import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";
import * as Items from "../../rpg/Items";
const totalItems = Object.values(Items.default).filter(
    (x) => Functions.isConsumable(x) || Functions.isSpecial(x)
);

const slashCommand: SlashCommandFile = {
    data: {
        name: "itemuseadmin",
        description: "Uses an item",
        options: [
            {
                name: "item",
                description: "Item>",
                type: 3,
                required: true,
                autocomplete: true,
            },
            {
                name: "target",
                description: "Target",
                type: 6,
                required: false,
            },
            {
                name: "amount",
                description: "Amount",
                type: 4,
                required: false,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const item = ctx.options.getString("item", true);
        const target = ctx.options.getUser("target", false);
        const amount = ctx.options.getInteger("amount", false) || 1;

        let targetData = await ctx.client.database.getRPGUserData(
            target?.id || ctx.interaction.user.id
        );

        const itemData = totalItems.find((x) => x.id === item);
        if (!itemData) {
            return void ctx.makeMessage({
                content: "Item not found",
            });
        }

        /**
         *             if (Functions.isEquipableItem(itemData))
                return void ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Jolyne,
                        `Oi oi, you can't use equipable items like that! Use the ${ctx.client.getSlashCommandMention(
                            "inventory equip"
                        )} command instead.`
                    ),
                });
            const winContent = `You used ${itemData.emoji} x${amountX} \`${itemData.name}\` and got:`;
            const oldData = cloneDeep(ctx.userData);

            if (Functions.isConsumable(itemData)) {
                console.log(`Attempting to use consumable item: ${itemData.id}`);
                Functions.useConsumableItem(itemData, ctx.userData, amountX);
                Functions.removeItem(ctx.userData, itemString, amountX);
            } else if (Functions.isSpecial(itemData)) {
                const oldData = { ...ctx.userData } as RPGUserDataJSON;
                await ctx.client.database.setCooldown(
                    ctx.user.id,
                    "You're currently using an item."
                );
                try {
                    const status = await itemData.use(ctx);
                    if (status) {
                        Functions.removeItem(ctx.userData, itemString, status);
                        ctx.client.database.saveUserData(ctx.userData);
                    }
                } catch (e) {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                    ctx.followUp({
                        content: `An error occured while using this item. Your data has been saved.\n\nLogs for developer: ${
                            (e as Error).stack
                        }`,
                    });
                    console.error(e);
                    ctx.RPGUserData = oldData;
                    ctx.client.database.saveUserData(ctx.userData);
                    throw e;
                }
                await ctx.client.database.deleteCooldown(ctx.user.id);
                return;
                // TODO: If used multiple times
            }
            ctx.client.database.saveUserData(ctx.userData);
            ctx.makeMessage({
                content:
                    winContent +
                    " " +
                    (Functions.getRewardsCompareData(oldData, ctx.userData).join(", ") ??
                        "nothing"),
            });
         */

        if (Functions.isEquipableItem(itemData))
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Jolyne,
                    `Oi oi, you can't use equipable items like that! Use the ${ctx.client.getSlashCommandMention(
                        "inventory equip"
                    )} command instead.`
                ),
            });

        const oldData = cloneDeep(targetData);

        if (Functions.isConsumable(itemData)) {
            Functions.useConsumableItem(itemData, targetData, amount);
        } else if (Functions.isSpecial(itemData)) {
            await ctx.client.database.setCooldown(targetData.id, "You're currently using an item.");
            try {
                ctx.RPGUserData = targetData;
                await itemData.use(ctx);
            } catch (e) {
                ctx.client.database.deleteCooldown(targetData.id);
                ctx.followUp({
                    content: `An error occured while using this item. Your data has been saved.\n\nLogs for developer: ${
                        (e as Error).stack
                    }`,
                });
                console.error(e);
                targetData = oldData;
                ctx.client.database.saveUserData(targetData);
                throw e;
            }
            await ctx.client.database.deleteCooldown(targetData.id);
            return;
        }

        ctx.client.database.saveUserData(targetData);

        ctx.makeMessage({
            content: `\`${targetData.tag}\` used ${itemData.emoji} x${amount} \`${
                itemData.name
            }\` and got: ${
                Functions.getRewardsCompareData(oldData, targetData).join(", ") || "nothing"
            }`,
        });

        return;
    },

    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: {
            name: string;
            value: string;
        }[] = [];
        const input = currentInput.toLowerCase();

        const itemsX = totalItems.filter(
            (x) => x.name.toLowerCase().includes(input) || x.id.toLowerCase().includes(input)
        );

        for (let i = 0; i < itemsX.length && i < 25; i++) {
            toRespond.push({
                name: itemsX[i].name,
                value: itemsX[i].id,
            });
        }

        await interaction.respond(toRespond);
    },
};

export default slashCommand;
