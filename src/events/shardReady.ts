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
    name: Events.ShardReady,
    once: false,
    execute: async (shardId: number, unavailableGuilds: Set<string>): Promise<void> => {
        shardLogsWebhook.send(
            `<:online:1218297911155101806> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** is ready! (unavailable guilds: ${unavailableGuilds?.size ?? 0})`
        );
    },
};
export default Event;
