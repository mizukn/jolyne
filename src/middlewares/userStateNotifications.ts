import {
    getMaxHealth,
    getMaxPrestigeLevel,
    getMaxStamina,
    getRawSkillPointsLeft,
} from "../services/UserService";
import { getBlackMarketString } from "../utils/Functions";

import type { Middleware, MiddlewareDecision } from "./types";

// Cluster of small, gated "soft reminder" notifications. None of these
// mutate user state — they're purely advisory follow-ups. Each one is gated
// on a per-user toggle under `userData.settings.notifications.*` so users
// can mute the ones they don't want.
//
// All checks live in one middleware so the order is explicit and there's
// only one stop-the-world point if we need to add another reminder later.
export const userStateNotificationsMiddleware: Middleware = async (
    input,
): Promise<MiddlewareDecision> => {
    const { ctx, command } = input;
    if (!ctx?.userData || !command) return { stop: false };

    const notifications = (input.notifications ??= []);
    const cmdName = command.data.name;
    const settings = ctx.userData.settings.notifications;

    // Low health / stamina — skipped on commands that already act on those
    // numbers (shop, inventory, campfire, heal).
    const healthLow = ctx.userData.health < getMaxHealth(ctx.userData) * 0.1;
    const staminaLow = ctx.userData.stamina < getMaxStamina(ctx.userData) * 0.1;
    const skipLowHealth = ["shop", "inventory", "campfire", "heal"].includes(cmdName);
    if ((healthLow || staminaLow) && !skipLowHealth && settings.low_health_or_stamina) {
        notifications.push(
            `🩸 | You're low in health/stamina. You should  ${ctx.client.getSlashCommandMention("heal")} yourself. You can use the ${ctx.client.getSlashCommandMention("shop")} command to use consumables. If you don't want to waste your money/items, you can rest at the ${ctx.client.getSlashCommandMention("rest start")} (1% of your max health every 2 minutes)`,
        );
    }

    // Unread emails — skipped while the user is already on the mail command.
    const unreadEmails = ctx.userData.emails.filter((r) => !r.read);
    if (unreadEmails.length > 0 && cmdName !== "emails" && settings.email) {
        notifications.push(
            `📧 | You have **${unreadEmails.length}** unread email${
                unreadEmails.length > 1 ? "s" : ""
            }. Use the ${ctx.client.getSlashCommandMention("mail inbox")} command to read them.`,
        );
    }

    // Sunday black-market open. Cached per user per command-tick so the
    // hot loop doesn't hit Redis once per command.
    if (new Date().getDay() === 0 && cmdName !== "shop") {
        const cacheKey = `black_market:${ctx.user.id}`;
        if (!ctx.client.otherCache.get(cacheKey)) {
            const data = await ctx.client.database.getJSONData(getBlackMarketString(ctx.user.id));
            ctx.client.otherCache.set(cacheKey, data);
            if (!data && settings.black_market) {
                notifications.push(
                    `🃏 | The black market is open! Use the ${ctx.client.getSlashCommandMention("shop")} command to see what's available!\n-# You can disable this notification with the ${ctx.client.getSlashCommandMention("settings notifications")} command.`,
                );
            }
        }
    }

    // Unspent skill points — skipped on the skill command itself.
    if (
        getRawSkillPointsLeft(ctx.userData) > 0 &&
        cmdName !== "skill" &&
        settings.skill_points
    ) {
        notifications.push(
            `:arrow_up: | **${ctx.user.username}**, you have **${getRawSkillPointsLeft(ctx.userData)}** skill points left! Use the ${ctx.client.getSlashCommandMention("skills invest")} command to invest them!`,
        );
    }

    // Sub-50% stamina entering a fight. Lives under low_health_or_stamina
    // because that's the toggle that gates it.
    const fightLikeCommand = ["fight", "dungeon", "assault"].includes(cmdName);
    if (
        fightLikeCommand &&
        ctx.userData.stamina < getMaxStamina(ctx.userData) * 0.5 &&
        settings.low_health_or_stamina
    ) {
        notifications.push(
            `:warning: | You're low in stamina and you just started a fight. Your stamina affects your attack damage, so be careful!`,
        );
    }

    // Reached the prestige cap. Only meaningful when ENABLE_PRESTIGE is on.
    if (
        process.env.ENABLE_PRESTIGE &&
        ctx.userData.level >= getMaxPrestigeLevel(ctx.userData.prestige) &&
        cmdName !== "prestige" &&
        settings.reached_max_level
    ) {
        notifications.push(
            `:star: | You reached the maximum level for your prestige level! Use the ${ctx.client.getSlashCommandMention("prestige")} command to prestige and start over...`,
        );
    }

    return { stop: false };
};
