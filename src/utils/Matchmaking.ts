import CommandInteractionContext from "../structures/CommandInteractionContext";
import { RPGUserDataJSON } from "../@types";
import Jolyne from "../structures/JolyneClient";
import { FightHandler, FightTypes } from "../structures/FightHandler";

const cache: Map<string, {
    ctx: CommandInteractionContext,
    enteredAt: number
}> = new Map();
export default (client: Jolyne): void => {
    client.cluster.on("matchmakingAdd", (ctx: CommandInteractionContext) => {
        cache.set(ctx.RPGUserData.id, { ctx, enteredAt: Date.now() });
        client.database.setCooldown(ctx.RPGUserData.id, `You're currently in a matchmaking.`);
        ctx.makeMessage({
            content: `You have been added to the matchmaking queue. There are currently ${cache.size} users (including you) in queue.`
        });
    });

    client.cluster.on("matchmakingRemove", (data: RPGUserDataJSON) => {
        const ctx = cache.get(data.id);
        client.database.deleteCooldown(data.id);
    });

    setInterval(() => {
        // console.log(`Matchmaking: ${cache.size} users in queue.`);
        const couples: [CommandInteractionContext, CommandInteractionContext][] = [];
        const keys = [...cache.keys()]; // keys of the cache, includes user ids
        const aloneCouples: [CommandInteractionContext, CommandInteractionContext][] = [];
        // level matchmaking:
        // 1-5, 5-10, 10-15, 15-20, 20-25, 30-40, 40-50, 50-60, 60-70, 70-80, 80-90, 90-100, 100-120, 120-140, 140-160, 160-180, 180-200
        // 200-250, 250-300, 300-350, 350-400, 400-450, 450-500, 500-550, 550-600, 600-650, 650-700, 700-750, 750-800, 800-850, 850-900, 900-950, 950-1000
        // after 1000: max 10% difference level

        const matchmaking = {
            "1_5": keys.filter(x => cache.get(x).ctx.userData.level >= 1 && cache.get(x).ctx.userData.level <= 10000).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt)
            /*
            "5_10": keys.filter(x => cache.get(x).ctx.userData.level >= 5 && cache.get(x).ctx.userData.level <= 10).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "10_15": keys.filter(x => cache.get(x).ctx.userData.level >= 10 && cache.get(x).ctx.userData.level <= 15).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "15_20": keys.filter(x => cache.get(x).ctx.userData.level >= 15 && cache.get(x).ctx.userData.level <= 20).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "20_25": keys.filter(x => cache.get(x).ctx.userData.level >= 20 && cache.get(x).ctx.userData.level <= 25).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "25_30": keys.filter(x => cache.get(x).ctx.userData.level >= 25 && cache.get(x).ctx.userData.level <= 30).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "30_40": keys.filter(x => cache.get(x).ctx.userData.level >= 30 && cache.get(x).ctx.userData.level <= 40).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "40_50": keys.filter(x => cache.get(x).ctx.userData.level >= 40 && cache.get(x).ctx.userData.level <= 50).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "50_60": keys.filter(x => cache.get(x).ctx.userData.level >= 50 && cache.get(x).ctx.userData.level <= 60).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "60_70": keys.filter(x => cache.get(x).ctx.userData.level >= 60 && cache.get(x).ctx.userData.level <= 70).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "70_80": keys.filter(x => cache.get(x).ctx.userData.level >= 70 && cache.get(x).ctx.userData.level <= 80).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "80_90": keys.filter(x => cache.get(x).ctx.userData.level >= 80 && cache.get(x).ctx.userData.level <= 90).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "90_100": keys.filter(x => cache.get(x).ctx.userData.level >= 90 && cache.get(x).ctx.userData.level <= 100).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "100_120": keys.filter(x => cache.get(x).ctx.userData.level >= 100 && cache.get(x).ctx.userData.level <= 120).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "120_140": keys.filter(x => cache.get(x).ctx.userData.level >= 120 && cache.get(x).ctx.userData.level <= 140).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "140_160": keys.filter(x => cache.get(x).ctx.userData.level >= 140 && cache.get(x).ctx.userData.level <= 160).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "160_180": keys.filter(x => cache.get(x).ctx.userData.level >= 160 && cache.get(x).ctx.userData.level <= 180).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "180_200": keys.filter(x => cache.get(x).ctx.userData.level >= 180 && cache.get(x).ctx.userData.level <= 200).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "200_250": keys.filter(x => cache.get(x).ctx.userData.level >= 200 && cache.get(x).ctx.userData.level <= 250).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "250_300": keys.filter(x => cache.get(x).ctx.userData.level >= 250 && cache.get(x).ctx.userData.level <= 300).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "300_350": keys.filter(x => cache.get(x).ctx.userData.level >= 300 && cache.get(x).ctx.userData.level <= 350).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "350_400": keys.filter(x => cache.get(x).ctx.userData.level >= 350 && cache.get(x).ctx.userData.level <= 400).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "400_450": keys.filter(x => cache.get(x).ctx.userData.level >= 400 && cache.get(x).ctx.userData.level <= 450).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "450_500": keys.filter(x => cache.get(x).ctx.userData.level >= 450 && cache.get(x).ctx.userData.level <= 500).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "500_550": keys.filter(x => cache.get(x).ctx.userData.level >= 500 && cache.get(x).ctx.userData.level <= 550).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "550_600": keys.filter(x => cache.get(x).ctx.userData.level >= 550 && cache.get(x).ctx.userData.level <= 600).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "600_650": keys.filter(x => cache.get(x).ctx.userData.level >= 600 && cache.get(x).ctx.userData.level <= 650).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "650_700": keys.filter(x => cache.get(x).ctx.userData.level >= 650 && cache.get(x).ctx.userData.level <= 700).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "700_750": keys.filter(x => cache.get(x).ctx.userData.level >= 700 && cache.get(x).ctx.userData.level <= 750).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "750_800": keys.filter(x => cache.get(x).ctx.userData.level >= 750 && cache.get(x).ctx.userData.level <= 800).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "800_850": keys.filter(x => cache.get(x).ctx.userData.level >= 800 && cache.get(x).ctx.userData.level <= 850).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "850_900": keys.filter(x => cache.get(x).ctx.userData.level >= 850 && cache.get(x).ctx.userData.level <= 900).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "900_950": keys.filter(x => cache.get(x).ctx.userData.level >= 900 && cache.get(x).ctx.userData.level <= 950).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "950_1000": keys.filter(x => cache.get(x).ctx.userData.level >= 950 && cache.get(x).ctx.userData.level <= 1000).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt),
            "1000_1100": keys.filter(x => cache.get(x).ctx.userData.level >= 1000 && cache.get(x).ctx.userData.level <= 1100).sort((a, b) => cache.get(a).enteredAt - cache.get(b).enteredAt)
        */
        };


        for (const key of Object.keys(matchmaking)) {
            const match = matchmaking[key as keyof typeof matchmaking].filter(x => !couples.flat().find(c => c.userData.id === x));
            while (match.length >= 2) {
                const user1 = match.shift();
                const user2 = match.shift();
                couples.push([cache.get(user1).ctx, cache.get(user2).ctx]);
                cache.delete(user1);
                cache.delete(user2);
            }
        }

        for (const couple of couples) {
            const fight = new FightHandler(couple[0], [[couple[0].userData], [couple[1].userData]], FightTypes.Ranked, couple[1]);
            couple.forEach(c => {
                const userDataID = c.userData.id;
                c.followUp({
                    content: `You have been matched with ${couple.find(x => x.userData.id !== userDataID).userData.tag} (${couple.find(x => x.userData.id !== userDataID).userData.id})`
                });
            });

            fight.on("end", (winners, losers) => {
                winners.forEach(c => client.database.deleteCooldown(c.id));
                losers.flat().forEach(c => client.database.deleteCooldown(c.id));
            });

            fight.on("unexpectedEnd", () => {
                couple.forEach(c => client.database.deleteCooldown(c.userData.id));
            });
        }


    }, 1000);


};