import type { AutocompleteInteraction } from "discord.js";
import type JolyneClient from "../structures/JolyneClient";

export async function handleAutocomplete(
    interaction: AutocompleteInteraction & { client: JolyneClient },
): Promise<void> {
    if (
        interaction.client.maintenanceReason &&
        !process.env.OWNER_IDS.split(",").includes(interaction.user.id)
    )
        return;
    if (!interaction.client.allCommands) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command || !interaction.guild) return;

    const userData = await interaction.client.database.getRPGUserData(interaction.user.id);
    if (!userData) {
        interaction.respond([]);
        return;
    }
    if (
        (await interaction.client.database.getCooldown(userData.id)) &&
        command.data.name !== "trade"
    ) {
        interaction.respond([]);
        return;
    }

    command.autoComplete(interaction, userData, interaction.options.getFocused().toString());
}
