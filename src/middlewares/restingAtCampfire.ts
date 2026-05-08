import type { Middleware, MiddlewareDecision } from "./types";

// While a user is resting at the campfire, only `/campfire` and `/rest`
// subcommands are usable. Everything else gets a hint pointing at
// `/rest leave`.
//
// Side effect: normalises `userData.restingAtCampfire` to a number on the
// way through. Older rows have it stored as a bigint string from Postgres;
// the rest of the codebase expects a number. Doing the coercion here
// keeps every later middleware from re-paying the cost.
export const restingAtCampfireMiddleware: Middleware = ({ ctx, command }): MiddlewareDecision => {
    if (!ctx?.userData || !command) return { stop: false };

    if (typeof ctx.userData.restingAtCampfire !== "number") {
        ctx.userData.restingAtCampfire = 0;
    }

    if (!Number(ctx.userData.restingAtCampfire)) return { stop: false };
    if (["campfire", "rest"].includes(command.data.name)) return { stop: false };

    return {
        stop: true,
        reply: {
            content: `🔥🪵 You're currently resting at the campfire. Use the ${ctx.client.getSlashCommandMention(
                "rest leave",
            )} command to leave.`,
        },
    };
};
