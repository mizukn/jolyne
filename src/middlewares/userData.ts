import CommandInteractionContext from "../structures/CommandInteractionContext";

import type { Middleware, MiddlewareDecision } from "./types";

// Fetches the RPG user document and constructs `ctx` for every later
// middleware (and the command itself). For the `help` command we still build
// a ctx so its translation helpers work, but we skip the database round-trip
// since help has no per-user state.
//
// If a user without an RPG row tries to run anything other than the
// onboarding command (`/start` or the legacy `/adventure start`), the
// `base:NO_ADVENTURE` translation is returned as the reply.
export const userDataMiddleware: Middleware = async (input): Promise<MiddlewareDecision> => {
    const { interaction, command } = input;
    if (!command) return { stop: false };

    if (command.data.name === "help") {
        input.ctx = new CommandInteractionContext(interaction);
        return { stop: false };
    }

    const userData = await interaction.client.database.getRPGUserData(interaction.user.id);
    const ctx = new CommandInteractionContext(interaction, userData);
    input.ctx = ctx;

    let commandName = command.data.name;
    if (command.data.options?.filter((r) => r.type === 1)?.length !== 0) {
        commandName += ` ${interaction.options.getSubcommand()}`;
    }
    input.commandName = commandName;

    if (!ctx.userData) {
        const startsAdventure =
            command.data.name === "start" ||
            (command.data.name === "adventure" &&
                interaction.options.getSubcommand() === "start");
        if (!startsAdventure) {
            return {
                stop: true,
                reply: { content: ctx.translate<string>("base:NO_ADVENTURE") },
            };
        }
    }

    return { stop: false };
};
