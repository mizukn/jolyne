import Jolyne from "../structures/JolyneClient";
import { Fighter, FightTypes } from "../structures/FightHandler";

const TICK_MS = 60_000; // 1 minute
const STALE_TICKS_THRESHOLD = 3; // 3 minutes of no state change before we kill
const MAX_FIGHT_AGE_MS = 30 * 60 * 1000; // hard cap so a runaway fight can't live forever

interface FightStateData {
    id: string;
    currentState: string;
}

export function watchFightHandler(client: Jolyne): void {
    let previousState: FightStateData[] = client.fightHandlers.map((fight) => ({
        id: fight.id,
        currentState: fight.currentState,
    }));
    const staleCounts = new Map<string, number>();

    setInterval(() => {
        for (const fight of client.fightHandlers.map((x) => x)) {
            const prev = previousState.find((x) => x.id === fight.id)?.currentState;
            const stateUnchanged = prev !== undefined && prev === fight.currentState;

            if (stateUnchanged) {
                staleCounts.set(fight.id, (staleCounts.get(fight.id) ?? 0) + 1);
            } else {
                staleCounts.delete(fight.id);
            }

            const staleTicks = staleCounts.get(fight.id) ?? 0;
            const tooOld = fight.startedAt + MAX_FIGHT_AGE_MS < Date.now();
            const corrupted = !fight.infos?.type;

            // Both conditions used to be OR'd against a single tick of staleness, which
            // killed legitimate slow fights and 20-min boss raids. Require the fight to
            // be either persistently stuck OR actually too old.
            if (staleTicks < STALE_TICKS_THRESHOLD && !tooOld && !corrupted) continue;

            let winnerTeam: Fighter[] | undefined;
            for (const team of fight.teams) {
                const humansAlive = team.filter((x) => !x.npc && x.health > 0);
                if (!winnerTeam && humansAlive.length > 0) {
                    winnerTeam = team;
                } else if (humansAlive.length > 0 && winnerTeam !== team) {
                    const winnerTeamHumansAlive = winnerTeam.filter(
                        (x) => !x.npc && x.health > 0
                    );
                    if (humansAlive.length > winnerTeamHumansAlive.length) {
                        winnerTeam = team;
                    }
                }
            }
            if (!winnerTeam) {
                winnerTeam = fight.teams[Math.floor(Math.random() * fight.teams.length)];
            }
            for (const fighter of fight.fighters) {
                if (!winnerTeam.find((x) => x.id === fighter.id)) {
                    fighter.health = 0;
                }
            }
            const loserTeams = fight.teams.filter((x) => x !== winnerTeam);
            const reason = corrupted
                ? "fight has no type"
                : tooOld
                  ? `fight exceeded ${MAX_FIGHT_AGE_MS / 60000} minutes`
                  : `fight stalled for ${staleTicks} consecutive ticks`;
            const message = `:warning: \`FightHandlerWatchdog\` exception in fight \`${fight.id}\` (${reason})! The fight has been forcibly ended.\n\n--> Winner is the team with the most humans alive; random if none.`;
            if (fight.turns) {
                fight.turns[fight.turns.length - 1].logs.push(message);
            }
            if (fight.message) {
                try {
                    fight.message.reply(message).catch(() => {});
                } catch (error) {
                    console.error(error);
                }
            }
            fight.emit("end", winnerTeam, loserTeams, fight.infos?.type ?? FightTypes.Boss);
            fight.sendFightStats();
            staleCounts.delete(fight.id);
            setTimeout(() => {
                if (!fight.ended) {
                    client.cluster.emit(`fightEnd_${fight.id}`);
                }
            }, 1000);
        }

        previousState = client.fightHandlers.map((fight) => ({
            id: fight.id,
            currentState: fight.currentState,
        }));
        for (const id of staleCounts.keys()) {
            if (!client.fightHandlers.has(id)) staleCounts.delete(id);
        }
    }, TICK_MS);
}
