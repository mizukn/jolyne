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
        // inventory use, inventory sell, inventory equip, inventory unequip, inventory info, inventory throw, inventory claim
        await ctx.makeMessage({
            content: `This command is deprecated!\n\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory use"
            )} command if you would like to use an (usable) item\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory sell"
            )} command if you would like to sell an item\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory equip"
            )} command if you would like to equip an item (hat, weapon, armor...)\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory unequip"
            )} command if you would like to unequip an item\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory info"
            )} command if you would like to view an item's info\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory throw"
            )} command if you would like to throw an item\n- Use the ${ctx.client.getSlashCommandMention(
                "inventory claim"
            )} command if you would like to claim an item that has been thrown.\n\nIf you're lost or need help, contact us on our [support server](https://discord.gg/jolyne-support-923608916540145694) (https://discord.gg/jolyne-support-923608916540145694)`,
        });
    },
};

export default slashCommand;
