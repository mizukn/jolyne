import { Item, RPGUserDataJSON, SlashCommandFile } from "../../@types";
import { Message, StringSelectMenuBuilder } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Items from "../../rpg/Items";
import { cloneDeep } from "lodash";
import { parse } from "node:path";

const craftableItems = Object.values(Items.default).filter((r) => r.craft);
const rarityValue = {
    SS: 100,
    T: 100,
    S: 50,
    A: 25,
    B: 15,
    C: 0,
};
const meetReq = (nb: number, iTem: Item, userData: RPGUserDataJSON) => {
    return Object.keys(iTem.craft).every((v) => {
        const xitem = Functions.findItem(v);
        if (!xitem) return false;
        if (iTem.craft[v] === 0) return true;
        return (
            userData.inventory[v] &&
            userData.inventory[v] >= iTem.craft[v] * nb &&
            userData.inventory[v] >= 0
        );
    });
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "craft",
        description: "Craft an item, or view the requirements to craft an item",
        options: [
            {
                name: "item",
                description: "Item to make",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const itemChosen = ctx.options.getString("item", true);
        const item = Functions.findItem(itemChosen);
        let craftValuePrice = 0;

        const contentCraft: string[][] = [[]];
        const contentPhaseMaxLengthCraft = 2048;
        const craftItems = Object.keys(item.craft)
            .map((v) => {
                const xitem = Functions.findItem(v);
                if (!xitem) return;
                if (item.craft[v] === 0) return;
                return {
                    name: xitem.name,
                    emoji: xitem.emoji,
                    rarity: xitem.rarity,
                    price: xitem.price,
                    amount: item.craft[v],
                    id: xitem.id,
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

        for (const item of craftItems) {
            const emoji =
                item === craftItems[craftItems.length - 1]
                    ? ctx.client.localEmojis.replyEnd
                    : ctx.client.localEmojis.reply;
            if (item.price !== undefined) craftValuePrice += item.price * item.amount;

            const itemString = `${emoji} ${item.emoji} \`${item.name} (x${item.amount})\` (${
                ctx.userData.inventory[item.id] ?? 0
            }/${item.amount})`;
            if (
                contentCraft[contentCraft.length - 1].join("\n").length + itemString.length >
                contentPhaseMaxLengthCraft
            )
                contentCraft.push([]);
            contentCraft[contentCraft.length - 1].push(itemString);
        }
        const meetRequirements = // item.craft & ctx.userData.inventory have the same type: { [key: string]: number }
            Object.keys(item.craft).every((v) => {
                const xitem = Functions.findItem(v);
                if (!xitem) return false;
                if (item.craft[v] === 0) return true;
                return (
                    ctx.userData.inventory[v] &&
                    ctx.userData.inventory[v] >= item.craft[v] &&
                    ctx.userData.inventory[v] >= 0
                );
            });
        let pas = 1;
        const canCraftAmount = Array.from({ length: 1000 })
            .map((v, i) => i + 1)
            .filter((v) => meetReq(v, item, ctx.userData))
            .sort((a, b) => b - a)[0];
        /*if (canCraftAmount % 15 == 0) pas = 15;
        else if (canCraftAmount % 10 == 0) pas = 10;
        else if (canCraftAmount % 5 == 0) pas = 5;
        else if (canCraftAmount % 3 == 0) pas = 3;
        else if (canCraftAmount % 2 == 0) pas = 2;*/
        for (let i = canCraftAmount - 1; i > 0; i--) {
            if (canCraftAmount % i == 0) {
                pas = i;
                break;
            }
        }

        const getOptions = () => {
            if (canCraftAmount < 25) {
                return Array.from({ length: canCraftAmount }, (_, i) => i + 1)
                    .map((v) => {
                        if (v === 0) return;
                        return {
                            value: v.toString(),
                            label: `x${v} ${item.name}`,
                        };
                    })
                    .filter((x) => x !== undefined)
                    .filter((v) => meetReq(parseInt(v.value), item, ctx.userData));
            } else {
                const pas2 = canCraftAmount / 25;
                const arr: { value: string; label: string }[] = [];
                arr.push({ value: "1", label: `x1 ${item.name}` });
                arr.push({
                    value: canCraftAmount.toString(),
                    label: `x${canCraftAmount} ${item.name}`,
                });
                while (arr.length < 25) {
                    const num = String(Math.round(arr.length * pas2));
                    arr.push({ value: num, label: `x${num} ${item.name}` });
                }
                return arr.sort((a, b) => parseInt(a.value) - parseInt(b.value));
            }
        };
        const selectAnAmountMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "amount")
                .setPlaceholder("Select an amount")
                .setDisabled(getOptions().length === 0)
                .addOptions(
                    getOptions().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getOptions()
                );

        ctx.makeMessage({
            embeds: [
                {
                    title: `${item.emoji} ${item.name}`,
                    description: `In order to craft this item, you need the following items:\n\n${contentCraft[0].join(
                        "\n"
                    )}`,
                    thumbnail: {
                        url: `https://cdn.discordapp.com/emojis/${Functions.getEmojiId(
                            item.emoji
                        )}.png`,
                    },
                    fields: [
                        /*{
                            name: "Craft value",
                            value: `${craftValuePrice.toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }`,
                        },*/
                        {
                            name: "Requirements met?",
                            value: meetRequirements ? "✅, select an amount to craft" : "❌",
                        },
                    ],
                },
            ],
            components: meetRequirements
                ? [
                      /*Functions.actionRow([
                          new ButtonBuilder()
                              .setCustomId(`craft_${ctx.interaction.id}`)
                              .setEmoji(item.emoji)
                              .setStyle(ButtonStyle.Secondary),
                      ]),*/
                      Functions.actionRow([selectAnAmountMenu()]),
                  ]
                : [],
        });

        if (meetRequirements) {
            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.customId === ctx.interaction.id + "amount" && i.user.id === ctx.userData.id,
                time: 60000,
                max: 1,
            });
            collector.on("end", () => {
                Functions.disableRows(ctx.interaction);
            });

            collector.on("collect", async (i) => {
                i.deferUpdate().catch(() => {});
                if (await ctx.antiCheat(true)) {
                    console.log("Anti cheat triggered at craft");
                    ctx.followUp({
                        content: `Your data has been changed. Please don't use other commands and try again.`,
                    });
                    collector.stop();
                    return;
                }
                if (!i.isStringSelectMenu()) return;
                // remove items from inventory
                const oldData = cloneDeep(ctx.userData);
                const results: boolean[] = [];
                const amount = parseInt(i.values[0]);
                if (!amount || isNaN(amount)) {
                    ctx.followUp({
                        content: `This message should not appear. How did you manage to get an invalid amount???`,
                    });
                    return;
                }
                if (!meetReq(amount, item, ctx.userData)) {
                    ctx.followUp({
                        content:
                            "I don't know how that's possible, but you don't meet the requirements anymore... ????",
                    });
                    return;
                }
                for (let i = 0; i < amount; i++)
                    for (const item of craftItems) {
                        results.push(Functions.removeItem(ctx.userData, item.id, item.amount));
                    }

                // add item to inventory
                results.push(Functions.addItem(ctx.userData, item.id, amount));
                const transaction = await ctx.client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: ctx.userData,
                        },
                    ],
                    `Crafted x${amount} ${item.name}`,
                    results
                );
                if (!transaction) return ctx.interaction.followUp("An error occurred.");

                ctx.interaction.followUp({
                    content: `You have successfully crafted x${amount} ${item.emoji} \`${item.name}\`!`,
                });
                //ctx.client.database.saveUserData(ctx.userData);
            });
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const items = craftableItems
            .filter(
                (r) =>
                    r.name.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                    r.id.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                    r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                    r.id.toLowerCase().includes(currentInput.toLowerCase())
            )
            .sort((b, a) => (meetReq(1, a, userData) ? 1 : 0 - (meetReq(1, b, userData) ? 1 : 0)));

        const realItems = items.map((x) => {
            return {
                name:
                    x.name +
                    (meetReq(1, x, userData) // white_check_mark : x
                        ? " ✅"
                        : " ❌"),
                value: x.id,
            };
        });
        if (realItems.length > 24) realItems.length = 24;

        interaction.respond(realItems);
    },
};

export default slashCommand;
