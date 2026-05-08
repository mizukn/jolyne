import { MessageFlags } from "discord.js";

import type { Middleware, MiddlewareDecision } from "./types";

// Enforces the `ownerOnly` and `adminOnly` flags declared on a command's
// `SlashCommandFile`. `ownerOnly` blocks silently with the bot's signature
// emoji (intentional — those commands are meant to be invisible). `adminOnly`
// returns a clear error unless the bot is running in the BETA env, where
// admin gating is intentionally disabled for testing.
export const permissionsMiddleware: Middleware = ({
    interaction,
    command,
}): MiddlewareDecision => {
    if (!command) return { stop: false };

    const ownerIds = process.env.OWNER_IDS?.split(",") ?? [];
    const adminIds = process.env.ADMIN_IDS?.split(",") ?? [];

    if (command.ownerOnly && !ownerIds.includes(interaction.user.id)) {
        return {
            stop: true,
            reply: { content: interaction.client.localEmojis["jolyne"] },
        };
    }

    if (command.adminOnly && !adminIds.includes(interaction.user.id) && !process.env.BETA) {
        return {
            stop: true,
            reply: {
                content: "You don't have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            },
        };
    }

    return { stop: false };
};
