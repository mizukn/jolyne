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
    name: Events.ShardError,
    once: false,
    execute: async (error: Error, shardId: number): Promise<void> => {
        shardLogsWebhook.send(
            `<:dnd:1218298008924323860> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** errored (error: \`${error.stack}\`) <@239739781238620160>`
        );
    },
};
export default Event;
