import type { EventFile } from "../@types";
import { Events } from "discord.js";
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
    }
};
export default Event;
