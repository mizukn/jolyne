import "dotenv/config";
import { ClusterManager } from "discord-hybrid-sharding";
import redis from "ioredis";
const TempRedis = new redis({ db: 0 });

TempRedis.keys("*tempCache_*").then((keys) => {
    for (const key of keys) {
        TempRedis.del(key);
    }
    console.log(`Cleared ${keys.length} temp cache keys.`);
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
