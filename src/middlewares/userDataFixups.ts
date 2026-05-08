import type { Middleware, MiddlewareDecision } from "./types";

// Tiny housekeeping pass that runs once per command:
//   - Mirror the user's current Discord username onto `userData.tag`. The
//     bot uses this in transaction logs and embeds; if a user changed their
//     username on Discord we want the next save to pick that up.
//   - Strip null entries from the inventory map. Some legacy migration
//     paths left `{ stand_arrow: null }` rows; downstream code does `value
//     || 0`, so the null is harmless but we tidy as we go.
export const userDataFixupsMiddleware: Middleware = ({ ctx }): MiddlewareDecision => {
    if (!ctx?.userData) return { stop: false };

    ctx.userData.tag = ctx.user.username;

    for (const item in ctx.userData.inventory) {
        if (ctx.userData.inventory[item] === null) {
            delete ctx.userData.inventory[item];
        }
    }

    return { stop: false };
};
