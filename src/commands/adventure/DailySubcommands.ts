import { SlashCommandFile, ClaimXQuest } from "../../@types";
import {
    Message,
    ButtonBuilder,
    ButtonStyle,
    InteractionResponse,
    MessageComponentInteraction,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { getQuestsStats } from "./Chapter";
import { cloneDeep } from "lodash";
import Aes from "../../utils/Aes";
import { COLORS, containers, V2Reply, SectionData } from "../../utils/containers";
import { emojiBar } from "../../utils/emojiBar";

const dailyQuestResetPrice = {
    undefined: 1000,
    null: 1000,
    0: 1000,
    1: 100000,
    2: 250000,
    3: 500000,
    4: 1000000,
    5: 5000000,
    6: 10000000,
    7: 25000000,
    8: 50000000,
    9: 100000000,
    10: 500000000,
    11: 1000000000,
    12: 5000000000,
    13: 10000000000,
    14: 50000000000,
    15: 100000000000,
    16: 500000000000,
    17: 1000000000000,
    18: 5000000000000,
    19: 10000000000000,
    20: 50000000000000,
    21: 100000000000000,
    22: 500000000000000,
    23: 1000000000000000,
    24: 5000000000000000,
    25: 9000000000000000,
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "daily",
        description: "Claim your daily rewards.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext,
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const dateAtMidnight = new Date().setUTCHours(0, 0, 0, 0);
        const nextDate = dateAtMidnight + 86400000;
        const subcommand =
            ctx.interaction.commandName === "daily" ? "claim" : ctx.interaction.options.getSubcommand();
        switch (subcommand) {
            case "claim": {
                const oldData = cloneDeep(ctx.userData);
                if (
                    ctx.userData.daily.lastClaimed &&
                    ctx.userData.daily.lastClaimed >= dateAtMidnight &&
                    ctx.userData.daily.lastClaimed < nextDate
                ) {
                    return ctx.makeMessage(
                        containers.primary({
                            title: "# 📆 Daily Reward",
                            description: ctx.translate("daily:ALREADY_CLAIMED", {
                                time: Functions.generateDiscordTimestamp(
                                    Date.now() + (nextDate - Date.now()),
                                    "FROM_NOW",
                                ),
                            }),
                            color: COLORS.warning,
                        }),
                    );
                }
                const rewards = Functions.getRewards(ctx.userData.level);

                if (
                    ctx.client.patreons.find((r) => r.id === ctx.userData.id) ||
                    ctx.client.boosters.find((r) => r === ctx.userData.id)
                ) {
                    rewards.xp = Math.round(rewards.xp * 1.1);
                }

                Functions.addCoins(ctx.userData, rewards.coins);
                const added = Functions.addXp(ctx.userData, rewards.xp, ctx.client);

                let embed_description = ctx.translate<string>("daily:CLAIMED_EMBED_DESCRIPTION", {
                    coins: rewards.coins.toLocaleString(),
                    xp: added.toLocaleString(),
                });

                if (
                    ctx.userData.daily.lastClaimed !== dateAtMidnight - 86400000 &&
                    // check if date is not 7 March 2026 or 8 march 2026 because jolyne was down!
                    !(
                        dateAtMidnight === new Date("2026-03-07").setUTCHours(0, 0, 0, 0) ||
                        dateAtMidnight === new Date("2026-03-08").setUTCHours(0, 0, 0, 0)
                    )
                ) {
                    const oldStreak = ctx.userData.daily.claimStreak;
                    ctx.userData.daily.claimStreak = 0;

                    if (oldStreak >= 7) {
                        const data = Aes.encrypt(
                            JSON.stringify({
                                oldStreak: oldStreak,
                                date: Date.now(),
                                user_id: ctx.userData.id,
                            }),
                        );

                        ctx.followUpQueue.push(
                            containers.warning(
                                Functions.makeNPCLine(
                                    NPCs.Jolyne,
                                    `You lost your **${oldStreak}-day streak**. You can try your luck by requesting a streak restore by [joining the support server](https://discord.gg/jolyne-support-923608916540145694) and providing the following code:\n\n\`${data}\`\n\n*Note that your streak may not be fully restored or restored at all.*`,
                                ),
                            ),
                        );
                    }
                }

                ctx.userData.daily.claimStreak++;
                ctx.userData.daily.lastClaimed = dateAtMidnight;

                let nextGoal = ctx.userData.daily.claimStreak + 1;
                while (nextGoal % 7 !== 0) {
                    nextGoal++;
                }

                if (ctx.client.patreons.find((r) => r.id === ctx.userData.id)) {
                    const xpRewards = Math.round(
                        rewards.xp *
                            (ctx.client.patreons.find((r) => r.id === ctx.userData.id).level / 7 +
                                0.25),
                    );
                    const moneyRewards = Math.round(
                        rewards.coins *
                            (ctx.client.patreons.find((r) => r.id === ctx.userData.id).level / 7 +
                                0.25),
                    );

                    const addedXP = Functions.addXp(ctx.userData, xpRewards, ctx.client);
                    embed_description +=
                        "\n" +
                        ctx.translate("daily:CLAIMED_EMBED_DESCRIPTION_PREMIUM", {
                            coins: moneyRewards.toLocaleString(),
                            xp: addedXP.toLocaleString(),
                            tier: ctx.client.patreons.find((r) => r.id === ctx.userData.id).level,
                        });
                    Functions.addCoins(ctx.userData, moneyRewards);
                }
                if (ctx.client.boosters.find((r) => r === ctx.userData.id)) {
                    const xpRewards = Math.round(rewards.xp * 0.1);
                    const moneyRewards = Math.round(rewards.coins * 0.1);

                    Functions.addCoins(ctx.userData, moneyRewards);
                    Functions.addXp(ctx.userData, xpRewards, ctx.client);

                    embed_description +=
                        "\n" +
                        ctx.translate("daily:CLAIMED_EMBED_DESCRIPTION_BOOSTER", {
                            coins: moneyRewards.toLocaleString(),
                            xp: xpRewards.toLocaleString(),
                        });
                }

                const dailySections: SectionData[] = [];
                const dailyFooter =
                    ctx.translate<string>("daily:CLAIMED_EMBED_FOOTER") +
                    ` ${ctx.userData.daily.claimStreak}/${nextGoal}`;

                let wantMoreDesc = "";
                if (
                    ctx.client.patreons.find((r) => r.id === ctx.userData.id) &&
                    ctx.client.boosters.find((r) => r === ctx.userData.id)
                ) {
                    wantMoreDesc = ctx.translate("daily:WANT_MORE_DESCRIPTION_PREMIUM_BOOSTER");
                } else if (ctx.client.patreons.find((r) => r.id === ctx.userData.id)) {
                    wantMoreDesc = ctx.translate("daily:WANT_MORE_DESCRIPTION_PREMIUM_NON_BOOSTER");
                } else if (ctx.client.boosters.find((r) => r === ctx.userData.id)) {
                    wantMoreDesc = ctx.translate("daily:WANT_MORE_DESCRIPTION_NON_PREMIUM_BOOSTER");
                } else {
                    wantMoreDesc = ctx.translate("daily:WANT_MORE_DESCRIPTION_NON_PREMIUM_NON_BOOSTER");
                }

                dailySections.push({
                    text: `### 🎁 **${ctx.translate("daily:WANT_MORE_HEADER")}**\n> ${wantMoreDesc}`
                });

                if (ctx.userData.daily.claimStreak % 7 == 0) {
                    let arrows = 0;
                    for (let i = ctx.userData.daily.claimStreak; i > 0; i -= 7) {
                        arrows++;
                    }
                    arrows *= 1.5;
                    arrows = Math.round(arrows);

                    if (arrows > 25) arrows = 25;

                    for (let i = 0; i < arrows; i++) {
                        Functions.addItem(ctx.userData, StandArrow);
                    }
                    dailySections.push({
                        text: `### 🔥 **Streak Bonus**\n> **Rewards:** \`x${arrows} ${StandArrow.name}\` ${StandArrow.emoji}`
                    });
                }

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests.filter(
                        (r) => Functions.isClaimXQuest(r) && r.x === "daily",
                    )) {
                        (quest as ClaimXQuest).amount++;
                    }
                }

                if (
                    Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate()
                    ]
                ) {
                    const christmasRewards = Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate()
                    ];
                    const nextChristmasReward = Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate(
                            new Date(Date.now() + 86400000), // next day
                        )
                    ];

                    const coins = christmasRewards.coins;
                    const xp = christmasRewards.xp;
                    const items = christmasRewards.items;

                    if (coins) Functions.addCoins(ctx.userData, coins);
                    if (xp) Functions.addXp(ctx.userData, xp, ctx.client);
                    if (items) {
                        for (const item of Object.keys(items)) {
                            Functions.addItem(ctx.userData, Functions.findItem(item), items[item]);
                        }
                    }

                    let nextRewardsText = "";
                    if (nextChristmasReward) {
                        const nextData = cloneDeep(oldData);
                        if (nextChristmasReward.coins) Functions.addCoins(nextData, nextChristmasReward.coins);
                        if (nextChristmasReward.xp) Functions.addXp(nextData, nextChristmasReward.xp, ctx.client);
                        if (nextChristmasReward.items) {
                            for (const item of Object.keys(nextChristmasReward.items)) {
                                Functions.addItem(
                                    nextData,
                                    Functions.findItem(item),
                                    nextChristmasReward.items[item],
                                );
                            }
                        }
                        nextRewardsText = Functions.getRewardsCompareData(oldData, nextData)
                            .map((x) => `-# - ${x}`)
                            .join("\n");
                    }

                    dailySections.push({
                        text: `### 🎄 **Merry Christmas!**\n> You got the following rewards for claiming today:\n${Functions.getRewardsCompareData(oldData, ctx.userData)
                            .map((x) => `> - ${x}`)
                            .join("\n")}${
                            nextChristmasReward
                                ? `\n\n> **Expected rewards tomorrow** (${Functions.generateDiscordTimestamp(
                                      new Date(Date.now() + 86400000).setUTCHours(0, 0, 0, 0),
                                      "FROM_NOW",
                                  )}):\n${nextRewardsText}`
                                : ""
                        }`,
                    });
                }

                const transaction = await ctx.client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: ctx.userData,
                        },
                    ],
                    "Daily claim",
                );

                if (!transaction) {
                    return ctx.makeMessage(containers.error("Daily claim failed. Your rewards were not saved."));
                }

                const dailyReply = containers.primary({
                    title: `# 📆 Daily Reward`,
                    description: `${ctx.client.localEmojis.a_} **Rewards Claimed:**\n${embed_description}`,
                    color: COLORS.primary,
                    descriptionDivider: true,
                    sections: dailySections,
                    sectionDividers: true,
                    footer: dailyFooter,
                });
                
                await ctx.makeMessage(dailyReply);
                break;
            }
            case "daily":
            case "quests": {
                const status = getQuestsStats(ctx.userData.daily.quests, ctx);

                let coinReward = 0;
                let xpReward = 2500;

                for (const quest of ctx.userData.daily.quests) {
                    if (Functions.isClaimItemQuest(quest) || Functions.isClaimXQuest(quest)) {
                        coinReward += quest.goal / 5;
                        xpReward += quest.goal / 15;
                        continue;
                    }

                    if (Functions.isFightNPCQuest(quest)) {
                        const npc = Object.values(FightableNPCS).find((r) => r.id === quest.npc);
                        if (!npc) continue;

                        coinReward += (npc.level + 1) * 100;
                        xpReward += (npc.level + 1) * 10;
                        continue;
                    }

                    coinReward += 100;
                    xpReward += 75;
                }
                if (coinReward > 50000) coinReward = 50000;
                xpReward = Math.round(xpReward * 1.99);

                if (
                    ctx.client.patreons.find((r) => r.id === ctx.userData.id) ||
                    ctx.client.boosters.find((r) => r === ctx.userData.id)
                ) {
                    xpReward = Math.round(xpReward * 1.1);
                }

                const questButtons: ButtonBuilder[] = [];

                if (Number(status.percent) === 100) {
                    const alreadyClaimed = await ctx.client.database.redis.get(
                        `daily-quests-${ctx.userData.id}`,
                    );

                    questButtons.push(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("⭐")
                            .setLabel(alreadyClaimed === "true" ? "Claimed" : "Claim Rewards")
                            .setCustomId(ctx.interaction.id + "daily-quests-claim")
                            .setDisabled(alreadyClaimed === "true"),
                    );

                    if (alreadyClaimed === "true") {
                        questButtons.push(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🔁")
                                .setCustomId(ctx.interaction.id + "daily-quests-reset")
                                .setLabel(
                                    `Reset for ${dailyQuestResetPrice[
                                        ctx.userData.daily
                                            .dailyQuestsReset as keyof typeof dailyQuestResetPrice
                                    ]?.toLocaleString()} coins`,
                                ),
                        );
                    }
                }

                const resetUnix = Math.round((dateAtMidnight + 86400000) / 1000);
                let currentPage = 0;
                const totalQuests = ctx.userData.daily.quests.length;
                const totalPages = Math.max(1, Math.ceil(totalQuests / Functions.QUEST_LIST_ITEMS_PER_PAGE));
                
                const questRows = Functions.buildQuestListRows(
                    ctx,
                    ctx.userData.daily.quests,
                    status.message,
                    undefined,
                    (quest) => {
                        const boosted = !!(
                            ctx.client.patreons.find((r) => r.id === ctx.userData.id) ||
                            ctx.client.boosters.find((r) => r === ctx.userData.id)
                        );
                        const rowRewards = Functions.getDailyQuestRowRewards(quest, { boosted });
                        return `**x${rowRewards.coins.toLocaleString()}** ${ctx.client.localEmojis.jocoins}, **x${rowRewards.xp.toLocaleString()}** ${ctx.client.localEmojis.xp}`;
                    },
                ).map(row => ({
                    text: row.text
                }));

                function buildQuestsReply(): V2Reply {
                    const firstQuest = currentPage * Functions.QUEST_LIST_ITEMS_PER_PAGE;
                    const pageSections = questRows.slice(
                        firstQuest,
                        firstQuest + Functions.QUEST_LIST_ITEMS_PER_PAGE,
                    );

                    const questsReply = containers.primary({
                        title: `# 📜 Daily Quests`,
                        description: `📊 **Progress:** ${status.percent.toFixed(2)}%`,
                        descriptionDivider: true,
                        sections: pageSections,
                        sectionDividers: true,
                        color: Functions.QUEST_LIST_ACCENT_COLOR,
                        footer: `Quests reset at <t:${resetUnix}:t> (<t:${resetUnix}:R>). Page ${currentPage + 1}/${totalPages}.`,
                    });

                    const actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
                    if (totalPages > 1) {
                        actionRows.push(
                            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(ctx.interaction.id + "daily-quests-prev")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("⬅️")
                                    .setDisabled(currentPage === 0),
                                new ButtonBuilder()
                                    .setCustomId(ctx.interaction.id + "daily-quests-page")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel(`${currentPage + 1} / ${totalPages}`)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId(ctx.interaction.id + "daily-quests-next")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("➡️")
                                    .setDisabled(currentPage === totalPages - 1),
                            )
                        );
                    }
                    if (questButtons.length !== 0) {
                        actionRows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(questButtons));
                    }

                    return {
                        components: [...questsReply.components, ...actionRows],
                        flags: questsReply.flags,
                    };
                }

                await ctx.makeMessage(buildQuestsReply());

                const collector = ctx.channel.createMessageComponentCollector({
                    filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(ctx.interaction.id),
                    time: 60000,
                });

                collector.on("collect", async (i) => {
                    if (i.customId === ctx.interaction.id + "daily-quests-prev") {
                        currentPage = Math.max(0, currentPage - 1);
                        return i.update(buildQuestsReply());
                    }

                    if (i.customId === ctx.interaction.id + "daily-quests-next") {
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        return i.update(buildQuestsReply());
                    }

                    ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
                    const oldData = cloneDeep(ctx.userData);

                    if (i.customId === ctx.interaction.id + "daily-quests-reset") {
                        const price = dailyQuestResetPrice[ctx.userData.daily.dailyQuestsReset as keyof typeof dailyQuestResetPrice];
                        if (ctx.userData.coins < price) {
                            return void i.reply({
                                ...containers.ephemeral(containers.error(`You need **${price.toLocaleString()}** ${ctx.client.localEmojis.jocoins} to reset your daily quests.`)),
                            });
                        }

                        ctx.userData.coins -= price;
                        ctx.userData.daily.quests = Functions.generateDailyQuests(
                            process.env.ENABLE_PRESTIGE ? Functions.getTrueLevel(ctx.userData) : ctx.userData.level,
                        );
                        await ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);
                        ctx.userData.daily.dailyQuestsReset = (ctx.userData.daily.dailyQuestsReset ?? 0) + 1;

                        const transaction = await ctx.client.database.handleTransaction(
                            [{ oldData, newData: ctx.userData }],
                            "Daily Quest Reset",
                        );
                        if (!transaction) {
                            return void i.reply({
                                ...containers.ephemeral(containers.error("Daily quest reset failed.")),
                            });
                        }
                        await i.reply({
                            ...containers.ephemeral(containers.success(`Daily quests reset for **${price.toLocaleString()}** ${ctx.client.localEmojis.jocoins}.`)),
                        });
                        return void i.message.edit(buildQuestsReply());
                    }

                    if (i.customId === ctx.interaction.id + "daily-quests-claim") {
                        const coins = Functions.addCoins(ctx.userData, coinReward);
                        const xp = Functions.addXp(ctx.userData, xpReward, ctx.client);
                        Functions.addItem(ctx.userData, Functions.findItem("Stand Arrow"));
                        Functions.addItem(ctx.userData, Functions.findItem("Dungeon"));

                        const transaction = await ctx.client.database.handleTransaction(
                            [{ oldData, newData: ctx.userData }],
                            "Daily Quest Claim",
                        );
                        if (!transaction) {
                            return void i.reply({
                                ...containers.ephemeral(containers.error("Daily quest claim failed.")),
                            });
                        }
                        await ctx.client.database.redis.set(`daily-quests-${ctx.userData.id}`, "true");

                        await i.update(
                            containers.success(
                                ctx.translate("daily:REWARDS_CLAIM_MESSAGE", {
                                    coins: coins.toLocaleString(),
                                    xp: xp.toLocaleString(),
                                    dungeon_key: Functions.findItem("Dungeon").emoji,
                                })
                            )
                        );
                    }
                });
                break;
            }
        }
    },
};

export default slashCommand;
