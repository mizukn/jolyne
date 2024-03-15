import type { EventFile } from "../@types";
import * as Functions from "../utils/Functions";
import { Events, ActivityType, ActivityOptions } from "discord.js";
import * as Stands from "../rpg/Stands/Stands";
import Jolyne from "../structures/JolyneClient";
import { CronJob } from "cron";
import TopGG from "../utils/TopGG";
import Matchmaking from "../utils/Matchmaking";
import { shardLogsWebhook } from "../utils/Webhooks";

const Event: EventFile = {
    name: Events.ShardReconnecting,
    once: false,
    execute: async (shardId: number): Promise<void> => {
        shardLogsWebhook.send(
            `<a:Loading2:1218298536786001970> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** is reconnecting...`
        );
    },
};
export default Event;
