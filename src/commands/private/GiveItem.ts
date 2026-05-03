import { SlashCommandFile } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";
import { auditedAdminAction } from "../../utils/AdminAudit";
import { cloneDeep } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "giveitem",
        description: "Admin: Give an item to a user",
        options: [
            {
                name: "item",
                description: "The item ID or name",
                type: 3,
                required: true,
            },
            {
                name: "user",
                description: "The target user",
                type: 6,
                required: false,
            },
            {
                name: "amount",
                description: "The amount to give",
                type: 4,
                required: false,
            },
        ],
    },
    adminOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const item = ctx.options.getString("item", true);
        const itemData = Functions.findItem(item);
        const user = ctx.options.getUser("user", false) || ctx.user;
        const userData = await ctx.client.database.getRPGUserData(user.id);
        const amount = ctx.options.getInteger("amount", false) ?? 1;

        if (amount <= 0) {
            return ctx.makeMessage({
                content: "Amount must be greater than 0.",
            });
        }

        if (!userData) {
            return ctx.makeMessage({
                content: `${userMention(user.id)} doesn't have a RPG account.`,
            });
        }

        if (!itemData) {
            return ctx.makeMessage({
                content: `Item \`${item}\` not found.`,
            });
        }

        const before = { inventory: cloneDeep(userData.inventory) };
        const itemAmount = userData.inventory[itemData.id] || 0;
        userData.inventory[itemData.id] = itemAmount + amount;
        const after = { inventory: cloneDeep(userData.inventory) };

        await ctx.client.database.saveUserData(userData);
        
        await auditedAdminAction(ctx, user.id, before, after, "GIVE_ITEM");

        return ctx.makeMessage({
            content: `${itemData.emoji} Gave ${userMention(user.id)} x${amount} ${itemData.name}.`,
        });
    },
};

export default slashCommand;
