import { Message, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { SlashCommandFile } from "../../@types";
import { shuffleArray, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { cloneDeep } from "lodash";

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
    "2": "<:bj_2:1109205164633641061>",
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
    checkRPGCooldown: "blackjack",

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        /*if (!ctx.client.user.username.includes("Beta")) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `This command is disabled for now.`
                ),
            });
        }*/
        if (ctx.client.otherCache.get("disableBlackjack")) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `This command is disabled for now.`
                ),
            });
        }
        const bet = ctx.options.getInteger("bet", true);
        const userCoins = ctx.userData.coins;
        const standID = generateRandomId();
        const hitID = generateRandomId();
        const counter =
            parseInt(await ctx.client.database.getString(`tempCache_blackjack_${ctx.user.id}`)) ||
            0;

        console.log("counter", counter);
        console.log(userCoins, bet);
        if (userCoins < 0) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `You're in debt. Get out of here!`
                ),
            });
        }
        if (bet < 1 || bet > userCoins) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `Are you trying to scam me? You don’t have enough money!`
                ),
            });
        }

        let betMultiplier = 1.03;
        let riggedPercent = 0;
        // if bet is equal or greater than 50% of the user's coins, then the bet multiplier is 2.25. if 25% then 1.75. If it is 100% then 3. otherwise 1.15
        if (bet >= ctx.userData.coins) {
            betMultiplier = 2.25;
            riggedPercent = 0.1;
        } else if (bet >= ctx.userData.coins * 0.5) {
            betMultiplier = 1.55;
            riggedPercent = 0.05;
        } else if (bet >= ctx.userData.coins * 0.25) {
            betMultiplier = 1.25;
            riggedPercent = 0.03;
        } else if (bet >= ctx.userData.coins * 0.1) {
            betMultiplier = 1.15;
            riggedPercent = 0.02;
        } else if (bet >= ctx.userData.coins * 0.05) {
            betMultiplier = 1.09;
            riggedPercent = 0.01;
        }
        riggedPercent *= 2;

        const bjWonId = `bjWonAmountToday_${ctx.user.id}_${Functions.getTodayString()}`;
        const bjWonToday = parseInt(await ctx.client.database.getString(bjWonId)) || 0;
        const initalMoneyTodayId = `initalMoneyToday_${ctx.user.id}_${Functions.getTodayString()}`;
        let initalMoneyToday: string | number = await ctx.client.database.getString(
            initalMoneyTodayId
        );

        if (!initalMoneyToday) {
            await ctx.client.database.setString(initalMoneyTodayId, ctx.userData.coins.toString());
            initalMoneyToday = ctx.userData.coins;
            console.log("initalMoneyToday", initalMoneyToday);
        } else {
            initalMoneyToday = parseInt(initalMoneyToday);
        }

        if (bjWonToday >= initalMoneyToday * 0.8) {
            console.log("won too much today 80%");
            riggedPercent *= 25;
        } else if (bjWonToday >= initalMoneyToday * 0.5) {
            console.log("won too much today 50%");
            riggedPercent *= 10;
        } else if (bjWonToday >= initalMoneyToday * 0.2) {
            console.log("won too much today 20%");
            riggedPercent *= 5;
        }
        if (ctx.client.patreons.find((x) => x.id === ctx.user.id)) {
            riggedPercent /= 2;
        }

        console.log("wonToday", bjWonToday, "initalMoneyToday", initalMoneyToday);
        const playerCards: string[] = [];
        const botCards: string[] = [];
        const systemIsRigged = Functions.percent(riggedPercent * 100);
        console.log(systemIsRigged, riggedPercent * 100);
        // Initialize deck and deal starting hands
        const shuffledDeck = shuffleArray([...deck]);
        playerCards.push(shuffledDeck.pop()!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        playerCards.push(shuffledDeck.pop()!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        botCards.push(shuffledDeck.pop()!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        if (ctx.client.user.username.includes("Beta"))
            ctx.followUpQueue.push({
                content: `DEBUG:\n\n- \`riggedPercent:\` **${
                    riggedPercent * 100
                }%**\n- \`betMultiplier:\` **x${betMultiplier}**\n- \`bjWonToday:\` ${bjWonToday.toLocaleString(
                    "en-US"
                )}\n- \`initalMoneyToday:\` ${initalMoneyToday.toLocaleString(
                    "en-US"
                )}\n- \`isRigged?\` **${systemIsRigged}**`,
            });

        const makeGameMessage = async (showBotSecondCard = false) =>
            ctx.makeMessage({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x70926c)
                        .setAuthor({
                            name: NPCs.Daniel_J_DArby.name,
                            iconURL:
                                "https://static.wikia.nocookie.net/vsbattles/images/6/61/Unit_Daniel_J._D%27Arby_%28Love_of_cheater%27s_cat%29.png/revision/latest?cb=20190218012340",
                        })
                        .setDescription(
                            `- Your bet: **${bet.toLocaleString("en-US")}** coins\n- Pot: **${(
                                bet * 2
                            ).toLocaleString("en-US")}** coins\n- Potentials: **${(
                                bet * betMultiplier
                            ).toLocaleString(
                                "en-US"
                            )}** coins\n-# - Your probability of winning: **${(
                                probabilityToWin(playerCards, playerCards, shuffledDeck) * 100
                            ).toLocaleString("en-US")}**%\n-# - Bot's probability of winning: **${(
                                probabilityToWin(botCards, playerCards, shuffledDeck) * 100
                            ).toLocaleString("en-US")}**%`
                        )
                        /*.setFooter({
                            text: getHint(playerCards, botCards, shuffledDeck),
                        })*/
                        .addFields(
                            {
                                name: `Your Hand (${calculateHandTotal(playerCards)}) ${(
                                    probabilityToWin(playerCards, playerCards, shuffledDeck) * 100
                                ).toLocaleString("en-US")}%`,
                                value: playerCards
                                    .map(
                                        (w) =>
                                            formatter[w as keyof typeof formatter] +
                                            ` [${!isNaN(parseInt(w[0])) ? w : w[0]}]`
                                    )
                                    .join(" "),
                            },
                            {
                                name: `Bot's Hand (${
                                    showBotSecondCard
                                        ? calculateHandTotal(botCards)
                                        : values[botCards[0] as keyof typeof values] + " + ?"
                                }) ${(
                                    probabilityToWin(botCards, playerCards, shuffledDeck) * 100
                                ).toLocaleString("en-US")}%`,
                                value: botCards
                                    .map((w, i) =>
                                        i == 0 && !showBotSecondCard
                                            ? `<:unkcard:1301222170982088744> [?]`
                                            : formatter[w as keyof typeof formatter] +
                                              ` [${!isNaN(parseInt(w[0])) ? w : w[0]}]`
                                    )
                                    .join(" "),
                            }
                        ),
                ],
                components: [
                    Functions.actionRow([
                        new ButtonBuilder()
                            .setCustomId(hitID)
                            .setLabel("Hit")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(standID)
                            .setLabel("Stand")
                            .setStyle(ButtonStyle.Danger),
                    ]),
                ],
            });

        await makeGameMessage();

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === ctx.user.id,
            time: 360000,
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();

            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

            if (ctx.userData.coins < bet) {
                ctx.followUp({
                    content: Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        `You tried to scam me, now you're in debt! HAHA`
                    ),
                });
                collector.stop("player_bust");
                return;
            }

            if (interaction.customId === hitID) {
                /*const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                playerCards.push(card);
                */
                if (systemIsRigged) {
                    const card = // get a card that will make the player bust
                        shuffledDeck.findIndex(
                            (card) => calculateHandTotal([...playerCards, card]) > 21
                        );
                    if (card === -1) {
                        const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                        playerCards.push(card);
                    } else {
                        playerCards.push(shuffledDeck[card]);
                        shuffledDeck.splice(card, 1);
                    }
                } else {
                    const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    playerCards.push(card);
                }

                const playerTotal = calculateHandTotal(playerCards);

                if (playerTotal > 21) {
                    collector.stop("player_bust");
                } else if (playerTotal === 21) {
                    collector.stop("player_blackjack");
                } else {
                    await makeGameMessage();
                }
            } else if (interaction.customId === standID) {
                let botTotal = calculateHandTotal(botCards);
                while (botTotal < 17) {
                    /*const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    botCards.push(card);*/
                    if (systemIsRigged) {
                        // bot must win
                        const card = // get a card that will make the bot win
                            shuffledDeck.findIndex(
                                (card) => calculateHandTotal([...botCards, card]) <= 21
                            );
                        if (card === -1) {
                            const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                            botCards.push(card);
                        } else {
                            botCards.push(shuffledDeck[card]);
                            shuffledDeck.splice(card, 1);
                        }
                    } else {
                        const card = shuffledDeck.pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                        botCards.push(card);
                    }

                    botTotal = calculateHandTotal(botCards);
                }
                collector.stop("stand");
            }
        });

        collector.on("end", async (_, reason) => {
            let resultMessage = "";
            const botTotal = calculateHandTotal(botCards);
            const playerTotal = calculateHandTotal(playerCards);

            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
            const oldData = cloneDeep(ctx.userData);

            if (reason === "player_bust") {
                resultMessage = `SYSTEM: You busted! You lost **${bet.toLocaleString(
                    "en-US"
                )}** coins.`;
                Functions.addCoins(ctx.userData, -bet);
            } else if (reason === "player_blackjack" || botTotal > 21 || playerTotal > botTotal) {
                const winnings = Math.round(bet * betMultiplier);
                resultMessage = `SYSTEM: You win **${winnings.toLocaleString("en-US")}** coins!`;
                Functions.addCoins(ctx.userData, winnings);
                ctx.client.database.setString(bjWonId, (bjWonToday + winnings).toString());
            } else if (botTotal > playerTotal) {
                resultMessage = `SYSTEM: You lost **${bet.toLocaleString("en-US")}** coins.`;
                Functions.addCoins(ctx.userData, -bet);
            } else {
                resultMessage = `SYSTEM: It's a tie! You get your **${bet.toLocaleString(
                    "en-US"
                )}** coins back.`;
            }

            //ctx.client.database.saveUserData(ctx.userData);
            const transaction = await ctx.client.database.handleTransaction(
                [
                    {
                        oldData,
                        newData: ctx.userData,
                    },
                ],
                `Blackjack: ${resultMessage} (initalMoneyToday: ${initalMoneyToday}, bjWonToday: ${bjWonToday}, riggedPercent: ${riggedPercent}, betMultiplier: ${betMultiplier}, systemIsRigged: ${systemIsRigged})`
            );
            if (!transaction) {
                ctx.followUp({
                    content: `SYSTEM: An error occurred while processing the transaction. No coins were lost or gained.`,
                });
                return;
            }
            await makeGameMessage(true);
            const newCounter = counter + 1;
            if (newCounter >= 6) {
                ctx.client.database.setRPGCooldown(ctx.user.id, "blackjack", 1000 * 60 * 1);
                ctx.client.database.redis.del(`tempCache_blackjack_${ctx.user.id}`);
            } else {
                ctx.client.database.setString(
                    `tempCache_blackjack_${ctx.user.id}`,
                    newCounter.toString()
                );
            }
            ctx.followUp({ content: resultMessage });
        });
    },
};

function calculateHandTotal(hand: string[]): number {
    let total = 0;
    let hasAce = false;

    for (const card of hand) {
        total += values[card as keyof typeof values];
        if (card === "Ace") hasAce = true;
    }

    if (hasAce && total <= 11) total += 10;

    return total;
}

export default slashCommand;

function probabilityToWin(
    playerHand: string[],
    botHand: string[],
    remainingDeck: string[]
): number {
    const playerTotal = calculateHandTotal(playerHand);
    const botTotal = calculateHandTotal(botHand);

    if (playerTotal > 21) return 0;
    if (botTotal > 21) return 1;
    if (playerTotal === 21) return 1;
    if (botTotal === 21) return 0;

    let playerWin = 0;
    let botWin = 0;

    for (const card of remainingDeck) {
        const newRemainingDeck = remainingDeck.filter((x) => x !== card);
        const newPlayerHand = [...playerHand, card];
        const newBotHand = [...botHand, card];

        if (calculateHandTotal(newPlayerHand) <= 21) {
            playerWin++;
        }

        if (calculateHandTotal(newBotHand) <= 21) {
            botWin++;
        }
    }

    return playerWin + botWin == 0 ? 1 : playerWin / (playerWin + botWin);
}

const getHint = (playerHand: string[], botHand: string[], remainingDeck: string[]): string => {
    const playerTotal = calculateHandTotal(playerHand);
    const botTotal = calculateHandTotal(botHand);

    if (playerTotal > 21) return "You busted!";

    const playerWin = probabilityToWin(playerHand, botHand, remainingDeck);
    const botWin = probabilityToWin(botHand, playerHand, remainingDeck);

    if (playerWin > botWin) return "Hit!";
    if (playerWin < botWin) return "Stand!";
    else if (playerTotal < 17) return "Hit!";
    else return "Stand!";
};
