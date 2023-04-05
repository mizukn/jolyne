import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserDataJSON,
    Consumable,
    numOrPerc,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "inventory",
        description: "dd",
        options: [
            {
                name: "view",
                description: "dd",
                type: 1,
            },
            {
                name: "use",
                description: "dd",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "dd",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "dd",
                        type: 4,
                        required: false,
                    },
                ],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.interaction.options.getSubcommand() === "view") {
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

            goToPage();

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
                goToPage();
            });
        } else {
            const itemString = ctx.interaction.options.getString("item", true);
            const amountX = ctx.interaction.options.getInteger("amount") || 1;
            const left = ctx.userData.inventory[itemString] || 0;

            if (left === 0) {
                ctx.makeMessage({
                    content: "This item does not exist or you don't have any left. Nice try",
                });
                return;
            }

            if (left < amountX) {
                ctx.makeMessage({
                    content: `You don't have enough of this item. You have ${left} left.`,
                });
                return;
            }

            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                ctx.makeMessage({
                    content: `Unknown item: \`${itemString}\`. Join https://discord.gg/jolyne to get a possible refund.`,
                });
                return;
            }

            const winContent = `You used ${itemData.emoji} x${amountX} \`${itemData.name}\` and got:`;
            const winContentArray: string[] = [];

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
                        winContentArray.push(`+${x() - oldX} ${emoji} (${x()}/${maxX})`);
                        break;
                    case "string":
                        // %
                        addX(ctx.userData, Math.round((x() / maxX) * parseInt(amount)));
                        winContentArray.push(`+${x() - oldX} ${emoji} (${x()}/${maxX})`);
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
                            winContentArray.push(
                                `[${i + 1}] +${itemData.effects.items[item]} ${itemData2.name} ${
                                    itemData2.emoji
                                }`
                            );
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
            ctx.client.database.saveUserData(ctx.userData);
            ctx.makeMessage({
                content: winContent + " " + winContentArray.join(", "),
            });

            // TODO: If item is GARMENT
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
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

        interaction.respond(
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
        );
    },
};

export default slashCommand;
