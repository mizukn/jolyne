import { SlashCommandFile, Leaderboard, Shop, RPGUserDataJSON, numOrPerc } from "../../@types";
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
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import * as Shops from "../../rpg/Shops";
import * as Stands from "../../rpg/Stands/Stands";
import * as Emojis from "../../emojis.json";

const standPercent = {
    SS: 2,
    S: 4,
    A: 14,
    B: 38,
    C: 50,
    T: 2,
};

export const standPrice = {
    SS: 2000000000000000,
    S: 100000,
    A: 50000,
    B: 25000,
    C: 10000,
    T: 6969696969696969,
};

type cShop = {
    name: string;
    data: StringSelectMenuBuilder;
    items: Shop["items"];
    emoji: string;
};

const goBackButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setEmoji(Emojis.arrowLeft)
    .setCustomId("goBack");

const slashCommand: SlashCommandFile = {
    data: {
        name: "shop",
        description: "SAGASHI MONO SAGASHI NI YUKU NO SA!!",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
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
                ],
            };
            const hasAlreadyBlackMarket = (await ctx.client.database.getJSONData(
                Functions.getBlackMarketString(ctx.user.id)
            )) as Shop["items"];
            if (!hasAlreadyBlackMarket) {
                for (const stand in Stands) {
                    BM.items.push({
                        item: Functions.findItem(Stands[stand as keyof typeof Stands].id).id,
                        price: standPrice[Stands[stand as keyof typeof Stands].rarity],
                    });
                }
                BM.items = Functions.shuffle(BM.items);
                BM.items.length = ctx.client.patreons.find((x) => x.id === ctx.user.id)
                    ? Functions.RNG(
                          ctx.client.patreons.find((x) => x.id === ctx.user.id).level + 2,
                          ctx.client.patreons.find((x) => x.id === ctx.user.id).level * 2 + 7
                      )
                    : Functions.RNG(3, 7);
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

            return BM;
        }

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
                    .setCustomId(`shop_${Shop.name}`)
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
                            const xitem = Functions.findItem(item.item);
                            if (!xitem) continue;
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
                for (const item of Shop.items) {
                    const xitem = Functions.findItem(item.item);
                    if (!xitem) continue;
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
            if (new Date().getDay() === 0) handleShop(await createUserBlackMarket());
            const shopSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("shop")
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
                            title: ":shopping_cart: Morioh City Shop",
                            fields: [
                                {
                                    name: shop.emoji + " " + shop.name,
                                    value: createShopString(shop),
                                },
                            ],
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
                } else if (i.customId === "shop") {
                    const shop = shops.find(
                        (x) => x.name === (i as StringSelectMenuInteraction).values[0]
                    );
                    if (!shop) return;
                    currentShop = shop;
                    makeShopEmbed(shop);
                } else if (i.customId.includes("shop")) {
                    // selected item
                    const item = currentShop?.items.find(
                        (x) => x.item === (i as StringSelectMenuInteraction).values[0]
                    );
                    if (!item) return;
                    const xitem = Functions.findItem(item.item);
                    if (!xitem) return;
                    const price = item.price ?? xitem.price;
                    if (ctx.userData.coins < price) {
                        ctx.followUp({
                            content: `You don't have enough ${ctx.client.localEmojis.jocoins} to buy this item!`,
                            ephemeral: true,
                        });
                        return;
                    }
                    Functions.addCoins(ctx.userData, -price);
                    if (!xitem.storable) {
                        const winContentArray: string[] = [];
                        // eslint-disable-next-line no-inner-declarations
                        function addHealthOrStamina(
                            amount: numOrPerc,
                            type: "health" | "stamina"
                        ): void {
                            const emoji = type === "health" ? ":heart:" : ":zap:";
                            const addX =
                                type === "health" ? Functions.addHealth : Functions.addStamina;
                            const x =
                                type === "health"
                                    ? () => ctx.userData.health
                                    : () => ctx.userData.stamina;
                            const oldX = x();

                            const maxX =
                                type === "health"
                                    ? Functions.getMaxHealth(ctx.userData)
                                    : Functions.getMaxStamina(ctx.userData);

                            switch (typeof amount) {
                                case "number":
                                    addX(ctx.userData, amount);
                                    winContentArray.push(
                                        `+${x() - oldX} ${emoji} (${x()}/${maxX})`
                                    );
                                    break;
                                case "string":
                                    // %
                                    addX(ctx.userData, parseInt(amount) * 0.01 * maxX);
                                    winContentArray.push(
                                        `+${x() - oldX} ${emoji} (${x()}/${maxX})`
                                    );
                                    break;
                                // default: impossible
                            }
                        }

                        if (Functions.isConsumable(xitem)) {
                            if (xitem.effects.health !== undefined)
                                addHealthOrStamina(xitem.effects.health, "health");
                            if (xitem.effects.stamina !== undefined)
                                addHealthOrStamina(xitem.effects.stamina, "stamina");

                            if (xitem.effects.items) {
                                const items = Object.keys(xitem.effects.items);

                                for (const item of items) {
                                    const itemData2 = Functions.findItem(item);
                                    // if (!itemData2) impossible;

                                    Functions.addItem(
                                        ctx.userData,
                                        item,
                                        xitem.effects.items[item]
                                    );
                                    winContentArray.push(
                                        `+${xitem.effects.items[item]} ${itemData2.name} ${itemData2.emoji}`
                                    );
                                }
                            }

                            ctx.followUp({
                                content: `${currentShop.emoji} **${currentShop.name}**: You used ${
                                    xitem.emoji
                                } **${xitem.name}** and got: ${winContentArray.join(", ")}`,
                            });
                        } else if (Functions.isSpecial(xitem)) {
                            const oldData = { ...ctx.userData } as RPGUserDataJSON;
                            await ctx.client.database.setCooldown(
                                ctx.user.id,
                                "You're currently using an item."
                            );
                            try {
                                const status = await xitem.use(ctx);
                                if (status) {
                                    Functions.addItem(ctx.userData, xitem, 1);
                                    ctx.followUp({
                                        content: `You couldn't use the item. Your data has been saved. Added the item back to your inventory.`,
                                    });
                                    ctx.client.database.saveUserData(ctx.userData);
                                }
                            } catch (e) {
                                ctx.client.database.deleteCooldown(ctx.user.id);
                                ctx.followUp({
                                    content:
                                        "An error occured while using this item. Your data has been saved.",
                                });
                                ctx.RPGUserData = oldData;
                                ctx.client.database.saveUserData(ctx.userData);
                                throw e;
                            }
                            await ctx.client.database.deleteCooldown(ctx.user.id);
                            return;
                            // TODO: If used multiple times
                        }
                    } else {
                        Functions.addItem(ctx.userData, xitem, 1);
                        ctx.followUp({
                            content: `${currentShop.emoji} **${currentShop.name}**: You bought ${
                                xitem.emoji
                            } **${xitem.name}** for **${price.toLocaleString("en-US")}** ${
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
