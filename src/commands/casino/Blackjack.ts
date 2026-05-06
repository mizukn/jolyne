import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { SlashCommandFile } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { containers, V2Reply } from "../../utils/containers";
import { cloneDeep } from "lodash";

const RANKS = [
    "Ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
] as const;
type Rank = (typeof RANKS)[number];

const SUITS = ["♠", "♥", "♦", "♣"] as const;
type Suit = (typeof SUITS)[number];

const RANK_VALUE: Record<Rank, number> = {
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

const RANK_EMOJI: Record<Rank, string> = {
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

const HIDDEN_CARD = "<:unkcard:1301222170982088744>";
const RESULT_DOT: Record<string, string> = { W: "🟢", L: "🔴", P: "🟡", B: "🟣" };

interface Card {
    rank: Rank;
    suit: Suit;
}

type ResultKind = "blackjack" | "win" | "dealer-bust" | "push" | "loss" | "bust";

interface GameResult {
    kind: ResultKind;
    net: number; // signed coin delta vs. the placed bet
    payout: number; // amount to credit back at settlement
    historyChar: "W" | "L" | "P" | "B";
}

function buildShoe(): Card[] {
    const shoe: Card[] = [];
    for (const rank of RANKS) {
        for (const suit of SUITS) {
            shoe.push({ rank, suit });
        }
    }
    return Functions.shuffleArray(shoe);
}

function handValue(hand: Card[]): number {
    let total = 0;
    let aces = 0;
    for (const c of hand) {
        if (c.rank === "Ace") aces++;
        total += RANK_VALUE[c.rank];
    }
    while (aces > 0 && total + 10 <= 21) {
        total += 10;
        aces--;
    }
    return total;
}

function isBlackjack(hand: Card[]): boolean {
    return hand.length === 2 && handValue(hand) === 21;
}

function formatCard(c: Card): string {
    return `${RANK_EMOJI[c.rank]}\`${c.suit}\``;
}

function formatHand(hand: Card[], hideSecond = false): string {
    return hand
        .map((c, i) => (hideSecond && i === 1 ? `${HIDDEN_CARD}\`?\`` : formatCard(c)))
        .join("  ");
}

function drawFair(shoe: Card[]): Card {
    return shoe.shift()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

// Picks the worst-for-player card on hit, or the best-for-dealer card on stand.
function drawBiased(
    shoe: Card[],
    strategy: "bust-player" | "save-dealer",
    currentHand: Card[]
): Card {
    let bestIdx = 0;
    if (strategy === "bust-player") {
        // Prefer cards that bust; otherwise highest non-bust total.
        let bestScore = -Infinity;
        for (let i = 0; i < shoe.length; i++) {
            const total = handValue([...currentHand, shoe[i]]);
            const score = total > 21 ? 1000 - total : total;
            if (score > bestScore) {
                bestScore = score;
                bestIdx = i;
            }
        }
    } else {
        // save-dealer: closest to 21 without busting; if all bust, lowest bust.
        let bestNonBust = -Infinity;
        let lowestBust = Infinity;
        let nonBustIdx = -1;
        let bustIdx = 0;
        for (let i = 0; i < shoe.length; i++) {
            const total = handValue([...currentHand, shoe[i]]);
            if (total <= 21) {
                if (total > bestNonBust) {
                    bestNonBust = total;
                    nonBustIdx = i;
                }
            } else if (total < lowestBust) {
                lowestBust = total;
                bustIdx = i;
            }
        }
        bestIdx = nonBustIdx >= 0 ? nonBustIdx : bustIdx;
    }
    return shoe.splice(bestIdx, 1)[0];
}

function resultLine(result: GameResult, coins: string, dealerVal: number, playerVal: number): string {
    const fmt = (n: number) => Math.abs(n).toLocaleString("en-US");
    switch (result.kind) {
        case "blackjack":
            return `🎰 **BLACKJACK!** You won **${fmt(result.net)}** ${coins}`;
        case "win":
            return `🏆 **You Win!** You won **${fmt(result.net)}** ${coins}`;
        case "dealer-bust":
            return `💥 **Dealer busts!** You won **${fmt(result.net)}** ${coins}`;
        case "loss": {
            const closeBy = dealerVal - playerVal;
            if (closeBy > 0 && closeBy <= 2) {
                return `😬 **So close!** Dealer beat you by ${closeBy}. You lost **${fmt(result.net)}** ${coins}`;
            }
            return `💀 **You lose!** Lost **${fmt(result.net)}** ${coins}`;
        }
        case "bust": {
            const over = playerVal - 21;
            if (over <= 1) return `💥 **Just one over!** Lost **${fmt(result.net)}** ${coins}`;
            return `💥 **Bust!** Lost **${fmt(result.net)}** ${coins}`;
        }
        case "push":
            return `🤝 **Push.** Your bet is returned.`;
    }
}

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
        if (ctx.client.otherCache.get("disableBlackjack")) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `This command is disabled for now.`
                ),
            });
        }

        const bet = ctx.options.getInteger("bet", true);
        if (bet < 1) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(NPCs.Daniel_J_DArby, `Place a real bet.`),
            });
        }

        // Concurrent-game lock with a 10-minute fallback expiry. Atomically
        // refuses a second blackjack while one is still in flight, which is
        // what previously let users multiply payouts by racing games.
        const lockKey = `bjLock_${ctx.user.id}`;
        const lockResult = await ctx.client.database.redis.set(lockKey, "1", {
            NX: true,
            EX: 600,
        });
        if (lockResult === null) {
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `One game at a time, kid. Finish your current hand first.`
                ),
            });
        }
        const releaseLock = () => ctx.client.database.redis.del(lockKey).catch(() => 0);

        // Refresh user data after acquiring the lock so we reason about the
        // latest balance, not whatever was cached at command-invoke time.
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        if (ctx.userData.coins < 1) {
            await releaseLock();
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `You're broke. Get out of here!`
                ),
            });
        }
        if (bet > ctx.userData.coins) {
            await releaseLock();
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Daniel_J_DArby,
                    `You don't have enough coins for that bet.`
                ),
            });
        }

        // Persisted addiction-loop state.
        const today = Functions.getTodayString();
        const wonTodayKey = `bjWonAmountToday_${ctx.user.id}_${today}`;
        const initialMoneyTodayKey = `initalMoneyToday_${ctx.user.id}_${today}`;
        const streakKey = `bjStreak_${ctx.user.id}`;
        const historyKey = `bjHistory_${ctx.user.id}`;

        const wonToday = parseInt(await ctx.client.database.getString(wonTodayKey)) || 0;
        let initialMoneyToday: number;
        const storedInitial = await ctx.client.database.getString(initialMoneyTodayKey);
        if (!storedInitial) {
            initialMoneyToday = ctx.userData.coins;
            await ctx.client.database.setString(initialMoneyTodayKey, initialMoneyToday.toString());
        } else {
            initialMoneyToday = parseInt(storedInitial);
        }
        const streak = parseInt(await ctx.client.database.getString(streakKey)) || 0;
        const history = (await ctx.client.database.getString(historyKey)) || "";

        // House bias is applied per-card-draw, independent of bet size, so
        // small "safe" bets can no longer farm against an unbiased deck.
        let bias = 0.2;
        if (wonToday >= initialMoneyToday * 0.8) bias = 0.85;
        else if (wonToday >= initialMoneyToday * 0.5) bias = 0.65;
        else if (wonToday >= initialMoneyToday * 0.2) bias = 0.45;
        if (streak >= 3) bias = Math.max(bias, 0.5);
        if (streak >= 5) bias = Math.max(bias, 0.75);
        if (await ctx.client.database.getString(`bjblacklist_${ctx.user.id}`)) bias = 1;
        if (ctx.client.patreons.find((x) => x.id === ctx.user.id)) bias *= 0.6;

        // Lock the funds by deducting the bet up front; settlement adds the
        // payout (refund + winnings) back at the end.
        const preBetData = cloneDeep(ctx.userData);
        Functions.addCoins(ctx.userData, -bet);
        const placeBetTx = await ctx.client.database.handleTransaction(
            [{ oldData: preBetData, newData: ctx.userData }],
            `Blackjack: bet placed (${bet} coins)`
        );
        if (!placeBetTx) {
            await releaseLock();
            return void ctx.makeMessage({
                content: `SYSTEM: Failed to place your bet. Try again.`,
            });
        }

        const counter =
            parseInt(await ctx.client.database.getString(`tempCache_blackjack_${ctx.user.id}`)) || 0;
        const standID = Functions.generateRandomId();
        const hitID = Functions.generateRandomId();
        const jocoinsEmoji = ctx.client.localEmojis.jocoins;

        const shoe = buildShoe();
        const playerCards: Card[] = [drawFair(shoe), drawFair(shoe)];
        const dealerCards: Card[] = [drawFair(shoe), drawFair(shoe)];

        function buildReply(reveal: boolean, result?: GameResult): V2Reply {
            const playerVal = handValue(playerCards);
            const dealerVal = handValue(dealerCards);
            const dealerDisplay = reveal
                ? `${dealerVal}`
                : `${RANK_VALUE[dealerCards[0].rank]} + ?`;

            const sections: { text: string }[] = [
                {
                    text: `### Dealer's Hand (Value: ${dealerDisplay})\n${formatHand(
                        dealerCards,
                        !reveal
                    )}`,
                },
                {
                    text: `### Your Hand (Value: ${playerVal})\n${formatHand(playerCards)}`,
                },
            ];

            if (result) {
                sections.push({
                    text: resultLine(result, jocoinsEmoji, dealerVal, playerVal),
                });
            } else {
                const lines: string[] = [
                    `💰 **Bet:** ${bet.toLocaleString("en-US")} ${jocoinsEmoji}`,
                ];
                if (streak > 0) lines.push(`🔥 **Win streak:** ${streak}`);
                else if (streak < 0) lines.push(`💔 **Loss streak:** ${Math.abs(streak)}`);
                if (history) {
                    const dots = history
                        .split("")
                        .map((c) => RESULT_DOT[c] || "")
                        .join(" ");
                    lines.push(`**Last games:** ${dots}`);
                }
                sections.push({ text: lines.join("\n") });
            }

            const reply = containers.primary({
                title: "🃏 Blackjack",
                sections,
                sectionDividers: true,
            });

            const hitButton = new ButtonBuilder()
                .setCustomId(hitID)
                .setLabel("Hit")
                .setEmoji("🃏")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!!result);
            const standButton = new ButtonBuilder()
                .setCustomId(standID)
                .setLabel("Stand")
                .setEmoji("🛑")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!!result);
            reply.components.push(Functions.actionRow([hitButton, standButton]));
            return reply;
        }

        function computeResult(): GameResult {
            const playerVal = handValue(playerCards);
            const dealerVal = handValue(dealerCards);
            const playerNatural = isBlackjack(playerCards);
            const dealerNatural = isBlackjack(dealerCards);

            if (playerVal > 21) {
                return { kind: "bust", net: -bet, payout: 0, historyChar: "L" };
            }
            if (playerNatural && !dealerNatural) {
                const winnings = Math.round(bet * 1.5);
                return {
                    kind: "blackjack",
                    net: winnings,
                    payout: bet + winnings,
                    historyChar: "B",
                };
            }
            if (dealerNatural && !playerNatural) {
                return { kind: "loss", net: -bet, payout: 0, historyChar: "L" };
            }
            if (playerNatural && dealerNatural) {
                return { kind: "push", net: 0, payout: bet, historyChar: "P" };
            }
            if (dealerVal > 21) {
                return { kind: "dealer-bust", net: bet, payout: bet * 2, historyChar: "W" };
            }
            if (playerVal > dealerVal) {
                return { kind: "win", net: bet, payout: bet * 2, historyChar: "W" };
            }
            if (playerVal === dealerVal) {
                return { kind: "push", net: 0, payout: bet, historyChar: "P" };
            }
            return { kind: "loss", net: -bet, payout: 0, historyChar: "L" };
        }

        async function settle(result: GameResult): Promise<void> {
            try {
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
                const oldData = cloneDeep(ctx.userData);
                if (result.payout > 0) Functions.addCoins(ctx.userData, result.payout);
                const tx = await ctx.client.database.handleTransaction(
                    [{ oldData, newData: ctx.userData }],
                    `Blackjack: ${result.kind} (bet=${bet}, payout=${result.payout})`
                );
                if (!tx) {
                    ctx.client.log(
                        `Blackjack payout transaction failed for user ${ctx.user.id} (kind=${result.kind}, bet=${bet}, payout=${result.payout})`,
                        "error"
                    );
                }

                const isWin =
                    result.kind === "win" ||
                    result.kind === "blackjack" ||
                    result.kind === "dealer-bust";
                const isLoss = result.kind === "loss" || result.kind === "bust";
                const newStreak = isWin
                    ? Math.max(streak, 0) + 1
                    : isLoss
                      ? Math.min(streak, 0) - 1
                      : streak;
                await ctx.client.database.redis.set(streakKey, newStreak.toString(), { EX: 86400 });

                const newHistory = (history + result.historyChar).slice(-5);
                await ctx.client.database.redis.set(historyKey, newHistory, { EX: 86400 });

                if (result.net > 0) {
                    await ctx.client.database.setString(
                        wonTodayKey,
                        (wonToday + result.net).toString()
                    );
                }

                const newCounter = counter + 1;
                if (newCounter >= 6) {
                    await ctx.client.database.setRPGCooldown(
                        ctx.user.id,
                        "blackjack",
                        1000 * 60 * 1
                    );
                    await ctx.client.database.redis.del(`tempCache_blackjack_${ctx.user.id}`);
                } else {
                    await ctx.client.database.setString(
                        `tempCache_blackjack_${ctx.user.id}`,
                        newCounter.toString()
                    );
                }
            } finally {
                await releaseLock();
            }
        }

        // Resolve naturals immediately — no buttons, just a final reveal.
        if (isBlackjack(playerCards) || isBlackjack(dealerCards)) {
            const result = computeResult();
            await settle(result);
            await ctx.makeMessage(buildReply(true, result));
            return;
        }

        await ctx.makeMessage(buildReply(false));

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === ctx.user.id,
            time: 360000,
        });

        let endedByPlay = false;

        collector.on("collect", async (interaction) => {
            if (!interaction.isButton()) return;
            if (interaction.customId !== hitID && interaction.customId !== standID) return;
            interaction.deferUpdate().catch(() => 0);

            if (interaction.customId === hitID) {
                const card = Functions.percent(bias * 100)
                    ? drawBiased(shoe, "bust-player", playerCards)
                    : drawFair(shoe);
                playerCards.push(card);

                if (handValue(playerCards) >= 21) {
                    endedByPlay = true;
                    collector.stop("hand-decided");
                } else {
                    await ctx.makeMessage(buildReply(false));
                }
            } else {
                while (handValue(dealerCards) < 17) {
                    const card = Functions.percent(bias * 100)
                        ? drawBiased(shoe, "save-dealer", dealerCards)
                        : drawFair(shoe);
                    dealerCards.push(card);
                }
                endedByPlay = true;
                collector.stop("hand-decided");
            }
        });

        collector.on("end", async () => {
            try {
                if (!endedByPlay) {
                    // Timed out without playing a card — refund the bet.
                    ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
                    const oldData = cloneDeep(ctx.userData);
                    Functions.addCoins(ctx.userData, bet);
                    await ctx.client.database.handleTransaction(
                        [{ oldData, newData: ctx.userData }],
                        `Blackjack: timeout refund (${bet} coins)`
                    );
                    return;
                }

                // Player hit to exactly 21 — dealer still needs to play out.
                if (handValue(playerCards) === 21) {
                    while (handValue(dealerCards) < 17) {
                        const card = Functions.percent(bias * 100)
                            ? drawBiased(shoe, "save-dealer", dealerCards)
                            : drawFair(shoe);
                        dealerCards.push(card);
                    }
                }

                const result = computeResult();
                await settle(result);
                await ctx.makeMessage(buildReply(true, result));
            } finally {
                if (!endedByPlay) await releaseLock();
            }
        });
    },
};

export default slashCommand;
