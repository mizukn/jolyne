import 'dotenv/config';
import { Manager } from 'discord-hybrid-sharding';
import redis from 'ioredis';
const TempRedis = new redis({ db: process.env.DEV_MODE === "true" ? 2 : 1 });

TempRedis.keys('*tempCache_*').then(keys => {
    for (const key of keys) {
        TempRedis.del(key);
    }
    console.log(`Cleared ${keys.length} temp cache keys.`);
    TempRedis.quit();
});
/*
const manager = new Manager(`${__dirname}/index.js`, { // compiled file
    totalShards: 'auto',
    shardsPerClusters: 8,
    mode: 'process',
    token: process.env.CLIENT_TOKEN,
});

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}\n-------------------------------------------------------------`));
manager.spawn({ timeout: -1 }).catch((e) => { console.log(e); });
*/

import database from "./database/RedisHandler";
const Redis = new database();

(async () => {
    await Redis.hmset("test", {
        test: "ok",
        number: 5
    });
    
    await Redis.hincrby("test", "x", 1);
    console.log(await Redis.hgetall("test"));
})();