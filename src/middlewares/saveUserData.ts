// Flushes accumulated notifications as a single follow-up bubble and
// persists user data when the pipeline mutated it. Runs after every RPG
// side-effect middleware so the cumulative diff is captured in one
// Postgres+Redis write rather than per-step.

import type { Middleware } from "./types";

export const saveUserDataMiddleware: Middleware = ({ ctx, oldDataJSON, notifications }) => {
    if (!ctx?.userData) return { stop: false };

    if (notifications && notifications.length > 0) {
        ctx.followUpQueue.push({
            content: `${notifications.join("\n\n")}\n-# <@${ctx.user.id}>`,
        });
    }

    if (oldDataJSON !== undefined && oldDataJSON !== JSON.stringify(ctx.userData)) {
        ctx.client.database.saveUserData(ctx.userData);
    }

    return { stop: false };
};
