import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import { FightableNPC, RPGUserDataJSON, RPGUserQuest, SlashCommandFile } from "../../@types";

const deck = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
const values = {
    Ace: 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    Jack: 10,
    Queen: 10,
    King: 10,
};

const formatter = {
    Ace: "<:bj_ace:1109205161471115356>",
    "2": "<:bj_1:1109205164633641061>",
    "3": "<:bj_3:1109205167146012802>",
    "4": "<:bj_4:1109205169255759913>",
    "5": "<:bj_5:1109205170988003348>",
    "6": "<:bj_6:1109205172476985434>",
    "7": "<:bj_7:1109205174540579019>",
    "8": "<:bj_8:1109205176549650522>",
    "9": "<:bj_9:1109205179800227880>",
    "10": "<:bj_10:1109205181322768495>",
    Jack: "<:bj_jack:1109205183575097354>",
    Queen: "<:bj_queen:1109205248544878662>",
    King: "<:bj_king:1109205188285317201>",
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "blackjack",
        description: "Play a game of Blackjack.",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const playerCards: string[] = [];
        const botCards: string[] = [];
        const standID = generateRandomId();
        const hitID = generateRandomId();

        // Shuffle the deck
        const shuffledDeck = shuffleArray([...deck]);

        // Deal initial cards
        playerCards.push(shuffledDeck.pop());
        playerCards.push(shuffledDeck.pop());
        botCards.push(shuffledDeck.pop());

        const playerTotal = calculateHandTotal(playerCards);
        let botTotal = calculateHandTotal(botCards);

        const playerHandString = `${playerCards
            .map((w) => formatter[w as keyof typeof formatter])
            .join(" ")}`;
        const botHandString = `${formatter[botCards[0] as keyof typeof formatter]} ?`;

        const message = await ctx.makeMessage({
            embeds: [
                {
                    fields: [
                        {
                            name: "Your Hand",
                            value: playerHandString,
                        },
                        {
                            name: "Bot's Hand",
                            value: botHandString,
                        },
                    ],
                },
            ],
            components: [
                actionRow([
                    new ButtonBuilder()
                        .setCustomId(hitID)
                        .setLabel("Hit")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(standID)
                        .setLabel("Stand")
                        .setStyle(ButtonStyle.Primary),
                ]),
            ],
        });

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === ctx.user.id,
            time: 60000,
        });

        collector.on("collect", (interaction) => {
            // eslint-disable-next-line
            interaction.deferUpdate().catch(() => {});
            if (interaction.customId === hitID) {
                const card = shuffledDeck.pop();
                playerCards.push(card);
                const playerTotal = calculateHandTotal(playerCards);

                if (playerTotal > 21) {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `Bust! You lose.`,
                    });
                    collector.stop();
                } else if (playerTotal === 21) {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `Blackjack! You win.`,
                    });
                    collector.stop();
                } else {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                    });
                }
            } else if (interaction.customId === standID) {
                while (botTotal < 17) {
                    const card = shuffledDeck.pop();
                    botCards.push(card);
                    botTotal = calculateHandTotal(botCards);
                }

                const playerHandString = `${playerCards
                    .map((w) => formatter[w as keyof typeof formatter])
                    .join(" ")} (${calculateHandTotal(playerCards)})`;
                const botHandString = `${botCards
                    .map((w) => formatter[w as keyof typeof formatter])
                    .join(" ")} (${botTotal})`;

                if (botTotal > 21) {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `Bot busts! You win.`,
                    });
                } else if (botTotal === playerTotal) {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `It's a tie!`,
                    });
                } else if (botTotal > playerTotal) {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `Bot wins.`,
                    });
                } else {
                    ctx.makeMessage({
                        embeds: [
                            {
                                fields: [
                                    {
                                        name: "Your Hand",
                                        value: playerHandString,
                                    },
                                    {
                                        name: "Bot's Hand",
                                        value: botHandString,
                                    },
                                ],
                            },
                        ],
                        content: `You win.`,
                    });
                }

                collector.stop();
            }
        });

        collector.on("end", () => {
            ctx.makeMessage({
                components: [],
            });
        });
    },
};

function calculateHandTotal(hand: string[]): number {
    let total = 0;
    let hasAce = false;

    for (const card of hand) {
        total += values[card as keyof typeof values];
        if (card === "Ace") {
            hasAce = true;
        }
    }

    if (hasAce && total <= 11) {
        total += 10; // Ace can count as 1 or 11, adding 10 here if it doesn't bust the hand
    }

    return total;
}

export default slashCommand;
