import type { EventFile } from "../@types";
import { Events } from "discord.js";
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
    }
};
export default Event;
