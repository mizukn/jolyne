import { WebhookClient, WebhookClientData, WebhookClientOptions, User, Guild } from "discord.js";

export const voteWebhook = new WebhookClient({ url: process.env.VOTE_WEBHOOK_URL });
export const tradeWebhook = new WebhookClient({ url: process.env.TRADE_WEBHOOK_URL });
export const raidWebhook = new WebhookClient({ url: process.env.RAID_WEBHOOK_URL });
