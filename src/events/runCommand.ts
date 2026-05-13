import { MessageFlags } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type CommandInteractionContext from "../structures/CommandInteractionContext";
import type { SlashCommand } from "../@types";
import type JolyneClient from "../structures/JolyneClient";

export async function runCommand(
    interaction: ChatInputCommandInteraction & { client: JolyneClient },
    command: SlashCommand,
    ctx: CommandInteractionContext,
): Promise<void> {
    try {
        await command.execute(ctx);
    } catch (error) {
        interaction.client.log(
            error instanceof Error ? error.stack ?? error.message : String(error),
            "error",
        );
        await interaction
            .reply({
                content: `There was an error while executing this command. Please try again later.\nError: ${
                    (error as Error)["message"]
                }`,
                flags: MessageFlags.Ephemeral,
            })
            .catch(() => {});
    }
}
