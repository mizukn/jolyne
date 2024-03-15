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
    execute: async (shardId: number, replayedEvents: number): Promise<void> => {
        shardLogsWebhook.send(
            `<:idle:1218297965148639383> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** has resumed. (replayed ${replayedEvents ?? 0} events)`
        );
    },
};
export default Event;
