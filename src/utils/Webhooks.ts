import { WebhookClient } from "discord.js";

export const voteWebhook = new WebhookClient({ url: process.env.VOTE_WEBHOOK_URL });
export const tradeWebhook = new WebhookClient({ url: process.env.TRADE_WEBHOOK_URL });
export const raidWebhook = new WebhookClient({ url: process.env.RAID_WEBHOOK_URL });
export const thrownItemsWebhook = new WebhookClient({ url: process.env.THROWN_ITEMS_WEBHOOK_URL });
export const claimedItemsWebhook = new WebhookClient({
    url: process.env.CLAIMED_ITEMS_WEBHOOK_URL
});