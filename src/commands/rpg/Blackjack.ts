import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import { FightableNPC, RPGUserDataJSON, RPGUserQuest, SlashCommandFile } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";

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
        options: [
            {
                name: "bet",
                description: "The amount of money you want to bet.",
                type: 4,
                required: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const bet = ctx.options.getInteger("bet", true);
        if (bet < 1) {
            ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    "Hahahahaha... You're joking, right?"
                ),
            });
            return;
        }
        if (bet > ctx.userData.coins) {
            ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `Are you trying to scam me? You don't have that much money... BOZO`
                ),
            });
            return;
        }

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
        let content: string;
        let betMultiplier = 1.03;
        // if bet is equal or greater than 50% of the user's coins, then the bet multiplier is 2.25. if 25% then 1.75. If it is 100% then 3. otherwise 1.15
        if (bet >= ctx.userData.coins) {
            betMultiplier = 1.75;
        } else if (bet >= ctx.userData.coins * 0.5) {
            betMultiplier = 1.25;
        } else if (bet >= ctx.userData.coins * 0.25) {
            betMultiplier = 1.15;
        }
        const moneyGive = Math.round(bet * betMultiplier);
        const coinsAfterWin = ctx.userData.coins + moneyGive;
        const coinsAfterLose = ctx.userData.coins - bet;

        const makeMessage = (components?: boolean, firstRound?: boolean) =>
            ctx.makeMessage({
                embeds: [
                    {
                        color: 0x70926c,
                        author: {
                            name: NPCs.Daniel_J_DArby.name,
                            icon_url:
                                "https://static.wikia.nocookie.net/vsbattles/images/6/61/Unit_Daniel_J._D%27Arby_%28Love_of_cheater%27s_cat%29.png/revision/latest?cb=20190218012340",
                        },
                        description: `- Bet Amount: **${bet}** ${
                            ctx.client.localEmojis.jocoins
                        }\n- Bet Multiplier: **${betMultiplier}x**\n- Your coins after you win: **${coinsAfterWin.toLocaleString(
                            "en-US"
                        )}** ${
                            ctx.client.localEmojis.jocoins
                        }\n- Your coins after you lose: **${coinsAfterLose.toLocaleString(
                            "en-US"
                        )}**  ${ctx.client.localEmojis.jocoins}`,
                        fields: [
                            {
                                name: "Your Hand" + ` (${calculateHandTotal(playerCards)})`,
                                value: playerCards
                                    .map(
                                        (w) => formatter[w as keyof typeof formatter] + ` [${w[0]}]`
                                    )
                                    .join(" "),
                            },
                            {
                                name: "Bot's Hand" + ` (${calculateHandTotal(botCards)})`,
                                value: firstRound
                                    ? `${formatter[botCards[0] as keyof typeof formatter]} [${
                                          botCards[0][0]
                                      }] ?`
                                    : botCards
                                          .map(
                                              (w) =>
                                                  formatter[w as keyof typeof formatter] +
                                                  ` [${w[0]}]`
                                          )
                                          .join(" "),
                            },
                        ],
                    },
                ],
                content,
                components: components
                    ? [
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
                      ]
                    : [],
            });

        await makeMessage(true, true);

        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.userData.id,
                `You are currently in a game of blackjack. You're lost ? Click here --> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });

        let status: "playing" | "won" | "lost" | "tied" = "playing";

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
                    content = `Bust! You lose.`;
                    status = "lost";
                    collector.stop();
                } else if (playerTotal === 21) {
                    content = `Blackjack! You win.`;
                    status = "won";
                    collector.stop();
                } else {
                    content = `You hit.`;
                }
            } else if (interaction.customId === standID) {
                while (botTotal < 17) {
                    const card = shuffledDeck.pop();
                    botCards.push(card);
                    botTotal = calculateHandTotal(botCards);
                }

                if (botTotal > 21) {
                    content = Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        Functions.randomArray([
                            `wow.. I-I busted..? Well, you win.. I guess?`,
                            `I-I busted? How?`,
                            `I-I busted? DAMN IT!`,
                            `You just got lucky! TSS.`,
                        ])
                    );
                    status = "won";
                } else if (botTotal === playerTotal) {
                    content = Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        Functions.randomArray([
                            `Huh? We tied?`,
                            `We tied?`,
                            `Good game, we tied.`,
                            "And that's a tie..",
                        ])
                    );
                    status = "tied";
                } else if (botTotal > playerTotal) {
                    content = Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        Functions.randomArray([
                            `HAHAhaha! I WON!`,
                            "I won... get better ggez bozo",
                            "I won ZEHAHAHHAHAHAHHAA",
                            "EZ",
                        ])
                    );
                    status = "lost";
                } else {
                    content = Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        Functions.randomArray([
                            `WTF you're cheating`,
                            "hahaha..... g-gg..",
                            "YOU WON? HOW",
                            "WRYYYY (dio was here)",
                        ])
                    );
                    status = "won";
                }

                collector.stop();
            }
            if (collector.ended) {
                switch (status) {
                    case "won":
                        Functions.addCoins(ctx.userData, moneyGive);
                        ctx.followUp({
                            content: `SYSTEM: You won ${moneyGive.toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }!`,
                        });
                        break;
                    case "tied":
                        Functions.addCoins(ctx.userData, bet);
                        break;
                    case "lost":
                        Functions.addCoins(ctx.userData, -bet);
                        ctx.followUp({
                            content: `SYSTEM: You lost ${bet.toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }`,
                        });
                        break;
                    default:
                        break;
                }
                ctx.client.database.saveUserData(ctx.userData);
                makeMessage(false);
            } else makeMessage(true);
        });

        collector.on("end", () => {
            if (status === "playing") {
                content = `SYSTEM: You took too long to respond. Game ended.`;
                makeMessage(false);
            }
            ctx.client.database.deleteCooldown(ctx.user.id);
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
