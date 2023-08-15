import TopGG from "@top-gg/sdk";
import JolyneClient from "../structures/JolyneClient";
import { voteWebhook } from "./Webhooks";
import express from "express";
import { addItem, TopGGVoteRewards } from "./Functions";

export default (client: JolyneClient): void => {

    const app = express();
    app.get("/", (req, res) => {
        res.send("Currently fetching votes from Top.gg");
    });

    const TopGGWebhook = new TopGG.Webhook(process.env.TOPGG_AUTH);

    app.post("/dblwebhook", TopGGWebhook.listener(async (vote) => {
        const user = await client.database.getRPGUserData(vote.user);

        voteWebhook.send({
            content: `:up: | \`${user.tag}\` (${user.id}) voted for Jolyne.`
        }).catch(() => {
            new Error("Failed to send vote webhook.");
        });

        if (user) {
            const rewards = TopGGVoteRewards(user);
            user.coins += rewards.coins;
            user.xp += rewards.xp;

            const voteMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

            if (!user.voteHistory[voteMonth]) user.voteHistory[voteMonth] = [Date.now()];
            else user.voteHistory[voteMonth].push(Date.now());

            user.totalVotes++;
            // every 2 votes, gives 2 stand arrow
            if (user.totalVotes % 2 === 0) {
                addItem(user, "stand_arrow", 2);
            }

            await client.database.saveUserData(user);
        }
    }));

    app.listen(6969, () => {
        client.log("TopGG webhook is now listening on port 6969", "info");
    });
};