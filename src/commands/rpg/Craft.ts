import {
    SlashCommandFile
} from "../../@types";
import {
    Message
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Items from "../../rpg/Items";

const craftableItems = Object.values(Items.default).filter((r) => r.craft);
const rarityValue = {
    SS: 100,
    T: 100,
    S: 50,
    A: 25,
    B: 15,
    C: 0
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
                autocomplete: true
            }
        ]
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
                    id: xitem.id
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
                        )}.png`
                    },
                    fields: [
                        {
                            name: "Craft value (price)",
                            value: `${craftValuePrice.toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }`
                        },
                        {
                            name: "Requirements met?",
                            value: meetRequirements
                                ? "✅, click the button below if you wish to craft this item"
                                : "❌"
                        }
                    ]
                }
            ],
            components: meetRequirements
                ? [
                    Functions.actionRow([
                        new ButtonBuilder()
                            .setCustomId(`craft_${ctx.interaction.id}`)
                            .setEmoji(item.emoji)
                            .setStyle(ButtonStyle.Secondary)
                    ])
                ]
                : []
        });

        if (meetRequirements) {
            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.customId === `craft_${ctx.interaction.id}` && i.user.id === ctx.userData.id,
                time: 60000,
                max: 1
            });

            collector.on("collect", async (i) => {
                i.deferUpdate().catch(() => {
                }); // eslint-disable-line
                if (await ctx.antiCheat(true)) return;

                // remove items from inventory
                for (const item of craftItems) {
                    Functions.removeItem(ctx.userData, item.id, item.amount);
                }

                // add item to inventory
                Functions.addItem(ctx.userData, item.id, 1);

                ctx.interaction.followUp({
                    content: `You have successfully crafted ${item.emoji} \`${item.name}\`!`
                });
                ctx.client.database.saveUserData(ctx.userData);
            });
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const items = craftableItems.filter(
            (r) =>
                r.name.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.id.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                r.id.toLowerCase().includes(currentInput.toLowerCase())
        );

        const realItems = items.map((x) => {
            return {
                name: x.name,
                value: x.id
            };
        });
        if (realItems.length > 24) realItems.length = 24;

        interaction.respond(realItems);
    }
};

export default slashCommand;
