import { getRawSkillPointsLeft } from "../services/UserService";

import type { Middleware, MiddlewareDecision } from "./types";

// Brand-new players hit `/fight` with all four starter skill points still
// unspent. The fight gets harder than it should, they bounce, the bot
// looks bad. This middleware intercepts that exact case (level 1, 4
// unspent points, command is `/fight`) and points them at `/skills invest`
// before they pick the fight.
//
// Once they invest even one point this stops firing — that's intentional:
// the hint is for the very first attempt, not a permanent gate.
export const firstFightSkillPointsHintMiddleware: Middleware = async ({
    ctx,
    command,
}): Promise<MiddlewareDecision> => {
    if (!ctx?.userData || !command) return { stop: false };
    if (command.data.name !== "fight") return { stop: false };
    if (ctx.userData.level !== 1) return { stop: false };
    if (getRawSkillPointsLeft(ctx.userData) !== 4) return { stop: false };

    await ctx.makeMessage({
        content: `:arrow_up: | **${ctx.user.username}**, you have **${getRawSkillPointsLeft(
            ctx.userData,
        )}** skill points left! Use the ${ctx.client.getSlashCommandMention(
            "skills invest",
        )} command to invest them! It is crucial to invest your skill points to progress in the game, so please do it.`,
    });
    return { stop: true };
};
