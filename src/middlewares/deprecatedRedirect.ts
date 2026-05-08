import { MessageFlags } from "discord.js";

import { getDeprecatedCommandRedirect } from "../services/DeprecatedCommandService";

import type { Middleware, MiddlewareDecision } from "./types";

// Renamed commands keep their old slug registered for one migration window so
// users with stale autocomplete don't get a hard error. The DeprecatedCommand
// service maps `<old slug>` → `<new slug>`; if a hit is found we point the
// user at the new mention and stop here.
export const deprecatedRedirectMiddleware: Middleware = ({
    interaction,
}): MiddlewareDecision => {
    const replacement = getDeprecatedCommandRedirect(interaction);
    if (!replacement) return { stop: false };

    return {
        stop: true,
        reply: {
            content: `This command is deprecated! Use the ${interaction.client.getSlashCommandMention(
                replacement,
            )} command instead.`,
            flags: MessageFlags.Ephemeral,
        },
    };
};
