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
    name: Events.ShardDisconnect,
    once: false,
    execute: async (shardId: number): Promise<void> => {
        shardLogsWebhook.send(
            `<:offline:1218298056324288605> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** has disconnected.`
        );
    },
};
export default Event;
