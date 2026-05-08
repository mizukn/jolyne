import { MessageFlags } from "discord.js";

import type { Middleware, MiddlewareDecision } from "./types";

// Per-command in-memory cooldown using `client.cooldowns` (a Discord.js
// Collection). Keyed by `${userId}:${commandName}`. Only commands that
// declare a `cooldown` (in seconds) on their `SlashCommandFile` participate.
//
// Pre-existing quirk preserved here: when an entry exists but has expired,
// we delete the entry and let the call through *without* setting a fresh
// cooldown. The next invocation then sets one. Effectively the throttle is
// one round shorter than the declared value. Fixing that is a behavior
// change — out of scope for the extraction; left for a follow-up.
export const commandCooldownMiddleware: Middleware = ({
    interaction,
    command,
}): MiddlewareDecision => {
    if (!command || !command.cooldown || isNaN(command.cooldown)) return { stop: false };

    const key = `${interaction.user.id}:${command.data.name}`;
    const existing = interaction.client.cooldowns.get(key);

    if (existing) {
        const timeLeft = existing - Date.now();
        if (timeLeft > 0) {
            return {
                stop: true,
                reply: {
                    content: `You can use this command again in ${(timeLeft / 1000).toFixed(2)} seconds.`,
                    flags: MessageFlags.Ephemeral,
                },
            };
        }
        interaction.client.cooldowns.delete(key);
        return { stop: false };
    }

    interaction.client.cooldowns.set(key, Date.now() + command.cooldown * 1000);
    return { stop: false };
};
