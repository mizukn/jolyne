import { MessageFlags } from "discord.js";

import type { Middleware, MiddlewareDecision } from "./types";

// Refuses every command except for the bot owners while
// `client.maintenanceReason` is set. The reason string is included in the
// reply so users know what's happening.
export const maintenanceMiddleware: Middleware = ({ interaction }): MiddlewareDecision => {
    const reason = interaction.client.maintenanceReason;
    if (!reason) return { stop: false };

    const ownerIds = process.env.OWNER_IDS?.split(",") ?? [];
    if (ownerIds.includes(interaction.user.id)) return { stop: false };

    return {
        stop: true,
        log: {
            message: `${interaction.user.username} tried to use a command while in maintenance.`,
            type: "warn",
        },
        reply: {
            content: `The bot is currently in maintenance mode. Reason: \`${reason}\``,
            flags: MessageFlags.Ephemeral,
        },
    };
};
