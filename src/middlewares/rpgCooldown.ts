import { generateDiscordTimestamp } from "../utils/format";

import type { Middleware, MiddlewareDecision } from "./types";

// A handful of commands declare `checkRPGCooldown: "<key>"` on their
// `SlashCommandFile` to gate themselves on a Redis-backed cooldown owned by
// some other action (e.g. /raid waits on the raid window). When set, look
// up the cooldown for this user and bail with a "ready in …" message if it
// is still in the future.
//
// Beta and Alpha bot deploys ignore RPG cooldowns to keep development fast,
// matching the original inline logic.
export const rpgCooldownMiddleware: Middleware = async ({
    interaction,
    command,
    ctx,
}): Promise<MiddlewareDecision> => {
    if (!command || !command.checkRPGCooldown || !ctx?.userData) return { stop: false };

    const username = interaction.client.user.username;
    if (username.includes("Beta") || username.includes("Alpha")) return { stop: false };

    const cooldown = await interaction.client.database.getRPGCooldown(
        ctx.user.id,
        command.checkRPGCooldown,
    );
    if (!cooldown || cooldown <= Date.now()) return { stop: false };

    return {
        stop: true,
        reply: {
            content: `You can use this RPG command again ${generateDiscordTimestamp(cooldown, "FROM_NOW")}`,
        },
    };
};
