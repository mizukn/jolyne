import type { EventFile } from "../@types";
import { Events } from "discord.js";
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
    }
};
export default Event;
