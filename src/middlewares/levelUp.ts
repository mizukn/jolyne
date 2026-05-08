import { getMaxPrestigeLevel } from "../services/UserService";
import { getMaxXp } from "../utils/rewards";

import type { Middleware, MiddlewareDecision } from "./types";

// Drains XP overflow into level-ups in a loop, capped at the prestige
// ceiling when ENABLE_PRESTIGE is on. If the user crossed multiple levels
// in a single command we collapse the per-level lines into a single
// "old → new" notification so the follow-up stays compact.
export const levelUpMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx } = input;
    if (!ctx?.userData) return { stop: false };

    const notifications = (input.notifications ??= []);
    const queue: string[] = [];
    const oldLevel = ctx.userData.level;

    const isCapped = (): boolean =>
        process.env.ENABLE_PRESTIGE
            ? ctx.userData.level >= getMaxPrestigeLevel(ctx.userData.prestige)
            : false;

    while (ctx.userData.xp >= getMaxXp(ctx.userData.level) && !isCapped()) {
        ctx.userData.xp -= getMaxXp(ctx.userData.level);
        ctx.userData.level++;
        queue.push(`:up: | You just leveled up to level **${ctx.userData.level}**!`);
    }

    if (queue.length > 1) {
        notifications.push(
            `:up: | You leveled up: **${oldLevel}** ${ctx.client.localEmojis.arrowRight} **${ctx.userData.level}**!`,
        );
    } else {
        for (const line of queue) notifications.push(line);
    }

    return { stop: false };
};
