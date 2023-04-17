import "dotenv/config";
import { ClusterManager } from "discord-hybrid-sharding";
import redis from "ioredis";
const TempRedis = new redis({ db: 0 });

TempRedis.keys("*tempCache_*").then((keys) => {
    for (const key of keys) {
        TempRedis.del(key);
    }
    console.log(`Cleared ${keys.length} temp cache keys.`);
});

TempRedis.keys("*rpgCooldown:*").then(async (keys) => {
    let counter = 0;
    for (const key of keys) {
        const cooldown = await TempRedis.get(key);
        if (Number(cooldown) < Date.now()) {
            TempRedis.del(key);
            counter++;
        }
    }
    console.log(`Cleared ${counter} rpg cooldown keys.`);
    TempRedis.quit();
});

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
    console.log(e);
});
