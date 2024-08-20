import { ClusterManager } from "discord-hybrid-sharding";
import redis from "ioredis";
import "dotenv/config";
import { exec } from "child_process";

const TempRedis = new redis({ db: Number(process.env.REDIS_DB) });
const port = 6969;

(async () => {
    // check at localhost if port is already in use
    exec(`lsof -i:${port}`, (error, stdout) => {
        if (stdout.includes("LISTEN")) {
            console.log(`Port ${port} is already in use. Exiting...`);
            process.exit(0);
        } else {
            console.log(`Port ${port} is available.`);
        }
    });
    // await TempRedis.set("rpgGlobalFightMatchmaking", JSON.stringify([]));
    await TempRedis.keys("*tempCache_*").then((keys) => {
        for (const key of keys) {
            TempRedis.del(key);
        }
        console.log(`Cleared ${keys.length} temp cache keys.`);
    });

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

    manager.on("clusterCreate", (cluster) =>
        console.log(
            `Launched Cluster ${cluster.id}\n-------------------------------------------------------------`
        )
    );
    manager.spawn({ timeout: -1 }).catch((e) => {
        console.log(process.env);
        //const response = JSON.parse(e.message);
        console.log(
            "DISCORD API LIMIT: ERROR, YOU HAVE BEEN RATELIMITED. PLEASE TRY AGAIN IN " +
                e.headers.get("Retry-After") +
                " SECONDS."
        );
    });
})();
