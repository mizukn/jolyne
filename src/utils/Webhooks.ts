import { WebhookClient } from "discord.js";

export const voteWebhook = new WebhookClient({ url: process.env.VOTE_WEBHOOK_URL });
export const tradeWebhook = new WebhookClient({ url: process.env.TRADE_WEBHOOK_URL });
export const raidWebhook = new WebhookClient({ url: process.env.RAID_WEBHOOK_URL });
export const thrownItemsWebhook = new WebhookClient({ url: process.env.THROWN_ITEMS_WEBHOOK_URL });
export const claimedItemsWebhook = new WebhookClient({
    url: process.env.CLAIMED_ITEMS_WEBHOOK_URL,
});
export const commandLogsWebhook = new WebhookClient({ url: process.env.COMMAND_LOGS_WEBHOOK_URL });
export const shardLogsWebhook = new WebhookClient({ url: process.env.SHARD_LOGS_WEBHOOK_URL });
export const dungeonLogsWebhook = new WebhookClient({ url: process.env.DUNGEON_LOGS_WEBHOOK_URL });
