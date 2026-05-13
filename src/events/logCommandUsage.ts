import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../@types";
import type JolyneClient from "../structures/JolyneClient";
import { commandLogsWebhook, specialLogsWebhook } from "../utils/Webhooks";

const OPTIONS_PREVIEW_LIMIT = 1000;

export function logCommandUsage(
    interaction: ChatInputCommandInteraction & { client: JolyneClient },
    command: SlashCommand,
): void {
    let optionsString = JSON.stringify(interaction.options["data"] || {});
    if (optionsString.length > OPTIONS_PREVIEW_LIMIT) {
        optionsString = optionsString.slice(0, OPTIONS_PREVIEW_LIMIT) + "... (truncated)";
    }

    const guildLabel = `${interaction.guild?.name || "DMs"} \`(${
        interaction.guild?.id || "N/A"
    })\``;
    const userLabel = `${interaction.user.username} \`(${interaction.user.id})\``;
    const optionsBlock = `\`\`\`${optionsString}\`\`\``;

    commandLogsWebhook
        .send(
            `🤖 | ${userLabel} used \`/${interaction.commandName}\` in guild ${guildLabel} with options: ${optionsBlock} _ _`,
        )
        .catch(() => {});

    if (command.category === "admin") {
        specialLogsWebhook
            .send(
                `:warning: | ${userLabel} used \`/${interaction.commandName}\` in guild ${guildLabel} with options: ${optionsBlock} _ _`,
            )
            .catch(() => {});
    }
}
