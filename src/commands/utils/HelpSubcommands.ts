import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserDataJSON,
    Consumable,
    numOrPerc,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as ActionQuestsL from "../../rpg/Quests/ActionQuests";

const slashCommand: SlashCommandFile = {
    data: {
        name: "help",
        description: "Show the help menu",
        options: [
            {
                name: "command",
                description: "The command to get help for",
                type: 3,
                required: false,
                autocomplete: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        //
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        //
    },
};

export default slashCommand;
