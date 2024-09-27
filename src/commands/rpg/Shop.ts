import { SlashCommandFile, Shop, RPGUserDataJSON, numOrPerc, Item } from "../../@types";
import {
    Message,
    APIEmbed,
    InteractionResponse,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as Shops from "../../rpg/Shops";
import * as Stands from "../../rpg/Stands/Stands";
import * as Emojis from "../../emojis.json";
import { clone, cloneDeep } from "lodash";
import * as EvolvableStands from "../../rpg/Stands/EvolutionStands";

export const standPrice = {
    SS: 2000000000000000,
    S: 100000,
    A: 50000,
    B: 25000,
    C: 10000,
    T: 6969696969696969,
};

const boxPrice = 450000;

type cShop = {
    name: string;
    data: StringSelectMenuBuilder;
    items: Shop["items"];
    emoji: string;
};

const choices: {
    value: string;
    label: string;
}[] = [];
for (let i = 0; i < 25; i++) {
    choices.push({
        value: (i + 1).toString(),
        label: (i + 1).toString(),
    });
}

const goBackButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setEmoji(Emojis.arrowLeft)
    .setCustomId("goBack");

const slashCommand: SlashCommandFile = {
    data: {
        name: "shop",
        description: "Shows the shop.",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        let shops: cShop[] = [];
        let currentShop: cShop | undefined;

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
            };

            BM.items.forEach((x) => {
                x.item = cloneDeep(Functions.findItem(x.item).id);
                x.price = cloneDeep(x.price);
            });
            const hasAlreadyBlackMarket = (await ctx.client.database.getJSONData(
                Functions.getBlackMarketString(ctx.user.id)
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

                for (
                    let i = 0;
                    i <
                    (ctx.client.patreons.find((x) => x.id === ctx.user.id)
                        ? (ctx.client.patreons.find((x) => x.id === ctx.user.id).level + 3) * 3
                        : 5);
                    i++
                ) {
                    const stand = shuffledStands[i];
                    BM.items.push({
                        item: Functions.findItem(stand.id).id,
                        price: standPrice[stand.rarity],
                    });
                }

                const otherItems = [
                    {
                        percent: 90,
                        price: 100000,
                        id: "Basic Katana",
                    },
                    {
                        percent: 15,
                        price: 1000000,
                        id: "bloody_knife",
                    },
                    {
                        percent: 60,
                        price: Functions.findItem("tonio")?.price ?? 10000,
                        id: Functions.findItem("tonio")?.id ?? "pizza",
                    },
                    {
                        percent: 50,
                        price: 100000,
                        id: "box",
                    },
                    {
                        percent: 50,
                        price: 50000,
                        id: "rare_stand_arrow",
                    },
                ];

                for (const item of otherItems) {
                    if (Functions.percent(item.percent)) {
                        BM.items.push({
                            item: Functions.findItem(item.id).id,
                            price: item.id === "box" ? boxPrice : item.price,
                        });
                    }
                }
                /*
                BM.items.length = ctx.client.patreons.find((x) => x.id === ctx.user.id)
                    ? Functions.RNG(
                          ctx.client.patreons.find((x) => x.id === ctx.user.id).level + 4,
                          ctx.client.patreons.find((x) => x.id === ctx.user.id).level * 2 + 7
                      )
                    : Functions.RNG(5, 9);*/
                if (ctx.client.patreons.find((x) => x.id === ctx.user.id)) {
                    const priceMult = {
                        1: 0.85,
                        2: 0.75,
                        3: 0.5,
                        4: 0.25,
                    }[ctx.client.patreons.find((x) => x.id === ctx.user.id).level];
                    for (const item of BM.items) {
                        item.price = Math.round(item.price * priceMult);
                    }
                }
                await ctx.client.database.setJSONData(
                    Functions.getBlackMarketString(ctx.user.id),
                    BM.items
                );
            } else {
                BM.items = hasAlreadyBlackMarket;
            }

            // check if items > 25, if so, remove the less valuable
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

        let selectedItem: Item;

        async function sendMenuEmbed(): Promise<void> {
            shops = [];
            const embed: APIEmbed = {
                title: ":shopping_cart: Morioh City Shop",
                description:
                    "`[NS]` means that the item is not storable, so it'll be consumed/used when you buy it.",
                fields: [],
                color: 0x70926c,
                footer: {
                    text: `You have ${ctx.userData.coins.toLocaleString("en-US")} 🪙 left.`,
                },
            };

            function handleShop(Shop: Shop): void {
                const shopSelect = new StringSelectMenuBuilder()
                    .setCustomId(`shop_${ctx.interaction.id}_${Shop.name}`)
                    .setPlaceholder("Select an item")
                    .setMinValues(1)
                    .setMaxValues(1);

                embed.fields.push({
                    name:
                        (Shop.emoji ?? Shop.owner?.emoji ?? "") +
                        (Shop.owner ? Shop.owner.name + "'s " : "") +
                        Shop.name,
                    value: (() => {
                        let str = "";
                        for (const item of Shop.items) {
                            const xitem = cloneDeep(Functions.findItem(item.item));
                            if (
                                !xitem ||
                                shopSelect.options.find((x) => x.data.label === xitem.name)
                            )
                                continue;
                            if (xitem.id === "box") xitem.price = boxPrice;
                            if (isNaN(xitem.price)) continue;

                            shopSelect.addOptions([
                                {
                                    label: xitem.name,
                                    value: xitem.id,
                                    emoji:
                                        xitem.emoji.split("<").length === 3
                                            ? "<" + xitem.emoji.split("<")[1]
                                            : xitem.emoji,
                                },
                            ]);

                            str += `${xitem.emoji} ${!xitem.storable ? "`[NS]`" : ""} **${
                                xitem.name
                            }** - ${(item.price ?? xitem.price).toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }`;
                            if (Functions.isConsumable(xitem))
                                str += ` | ${Object.keys(xitem.effects)
                                    .map(
                                        (x) =>
                                            `+**${xitem.effects[
                                                x as keyof typeof xitem.effects
                                            ].toLocaleString("en-US")}** ${x}`
                                    )
                                    .join(`, `)}`;
                            str += "\n";
                        }
                        shops.push({
                            name: (Shop.owner ? Shop.owner.name + "'s " : "") + Shop.name,
                            data: shopSelect,
                            emoji: Shop.emoji ?? Shop.owner?.emoji ?? "",
                            items: Shop.items,
                        });
                        return str;
                    })(),
                });
            }

            function createShopString(Shop: Shop): string {
                let str = "";
                for (const item of cloneDeep(Shop.items)) {
                    const xitem = cloneDeep(Functions.findItem(item.item));
                    if (!xitem || (str.includes(xitem.emoji) && str.includes(xitem.name))) continue;
                    if (xitem.id === "box") {
                        xitem.price = boxPrice;
                        item.price = boxPrice;
                    }
                    if (isNaN(xitem.price)) continue;

                    str += `${xitem.emoji} ${!xitem.storable ? "`[NS]`" : ""} **${
                        xitem.name
                    }** - ${(item.price ?? xitem.price).toLocaleString("en-US")} ${
                        ctx.client.localEmojis.jocoins
                    }`;
                    if (Functions.isConsumable(xitem))
                        str += ` | ${Object.keys(xitem.effects)
                            .map(
                                (x) =>
                                    `+**${xitem.effects[
                                        x as keyof typeof xitem.effects
                                    ].toLocaleString("en-US")}** ${x}`
                            )
                            .join(`, `)}`;
                    str += "\n";
                }
                return str;
            }

            for (const shop in Shops) {
                const Shop = Shops[shop as keyof typeof Shops];
                handleShop(Shop);
            }
            if (new Date().getDay() === 0 || new Date().getDay() === 1)
                handleShop(await createUserBlackMarket());
            const shopSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`shop_${ctx.interaction.id}` + ctx.interaction.id)
                .setPlaceholder("Select a shop")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    shops.map((x) => ({
                        label: x.name,
                        value: x.name,
                        emoji: x.emoji,
                    }))
                );

            embed.fields = Functions.fixFields(embed.fields);

            ctx.makeMessage({
                embeds: [embed],
                components: [Functions.actionRow([shopSelectMenu])],
            });

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === ctx.user.id,
                time: 60000,
            });

            function makeShopEmbed(shop: cShop): void {
                ctx.makeMessage({
                    embeds: [
                        {
                            title: shop.emoji + " " + shop.name,
                            description: createShopString(shop),
                            color: 0x70926c,
                            footer: {
                                text: `You have ${ctx.userData.coins.toLocaleString(
                                    "en-US"
                                )} 🪙 left.`,
                            },
                        },
                    ],
                    components: [
                        Functions.actionRow([shop.data]),
                        Functions.actionRow([goBackButton]),
                    ],
                });
            }

            collector.on("collect", async (i) => {
                i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                if (await ctx.client.database.getCooldown(ctx.user.id)) return;
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
                if (i.customId === "goBack") {
                    sendMenuEmbed();
                } else if (
                    i.customId.replace(ctx.interaction.id, "") === `shop_${ctx.interaction.id}`
                ) {
                    const shop = shops.find(
                        (x) => x.name === (i as StringSelectMenuInteraction).values[0]
                    );
                    if (!shop) return;
                    currentShop = shop;
                    makeShopEmbed(shop);
                } else if (i.customId.includes(`shop_${ctx.interaction.id}`)) {
                    // selected item
                    const item = currentShop?.items.find(
                        (x) => x.item === (i as StringSelectMenuInteraction).values[0]
                    );
                    if (!item) return;
                    const xitem = Functions.findItem(item.item);
                    if (!xitem) return;
                    selectedItem = { ...cloneDeep(xitem), price: item.price ?? xitem.price };

                    ctx.makeMessage({
                        components: [
                            Functions.actionRow([
                                new StringSelectMenuBuilder()
                                    .setCustomId(`amount_${ctx.interaction.id}`)
                                    .setPlaceholder("Select an amount")
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .addOptions(choices),
                            ]),
                        ],
                    });
                } else if (i.customId === `amount_${ctx.interaction.id}`) {
                    let amount = parseInt((i as StringSelectMenuInteraction).values[0]) || 1;
                    if (isNaN(amount)) amount = 1000000000000;

                    const price =
                        selectedItem.id === "box"
                            ? boxPrice * amount
                            : (selectedItem.price ?? 10000) * amount;

                    if (ctx.userData.coins < price) {
                        sendMenuEmbed().then(() => {
                            ctx.followUp({
                                content: `You don't have enough ${ctx.client.localEmojis.jocoins} to buy this item!`,
                                ephemeral: true,
                            });
                        });
                        return;
                    }
                    Functions.addCoins(ctx.userData, -price);
                    const oldData = cloneDeep(ctx.userData);
                    if (!selectedItem.storable) {
                        if (Functions.isConsumable(selectedItem)) {
                            Functions.useConsumableItem(selectedItem, ctx.userData, amount);

                            ctx.followUp({
                                content: `${currentShop.emoji} x${amount} **${
                                    currentShop.name
                                }**: You used ${selectedItem.emoji} **${
                                    selectedItem.name
                                }** and got: ${Functions.getRewardsCompareData(
                                    oldData,
                                    ctx.userData
                                ).join(", ")}`.slice(0, 500),
                            });
                        } else {
                            Functions.addItem(ctx.userData, selectedItem, amount);

                            ctx.followUp({
                                content: `${currentShop.emoji} **${
                                    currentShop.name
                                }**: You bought x${amount} ${selectedItem.emoji} **${
                                    selectedItem.name
                                }** for **${price.toLocaleString("en-US")}** ${
                                    ctx.client.localEmojis.jocoins
                                }`,
                            });
                        }
                    } else {
                        Functions.addItem(ctx.userData, selectedItem, amount);

                        ctx.followUp({
                            content: `${currentShop.emoji} **${
                                currentShop.name
                            }**: You bought x${amount} ${selectedItem.emoji} **${
                                selectedItem.name
                            }** for **${price.toLocaleString("en-US")}** ${
                                ctx.client.localEmojis.jocoins
                            }`,
                        });
                    }
                    await ctx.client.database.saveUserData(ctx.userData);
                    makeShopEmbed(currentShop);
                }
            });
        }

        sendMenuEmbed();
    },
};

export default slashCommand;
