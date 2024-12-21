import { cloneDeep, set } from "lodash";
import Jolyne from "../structures/JolyneClient";
import { Fighter, FightTypes } from "../structures/FightHandler";

const twentyMinutes = 1200000; // 1200000 milliseconds = 20 minutes
export function watchFightHandler(client: Jolyne): void {
    let previousState = cloneDeep(client.fightHandlers);

    setInterval(() => {
        for (const fight of client.fightHandlers.map((x) => x)) {
            console.log(`Checking fight ${fight.id}`);
            const currentFightState = fight.currentState;
            const previousFightState = previousState.find((x) => x.id === fight.id)?.currentState;
            if (!previousFightState) continue;

            if (
                currentFightState === previousFightState ||
                fight.startedAt + twentyMinutes < Date.now() ||
                !fight.infos?.type
            ) {
                // the fight is bugged!
                let winnerTeam: Fighter[] | undefined;
                for (const team of fight.teams) {
                    console.log(`Checking team ${team.map((x) => x.name).join(", ")}`);
                    const humansAlive = team.filter((x) => !x.npc && x.health > 0);
                    if (!winnerTeam && humansAlive.length > 0) {
                        // first team with humans alive
                        winnerTeam = team;
                        console.log(`Winner team: ${team.map((x) => x.name).join(", ")}`);
                    } else if (humansAlive.length > 0 && winnerTeam !== team) {
                        // another team with humans alive
                        const winnerTeamHumansAlive = winnerTeam.filter(
                            (x) => !x.npc && x.health > 0
                        );
                        if (humansAlive.length > winnerTeamHumansAlive.length) {
                            winnerTeam = team;
                            console.log(`New winner team: ${team.map((x) => x.name).join(", ")}`);
                        }
                    }
                }
                if (!winnerTeam) {
                    console.log("No humans alive, picking random team");
                    // no humans alive
                    winnerTeam = fight.teams[Math.floor(Math.random() * fight.teams.length)]; // random team
                }
                const loserTeams = fight.teams.filter((x) => x !== winnerTeam);
                const message = `:warning: \`FightHandlerWatchdog\` exception occured in fight \`${fight.id}\`! The fight has been forcibly ended.\n\n--> The winner team is the team with the most humans alive. If there are no humans alive, a random team will be picked.`;
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
                setTimeout(() => {
                    if (!fight.ended) {
                        client.cluster.emit(`fightEnd_${fight.id}`);
                    }
                }, 1000);
            }
        }

        previousState = cloneDeep(client.fightHandlers);
    }, 60000); // 60000 milliseconds = 1 minute
}
