import { SlashCommandFile } from "../../@types";
import { APIEmbed, InteractionResponse, Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "help",
        description: "Shows the help menu",
        options: [
            {
                name: "command",
                description: "The command to get help for ",
                type: 3,
                autocomplete: true,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<InteractionResponse | Message | void> => {
        if (ctx.interaction.options.getString("command")) {
            const command = ctx.client.allCommands.find(
                (x) => x.name === ctx.interaction.options.getString("command")
            );
            if (!command) {
                return await ctx.makeMessage({
                    content: "Command not found: " + ctx.interaction.options.getString("command"),
                });
            }
            const embed: APIEmbed = {
                title: `Help menu for: /${command.name}`,
                description:
                    ctx.client.getSlashCommandMention(command.name) + ": " + command.description,
                fields: [],
                color: 0x70926c,
            };
            if (command.options) {
                embed.fields.push({
                    name: "Options",
                    value:
                        `> ${ctx.client.getSlashCommandMention(command.name)} \`${command.options
                            .sort((a, b) => {
                                // required first
                                if (a.required && !b.required) return -1;
                                if (!a.required && b.required) return 1;
                                return a.name.localeCompare(b.name);
                            })
                            .map((x) => `${x.required ? `<${x.name}>` : `[${x.name}]`}`)
                            .join(" ")}\`\n` +
                        command.options
                            .sort((a, b) => {
                                // required first
                                if (a.required && !b.required) return -1;
                                if (!a.required && b.required) return 1;
                                return a.name.localeCompare(b.name);
                            })
                            .map(
                                (x) =>
                                    ` - \`${x.name}:\` ${x.description} ${
                                        x.required ? " (required)" : ""
                                    }`
                            )
                            .join("\n"),
                });
            }
            embed.fields.push({
                name: "Category",
                value: Functions.capitalize(command.category),
            });

            return await ctx.makeMessage({
                embeds: [embed],
            });
        }

        const descriptions: string[] = [
            `Jolyne has a total of ${
                ctx.client.allCommands.length
            } commands, including private commands.\nYou can use the ${ctx.client.getSlashCommandMention(
                "help"
            )} \`<command>\` command to get help for a specific command.\nIf you need help with something else, you can join the [support server](https://discord.gg/jolyne-support-923608916540145694)\n\n`,
        ];

        for (
            let i = 0;
            i < ctx.client.allCommands.filter((x) => x.category !== "private").length;
            i++
        ) {
            const lastDescription = descriptions[descriptions.length - 1];
            const currentCommand = ctx.client.allCommands.filter((x) => x.category !== "private")[
                i
            ];
            const toAdd = `- ${ctx.client.getSlashCommandMention(currentCommand.name)} ${
                currentCommand.options?.length > 0
                    ? `\`${currentCommand.options
                          .sort((a, b) => {
                              // required first
                              if (a.required && !b.required) return -1;
                              if (!a.required && b.required) return 1;
                              return a.name.localeCompare(b.name);
                          })
                          .map((x) => `${x.required ? `<${x.name}>` : `[${x.name}]`}`)
                          .join(" ")}\``
                    : ""
            }: ${currentCommand.description}\n`;
            if (lastDescription.length + toAdd.length > 4096) {
                descriptions.push(toAdd);
            } else {
                descriptions[descriptions.length - 1] += toAdd;
            }
        }

        const embeds: APIEmbed[] = [];

        for (let i = 0; i < descriptions.length; i++) {
            embeds.push({
                title: i === 0 ? "Help menu" : "",
                description: descriptions[i],
                fields: [],
                color: 0x70926c,
            });
        }
        /*
        for (const category of ["rpg", "utils"]) {
            embed.fields.push({
                name: Functions.capitalize(category),
                value:
            });
        }*/

        return await ctx.makeMessage({
            embeds,
        });
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const commands = interaction.client.allCommands.filter(
            (x) =>
                x.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                x.description.toLowerCase().includes(currentInput.toLowerCase())
        );

        await interaction.respond(
            commands
                .map((x) => ({
                    name: x.name,
                    value: x.name,
                    description: x.description,
                }))
                .slice(0, 24)
        );
    },
};
export default slashCommand;
