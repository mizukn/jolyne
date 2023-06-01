import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "giveitem",
        description: "ggg",
        options: [
            {
                name: "item",
                description: "ssss",
                type: 3,
                required: true,
            },
            {
                name: "user",
                description: "ssss",
                type: 6,
                required: false,
            },
        ],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const item = ctx.options.getString("item", true);
        const itemData = Functions.findItem(item);
        const user = ctx.options.getUser("user", false) || ctx.user;
        const userData = await ctx.client.database.getRPGUserData(user.id);
        if (!userData) {
            ctx.makeMessage({
                content: `${userMention(user.id)} doesn't have a RPG account.`,
            });
            return;
        }
        if (!itemData) {
            ctx.makeMessage({
                content: `Item \`${item}\` not found.`,
            });
            return;
        }
        const itemAmount = userData.inventory[itemData.id] || 0;
        userData.inventory[itemData.id] = itemAmount + 1;
        await ctx.client.database.saveUserData(userData);
        ctx.makeMessage({
            content: `${itemData.emoji} Gave ${userMention(user.id)} ${itemData.name}.`,
        });
    },
};

export default slashCommand;
