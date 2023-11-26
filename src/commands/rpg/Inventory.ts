import {
    SlashCommandFile,
    RPGUserDataJSON,
    numOrPerc,
    formattedEquipableItemTypes,
    equipableItemTypesLimit,
    SkillPoints,
    Weapon,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { claimedItemsWebhook, thrownItemsWebhook } from "../../utils/Webhooks";
import { NPCs } from "../../rpg/NPCs";
import { cloneDeep } from "lodash";
import e from "express";

const slashCommand: SlashCommandFile = {
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
                    "Throws an item away. Can be re-claimed by using the /inventory claim command [args: ID]",
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
                    name: item.name,
                    emoji: item.emoji,
                    rarity: item.rarity,
                    price: item.price,
                    amount: ctx.userData.inventory[v],
                };
            })
            .filter((v) => v !== undefined)
            .sort((a, b) => {
                let aVal = rarityValue[a.rarity];
                let bVal = rarityValue[b.rarity];

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

        if (ctx.interaction.options.getSubcommand() === "view") {
            const content: string[][] = [[]];
            const contentPhaseMaxLength = 2048;

            if (userItems.length === 0) {
                content.push(["WTF? you got no items bro, how is that even possible? :clown:"]);
            }

            for (const item of userItems) {
                const emoji =
                    item === userItems[userItems.length - 1]
                        ? ctx.client.localEmojis.replyEnd
                        : ctx.client.localEmojis.reply;

                const itemString = `${emoji} ${item.emoji} \`${item.name} (x${item.amount})\``;
                if (
                    content[content.length - 1].join("\n").length + itemString.length >
                    contentPhaseMaxLength
                )
                    content.push([]);
                content[content.length - 1].push(itemString);
            }

            const nextPageButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setEmoji("943187898495303720")
                .setCustomId("nextPage");
            const prevPageButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setEmoji("943188053390929940")
                .setCustomId("prevPage");
            let page = 0;

            // wtf is that fucking rule???
            // eslint-disable-next-line no-inner-declarations
            function goToPage() {
                return ctx.makeMessage({
                    embeds: [
                        {
                            title: `${ctx.client.localEmojis.inventory} Inventory`,
                            description: content[page].join("\n"),
                            color: 0x2f3136,
                            footer: {
                                text: `Page ${page + 1}/${content.length}`,
                            },
                        },
                    ],
                    components: [
                        Functions.actionRow([
                            prevPageButton.setDisabled(page === 0),
                            nextPageButton.setDisabled(page === content.length - 1),
                        ]),
                    ],
                });
            }

            await goToPage();

            if (content.length === 1) return;

            const filter = (i: MessageComponentInteraction) => {
                return i.user.id === ctx.user.id;
            };
            const collector = ctx.interaction.channel.createMessageComponentCollector({
                filter,
                time: 30000,
            });

            collector.on("collect", async (i) => {
                i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                if (i.customId === "nextPage") {
                    page++;
                } else if (i.customId === "prevPage") {
                    page--;
                }
                await goToPage();
            });
        } else if (ctx.interaction.options.getSubcommand() === "info") {
            const itemString = ctx.interaction.options.getString("item", true);
            const itemData = Functions.findItem(itemString);

            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }

            const embed: APIEmbed = {
                title: itemData.emoji + " " + itemData.name,
                description: itemData.description,
                color: (itemData as Weapon).color,
                fields: [
                    {
                        name: "Rarity",
                        value: itemData.rarity,
                        inline: true,
                    },
                    {
                        name: "Price",
                        value: `${ctx.client.localEmojis.jocoins} ${
                            itemData.price ?? "N/A (unbuyable/not sellable)"
                        }`,
                        inline: true,
                    },
                    {
                        name: "Tradable?",
                        value: itemData.tradable ? "Yes" : "Unofortunately not :pensive:",
                        inline: true,
                    },
                ],
            };

            if (Functions.isEquipableItem(itemData)) {
                embed.fields.push({
                    name: "Bonus if equipped",
                    value: `${ctx.client.localEmojis.xp} XP Boost: **${
                        itemData.effects.xpBoost ?? 0
                    }%**\n\`[+]\` Health: **${itemData.effects.health ?? 0}**\n\`[+]\` Stamina: **${
                        itemData.effects.stamina ?? 0
                    }**\n${
                        itemData.effects.skillPoints
                            ? Object.keys(itemData.effects.skillPoints)
                                  .map((x) => {
                                      return `\`[SP]\` ${Functions.capitalize(x)}: **${
                                          itemData.effects.skillPoints[x as keyof SkillPoints]
                                      }**`;
                                  })
                                  .join("\n")
                            : ""
                    }`,
                    inline: true,
                });
                if (itemData.requirements)
                    embed.fields.push({
                        name: "Requirements to equip",
                        value: `Level: ${itemData.requirements.level ?? 0}\n${
                            itemData.requirements.skillPoints
                                ? Object.keys(itemData.requirements.skillPoints)
                                      .map((x) => {
                                          return `[SP] ${Functions.capitalize(x)}: ${
                                              itemData.requirements.skillPoints[
                                                  x as keyof SkillPoints
                                              ]
                                          }`;
                                      })
                                      .join("\n")
                                : ""
                        }`,
                        inline: true,
                    });
            } else if (Functions.isConsumable(itemData)) {
                embed.fields.push({
                    name: "Effects",
                    value: `${
                        itemData.effects.health
                            ? `\`[+]\` Health: **${
                                  itemData.effects.health +
                                  (typeof itemData.effects.health === "string" ? "%" : "")
                              }**\n`
                            : ""
                    }${
                        itemData.effects.stamina
                            ? `\`[+]\` stamina: **${
                                  itemData.effects.health +
                                  (typeof itemData.effects.health === "string" ? "%" : "")
                              }**\n`
                            : ""
                    }`,
                });
            }

            await ctx.makeMessage({
                embeds: [embed],
            });
        } else if (ctx.interaction.options.getSubcommand() === "unequip") {
            const itemString = ctx.interaction.options.getString("item", true);
            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }
            if (!Object.keys(ctx.userData.equippedItems).includes(itemString)) {
                await ctx.makeMessage({
                    content: `You don't have this item equipped.`,
                });
                return;
            }

            delete ctx.userData.equippedItems[itemData.id];
            ctx.userData.inventory[itemData.id] = (ctx.userData.inventory[itemData.id] || 0) + 1;
            await ctx.client.database.saveUserData(ctx.userData);
            await ctx.makeMessage({
                content: `Unequipped ${itemData.emoji} \`${itemData.name}\``,
            });
        } else if (ctx.interaction.options.getSubcommand() === "equip") {
            let itemString = ctx.interaction.options.getString("item", true);
            const amountX = ctx.interaction.options.getInteger("amount") || 1;

            if (ctx.userData.inventory[itemString] === undefined) {
                const foundItem = Functions.findItem(itemString);
                if (foundItem) {
                    itemString = foundItem.id;
                } else {
                    await ctx.makeMessage({
                        content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                    });
                    return;
                }
            }
            const left = ctx.userData.inventory[itemString] || 0;

            if (left === 0) {
                return void ctx.makeMessage({
                    content: "This item does not exist or you don't have any left. Nice try",
                });
            }

            if (left < amountX) {
                await ctx.makeMessage({
                    content: `You don't have enough of this item. You have ${left} left.`,
                });
                return;
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }
            if (!Functions.isEquipableItem(itemData)) {
                await ctx.makeMessage({
                    content: `You can't equip this item. Nice try`,
                });
                return;
            }
            if (
                Object.values(ctx.userData.equippedItems).filter((r) => r === itemData.type)
                    .length >= equipableItemTypesLimit[itemData.type]
            ) {
                await ctx.makeMessage({
                    content: `You can't equip more than ${
                        equipableItemTypesLimit[itemData.type]
                    } items of this type.`,
                });
                return;
            }
            if (Object.keys(ctx.userData.equippedItems).find((r) => r === itemData.id)) {
                await ctx.makeMessage({
                    content: `You already have this item equipped.`,
                });
            }

            if (itemData.requirements) {
                let meetReqs = true;
                if (itemData.requirements.level && itemData.requirements.level > ctx.userData.level)
                    meetReqs = false;
                if (itemData.requirements.skillPoints)
                    for (const skill in itemData.requirements.skillPoints) {
                        if (
                            ctx.userData.skillPoints[skill as keyof SkillPoints] <
                            itemData.requirements.skillPoints[skill as keyof SkillPoints]
                        )
                            meetReqs = false;
                    }
                if (!meetReqs) {
                    ctx.makeMessage({
                        content: `You don't meet the requirements to equip this item. Use the ${ctx.client.getSlashCommandMention(
                            "inventory info"
                        )} command to get more informations.`,
                    });
                    return;
                }
            }
            ctx.userData.equippedItems[itemData.id] = itemData.type;
            ctx.userData.inventory[itemData.id] -= amountX;
            await ctx.makeMessage({
                content: ` [${formattedEquipableItemTypes[itemData.type]}] You equipped ${
                    itemData.emoji
                } \`${itemData.name}\``,
            });
            await ctx.client.database.saveUserData(ctx.userData);
        } else if (ctx.interaction.options.getSubcommand() === "use") {
            let itemString = ctx.interaction.options.getString("item", true);
            const amountX = ctx.interaction.options.getInteger("amount") || 1;

            if (ctx.userData.inventory[itemString] === undefined) {
                const foundItem = Functions.findItem(itemString);
                if (foundItem) {
                    itemString = foundItem.id;
                } else {
                    await ctx.makeMessage({
                        content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                    });
                    return;
                }
            }

            const left = ctx.userData.inventory[itemString] || 0;

            if (left === 0) {
                await ctx.makeMessage({
                    content: "This item does not exist or you don't have any left. Nice try",
                });
                return;
            }

            if (left < amountX) {
                await ctx.makeMessage({
                    content: `You don't have enough of this item. You have ${left} left.`,
                });
                return;
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }
            const winContent = `You used ${itemData.emoji} x${amountX} \`${itemData.name}\` and got:`;
            const oldData = cloneDeep(ctx.userData);

            // eslint-disable-next-line no-inner-declarations
            function addHealthOrStamina(amount: numOrPerc, type: "health" | "stamina"): void {
                const emoji = type === "health" ? ":heart:" : ":zap:";
                const addX = type === "health" ? Functions.addHealth : Functions.addStamina;
                const x =
                    type === "health" ? () => ctx.userData.health : () => ctx.userData.stamina;
                const oldX = x();

                const maxX =
                    type === "health"
                        ? Functions.getMaxHealth(ctx.userData)
                        : Functions.getMaxStamina(ctx.userData);

                switch (typeof amount) {
                    case "number":
                        addX(ctx.userData, amount);
                        break;
                    case "string":
                        // %
                        addX(ctx.userData, Math.round((x() / maxX) * parseInt(amount)));
                        break;
                    // default: impossible
                }
            }

            if (Functions.isConsumable(itemData)) {
                Functions.removeItem(ctx.userData, itemString, amountX);
                for (let i = 0; i < amountX; i++) {
                    if (itemData.effects.health !== undefined)
                        addHealthOrStamina(itemData.effects.health, "health");
                    if (itemData.effects.stamina !== undefined)
                        addHealthOrStamina(itemData.effects.stamina, "stamina");

                    if (itemData.effects.items) {
                        const items = Object.keys(itemData.effects.items);

                        for (const item of items) {
                            const itemData2 = Functions.findItem(item);
                            // if (!itemData2) impossible;

                            Functions.addItem(ctx.userData, item, itemData.effects.items[item]);
                        }
                    }
                }
            } else if (Functions.isSpecial(itemData)) {
                const oldData = { ...ctx.userData } as RPGUserDataJSON;
                await ctx.client.database.setCooldown(
                    ctx.user.id,
                    "You're currently using an item."
                );
                try {
                    const status = await itemData.use(ctx);
                    if (status) {
                        Functions.removeItem(ctx.userData, itemString);
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
                    Functions.getRewardsCompareData(oldData, ctx.userData).join(", "),
            });
        } else if (ctx.interaction.options.getSubcommand() === "throw") {
            const itemString = ctx.interaction.options.getString("item", true);
            const left = ctx.userData.inventory[itemString] || 0;
            const amountX = ctx.interaction.options.getInteger("amount") || 1;

            if (0 > amountX || amountX === 0 || amountX === Infinity) {
                await ctx.makeMessage({
                    content:
                        "WARINING: What you just tried to do is to duplicate items. Nice try, a notification has been sent to the developers.",
                    ephemeral: true,
                });
                ctx.client.users.fetch("239739781238620160").then((user) => {
                    user.send(
                        `Someone tried to duplicate items. User: ${ctx.user.tag} (${ctx.user.id})`
                    );
                });
                return;
            }

            if (left === 0) {
                await ctx.makeMessage({
                    content: "This item does not exist or you don't have any left. Nice try",
                });
                return;
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }

            if (left < amountX) {
                await ctx.makeMessage({
                    content: `You don't have enough of this item. You have ${left} left.`,
                });
                return;
            }

            const itemId = Functions.generateRandomId();
            const itemDataJSON = {
                item: itemData.id,
                amount: amountX,
                droppedBy: ctx.user.id,
                droppedAt: Date.now(),
            };
            await ctx.client.database.redis.set(
                "thrownItem_" + itemId,
                JSON.stringify(itemDataJSON)
            );
            Functions.removeItem(ctx.userData, itemString, amountX);
            await ctx.client.database.saveUserData(ctx.userData);
            await thrownItemsWebhook.send({
                embeds: [
                    {
                        title: "Item thrown",
                        description: `**${ctx.user.tag}** threw ${itemData.emoji} x${amountX} \`${itemData.name}\`! (ID: \`${itemId}\`)`,
                        color: 0x00ff00,
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
            await ctx.makeMessage({
                content: `You threw ${itemData.emoji} x${amountX} \`${
                    itemData.name
                }\`! (You can pick it up again with the ${ctx.client.getSlashCommandMention(
                    "inventory claim"
                )} command [ID: \`${itemId}\`])`,
            });
        } else if (ctx.interaction.options.getSubcommand() === "claim") {
            const itemId = ctx.interaction.options.getString("id", true);
            const itemData = await ctx.client.database.redis.get("thrownItem_" + itemId);
            if (!itemData) {
                await ctx.makeMessage({
                    content:
                        "This item does not exist or has already been claimed [ERROR: not in redis cache].",
                });
                return;
            }

            const itemDataJSON: {
                item: string;
                amount: number;
                droppedBy: string;
                droppedAt: number;
            } = JSON.parse(itemData);
            const item = Functions.findItem(itemDataJSON?.item);
            if (!item) {
                await ctx.makeMessage({
                    content:
                        "This item does not exist or has already been claimed [ERROR: item does not exist].",
                });
                return;
            }
            if (item.id.includes("$disc$") && Functions.hasExceedStandLimit(ctx)) {
                await ctx.makeMessage({
                    content: "Nice try.",
                });
                return;
            }

            // if item has been dropped for over a week, tell him it has been expired. If they think that is a mistake or bug, contact us at .gg/jolyne
            if (Date.now() - itemDataJSON.droppedAt > 604800000) {
                await ctx.makeMessage({
                    content: `This item has expired [${item.emoji} x${itemDataJSON.amount} \`${item.name}\`]. You can't claim it anymore. If you think this is a mistake, contact us at https://discord.gg/jolyne`,
                });
                await ctx.client.database.redis.del("thrownItem_" + itemId);
                return;
            }
            // TODO: count stand discsc in inventory, anti bypass

            Functions.addItem(ctx.userData, itemDataJSON.item, itemDataJSON.amount, true);
            await ctx.client.database.redis.del("thrownItem_" + itemId);

            await ctx.client.database.saveUserData(ctx.userData);
            await claimedItemsWebhook.send({
                embeds: [
                    {
                        title: "Item claimed",
                        description: `**${ctx.user.tag}** claimed ${item.emoji} x${itemDataJSON.amount} \`${item.name}\` in guild **${ctx.guild.name}** (ItemID: \`${itemId}\`)`,
                        color: 0x00ff00,
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
            await ctx.makeMessage({
                content: `You claimed ${item.emoji} x${itemDataJSON.amount} \`${item.name}\`!`,
            });
        } else if (ctx.interaction.options.getSubcommand() === "sell") {
            const itemString = ctx.interaction.options.getString("item", true);
            const amountX = ctx.interaction.options.getInteger("amount") || 1;
            const left = ctx.userData.inventory[itemString] || 0;

            if (left === 0) {
                await ctx.makeMessage({
                    content: "This item does not exist or you don't have any left. Nice try",
                });
                return;
            }

            if (left < amountX) {
                await ctx.makeMessage({
                    content: `You don't have enough of this item. You have ${left} left.`,
                });
                return;
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                await ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }

            if (itemData.rarity === "C" && !itemData.id.includes("$")) {
                await ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Pucci,
                        "bro, don't sell me trash items. wtf is that? you better throw that away."
                    ),
                });
                return;
            }

            if (!itemData.price) {
                await ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Pucci,
                        "sorry, I don't know what that item is. that's weird..."
                    ),
                });
                return;
            }
            const itemTaxes = {
                T: 1,
                SS: 1,
                S: 0.78,
                A: 0.65,
                B: 0.46,
                C: 0.3,
            };
            await ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Pucci,
                    `Hmm, since this item is ${itemData.rarity} tier, I'll give you ${
                        itemTaxes[itemData.rarity] * 100
                    }% of the original price, which means you'll get ${Math.round(
                        itemData.price * itemTaxes[itemData.rarity] * amountX
                    ).toLocaleString("en-US")} coins. (x${amountX} ${itemData.emoji} ${
                        itemData.name
                    })`
                ),
                components: [
                    Functions.actionRow([
                        new ButtonBuilder()
                            .setCustomId(`${ctx.interaction.id}_sell`)
                            .setLabel("Sell")
                            .setEmoji(ctx.client.localEmojis.jocoins)
                            .setStyle(ButtonStyle.Secondary),
                    ]),
                ],
            });

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.customId === `${ctx.interaction.id}_sell` && i.user.id === ctx.user.id,
                time: 60000,
                max: 1,
            });

            collector.on("collect", async (i) => {
                if (await ctx.antiCheat(true)) {
                    collector.stop("cheat");
                    return;
                }
                i.deferUpdate().catch(() => {}); // eslint-disable-line
                Functions.addCoins(
                    ctx.userData,
                    Math.round(itemData.price * itemTaxes[itemData.rarity] * amountX)
                );
                Functions.removeItem(ctx.userData, itemString, amountX);
                ctx.client.database.saveUserData(ctx.userData);
                ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Pucci,
                        `Thanks for selling me ${itemData.emoji} x${amountX} \`${
                            itemData.name
                        }\`! (+${Math.round(
                            itemData.price * itemTaxes[itemData.rarity] * amountX
                        ).toLocaleString("en-US")} ${ctx.client.localEmojis.jocoins})`
                    ),
                    components: [],
                });
            });
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        if (interaction.options.getSubcommand() === "use") {
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
            });

            await interaction.respond(
                userItems
                    .filter((r) => r)
                    .map((i) => {
                        return {
                            value: i.id,
                            name: `${i.name} (x${i.amount} left)`,
                            description: i,
                        };
                    })
                    .filter(
                        (item) =>
                            item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            item.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );
        } else if (interaction.options.getSubcommand() === "info") {
            for (const item of Object.keys(userData.equippedItems)) {
                Functions.addItem(userData, item, 1);
            }

            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (userData.inventory[v] === 0) return;

                return {
                    name: item.name,
                    amount: userData.inventory[v],
                    id: v,
                };
            });

            const finalItems = userItems
                .filter((r) => r)
                .map((i) => {
                    return {
                        value: i.id,
                        name: `${i.name}`,
                        description: i,
                    };
                })
                .filter(
                    (item) =>
                        item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        item.value.toLowerCase().includes(currentInput.toLowerCase())
                );
            if (finalItems.length > 25) finalItems.length = 25;

            interaction.respond(finalItems);
        } else if (interaction.options.getSubcommand() === "equip") {
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
            });

            const finalItems = userItems
                .filter((r) => r)
                .map((i) => {
                    return {
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                        description: i,
                    };
                })
                .filter(
                    (item) =>
                        item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        item.value.toLowerCase().includes(currentInput.toLowerCase())
                );
            if (finalItems.length > 25) finalItems.length = 25;

            interaction.respond(finalItems);
        } else if (interaction.options.getSubcommand() === "unequip") {
            const userItems = Object.keys(userData.equippedItems).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (!Functions.isEquipableItem(item)) return;

                return {
                    name: item.name + ` [${formattedEquipableItemTypes[item.type]}]`,
                    id: v,
                };
            });
            const realItems = userItems
                .filter((r) => r)
                .map((i) => {
                    return {
                        value: i.id,
                        name: i.name,
                        description: i,
                    };
                })
                .filter(
                    (item) =>
                        item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        item.value.toLowerCase().includes(currentInput.toLowerCase())
                );
            if (realItems.length > 25) realItems.length = 25;

            interaction.respond(realItems);
        } else if (
            interaction.options.getSubcommand() === "sell" ||
            interaction.options.getSubcommand() === "throw" ||
            interaction.options.getSubcommand() === "sell"
        ) {
            // all items
            const userItems = Object.keys(userData.inventory).map((v) => {
                const item = Functions.findItem(v);
                if (!item) return;
                if (userData.inventory[v] === 0) return;

                return {
                    name: item.name,
                    amount: userData.inventory[v],
                    id: v,
                };
            });

            const finalItems = userItems
                .filter((r) => r)
                .map((i) => {
                    return {
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                        description: i,
                    };
                })
                .filter(
                    (item) =>
                        item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        item.value.toLowerCase().includes(currentInput.toLowerCase())
                );
            if (finalItems.length > 25) finalItems.length = 25;

            interaction.respond(finalItems);
        }
    },
};

export default slashCommand;
