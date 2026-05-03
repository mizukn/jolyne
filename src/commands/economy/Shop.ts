import { SlashCommandFile, Shop, Item } from "../../@types";
import {
    Message,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ActionRowBuilder,
    ButtonInteraction,
    MessageActionRowComponentBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as Shops from "../../rpg/Shops";
import * as Stands from "../../rpg/Stands/Stands";
import * as EvolvableStands from "../../rpg/Stands/EvolutionStands";
import { cloneDeep } from "lodash";
import { containers, SectionData, COLORS, EMOJIS } from "../../utils/containers";

export const standPrice = {
    SS: 2000000000000000,
    S: 100000,
    A: 50000,
    B: 25000,
    C: 10000,
    T: 6969696969696969,
};

const boxPrice = 450000;
const ITEMS_PER_PAGE = 5;

type cShop = {
    name: string;
    items: Shop["items"];
    emoji: string;
    currency: "coins" | "prestige_shards";
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "shop",
        description: "Shows the shop.",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext,
    ): Promise<Message | void | InteractionResponse> => {
        let shops: cShop[] = [];
        let currentCategoryIndex = 0;
        let currentPage = 0;

        async function createUserBlackMarket(): Promise<Shop> {
            const BM: Shop = {
                name: "Black Market",
                owner: {
                    name: ctx.user.username,
                    id: ctx.user.id,
                    emoji: ":x:",
                },
                emoji: "🃏",
                items: [
                    {
                        item: Functions.findItem("stand_arrow").id,
                        price: Functions.findItem("stand_arrow").price ?? 10000,
                    },
                    {
                        item: Functions.findItem("ancient_scroll").id,
                        price: Functions.findItem("ancient_scroll").price ?? 10000,
                    },
                    {
                        item: "skill_points_reset_potion",
                        price: Functions.findItem("skill_points_reset_potion").price ?? 10000,
                    },
                    {
                        item: "dungeon_key",
                        price: Functions.findItem("dungeon_key").price ?? 10000,
                    },
                ],
                currency: "coins",
            };

            BM.items.forEach((x) => {
                x.item = cloneDeep(Functions.findItem(x.item).id);
                x.price = cloneDeep(x.price);
            });
            const hasAlreadyBlackMarket = (await ctx.client.database.getJSONData(
                Functions.getBlackMarketString(ctx.user.id),
            )) as Shop["items"];
            if (!hasAlreadyBlackMarket) {
                BM.items = Functions.shuffle(BM.items);
                const shuffledStands = Functions.shuffle([
                    ...Functions.shuffle(Object.values(cloneDeep(Stands))),
                    ...Object.values(EvolvableStands)
                        .filter((w) => w.evolutions[0])
                        .map((w) => {
                            return { ...w.evolutions[0], id: w.id };
                        }),
                ]).filter((x) => x.rarity !== "SS" && x.rarity !== "T" && x.available);

                const patreonData = ctx.client.patreons.find((x) => x.id === ctx.user.id);

                for (
                    let i = 0;
                    i < (patreonData ? (patreonData.level + 3) * 3 : 5);
                    i++
                ) {
                    const stand = shuffledStands[i];
                    BM.items.push({
                        item: Functions.findItem(stand.id).id,
                        price: standPrice[stand.rarity as keyof typeof standPrice],
                    });
                }

                const otherItems = [
                    { percent: 90, price: 100000, id: "Basic Katana" },
                    { percent: 15, price: 1000000, id: "bloody_knife" },
                    {
                        percent: 60,
                        price: Functions.findItem("tonio")?.price ?? 10000,
                        id: Functions.findItem("tonio")?.id ?? "pizza",
                    },
                    { percent: 50, price: 100000, id: "box" },
                    { percent: 50, price: 50000, id: "rare_stand_arrow" },
                ];

                for (const item of otherItems) {
                    if (Functions.percent(item.percent)) {
                        BM.items.push({
                            item: Functions.findItem(item.id).id,
                            price: item.id === "box" ? boxPrice : item.price,
                        });
                    }
                }

                if (patreonData) {
                    const priceMult = {
                        1: 0.85,
                        2: 0.75,
                        3: 0.5,
                        4: 0.25,
                    }[patreonData.level as 1 | 2 | 3 | 4];
                    for (const item of BM.items) {
                        item.price = Math.round((item.price ?? 0) * (priceMult ?? 1));
                    }
                }
                await ctx.client.database.setJSONData(
                    Functions.getBlackMarketString(ctx.user.id),
                    BM.items,
                );
            } else {
                BM.items = hasAlreadyBlackMarket;
            }

            if (BM.items.length > 25) {
                BM.items.sort((a, b) => {
                    return (
                        (a.price ?? Functions.findItem(a.item).price ?? 0) -
                        (b.price ?? Functions.findItem(b.item).price ?? 0)
                    );
                });
                BM.items.length = 25;
            }

            return BM;
        }

        // Initialize shops
        for (const shopKey in Shops) {
            const Shop = Shops[shopKey as keyof typeof Shops];
            if (Shop.name.toLocaleLowerCase().includes("prestige")) {
                if (ctx.userData.prestige_shards <= 0 || !process.env.ENABLE_PRESTIGE) continue;
            }
            
            // Clean up items that don't exist or have invalid prices
            const validItems = [];
            const seen = new Set();
            for (const item of cloneDeep(Shop.items)) {
                const xitem = Functions.findItem(item.item);
                if (!xitem || seen.has(xitem.id)) continue;
                if (xitem.id === "box") {
                    xitem.price = boxPrice;
                    item.price = boxPrice;
                }
                if (isNaN(xitem.price)) continue;
                seen.add(xitem.id);
                validItems.push(item);
            }

            shops.push({
                name: (Shop.owner ? Shop.owner.name + "'s " : "") + Shop.name,
                emoji: Shop.emoji ?? Shop.owner?.emoji ?? "🏪",
                items: validItems,
                currency: Shop.currency ?? "coins",
            });
        }

        if (new Date().getDay() === 0 || new Date().getDay() === 1) {
            const bm = await createUserBlackMarket();
            const validItems = [];
            const seen = new Set();
            for (const item of cloneDeep(bm.items)) {
                const xitem = Functions.findItem(item.item);
                if (!xitem || seen.has(xitem.id)) continue;
                if (xitem.id === "box") {
                    xitem.price = boxPrice;
                    item.price = boxPrice;
                }
                if (isNaN(item.price ?? xitem.price)) continue;
                seen.add(xitem.id);
                validItems.push(item);
            }
            shops.push({
                name: (bm.owner ? bm.owner.name + "'s " : "") + bm.name,
                emoji: bm.emoji ?? bm.owner?.emoji ?? "🃏",
                items: validItems,
                currency: bm.currency ?? "coins",
            });
        }

        if (shops.length === 0) {
            return ctx.makeMessage(containers.error("No shops are currently available."));
        }

        function getShopMessageData() {
            const shop = shops[currentCategoryIndex];
            const totalPages = Math.max(1, Math.ceil(shop.items.length / ITEMS_PER_PAGE));
            if (currentPage >= totalPages) currentPage = totalPages - 1;

            const pageItems = shop.items.slice(
                currentPage * ITEMS_PER_PAGE,
                (currentPage + 1) * ITEMS_PER_PAGE
            );

            const sections: SectionData[] = pageItems.map((item) => {
                const xitem = cloneDeep(Functions.findItem(item.item));
                const price = item.price ?? xitem.price;
                const currencyEmoji = shop.currency === "prestige_shards" ? ctx.client.localEmojis.prestige_shard : EMOJIS.jocoins;
                const currencyName = shop.currency === "prestige_shards" ? "prestige shards" : "jocoins";

                let bonusesText = "";
                if (Functions.isConsumable(xitem)) {
                    bonusesText = `\n**Bonuses**\n> ${Object.entries(xitem.effects)
                        .map(([stat, val]) => `**+${val.toLocaleString()}** ${stat}`)
                        .join(", ")}`;
                }

                return {
                    text: `### ${xitem.emoji} ${xitem.name}${!xitem.storable ? " \`[NS]\`" : ""}\n> ${currencyEmoji} Cost: **${price.toLocaleString()}** ${currencyName}${bonusesText}`,
                    accessory: new ButtonBuilder()
                        .setCustomId(`buy_${currentCategoryIndex}_${xitem.id}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Buy")
                        .setEmoji("💰"),
                };
            });

            const currencyAmount = shop.currency === "prestige_shards" ? ctx.userData.prestige_shards : ctx.userData.coins;
            const footerText = `You have ${currencyAmount.toLocaleString()} ${shop.currency === "prestige_shards" ? "prestige shards" : "coins"}.`;

            const replyData = containers.primary({
                title: `${shop.emoji} ${shop.name}`,
                sections: sections,
                sectionDividers: true,
                footer: footerText,
            });

            const actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

            // Row 1: Categories
            const catRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                shops.slice(0, 5).map((s, idx) =>
                    new ButtonBuilder()
                        .setCustomId(`cat_${idx}`)
                        .setStyle(idx === currentCategoryIndex ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setLabel(s.name.length > 25 ? s.name.substring(0, 22) + "..." : s.name)
                        .setEmoji(s.emoji)
                        .setDisabled(idx === currentCategoryIndex)
                )
            );
            actionRows.push(catRow);

            // Row 2: Pagination (if needed)
            if (totalPages > 1) {
                const pagRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("page_prev")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("⬅️")
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId("page_noop")
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel(`${currentPage + 1} / ${totalPages}`)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("page_next")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("➡️")
                        .setDisabled(currentPage === totalPages - 1)
                );
                actionRows.push(pagRow);
            }

            return {
                components: [...replyData.components, ...actionRows],
                flags: replyData.flags,
            };
        }

        await ctx.makeMessage(getShopMessageData());

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 120000,
        });

        collector.on("collect", async (i) => {
            if (i.isStringSelectMenu()) {
                const menu = i as StringSelectMenuInteraction;
                if (!menu.customId.startsWith("amount_")) return;

                const parts = menu.customId.split("_");
                const catIdxStr = parts[1];
                const itemId = parts.slice(2).join("_");
                const catIdx = parseInt(catIdxStr);
                const shop = shops[catIdx];
                const itemEntry = shop.items.find((x) => x.item === itemId);
                if (!itemEntry) return;

                const xitem = Functions.findItem(itemEntry.item);
                if (!xitem) return;

                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

                let amount = parseInt(menu.values[0]);
                if (isNaN(amount) || amount < 1) amount = 1;

                const price = (itemEntry.price ?? xitem.price) * amount;
                const isPrestige = shop.currency === "prestige_shards";
                const currencyEmoji = isPrestige ? ctx.client.localEmojis.prestige_shard : EMOJIS.jocoins;
                const userMoney = isPrestige ? ctx.userData.prestige_shards : ctx.userData.coins;

                if (userMoney < price) {
                    await menu.reply({
                        ...containers.error(`You don't have enough ${isPrestige ? "prestige shards" : "coins"} to buy this item!`),
                        ephemeral: true,
                    });
                    return;
                }

                if (isPrestige) Functions.addPrestigeShards(ctx.userData, -price);
                else Functions.addCoins(ctx.userData, -price);

                const oldData = cloneDeep(ctx.userData);
                let successContent = "";

                if (!xitem.storable) {
                    if (Functions.isConsumable(xitem)) {
                        Functions.useConsumableItem(xitem, ctx.userData, amount);
                        const rewards = Functions.getRewardsCompareData(oldData, ctx.userData).join(", ");
                        successContent = `You used ${xitem.emoji} **${xitem.name}** and got: ${rewards}`.slice(0, 500);
                    } else {
                        Functions.addItem(ctx.userData, xitem, amount);
                        successContent = `You bought x${amount} ${xitem.emoji} **${xitem.name}** for **${price.toLocaleString()}** ${currencyEmoji}`;
                    }
                } else {
                    Functions.addItem(ctx.userData, xitem, amount);
                    successContent = `You bought x${amount} ${xitem.emoji} **${xitem.name}** for **${price.toLocaleString()}** ${currencyEmoji}`;
                }

                await ctx.client.database.saveUserData(ctx.userData);

                await menu.reply({
                    ...containers.success(`**${shop.name}**\n${successContent}`),
                    ephemeral: true,
                });

                // Update main view to reflect new balance and clear the select menu
                await ctx.interaction.editReply(getShopMessageData()).catch(() => {});
                return;
            }

            const btn = i as ButtonInteraction;

            if (btn.customId.startsWith("cat_")) {
                currentCategoryIndex = parseInt(btn.customId.split("_")[1]);
                currentPage = 0;
                await btn.update(getShopMessageData()).catch(() => {});
            } else if (btn.customId === "page_prev") {
                currentPage--;
                await btn.update(getShopMessageData()).catch(() => {});
            } else if (btn.customId === "page_next") {
                currentPage++;
                await btn.update(getShopMessageData()).catch(() => {});
            } else if (btn.customId.startsWith("buy_")) {
                const parts = btn.customId.split("_");
                const catIdxStr = parts[1];
                const itemId = parts.slice(2).join("_");
                const catIdx = parseInt(catIdxStr);
                const shop = shops[catIdx];
                const itemEntry = shop.items.find((x) => x.item === itemId);
                if (!itemEntry) return;

                const xitem = Functions.findItem(itemEntry.item);
                if (!xitem) return;

                const isPrestige = shop.currency === "prestige_shards";
                const currencyName = isPrestige ? "prestige shards" : "jocoins";
                const userMoney = isPrestige ? ctx.userData.prestige_shards : ctx.userData.coins;
                const unitPrice = itemEntry.price ?? xitem.price;

                const getOptions = () =>
                    Array.from({ length: 25 }, (_, idx) => idx + 1)
                        .map((qty) => ({
                            label: `x${qty} (${(qty * unitPrice).toLocaleString()} ${currencyName})`,
                            value: qty.toString(),
                        }))
                        .filter((opt) => userMoney >= parseInt(opt.value) * unitPrice);

                const options = getOptions();

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`amount_${catIdx}_${itemId}`)
                    .setPlaceholder("Select an amount")
                    .setDisabled(options.length === 0)
                    .addOptions(
                        options.length === 0
                            ? [{ label: "You cannot afford any", value: "no" }]
                            : options
                    );

                const currentMessageData = getShopMessageData();
                currentMessageData.components.push(
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu)
                );

                await btn.update(currentMessageData).catch(() => {});
            }
        });
    },
};

export default slashCommand;