import type { EventFile } from "../@types";
import { Events } from "discord.js";
import { shardLogsWebhook } from "../utils/Webhooks";

const Event: EventFile = {
    name: Events.ShardError,
    once: false,
    execute: async (error: Error, shardId: number): Promise<void> => {
        shardLogsWebhook.send(
            `<:dnd:1218298008924323860> | Shard **${shardId}** / **${
                Number(process.env.TOTAL_SHARDS) - 1
            }** errored (error: \`${error.stack}\`) <@${process.env.OWNER_IDS?.split(",")[0]}>`
        );
    }
};
export default Event;
