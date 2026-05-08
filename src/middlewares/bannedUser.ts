import type { Middleware, MiddlewareDecision } from "./types";

// Community-ban sentinel. The DB stores the ban flag in
// `userData.inventory.candy_cane` (a negative count means banned). It's a
// hack inherited from the V2 era — see PLAN.md / BRAINSTORM for the
// rationale. Surfaces a contact link so the user can appeal.
export const bannedUserMiddleware: Middleware = ({ ctx }): MiddlewareDecision => {
    if (!ctx?.userData) return { stop: false };
    const sentinel = ctx.userData.inventory.candy_cane;
    if (!sentinel || sentinel >= 0) return { stop: false };

    return {
        stop: true,
        reply: {
            content: `:x: | **${ctx.user.username}**, You are banned. Please contact us at https://discord.gg/jolyne-support-923608916540145694-support-923608916540145694 to appeal (@mizukn).`,
        },
    };
};
