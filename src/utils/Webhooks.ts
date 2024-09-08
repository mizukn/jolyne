import { WebhookClient } from "discord.js";

export const voteWebhook = new WebhookClient({
    url: process.env.BETA ? process.env.BETA_FALLBACK_WEBHOOK_URL : process.env.VOTE_WEBHOOK_URL,
});
export const tradeWebhook = new WebhookClient({
    url: process.env.BETA ? process.env.BETA_FALLBACK_WEBHOOK_URL : process.env.TRADE_WEBHOOK_URL,
});
export const raidWebhook = new WebhookClient({
    url: process.env.BETA ? process.env.BETA_FALLBACK_WEBHOOK_URL : process.env.RAID_WEBHOOK_URL,
});
export const thrownItemsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.THROWN_ITEMS_WEBHOOK_URL,
});
export const claimedItemsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.CLAIMED_ITEMS_WEBHOOK_URL,
});
export const commandLogsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.COMMAND_LOGS_WEBHOOK_URL,
});
export const shardLogsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.SHARD_LOGS_WEBHOOK_URL,
});
export const dungeonLogsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.DUNGEON_LOGS_WEBHOOK_URL,
});
export const fightStartWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.FIGHT_START_LOGS_WEBHOOK_URL,
});
export const fightEndWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.FIGHT_END_LOGS_WEBHOOK_URL,
});
export const standLogsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.STAND_OBTAINED_LOGS_WEBHOOK_URL,
});

// SPECIAL_LOGS_WEBHOOK_URL

export const specialLogsWebhook = new WebhookClient({
    url: process.env.BETA
        ? process.env.BETA_FALLBACK_WEBHOOK_URL
        : process.env.SPECIAL_LOGS_WEBHOOK_URL,
});
