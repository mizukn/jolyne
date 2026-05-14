import {
    SlashCommandFile,
    RPGUserDataJSON,
    formattedEquipableItemTypes,
    equipableItemTypesLimit,
    SkillPoints,
    Weapon,
} from "../../@types";
import {
    Message,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
    InteractionResponse,
    MessageFlags,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { claimedItemsWebhook, thrownItemsWebhook } from "../../utils/Webhooks";
import { NPCs } from "../../rpg/NPCs";
import { cloneDeep } from "lodash";
import { COLORS, containers, ephemeralV2, SectionData, V2Reply } from "../../utils/containers";

const ITEMS_PER_PAGE = 5;

const itemTaxes = {
    T: 1,
    SS: 1,
    S: 0.78,
    A: 0.65,
    B: 0.46,
    C: 0.3,
};

export async function unequipInventoryItem(ctx: CommandInteractionContext, itemStringArg?: string, isButton = false): Promise<void> {
    const itemString = fixItemString(itemStringArg ?? ctx.interaction.options.getString("item", true));
    
    const respond = async (payload: any): Promise<void> => {
        if (isButton) return void await ctx.interaction.editReply(payload);
        return void await ctx.makeMessage(payload);
    };

    const itemData = Functions.findItem(itemString);
    if (!itemData) {
        return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
    }
    if (!Object.keys(ctx.userData.equippedItems).includes(itemData.id)) {
        return await respond(containers.error(`You don't have this item equipped.`));
    }

    const oldData = cloneDeep(ctx.userData);
    delete ctx.userData.equippedItems[itemData.id];
    ctx.userData.inventory[itemData.id] = (ctx.userData.inventory[itemData.id] || 0) + 1;
    
    const transaction = await ctx.client.database.handleTransaction(
        [{ oldData, newData: ctx.userData }],
        `Unequipped ${itemData.name}`
    );

    if (!transaction) {
        return await respond(containers.error("Transaction failed. Item was not unequipped."));
    }

    await respond(containers.success(`Unequipped ${itemData.emoji} **${itemData.name}**`));
}

export async function equipInventoryItem(ctx: CommandInteractionContext, itemStringArg?: string, isButton = false): Promise<void> {
    let itemString = fixItemString(itemStringArg ?? ctx.interaction.options.getString("item", true));
    const amountX = 1;

    const respond = async (payload: any): Promise<void> => {
        if (isButton) return void await ctx.interaction.editReply(payload);
        return void await ctx.makeMessage(payload);
    };

    if (ctx.userData.inventory[itemString] === undefined) {
        const foundItem = Functions.findItem(itemString);
        if (foundItem) {
            itemString = foundItem.id;
        } else {
            return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
        }
    }
    const left = ctx.userData.inventory[itemString] || 0;

    if (left === 0) {
        return await respond(containers.error("You don't have any of this item left."));
    }

    const itemData = Functions.findItem(itemString);
    if (!itemData) {
        return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
    }
    if (!Functions.isEquipableItem(itemData)) {
        return await respond(containers.error(`You can't equip this item.`));
    }
    if (
        Object.values(ctx.userData.equippedItems).filter((r) => r === itemData.type).length >=
        equipableItemTypesLimit[itemData.type]
    ) {
        return await respond(containers.error(`You can't equip more than **${equipableItemTypesLimit[itemData.type]}** items of this type.`));
    }
    if (Object.keys(ctx.userData.equippedItems).find((r) => r === itemData.id)) {
        return await respond(containers.error(`You already have this item equipped.`));
    }

    if (!Functions.userMeetsRequirementsForItem(ctx.userData, itemData)) {
        return await respond(containers.error(`You don't meet the requirements to equip this item. Use ${ctx.client.getSlashCommandMention("item info")} to see what you need.`));
    }

    const oldData = cloneDeep(ctx.userData);
    ctx.userData.equippedItems[itemData.id] = itemData.type;
    ctx.userData.inventory[itemData.id] -= amountX;
    if (ctx.userData.inventory[itemData.id] === 0) delete ctx.userData.inventory[itemData.id];

    const transaction = await ctx.client.database.handleTransaction(
        [{ oldData, newData: ctx.userData }],
        `Equipped ${itemData.name}`
    );

    if (!transaction) {
        return await respond(containers.error("Transaction failed. Item was not equipped."));
    }

    await respond(containers.success(`[${formattedEquipableItemTypes[itemData.type]}] You equipped ${itemData.emoji} **${itemData.name}**`));
}

export async function useInventoryItem(ctx: CommandInteractionContext, itemStringArg?: string, amountArg?: number, isButton = false): Promise<void> {
    let itemString = fixItemString(itemStringArg ?? ctx.interaction.options.getString("item", true));
    const amountX = amountArg ?? ctx.interaction.options.getInteger("amount") ?? 1;

    const respond = async (payload: any): Promise<void> => {
        if (isButton) return void await ctx.interaction.editReply(payload);
        return void await ctx.makeMessage(payload);
    };

    if (ctx.userData.inventory[itemString] === undefined) {
        const foundItem = Functions.findItem(itemString);
        if (foundItem) {
            itemString = foundItem.id;
        } else {
            return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
        }
    }

    const left = ctx.userData.inventory[itemString] || 0;
    if (left === 0) {
        return await respond(containers.error("You don't have any of this item left."));
    }
    if (left < amountX) {
        return await respond(containers.error(`You don't have enough of this item. You have **${left}** left.`));
    }

    const itemData = Functions.findItem(itemString);
    if (!itemData) {
        return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
    }

    if (Functions.isEquipableItem(itemData))
        return await respond(containers.error(
                Functions.makeNPCString(
                    NPCs.Jolyne,
                    `Oi oi, you can't use equipable items like that! Use the ${ctx.client.getSlashCommandMention("equip")} command instead.`
                )
            ));

    const oldData = cloneDeep(ctx.userData);

    if (Functions.isConsumable(itemData)) {
        Functions.useConsumableItem(itemData, ctx.userData, amountX);
        Functions.removeItem(ctx.userData, itemString, amountX);
    } else if (Functions.isSpecial(itemData)) {
        await ctx.client.database.setCooldown(ctx.user.id, "You're currently using an item.");
        try {
            const status = await itemData.use(ctx);
            if (status) {
                const statusX = Functions.removeItem(ctx.userData, itemString, status);
                if (!statusX) {
                    ctx.RPGUserData = oldData;
                    await ctx.client.database.saveUserData(ctx.userData);
                    if (!isButton) await ctx.interaction.followUp(containers.error("An error occured while using this item. Your data has been rolled back."));
                    else await ctx.interaction.editReply(containers.error("An error occured while using this item. Your data has been rolled back."));
                    return;
                }
                await ctx.client.database.handleTransaction(
                    [{ oldData, newData: ctx.userData }],
                    `Used ${itemData.name}`,
                    [statusX]
                );
            }
        } catch (e) {
            await ctx.client.database.deleteCooldown(ctx.user.id);
            ctx.RPGUserData = oldData;
            await ctx.client.database.saveUserData(ctx.userData);
            throw e;
        }
        await ctx.client.database.deleteCooldown(ctx.user.id);
        return;
    } else {
        return await respond(containers.error(`You can't use this item..?`));
    }

    await ctx.client.database.handleTransaction(
        [{ oldData, newData: ctx.userData }],
        `Used ${itemData.name}`
    );
    
    const rewards = Functions.getRewardsCompareData(oldData, ctx.userData).join(", ");
    await respond(containers.success(`You used ${itemData.emoji} x${amountX} **${itemData.name}** and got: ${rewards || "nothing"}`));
}

export async function sellInventoryItem(ctx: CommandInteractionContext, itemStringArg?: string, amountArg?: number, isButton = false): Promise<void> {
    const itemString = fixItemString(itemStringArg ?? ctx.interaction.options.getString("item", true));
    const amountX = amountArg ?? ctx.interaction.options.getInteger("amount") ?? 1;
    const left = ctx.userData.inventory[itemString] || 0;

    const respond = async (payload: any): Promise<void> => {
        if (isButton) return void await ctx.interaction.editReply(payload);
        return void await ctx.makeMessage(payload);
    };

    if (left === 0) {
        return await respond(containers.error("You don't have any of this item left."));
    }
    if (left < amountX) {
        return await respond(containers.error(`You don't have enough of this item. You have **${left}** left.`));
    }
    if (amountX < 1) {
        return await respond(containers.error("You can't sell less than 1 item. Nice try."));
    }

    const itemData = Functions.findItem(itemString);
    if (!itemData) {
        return await respond(containers.error(`Unknown item: \`${itemString}\`.`));
    }

    if (itemData.rarity === "C" && !itemData.id.includes("$")) {
        return await respond(containers.warning(Functions.makeNPCString(
                NPCs.Pucci,
                `Bro, don't sell me trash items. wtf is that? You better ${ctx.client.getSlashCommandMention("item discard")} that away.`
            )));
    }

    if (itemData.id === "dungeon_key") {
        return await respond(containers.warning(Functions.makeNPCString(
                NPCs.Pucci,
                `H-Hey... I'm not interested in buying that. Y-You should keep it for yourself... (${ctx.client.getSlashCommandMention("dungeon")})`
            )));
    }

    if (!itemData.price) {
        return await respond(containers.error(Functions.makeNPCString(
                NPCs.Pucci,
                `I'm sorry, but this item is not sellable.`
            )));
    }

    const salePrice = Math.round(itemData.price * itemTaxes[itemData.rarity as keyof typeof itemTaxes] * amountX);
    const confirmId = `${ctx.interaction.id}_confirm_sell_${Date.now()}`;

    const warningReply = containers.warning(Functions.makeNPCString(
        NPCs.Pucci,
        `Since this item is ${itemData.rarity} tier, I'll give you ${itemTaxes[itemData.rarity as keyof typeof itemTaxes] * 100}% of the original price.\n> You'll get **${salePrice.toLocaleString()}** ${ctx.client.localEmojis.jocoins} for x${amountX} ${itemData.emoji} ${itemData.name}.`
    ));

    warningReply.components.push(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(confirmId)
                .setLabel("Confirm Sale")
                .setEmoji(ctx.client.localEmojis.jocoins)
                .setStyle(ButtonStyle.Danger)
        )
    );

    await respond(warningReply);

    const collector = ctx.channel.createMessageComponentCollector({
        filter: (i) => i.customId === confirmId && i.user.id === ctx.user.id,
        time: 60000,
        max: 1,
    });

    collector.on("collect", async (i) => {
        if (await ctx.antiCheat(true)) {
            collector.stop("cheat");
            return;
        }
        const oldData = cloneDeep(ctx.userData);
        
        Functions.addCoins(ctx.userData, salePrice);
        const result = Functions.removeItem(ctx.userData, itemString, amountX);
        
        const transaction = await ctx.client.database.handleTransaction(
            [{ oldData, newData: ctx.userData }],
            `Sold x${amountX} ${itemData.name}`,
            [result]
        );

        if (!transaction) {
            return void await i.update({ content: "", embeds: [], ...containers.error("An error occured while selling this item.") });
        }

        await i.update({
            content: "",
            embeds: [],
            ...containers.success(Functions.makeNPCString(
                NPCs.Pucci,
                `Thanks for selling me ${itemData.emoji} x${amountX} **${itemData.name}**! (+${salePrice.toLocaleString()} ${ctx.client.localEmojis.jocoins})`
            ))
        });
    });
}

const slashCommand: SlashCommandFile = {
    hiddenCommandNames: [
        "inventory use",
        "inventory equip",
        "inventory info",
        "inventory unequip",
        "inventory throw",
        "inventory claim",
        "inventory sell",
    ],
    data: {
        name: "inventory",
        description: "Show information about your inventory",
        options: [
            {
                name: "view",
                description: "Shows your inventory",
                type: 1,
            },
            {
                name: "use",
                description: "Uses an item. Consumes it.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to use. ",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "How many times do you want to use that item? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
            {
                name: "equip",
                description: "Equips an item. You can only equip items that are equippable.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to equip.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "info",
                description: "Shows info about an item that you own.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to view info about.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "unequip",
                description: "Unequips an item. You can only unequip items that are equipable.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to unequip.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "throw",
                description:
                    "Throws an item away. Can be re-claimed by using the /item recover command [args: ID]",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to throw away.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description:
                            "How many times do you want to throw that item away? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
            {
                name: "claim",
                description: "Claims an item that you or someone threw away.",
                type: 1,
                options: [
                    {
                        name: "id",
                        description: "The ID of the item you want to claim.",
                        type: 3,
                        required: true,
                    },
                ],
            },
            {
                name: "sell",
                description: "Sells an item.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to sell.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "How many times do you want to sell that item? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const rarityValue = {
            SS: 100,
            T: 100,
            S: 50,
            A: 25,
            B: 15,
            C: 0,
        };
        const userItems = Object.keys(ctx.userData.inventory)
            .map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (ctx.userData.inventory[v] === 0) return;
                return {
                    id: item.id,
                    name: item.name,
                    emoji: item.emoji,
                    rarity: item.rarity,
                    price: item.price,
                    amount: ctx.userData.inventory[v],
                };
            })
            .filter((v) => v !== undefined)
            .sort((a, b) => {
                let aVal = rarityValue[a.rarity as keyof typeof rarityValue];
                let bVal = rarityValue[b.rarity as keyof typeof rarityValue];

                if (a.name.toLowerCase().includes("disc")) aVal += 15;
                if (b.name.toLowerCase().includes("disc")) bVal += 15;

                if (a.name.toLowerCase().includes("arrow")) aVal += 10;
                if (b.name.toLowerCase().includes("arrow")) bVal += 10;

                if (a.name.toLowerCase().includes("box")) aVal += 9;
                if (b.name.toLowerCase().includes("box")) bVal += 9;

                if (a.name.length > b.name.length) aVal += 5;
                if (b.name.length > a.name.length) bVal += 5;

                return aVal - bVal;
            });

        const subcommand = ctx.interaction.options.getSubcommand();

        if (subcommand === "view") {
            if (userItems.length === 0) {
                return void ctx.makeMessage(containers.primary({
                    title: "🎒 Inventory",
                    description: "Your bag is empty. Go get some loot! 🤡",
                    color: COLORS.warning
                }));
            }

            const totalPages = Math.max(1, Math.ceil(userItems.length / ITEMS_PER_PAGE));
            let page = 0;

            const buildReply = (p: number): V2Reply => {
                const start = p * ITEMS_PER_PAGE;
                const pageItems = userItems.slice(start, start + ITEMS_PER_PAGE);

                const sections: SectionData[] = pageItems.map(item => ({
                    text: `### ${item.emoji} **${item.name}**\n> -# **x${item.amount.toLocaleString()}** • Rarity: **${item.rarity}**`,
                    accessory: new ButtonBuilder()
                        .setCustomId(`${ctx.interaction.id}_info_${item.id}`)
                        .setLabel("Details")
                        .setStyle(ButtonStyle.Secondary)
                }));

                const reply = containers.primary({
                    title: "# 🎒 Inventory",
                    description: `You are carrying **${userItems.length}** types of items.`,
                    descriptionDivider: true,
                    sections,
                    sectionDividers: true,
                    color: COLORS.primary,
                    footer: `Page ${p + 1}/${totalPages} • ${ctx.client.getSlashCommandMention("item info")} <item> for full stats`,
                });

                if (totalPages > 1) {
                    reply.components.push(
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${ctx.interaction.id}_prev`)
                                .setEmoji("⬅️")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(p === 0),
                            new ButtonBuilder()
                                .setCustomId(`${ctx.interaction.id}_page`)
                                .setLabel(`${p + 1} / ${totalPages}`)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`${ctx.interaction.id}_next`)
                                .setEmoji("➡️")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(p === totalPages - 1)
                        )
                    );
                }
                return reply;
            };

            await ctx.makeMessage(buildReply(page));

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(ctx.interaction.id),
                time: 120000,
            });

            collector.on("collect", async (i) => {
                if (i.customId === `${ctx.interaction.id}_prev`) {
                    page--;
                    await i.update(buildReply(page));
                } else if (i.customId === `${ctx.interaction.id}_next`) {
                    page++;
                    await i.update(buildReply(page));
                } else if (i.customId.startsWith(`${ctx.interaction.id}_info_`)) {
                    const itemId = i.customId.replace(`${ctx.interaction.id}_info_`, "");
                    await i.reply(
                        ephemeralV2(
                            containers.info(
                                `To view full details, use: ${ctx.client.getSlashCommandMention("item info")} \`item:${itemId}\``,
                            ),
                        ),
                    );
                }
            });
        } else if (subcommand === "info") {
            const itemString = fixItemString(ctx.interaction.options.getString("item", true));
            const itemData = Functions.findItem(itemString);

            if (!itemData) {
                return void ctx.makeMessage(containers.error(`Unknown item: \`${itemString}\`.`));
            }

            const count = ctx.userData.inventory[itemData.id] || 0;
            const equippedItem = ctx.userData.equippedItems[itemData.id];
            const isEquipped = !!equippedItem;

            const sections: SectionData[] = [
                {
                    text: `### 💎 **Rarity:** ${itemData.rarity}\n> **Price:** ${itemData.price?.toLocaleString() ?? "N/A"} ${ctx.client.localEmojis.jocoins} • **Tradable:** ${itemData.tradable ? "Yes" : "No"}\n> **Owned:** x${count.toLocaleString()} • **Status:** ${isEquipped ? "Equipped" : "In Bag"}`
                }
            ];

            if (Functions.isEquipableItem(itemData)) {
                let bonusText = `### ✨ **Equip Bonuses**\n❤️ **Health:** +${itemData.effects.health ?? 0}\n🔋 **Stamina:** +${itemData.effects.stamina ?? 0}`;
                if (itemData.effects.xpBoost) bonusText += `\n✨ **XP Boost:** ${itemData.effects.xpBoost}%`;
                if (itemData.effects.skillPoints) {
                    bonusText += "\n" + Object.entries(itemData.effects.skillPoints)
                        .map(([k, v]) => `🌀 **${Functions.capitalize(k)}:** +${v}`)
                        .join("\n");
                }
                if (itemData.effects.standDiscIncrease) {
                    bonusText += `\n💾 **Stand Discs:** +${itemData.effects.standDiscIncrease}`;
                }

                sections.push({ text: bonusText });

                if (itemData.requirements) {
                    let reqText = `### 📋 **Requirements**\n⭐ **Level:** ${itemData.requirements.level ?? 0}`;
                    if (itemData.requirements.skillPoints) {
                        reqText += "\n" + Object.entries(itemData.requirements.skillPoints)
                            .map(([k, v]) => `🌀 **${Functions.capitalize(k)}:** ${v}`)
                            .join("\n");
                    }
                    sections.push({ text: reqText });
                }
            } else if (Functions.isConsumable(itemData)) {
                let effectText = "";
                if (itemData.effects.health) effectText += `❤️ **Health:** +${itemData.effects.health}\n`;
                if (itemData.effects.stamina) effectText += `🔋 **Stamina:** +${itemData.effects.stamina}\n`;
                
                sections.push({
                    text: `### ✨ **Effects**\n${effectText.trim() || "No immediate effects."}`
                });
            }

            const reply = containers.primary({
                title: `# ${itemData.emoji} ${itemData.name}`,
                description: itemData.description,
                descriptionDivider: true,
                sections,
                sectionDividers: true,
                color: Functions.isWeapon(itemData) ? itemData.color : COLORS.accent,
                footer: "Use the buttons below to manage this item."
            });

            const actionButtons: ButtonBuilder[] = [];

            if (Functions.isEquipableItem(itemData)) {
                if (isEquipped) {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId(`${ctx.interaction.id}_unequip_${itemData.id}`)
                            .setLabel("Unequip")
                            .setStyle(ButtonStyle.Danger)
                    );
                } else if (count > 0) {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId(`${ctx.interaction.id}_equip_${itemData.id}`)
                            .setLabel("Equip")
                            .setStyle(ButtonStyle.Success)
                    );
                }
            } else if (count > 0 && (Functions.isConsumable(itemData) || Functions.isSpecial(itemData))) {
                 actionButtons.push(
                    new ButtonBuilder()
                        .setCustomId(`${ctx.interaction.id}_use_${itemData.id}`)
                        .setLabel("Use Item")
                        .setStyle(ButtonStyle.Primary)
                );
            }

            if (count > 0 && itemData.price && itemData.rarity !== "C") {
                 actionButtons.push(
                    new ButtonBuilder()
                        .setCustomId(`${ctx.interaction.id}_sell_${itemData.id}`)
                        .setLabel("Sell")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(ctx.client.localEmojis.jocoins)
                );
            }

            if (actionButtons.length > 0) {
                reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(actionButtons));
            }

            await ctx.makeMessage(reply);

            if (actionButtons.length > 0) {
                const collector = ctx.channel.createMessageComponentCollector({
                    filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(ctx.interaction.id),
                    time: 60000,
                });

                collector.on("collect", async (i) => {
                    await i.deferUpdate();
                    collector.stop();

                    if (i.customId.includes("_sell_")) {
                        await sellInventoryItem(ctx, itemData.id, 1, true);
                    } else if (i.customId.includes("_equip_")) {
                        await equipInventoryItem(ctx, itemData.id, true);
                    } else if (i.customId.includes("_unequip_")) {
                        await unequipInventoryItem(ctx, itemData.id, true);
                    } else if (i.customId.includes("_use_")) {
                        await useInventoryItem(ctx, itemData.id, 1, true);
                    }
                });
            }
        } else if (subcommand === "unequip") {
            await unequipInventoryItem(ctx);
        } else if (subcommand === "equip") {
            await equipInventoryItem(ctx);
        } else if (subcommand === "use") {
            await useInventoryItem(ctx);
        } else if (subcommand === "sell") {
            await sellInventoryItem(ctx);
        } else if (["throw", "discard"].includes(subcommand)) {
            if (Functions.userIsCommunityBanned(ctx.userData)) {
                return void ctx.makeMessage({
                    ...containers.error("You're community banned. You can't throw items. You should throw yourself instead."),
                    flags: MessageFlags.Ephemeral,
                });
            }
            const itemString = fixItemString(ctx.interaction.options.getString("item", true));
            const left = ctx.userData.inventory[itemString] || 0;
            const amountX = ctx.interaction.options.getInteger("amount") || 1;

            if (amountX <= 0 || amountX === Infinity) {
                return void ctx.makeMessage({
                    ...containers.error("Stop trying to find glitches."),
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (left === 0) {
                return void ctx.makeMessage(containers.error("You don't have any of this item left."));
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                return void ctx.makeMessage(containers.error(`Unknown item: \`${itemString}\`.`));
            }

            if (left < amountX) {
                return void ctx.makeMessage(containers.error(`You don't have enough of this item. You have **${left}** left.`));
            }

            if (!itemData.tradable || !itemData.storable) {
                return void ctx.makeMessage(containers.error("You can't throw this item."));
            }

            const itemId = Functions.generateRandomId();
            const oldData = cloneDeep(ctx.userData);
            const itemDataJSON = {
                item: itemData.id,
                amount: amountX,
                droppedBy: ctx.user.id,
                droppedAt: Date.now(),
            };
            
            await ctx.client.database.redis.set("thrownItem_" + itemId, JSON.stringify(itemDataJSON));
            
            const status = Functions.removeItem(ctx.userData, itemString, amountX);
            const transaction = await ctx.client.database.handleTransaction(
                [{ oldData, newData: ctx.userData }],
                `Thrown x${amountX} ${itemData.name} [ID: ${itemId}]`,
                [status]
            );

            if (!transaction) {
                return void ctx.makeMessage(containers.error("An error occured while throwing this item."));
            }

            await thrownItemsWebhook.send({
                embeds: [{
                    title: "Item thrown",
                    description: `> - User: **${ctx.user.tag}** (<@!${ctx.user.id}>)\n> - Item: ${itemData.emoji} x${amountX} \`${itemData.name}\`\n> - Item ID: \`${itemId}\`\n> - Guild: \`${ctx.guild.name}\` (\`${ctx.guild.id}\`)`,
                    color: 0x00ff00,
                    timestamp: new Date().toISOString(),
                }],
            });

            await ctx.makeMessage(containers.success(`You threw ${itemData.emoji} x${amountX} **${itemData.name}**!\n> Use ${ctx.client.getSlashCommandMention("item recover")} \`id:${itemId}\` to pick it up again.\n> *The item will be deleted in a week.*`));

        } else if (["claim", "recover"].includes(subcommand)) {
            if (Functions.userIsCommunityBanned(ctx.userData)) {
                return void ctx.makeMessage({
                    ...containers.error("You're community banned. You can't claim items. You should throw yourself instead."),
                    flags: MessageFlags.Ephemeral,
                });
            }

            const itemId = ctx.interaction.options.getString("id", true);
            const itemDataStr = await ctx.client.database.redis.get("thrownItem_" + itemId);
            if (!itemDataStr) {
                return void ctx.makeMessage(containers.error("This item does not exist or has already been claimed."));
            }

            const itemDataJSON: { item: string; amount: number; droppedBy: string; droppedAt: number; } = JSON.parse(itemDataStr);
            const item = Functions.findItem(itemDataJSON?.item);
            
            if (!item) {
                return void ctx.makeMessage(containers.error("This item does not exist or has already been claimed."));
            }

            if (item.id.includes("$disc$") && Functions.hasExceedStandLimit(ctx)) {
                return void ctx.makeMessage(containers.error("You don't have enough Stand Disc Storage! Sell or throw some away."));
            }

            if (Date.now() - itemDataJSON.droppedAt > 604800000) {
                await ctx.client.database.redis.del("thrownItem_" + itemId);
                return void ctx.makeMessage(containers.error(`This item has expired [${item.emoji} x${itemDataJSON.amount} **${item.name}**].`));
            }

            const oldData = cloneDeep(ctx.userData);
            const result = Functions.addItem(ctx.userData, itemDataJSON.item, itemDataJSON.amount, true);
            
            const transaction = await ctx.client.database.handleTransaction(
                [{ oldData, newData: ctx.userData }],
                `Claimed x${itemDataJSON.amount} ${item.name} [ID: ${itemId}]`,
                [result]
            );

            if (!transaction) {
                return void ctx.makeMessage(containers.error("Transaction failed. An error occured while claiming this item."));
            }

            await ctx.client.database.redis.del("thrownItem_" + itemId);

            await claimedItemsWebhook.send({
                embeds: [{
                    title: "Item claimed",
                    description: `> - User: **${ctx.user.tag} (<@!${ctx.user.id}>)**\n> - Item: ${item.emoji} x${itemDataJSON.amount} \`${item.name}\`\n> - Item ID: \`${itemId}\`\n> - Guild: \`${ctx.guild.name}\` (\`${ctx.guild.id}\`)`,
                    color: 0x00ff00,
                    timestamp: new Date().toISOString(),
                }],
            });

            await ctx.makeMessage(containers.success(`You claimed ${item.emoji} x${itemDataJSON.amount} **${item.name}**!`));
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "use") {
            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (userData.inventory[v] === 0) return;
                if (Functions.isEquipableItem(item)) return;
                if (!Functions.isConsumable(item) && !Functions.isSpecial(item)) return;

                return {
                    name: item.name,
                    amount: userData.inventory[v],
                    id: v,
                };
            }).filter((r): r is NonNullable<typeof r> => !!r);

            await interaction.respond(
                userItems
                    .map((i) => ({
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                    }))
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        } else if (subcommand === "info") {
            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (userData.inventory[v] === 0) return;

                return {
                    name: item.name,
                    id: v,
                };
            }).filter((r): r is NonNullable<typeof r> => !!r);

            await interaction.respond(
                userItems
                    .map((i) => ({
                        value: i.id,
                        name: i.name,
                    }))
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        } else if (subcommand === "equip") {
            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (!Functions.isEquipableItem(item)) return;
                if (userData.inventory[v] === 0) return;

                return {
                    name: item.name + ` [${formattedEquipableItemTypes[item.type]}]`,
                    amount: userData.inventory[v],
                    id: v,
                };
            }).filter((r): r is NonNullable<typeof r> => !!r);

            await interaction.respond(
                userItems
                    .map((i) => ({
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                    }))
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        } else if (subcommand === "unequip") {
            const userItems = Object.keys(userData.equippedItems).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (!Functions.isEquipableItem(item)) return;

                return {
                    name: item.name + ` [${formattedEquipableItemTypes[item.type]}]`,
                    id: v,
                };
            }).filter((r): r is NonNullable<typeof r> => !!r);

            await interaction.respond(
                userItems
                    .map((i) => ({
                        value: i.id,
                        name: i.name,
                    }))
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        } else if (["sell", "throw", "discard"].includes(subcommand)) {
            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (userData.inventory[v] === 0) return;

                return {
                    name: item.name,
                    amount: userData.inventory[v],
                    id: v,
                };
            }).filter((r): r is NonNullable<typeof r> => !!r);

            await interaction.respond(
                userItems
                    .map((i) => ({
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                    }))
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        }
    },
};

function fixItemString(str: string): string {
    if (str.includes("(") && str.includes(")") && str.includes("x") && str.includes("left")) {
        return str.split("(")[0].trim();
    }
    return str;
}

export default slashCommand;
