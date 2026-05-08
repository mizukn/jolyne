import { EVENT_IDS, isActive, type EventId } from "../services/EventService";
import { addEmail } from "../services/UserService";

import type { Middleware, MiddlewareDecision } from "./types";
import type CommandInteractionContext from "../structures/CommandInteractionContext";

// Seasonal "you got mail" injector. Replaces the four near-identical `if`
// blocks the inline interactionCreate had for 3rd anniversary, Halloween
// 2024/2025, and Christmas 2024 with a single config table.
//
// Two layers of idempotency:
//   1. `userData.emails.find(id)` — skip if the user already has the mail in
//      their inbox.
//   2. Optional Redis `idempotencyKey(userId)` — for events where the mail
//      stays issued even if the user deletes it. The 3rd-anniversary entry
//      omits this on purpose, matching the legacy behavior.
interface SeasonalEmailConfig {
    eventId: EventId;
    emailId: string;
    notification: (ctx: CommandInteractionContext) => string;
    /** Optional Redis key to flag "already issued" beyond the inbox check. */
    idempotencyKey?: (userId: string) => string;
}

export const SEASONAL_EMAILS: readonly SeasonalEmailConfig[] = [
    {
        eventId: EVENT_IDS.THIRD_ANNIVERSARY,
        emailId: "third_anniversary",
        notification: (ctx) =>
            `:tada: | **${ctx.user.username}**, thank you for playing Jolyne's RPG! You received a special email & quest for the 3rd anniversary of the bot!`,
    },
    {
        eventId: EVENT_IDS.HALLOWEEN_2024,
        emailId: "halloween_2024",
        notification: (ctx) =>
            `:jack_o_lantern: | **${ctx.user.username}**, Happy Halloween! You received a special email & quest for the 2024 Halloween event.`,
        idempotencyKey: (id) => `setHalloween2024:${id}`,
    },
    {
        eventId: EVENT_IDS.CHRISTMAS_2024,
        emailId: "christmas_2024",
        notification: (ctx) =>
            `:christmas_tree: | **${ctx.user.username}**, You received a special email & quest for the 2024 Christmas event.`,
        idempotencyKey: (id) => `setChristmas2024:${id}`,
    },
    {
        eventId: EVENT_IDS.HALLOWEEN_2025,
        emailId: "halloween_2025",
        notification: (ctx) =>
            `:jack_o_lantern: | **${ctx.user.username}**, Happy Halloween! You received a special email & quest for the 2025 Halloween event.`,
        idempotencyKey: (id) => `setHalloween2025:${id}`,
    },
];

export const seasonalEmailsMiddleware: Middleware = async ({
    ctx,
}): Promise<MiddlewareDecision> => {
    if (!ctx?.userData) return { stop: false };

    for (const config of SEASONAL_EMAILS) {
        if (!isActive(config.eventId)) continue;
        if (ctx.userData.emails.find((r) => r.id === config.emailId)) continue;

        if (config.idempotencyKey) {
            const key = config.idempotencyKey(ctx.user.id);
            const already = await ctx.client.database.getString(key);
            if (already) continue;
            await ctx.client.database.setString(key, "true");
        }

        ctx.followUpQueue.push({ content: config.notification(ctx) });
        addEmail(ctx.userData, config.emailId);
    }

    return { stop: false };
};
