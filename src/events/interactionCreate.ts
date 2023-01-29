import type { EventFile } from "../@types";
import { Events, Interaction } from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "../utils/Functions";

const Event: EventFile = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction & { client: JolyneClient }) {
        if (interaction.isCommand() && interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;

            if (
                command.ownerOnly &&
                !process.env.OWNER_IDS.split(",").includes(interaction.user.id)
            )
                return interaction.reply({
                    content: interaction.client.localEmojis["jolyne"],
                });
            if (
                command.adminOnly &&
                !process.env.ADMIN_IDS.split(",").includes(interaction.user.id)
            )
                return interaction.reply({
                    content: interaction.client.localEmojis["jolyne"],
                });

            // cooldown
            if (command.cooldown && !isNaN(command.cooldown)) {
                const cd = interaction.client.cooldowns.get(
                    `${interaction.user.id}:${command.data.name}`
                );
                if (cd) {
                    const timeLeft = cd - Date.now();
                    if (timeLeft > 0) {
                        return interaction.reply({
                            content: `You can use this command again in ${(timeLeft / 1000).toFixed(
                                2
                            )} seconds.`,
                            ephemeral: true,
                        });
                    } else
                        interaction.client.cooldowns.delete(
                            `${interaction.user.id}:${command.data.name}`
                        );
                } else
                    interaction.client.cooldowns.set(
                        `${interaction.user.id}:${command.data.name}`,
                        Date.now() + command.cooldown * 1000
                    );
            }
            let ctx: CommandInteractionContext;

            if (command.category === "rpg" || command.ownerOnly || command.adminOnly) {
                const userData = await interaction.client.database.getRPGUserData(
                    interaction.user.id
                );
                ctx = new CommandInteractionContext(interaction, userData);
                if (!ctx.userData && command.data.name !== "adventure") {
                    if (interaction.options.getSubcommand() !== "start") {
                        return interaction.reply({
                            content: interaction.client.translations.get("en-US")(
                                "base:NO_ADVENTURE",
                                {
                                    emojis: interaction.client.localEmojis,
                                }
                            ),
                        });
                    }
                }
            } else ctx = new CommandInteractionContext(interaction);

            try {
                await command.execute(ctx);
            } catch (error) {
                console.error(error);
                await interaction
                    .reply({
                        content: `There was an error while executing this command. Please try again later.\nError: ${
                            (error as Error)["message"]
                        }`,
                        ephemeral: true,
                    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .catch(() => {});
            }
        }
    },
};

export default Event;
