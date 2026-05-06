import { SlashCommandFile, Leaderboard } from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";

const slashCommand: SlashCommandFile = {
    data: {
        name: "items",
        description: "This command is deprecated.",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        // item use, item sell, equip, unequip, item info, item discard, item recover
        await ctx.makeMessage({
            content: `This command is deprecated!\n\n- Use the ${ctx.client.getSlashCommandMention(
                "item use"
            )} command if you would like to use an (usable) item\n- Use the ${ctx.client.getSlashCommandMention(
                "item sell"
            )} command if you would like to sell an item\n- Use the ${ctx.client.getSlashCommandMention(
                "equip"
            )} command if you would like to equip an item (hat, weapon, armor...)\n- Use the ${ctx.client.getSlashCommandMention(
                "unequip"
            )} command if you would like to unequip an item\n- Use the ${ctx.client.getSlashCommandMention(
                "item info"
            )} command if you would like to view an item's info\n- Use the ${ctx.client.getSlashCommandMention(
                "item discard"
            )} command if you would like to throw an item\n- Use the ${ctx.client.getSlashCommandMention(
                "item recover"
            )} command if you would like to claim an item that has been thrown.\n\nIf you're lost or need help, contact us on our [support server](https://discord.gg/jolyne-support-923608916540145694) (https://discord.gg/jolyne-support-923608916540145694)`,
        });
    },
};

export default slashCommand;
