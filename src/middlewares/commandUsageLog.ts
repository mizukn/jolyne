// Emits the cluster-side `client.log` line (separate from the public
// webhook in `logCommandUsage.ts`) and snapshots the current userData
// payload so the save middleware can diff against it after the RPG
// side-effect chain.

import type { Middleware } from "./types";

export const commandUsageLogMiddleware: Middleware = ({ interaction, ctx, commandName, command }) => {
    if (!ctx?.userData) return { stop: false };

    const resolvedName = commandName ?? command?.data.name ?? interaction.commandName;
    interaction.client.log(
        `${ctx.user.username} used ${resolvedName} with options: ${JSON.stringify(
            interaction.options["data"],
        )}`,
        "command",
    );

    return { stop: false };
};
