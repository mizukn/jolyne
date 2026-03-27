import * as TopGG from "@top-gg/sdk";
import JolyneClient from "../structures/JolyneClient";
import { voteWebhook } from "./Webhooks";
import express from "express";
import { addItem, getMaxHealth, getMaxStamina, TopGGVoteRewards } from "./Functions";
import { cloneDeep } from "lodash";
import * as Items from "../rpg/Items";
import * as Stands from "../rpg/Stands";

export default (client: JolyneClient): void => {
    const app = express();
    app.get("/", (req, res) => {
        res.send("Currently fetching votes from Top.gg");
    });

    app.get("/status", async (req, res) => {
        try {
            const data = await client.database.redis.get("jolyne:clusters:summary");
            if (!data) return res.status(503).json({ error: "No data yet" });
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: "Redis error" });
        }
    });

    app.get("/infos", async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // renvoie le nombre total de stands, registered users, nombre total d'abilites, items
        const users = await client.database.postgresql
            .query("SELECT COUNT(*) FROM users")
            .then((result) => parseInt(result.rows[0].count))
            .catch(() => null);
        res.json({
            totalStands: Object.keys({ ...Stands.EvolutionStands, ...Stands.Stands }).length,
            totalItems: Object.keys(Items.default).length,
            totalRegisteredUsers: users,
            totalGuilds: await client.cluster
                .broadcastEval((c) => c.guilds.cache.size)
                .then((results) => results.reduce((a, b) => a + b, 0)),
        });
    });

    const TopGGWebhook = new TopGG.Webhook(process.env.TOPGG_AUTH);

    app.post(
        "/dblwebhook",
        TopGGWebhook.listener(async (vote) => {
            const user = await client.database.getRPGUserData(vote.user);

            voteWebhook
                .send({
                    content: `:up: | \`${user.tag}\` (${user.id}) voted for Jolyne.`,
                })
                .catch(() => {
                    new Error("Failed to send vote webhook.");
                });

            if (user) {
                const rewards = TopGGVoteRewards(user);
                const oldData = cloneDeep(user);
                user.coins += rewards.coins;
                user.xp += rewards.xp;

                user.health = getMaxHealth(user);
                user.stamina = getMaxStamina(user);

                addItem(user, "dungeon_key", 1);
                addItem(user, "stand_arrow", 2);

                const voteMonth = new Date().toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                });

                if (!user.voteHistory[voteMonth]) user.voteHistory[voteMonth] = [Date.now()];
                else user.voteHistory[voteMonth].push(Date.now());

                user.totalVotes++;
                // every 2 votes, gives 2 stand arrow
                if (user.totalVotes % 2 === 0) {
                    addItem(user, "rare_stand_arrow", 2);
                }

                for (const key of ["assault", "loot", "raid"]) {
                    client.database.deleteRPGCooldown(user.id, key);
                }

                //await client.database.saveUserData(user);
                await client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: user,
                        },
                    ],
                    `Voted for Jolyne`,
                );
            }
        }),
    );

    const port = process.env.CLIENT_TOKEN === process.env.ALPHA_TOKEN ? 6060 : 6969;

    try {
        app.listen(port, () => {
            client.log("TopGG webhook is now listening on port 6969", "info");
        });
    } catch (_s) {
        client.log("Failed to start TopGG webhook.", "error");
    }
};
