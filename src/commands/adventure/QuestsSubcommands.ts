import { SlashCommandFile } from "../../@types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import dailyCommand from "./DailySubcommands";
import sideCommand from "./SideQuests";
import actionCommand from "./Action";

const sideQuestOption = {
    name: "side_quest",
    description: "The side quest you want to view",
    type: ApplicationCommandOptionType.String,
    required: true,
    autocomplete: true,
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "quests",
        description: "View quest progress and complete quest actions.",
        type: 1,
        options: [
            {
                name: "daily",
                description: "Shows your daily quests.",
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "side",
                description: "View side quest progress and information.",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "view",
                        description: "Shows your progress about a specific side quest.",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [sideQuestOption],
                    },
                    {
                        name: "info",
                        description: "Shows information about a specific side quest.",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [sideQuestOption],
                    },
                ],
            },
            {
                name: "action",
                description: "Complete an action quest.",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "use",
                        description: "Select a quest action to use.",
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
        ],
    },
    execute: async (ctx) => {
        const group = ctx.options.getSubcommandGroup(false);
        const subcommand = ctx.options.getSubcommand();

        if (group === "side") return sideCommand.execute(ctx);
        if (subcommand === "daily") return dailyCommand.execute(ctx);
        if (subcommand === "action") return actionCommand.execute(ctx);
    },
    autoComplete: async (interaction, userData, currentInput) => {
        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand();

        if (group === "side") {
            return sideCommand.autoComplete?.(interaction, userData, currentInput);
        }
        if (subcommand === "action") {
            return actionCommand.autoComplete?.(interaction, userData, currentInput);
        }
    },
};

export default slashCommand;
