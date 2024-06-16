import type { EventFile } from "../@types";
import { Events } from "discord.js";
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
    }
};
export default Event;
