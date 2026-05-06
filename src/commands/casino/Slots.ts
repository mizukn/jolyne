import {
    Message,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";
import * as Emojis from "../../emojis.json";
import { cloneDeep } from "lodash";
import { COLORS, containers, V2Reply } from "../../utils/containers";

const slotsChart = {
    [Emojis.diamond_gif]: {
        2: 8,
        3: 15,
        frequence: 1,
    },
    [Emojis.money_gif]: {
        2: 7,
        3: 10,
        frequence: 1,
    },
    [Emojis.watermelon_gif1]: {
        2: 5,
        3: 9,
        frequence: 1,
    },
    [Emojis.sevensl]: {
        2: 4,
        3: 8,
        frequence: 1,
    },
    "🍓": {
        2: 3,
        3: 7,
        frequence: 2,
    },
    "🍇": {
        2: 3,
        3: 6,
        frequence: 2,
    },
    "🍌": {
        2: 3,
        3: 5,
        frequence: 3,
    },
    "🍋": {
        2: 2,
        3: 4,
        frequence: 3,
    },
    "🍊": {
        2: 2,
        3: 3,
        frequence: 3,
    },
    "🍒": {
        2: 1.9,
        3: 2.6,
        frequence: 3,
    },
    "🍎": {
        2: 1.8,
        3: 2.5,
        frequence: 3,
    },
    "🍐": {
        2: 1.7,
        3: 2.4,
        frequence: 3,
    },
    "🍍": {
        2: 1.5,
        3: 2.2,
        frequence: 3,
    },
    "🍈": {
        2: 1.4,
        3: 2.1,
        frequence: 3,
    },
    "🍑": {
        2: 1.3,
        3: 2,
        frequence: 3,
    },
    "🍏": {
        2: 1.2,
        3: 1.9,
        frequence: 3,
    },
};

const totalFruits = Object.values(slotsChart)
    .map((d) => d.frequence)
    .reduce((arr, curr) => arr + curr);
const DARBY = NPCs.Daniel_J_DArby;

function getSymbolTwoOfThreeProbability(symbol: keyof typeof slotsChart): number {
    return (slotsChart[symbol].frequence / totalFruits) ** 2;
}

function getSymbolThreeOfThreeProbability(symbol: keyof typeof slotsChart): number {
    return (slotsChart[symbol].frequence / totalFruits) ** 3;
}

function getOverallTwoOfThreeProbability(): number {
    const symbolProbabilities = Object.keys(slotsChart).map((symbol) =>
        getSymbolTwoOfThreeProbability(symbol as keyof typeof slotsChart)
    );
    return symbolProbabilities.reduce((acc, curr) => acc + Number(curr), 0);
}

function getOverallThreeOfThreeProbability(): number {
    const symbolProbabilities = Object.keys(slotsChart).map((symbol) =>
        getSymbolThreeOfThreeProbability(symbol as keyof typeof slotsChart)
    );
    return symbolProbabilities.reduce((acc, curr) => acc + Number(curr), 0);
}

function darbyLine(text: string): string {
    return `${DARBY.emoji} **Daniel J. D'Arby:** ${text}`;
}

function casinoWarning(text: string): V2Reply {
    return containers.warning(darbyLine(text));
}

function formatSlotGrid(symbols: string[]): string {
    return [
        `${symbols[0]}  ${symbols[1]}  ${symbols[2]}`,
        `➡️ ${symbols[3]}  ${symbols[4]}  ${symbols[5]}`,
        `${symbols[6]}  ${symbols[7]}  ${symbols[8]}`,
    ].join("\n");
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "slots",
        description: "Play the slots machine or view the slots chart.",
        options: [
            {
                name: "spin",
                description: "Spins the slots machine.",
                options: [
                    {
                        name: "bet",
                        description: "The amount of money you want to bet.",
                        type: 4,
                        required: true,
                    },
                ],
                type: 1,
            },
            {
                name: "chart",
                description: "View the slots chart.",
                type: 1,
            },
        ],
    },
    checkRPGCooldown: "slots",

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        if (ctx.options.getSubcommand() === "chart") {
            const sections = Object.keys(slotsChart).map((symbol) => {
                const typedSymbol = symbol as keyof typeof slotsChart;
                const data = slotsChart[typedSymbol];
                return {
                    text:
                        `${symbol} **x${data[2]}** for 2 matches, **x${data[3]}** jackpot\n` +
                        `> Frequency: ${data.frequence} | 2/3: ${getSymbolTwoOfThreeProbability(typedSymbol).toFixed(4)} | 3/3: ${getSymbolThreeOfThreeProbability(typedSymbol).toFixed(4)}`,
                };
            });

            return void ctx.makeMessage(
                containers.primary({
                    title: "🎰 Slots Chart",
                    description:
                        `Payouts are multiplied by your bet.\n` +
                        `> Total 2/3 chance: **${getOverallTwoOfThreeProbability().toFixed(4)}**\n` +
                        `> Total jackpot chance: **${getOverallThreeOfThreeProbability().toFixed(4)}**`,
                    descriptionDivider: true,
                    sections,
                    color: COLORS.accent,
                    footer: "Patreon tiers add extra diamonds to the machine.",
                })
            );
        }

        let bet = ctx.options.getInteger("bet", true);
        if (bet < 1) {
            return void ctx.makeMessage(casinoWarning("Hahahahaha... you're joking, right? Place a real bet."));
        }

        // Concurrency lock
        const lockKey = `tempCache_slotsLock_${ctx.user.id}`;
        const lockResult = await ctx.client.database.redis.set(lockKey, "1", {
            NX: true,
            EX: 300,
        });
        if (lockResult === null) {
            return void ctx.makeMessage(casinoWarning("One machine at a time! Finish your current spin first."));
        }
        const releaseLock = () => ctx.client.database.redis.del(lockKey).catch(() => 0);

        try {
            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
            if (ctx.userData.coins < 1) {
                await releaseLock();
                return void ctx.makeMessage(casinoWarning("You're broke. Get out of here!"));
            }
            if (bet > ctx.userData.coins) {
                await releaseLock();
                return void ctx.makeMessage(casinoWarning("Are you trying to scam me? You don't have that much money."));
            }

            const spinID = Functions.generateRandomId();
            const changeBetID = Functions.generateRandomId();
            const cancelID = Functions.generateRandomId();

            function buildInitialUI(): V2Reply {
                const sections = [
                    {
                        text: `You are about to bet **${Functions.localeNumber(bet)}** ${ctx.client.localEmojis.jocoins}.`
                    },
                    {
                        text: darbyLine("Ready to lose some coins, kid?")
                    }
                ];
                const reply = containers.primary({
                    title: `${DARBY.emoji} Slots Machine`,
                    sections,
                    sectionDividers: true,
                    color: COLORS.accent,
                    footer: `Balance: ${Functions.localeNumber(ctx.userData.coins)} ${ctx.client.localEmojis.jocoins}`,
                });
                reply.components.push(Functions.actionRow([
                    new ButtonBuilder().setCustomId(spinID).setLabel("Spin").setStyle(ButtonStyle.Primary).setEmoji("🎰"),
                    new ButtonBuilder().setCustomId(changeBetID).setLabel("Change bet").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(cancelID).setLabel("Nevermind").setStyle(ButtonStyle.Danger)
                ]));
                return reply;
            }

            await ctx.makeMessage(buildInitialUI());

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === ctx.user.id,
                time: 60000,
            });

            collector.on("collect", async (i) => {
                if (i.customId === cancelID) {
                    collector.stop("cancelled");
                    await ctx.makeMessage(containers.error(`Game cancelled.`));
                    return;
                }

                if (i.customId === changeBetID) {
                    const modal = new ModalBuilder()
                        .setCustomId(`slotsBetModal_${ctx.user.id}_${Functions.generateRandomId()}`)
                        .setTitle("Change Bet")
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("betInput")
                                    .setLabel("Amount to bet")
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(bet.toString())
                                    .setRequired(true)
                            )
                        );
                    
                    await i.showModal(modal);
                    const submission = await i.awaitModalSubmit({ time: 30000 }).catch(() => null);
                    if (!submission) return;

                    const newBet = parseInt(submission.fields.getTextInputValue("betInput"));
                    if (isNaN(newBet) || newBet < 1) {
                        return void submission.reply({ ...containers.error("Enter a valid bet amount."), ephemeral: true });
                    }
                    if (newBet > ctx.userData.coins) {
                        return void submission.reply({ ...containers.error("You don't have enough coins for that bet."), ephemeral: true });
                    }
                    
                    bet = newBet;
                    await submission.deferUpdate();
                    await ctx.makeMessage(buildInitialUI());
                    return;
                }

                if (i.customId === spinID) {
                    if (bet > ctx.userData.coins) {
                        return void i.reply({ ...containers.error("You don't have enough coins for that bet anymore!"), ephemeral: true });
                    }
                    collector.stop("spinning");
                    await i.deferUpdate();
                    await runGame(ctx, bet);
                }
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time" || reason === "cancelled") {
                    await releaseLock();
                }
            });

        } catch (e) {
            ctx.client.log(`Slots command failed for ${ctx.user.id}: ${e instanceof Error ? e.stack ?? e.message : String(e)}`, "error");
            await releaseLock();
        }
    },
};

async function runGame(ctx: CommandInteractionContext, bet: number) {
    const fruits = Object.keys(slotsChart);
    for (const id in slotsChart) {
        const symbol = slotsChart[id as keyof typeof slotsChart];
        for (let i = 0; i < symbol.frequence; i++) fruits.push(id);
    }

    const patreonData = ctx.client.patreons.find((s) => s.id === ctx.user.id);
    if (patreonData) {
        for (let i = 0; i < patreonData.level * 5; i++) fruits.push("💎");
    }

    let slotMachineFruits = Functions.shuffle([...fruits, ...fruits, ...fruits]);
    let left = Functions.randomNumber(3, 6);

    const pullAgainID = Functions.generateRandomId();
    const changeBetID = Functions.generateRandomId();

    const pullAgainButton = new ButtonBuilder().setCustomId(pullAgainID).setLabel("Spin again").setStyle(ButtonStyle.Primary).setEmoji("🎰");
    const changeBetButton = new ButtonBuilder().setCustomId(changeBetID).setLabel("Change bet").setStyle(ButtonStyle.Secondary).setEmoji("🔄");

    function buildUI(isFinal: boolean, resultText?: string, dialogue?: string): V2Reply {
        const sections = [
            {
                text: `You bet **${Functions.localeNumber(bet)}** ${ctx.client.localEmojis.jocoins}.`
            },
            {
                text: formatSlotGrid(slotMachineFruits)
            }
        ];

        if (resultText) {
            sections.push({ text: resultText });
        }

        if (dialogue) {
            sections.push({ text: dialogue });
        }

        const reply = containers.primary({
            title: `🎰 Slots Machine`,
            sections,
            sectionDividers: true,
            color: isFinal ? resultKindColor(resultText) : COLORS.accent,
            footer: `Balance: ${Functions.localeNumber(ctx.userData.coins)} ${ctx.client.localEmojis.jocoins}`,
        });

        if (isFinal) {
            reply.components.push(Functions.actionRow([pullAgainButton, changeBetButton]));
        }
        return reply;
    }

    while (left > 0) {
        await ctx.makeMessage(buildUI(false, `Spinning... **${left}**`));
        await new Promise(r => setTimeout(r, 800));
        slotMachineFruits = slotMachineFruits.slice(3);
        if (slotMachineFruits.length < 9) slotMachineFruits = Functions.shuffle([...fruits, ...fruits]);
        left--;
    }

    // Final result
    const oldData = cloneDeep(ctx.userData);
    let multiplier = 0;
    let resultKind: "jackpot" | "win" | "loss" = "loss";

    if (slotMachineFruits[3] === slotMachineFruits[4] && slotMachineFruits[4] === slotMachineFruits[5]) {
        resultKind = "jackpot";
        multiplier = (slotsChart[slotMachineFruits[3] as keyof typeof slotsChart] as any)[3];
    } else if (slotMachineFruits[3] === slotMachineFruits[4] || slotMachineFruits[4] === slotMachineFruits[5] || slotMachineFruits[3] === slotMachineFruits[5]) {
        const match = slotMachineFruits[3] === slotMachineFruits[4] ? slotMachineFruits[3] : (slotMachineFruits[4] === slotMachineFruits[5] ? slotMachineFruits[4] : slotMachineFruits[3]);
        multiplier = (slotsChart[match as keyof typeof slotsChart] as any)[2];
        if (multiplier) resultKind = "win";
    }

    let net = 0;
    let dialogue = "";
    let resultText = "";

    if (resultKind === "jackpot") {
        net = Math.round(bet * multiplier);
        resultText = `🎰 **JACKPOT!** You won ${Functions.localeNumber(net)} ${ctx.client.localEmojis.jocoins}!`;
        dialogue = Functions.randomArray(ctx.translate<string[]>("casino:JACKPOT_MESSAGES", { returnObjects: true })).trim();
    } else if (resultKind === "win") {
        net = Math.round(bet * multiplier);
        resultText = `🏆 **WIN!** You won ${Functions.localeNumber(net)} ${ctx.client.localEmojis.jocoins}!`;
        dialogue = Functions.randomArray(ctx.translate<string[]>("casino:BASIC_WIN_MESSAGES", { returnObjects: true, win: Functions.localeNumber(net) })).trim();
    } else {
        net = -bet;
        resultText = `💥 **LOSE!** You lost ${Functions.localeNumber(bet)} ${ctx.client.localEmojis.jocoins}.`;
        dialogue = Functions.randomArray(ctx.translate<string[]>("casino:LOSE_MESSAGES", { returnObjects: true, emojis: ctx.client.localEmojis })).trim();
    }

    Functions.addCoins(ctx.userData, net);
    
    const tx = await ctx.client.database.handleTransaction(
        [{ oldData, newData: ctx.userData }],
        `Slots: ${resultKind} (bet=${bet}, net=${net})`
    );

    if (!tx) {
        await ctx.makeMessage(containers.error("Transaction failed. Your coins were not moved."));
        await ctx.client.database.redis.del(`tempCache_slotsLock_${ctx.user.id}`).catch(() => 0);
        return;
    } else {
        await ctx.makeMessage(buildUI(true, resultText, dialogue));
    }

    // Release lock for "Pull Again" collector
    await ctx.client.database.redis.del(`tempCache_slotsLock_${ctx.user.id}`).catch(() => 0);

    const finalCollector = ctx.channel.createMessageComponentCollector({
        filter: (i) => i.user.id === ctx.user.id,
        time: 30000,
        max: 1
    });

    finalCollector.on("collect", async (i) => {
        if (i.customId === pullAgainID) {
            await i.deferUpdate();
            await runGame(ctx, bet);
        } else if (i.customId === changeBetID) {
            // Re-invoke the command to show initial screen with Change Bet option
            // Or better, just show the modal here?
            // To keep it simple, we'll re-invoke execute
            await i.deferUpdate();
            await slashCommand.execute(ctx);
        }
    });
}

function resultKindColor(resultText?: string): number {
    if (!resultText) return COLORS.accent;
    if (resultText.includes("LOSE")) return COLORS.error;
    if (resultText.includes("JACKPOT")) return COLORS.warning;
    return COLORS.success;
}

export default slashCommand;
