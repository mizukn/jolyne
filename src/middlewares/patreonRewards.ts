import { cloneDeep } from "lodash";

import { givePatreonRewards } from "../services/InventoryService";
import { getRewardsCompareData } from "../utils/Functions";

import type { Middleware, MiddlewareDecision } from "./types";

// Hands out the monthly Patreon reward bag the first time a user runs any
// command after their `lastPatreonCharge` ticks forward. Compares the user
// snapshot before and after `givePatreonRewards` so we can show exactly what
// they got in a single notification, then stamps
// `userData.lastPatreonReward = lastPatreonCharge` so the next pass
// short-circuits until the next monthly charge.
export const patreonRewardsMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx } = input;
    if (!ctx?.userData) return { stop: false };

    const patron = ctx.client.patreons.find((r) => r.id === ctx.user.id);
    if (!patron) return { stop: false };
    if (ctx.userData.lastPatreonReward === patron.lastPatreonCharge) return { stop: false };

    const before = cloneDeep(ctx.userData);
    givePatreonRewards(ctx.userData, patron.level);
    ctx.userData.lastPatreonReward = patron.lastPatreonCharge;

    if (!input.notifications) input.notifications = [];
    input.notifications.push(
        `:heart: <:patronbox:1056324158524502036> | You received your monthly Patreon rewards! You got these items: ${getRewardsCompareData(
            before,
            ctx.userData,
        ).join(", ")}`,
    );

    return { stop: false };
};
