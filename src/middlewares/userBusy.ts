import { MessageFlags } from "discord.js";

import type { Middleware, MiddlewareDecision } from "./types";

// "Busy" cooldown — set by long-running interactive flows (trades,
// blackjack, etc.) via `client.database.setCooldown` to make sure a user
// doesn't fork the bot's state by running another command mid-flow.
//
// The trade subcommand `/trade trade` is the carve-out: it's the action
// that finalises a trade, so it's allowed to run even if the user is
// flagged as busy by the trade flow itself. Every other subcommand under
// `/trade` (and every other command full stop) bails.
//
// On bail we also push a one-shot "if this is stuck, wait a bit" tip via
// followUp, gated on a Redis flag so we only pester the user once.
export const userBusyMiddleware: Middleware = async ({
    interaction,
    command,
    ctx,
}): Promise<MiddlewareDecision> => {
    if (!ctx?.userData || !command) return { stop: false };

    const reason = await interaction.client.database.getCooldown(ctx.user.id);
    if (!reason) return { stop: false };

    if (command.data.name === "trade" && interaction.options.getSubcommand() !== "trade") {
        return { stop: false };
    }

    await interaction.reply({ content: reason });

    const warningKey = `tempCache_cooldown:${ctx.user.id}_toldWarning`;
    const alreadyWarned = await interaction.client.database.redis.get(warningKey);
    if (!alreadyWarned) {
        ctx.followUp({
            content:
                "Reminder: If you can't find the command or someone deleted it, just wait a few minutes and your cooldown will be automatically deleted. If this problem still persists, please contact us at https://discord.gg/jolyne-support-923608916540145694",
            flags: MessageFlags.Ephemeral,
        });
        await interaction.client.database.redis.set(warningKey, "true");
    }

    return { stop: true };
};
