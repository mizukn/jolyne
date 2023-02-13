import { SlashCommandFile, Chapter, ChapterPart } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "inventory",
        description: "dd",
        options: [],
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
    },
};

export default slashCommand;
