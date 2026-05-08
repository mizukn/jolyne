import {
    generateDailyQuests,
    getTrueLevel,
} from "../utils/Functions";

import type { Middleware, MiddlewareDecision } from "./types";

// At UTC midnight every user's daily-quest list gets regenerated. The
// `lastDailyQuestsReset` timestamp is the idempotency key — once it equals
// today's UTC start the regen short-circuits. Also wipes the cached daily
// quest layout in Redis so the next `/quests daily` re-fetches.
export const dailyResetMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx } = input;
    if (!ctx?.userData) return { stop: false };

    const todayUtcStart = new Date().setUTCHours(0, 0, 0, 0);
    if (ctx.userData.daily.lastDailyQuestsReset === todayUtcStart) return { stop: false };

    ctx.userData.daily.quests = generateDailyQuests(getTrueLevel(ctx.userData));
    ctx.userData.daily.lastDailyQuestsReset = todayUtcStart;
    ctx.userData.daily.dailyQuestsReset = 0;
    ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);

    const notifications = (input.notifications ??= []);
    notifications.push(
        `:scroll:${ctx.client.localEmojis.timerIcon} | **${ctx.user.username}**, you have new daily quests! Use the ${ctx.client.getSlashCommandMention(
            "quests daily",
        )} command to see them!`,
    );

    return { stop: false };
};
