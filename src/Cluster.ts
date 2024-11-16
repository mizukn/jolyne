import { ClusterManager } from "discord-hybrid-sharding";
import redis from "ioredis";
import "dotenv/config";
import { exec } from "child_process";
import Jolyne from "./structures/JolyneClient";
import axios, { AxiosResponse } from "axios";

const TempRedis = new redis({ db: Number(process.env.REDIS_DB) });
const port = process.env.CLIENT_TOKEN === process.env.ALPHA_TOKEN ? 6060 : 6969;

// check at localhost if port is already in use
const final = () =>
    exec(`lsof -i:${port}`, async (error, stdout) => {
        if (stdout.includes("LISTEN")) {
            while (process.env.JIFOSADIOJFAIOJOJIF !== "jisdgijksigk") {
                // always true
                console.log(`Port ${port} is already in use.`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } else {
            console.log(`Port ${port} is available.`);
            // await TempRedis.set("rpgGlobalFightMatchmaking", JSON.stringify([]));
            await TempRedis.keys("*tempCache_*").then((keys) => {
                for (const key of keys) {
                    TempRedis.del(key);
                }
                console.log(`Cleared ${keys.length} temp cache keys.`);
            });
            TempRedis.set("activeFights", JSON.stringify([]));

            await TempRedis.keys("*rpgCooldown:*").then(async (keys) => {
                let counter = 0;
                for (const key of keys) {
                    const cooldown = await TempRedis.get(key);
                    if (Number(cooldown) < Date.now()) {
                        TempRedis.del(key);
                        counter++;
                    }
                }
                console.log(`Cleared ${counter} rpg cooldown keys.`);
                if (new Date().getDay() === 0) TempRedis.quit();
            });

            // if it's not sunday then clear old black market
            if (new Date().getDay() !== 0) {
                await TempRedis.keys("*black_market:*").then(async (keys) => {
                    let counter = 0;
                    for (const key of keys) {
                        TempRedis.del(key);
                        counter++;
                    }
                    console.log(`Cleared ${counter} black market keys.`);
                    TempRedis.quit();
                });
            }

            const manager = new ClusterManager(`${__dirname}/index.js`, {
                totalShards: "auto",
                shardsPerClusters: 8,
                mode: "process",
                token: process.env.CLIENT_TOKEN,
            });

            manager.on("clusterCreate", (cluster) => {
                console.log(
                    `Launched Cluster ${cluster.id}\n-------------------------------------------------------------`
                );
                /*
            setInterval(() => {
                cluster
                    .request({
                        content: "What are your fights?",
                        fightHandlers: true,
                    })
                    .then((response: any) => {
                        if (response.content === "alright") {
                            clients.set(cluster.id, response.client);
                        }
                    });
                setInterval(() => {
                    cluster.send({ content: "fightTotal", fights: clients });
                }, 2000);
            }, 5000);*/
            });
            manager.spawn({ timeout: -1 }).catch((e) => {
                console.log(e);
                //const response = JSON.parse(e.message);
                console.log(
                    "DISCORD API LIMIT: ERROR, YOU HAVE BEEN RATELIMITED. PLEASE TRY AGAIN IN " +
                        e.headers.get("Retry-After") +
                        " SECONDS."
                );
            });
        }
    });
const isRatelimited = async () => {
    try {
        const response = await axios.get("https://discord.com/api/v9/gateway/bot", {
            headers: {
                Authorization: `Bot ${process.env.CLIENT_TOKEN}`,
            },
        });
        return response.status === 429;
    } catch (error) {
        if ((error as any).response && (error as any).response.status === 429) {
            const retryAfter = parseFloat((error as any).response.headers["retry-after"]) * 1000; // Convert to ms
            console.log(`Rate limited. Retry after ${retryAfter} ms.`);
            await new Promise((resolve) => setTimeout(resolve, retryAfter + 1000));
        } else {
            console.error("An error occurred:", (error as any).message);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};

const start = async () => {
    while (await isRatelimited()) {
        console.log("Retrying...");
    }
    final();
};

start();
