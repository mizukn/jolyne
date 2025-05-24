import { SlashCommandFile, ClaimXQuest } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    InteractionResponse,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { getQuestsStats } from "./Chapter";
import { cloneDeep } from "lodash";
import Aes from "../../utils/Aes";

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
        description: "Claim your daily or view your daily quests.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "claim",
                description: "Claim your daily rewards.",
                type: 1,
            },
            {
                name: "quests",
                description: "Shows your daily quests.",
                type: 1,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const dateAtMidnight = new Date().setUTCHours(0, 0, 0, 0);
        const nextDate = dateAtMidnight + 86400000;
        switch (ctx.interaction.options.getSubcommand()) {
            case "claim": {
                const oldData = cloneDeep(ctx.userData);
                if (
                    ctx.userData.daily.lastClaimed &&
                    ctx.userData.daily.lastClaimed >= dateAtMidnight &&
                    ctx.userData.daily.lastClaimed < nextDate
                ) {
                    return ctx.sendTranslated("daily:ALREADY_CLAIMED", {
                        time: Functions.generateDiscordTimestamp(
                            Date.now() + (nextDate - Date.now()),
                            "FROM_NOW"
                        ),
                    });
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

                console.log(
                    ctx.userData.daily.lastClaimed !== dateAtMidnight - 86400000,
                    Functions.getCurrentDate() !== `2025-05-04` ||
                        Functions.getCurrentDate() !== `2025-05-05`
                );

                if (
                    ctx.userData.daily.lastClaimed !== dateAtMidnight - 86400000 &&
                    (Functions.getCurrentDate() !== `2025-05-04` ||
                        Functions.getCurrentDate() !== `2025-05-05`)
                ) {
                    const oldStreak = ctx.userData.daily.claimStreak;
                    ctx.userData.daily.claimStreak = 0;

                    if (oldStreak >= 7) {
                        const data = Aes.encrypt(
                            JSON.stringify({
                                oldStreak: oldStreak,
                                date: Date.now(),
                                user_id: ctx.userData.id,
                            })
                        );

                        ctx.followUpQueue.push({
                            content: Functions.makeNPCString(
                                NPCs.Jolyne,
                                `You lost your **${oldStreak}-day streak**. You can try your luck by requesting a streak restore by [joining the support server](https://discord.gg/jolyne-support-923608916540145694) and providing the following code:\n\n\`${data}\`\n\n*Note that your streak may not be fully restored or restored at all.*`,
                                ctx.client.localEmojis.JolyneAhhhhh
                            ),
                        });
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
                                0.25)
                    );
                    const moneyRewards = Math.round(
                        rewards.coins *
                            (ctx.client.patreons.find((r) => r.id === ctx.userData.id).level / 7 +
                                0.25)
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

                const embed: APIEmbed = {
                    author: {
                        name: ctx.user.username,
                        icon_url: ctx.user.displayAvatarURL(),
                    },
                    description: embed_description,
                    color: 0x70926c,
                    footer: {
                        text:
                            ctx.translate("daily:CLAIMED_EMBED_FOOTER") +
                            ` ${ctx.userData.daily.claimStreak}/${nextGoal}`,
                    },
                    fields: [
                        {
                            name: ctx.translate("daily:WANT_MORE_HEADER"),
                            value: "[..]",
                        },
                    ],
                };

                if (
                    ctx.client.patreons.find((r) => r.id === ctx.userData.id) &&
                    ctx.client.boosters.find((r) => r === ctx.userData.id)
                ) {
                    embed.fields[0].value = ctx.translate(
                        "daily:WANT_MORE_DESCRIPTION_PREMIUM_BOOSTER"
                    );
                } else if (ctx.client.patreons.find((r) => r.id === ctx.userData.id)) {
                    embed.fields[0].value = ctx.translate(
                        "daily:WANT_MORE_DESCRIPTION_PREMIUM_NON_BOOSTER"
                    );
                } else if (ctx.client.boosters.find((r) => r === ctx.userData.id)) {
                    embed.fields[0].value = ctx.translate(
                        "daily:WANT_MORE_DESCRIPTION_NON_PREMIUM_BOOSTER"
                    );
                } else {
                    embed.fields[0].value = ctx.translate(
                        "daily:WANT_MORE_DESCRIPTION_NON_PREMIUM_NON_BOOSTER"
                    );
                }

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
                    embed.fields.push({
                        name: "Streak Bonus",
                        value: `\`x${arrows} ${StandArrow.name}\` ${StandArrow.emoji}`,
                    });
                }

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests.filter(
                        (r) => Functions.isClaimXQuest(r) && r.x === "daily"
                    )) {
                        (quest as ClaimXQuest).amount++;
                    }
                }

                if (
                    Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate()
                    ]
                ) {
                    const rewards = Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate()
                    ];
                    const nextReward = Functions.dailyClaimRewardsChristmas(ctx.userData.level)[
                        Functions.getCurrentDate(
                            new Date(Date.now() + 86400000) // next day
                        )
                    ];

                    const coins = rewards.coins;
                    const xp = rewards.xp;
                    const items = rewards.items;

                    if (coins) Functions.addCoins(ctx.userData, coins);
                    if (xp) Functions.addXp(ctx.userData, xp, ctx.client);
                    if (items) {
                        for (const item of Object.keys(items)) {
                            Functions.addItem(ctx.userData, Functions.findItem(item), items[item]);
                        }
                    }

                    let nextRewards = "";
                    if (nextReward) {
                        const nextData = cloneDeep(oldData);
                        if (nextReward.coins) Functions.addCoins(nextData, nextReward.coins);
                        if (nextReward.xp) Functions.addXp(nextData, nextReward.xp, ctx.client);
                        if (nextReward.items) {
                            for (const item of Object.keys(nextReward.items)) {
                                Functions.addItem(
                                    nextData,
                                    Functions.findItem(item),
                                    nextReward.items[item]
                                );
                            }
                        }
                        nextRewards = Functions.getRewardsCompareData(oldData, nextData)
                            .map((x) => `-# - ${x}`)
                            .join("\n");
                    }

                    embed.fields.push({
                        name: "Merry Christmas!",
                        value: `You got the following rewards for claiming today:\n${Functions.getRewardsCompareData(
                            oldData,
                            ctx.userData
                        )
                            .map((x) => `- ${x}`)
                            .join("\n")} ${
                            nextReward
                                ? `\n\nExpected rewards if you claim tomorrow (${Functions.generateDiscordTimestamp(
                                      new Date(Date.now() + 86400000).setUTCHours(0, 0, 0, 0),
                                      "FROM_NOW"
                                  )}):\n${nextRewards}`
                                : ""
                        }`,
                    });
                }

                //await ctx.client.database.saveUserData(ctx.userData);
                const transaction = await ctx.client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: ctx.userData,
                        },
                    ],
                    "Daily claim"
                );

                await ctx.makeMessage({
                    embeds: [embed],
                });

                break;
            }
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
                // check if is booster or patreon

                if (
                    ctx.client.patreons.find((r) => r.id === ctx.userData.id) ||
                    ctx.client.boosters.find((r) => r === ctx.userData.id)
                ) {
                    xpReward = Math.round(xpReward * 1.1);
                }

                const components: ButtonBuilder[] = [];

                if (Number(status.percent) === 100) {
                    const alreadyClaimed = await ctx.client.database.redis.get(
                        `daily-quests-${ctx.userData.id}`
                    );

                    components.push(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("⭐")
                            .setCustomId(ctx.interaction.id + "daily-quests-claim")
                            .setDisabled(alreadyClaimed === "true")
                    );

                    if (alreadyClaimed === "true") {
                        components.push(
                            // repeat button
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🔁")
                                .setCustomId(ctx.interaction.id + "daily-quests-reset")
                                .setLabel(
                                    `Reset for ${dailyQuestResetPrice[
                                        ctx.userData.daily
                                            .dailyQuestsReset as keyof typeof dailyQuestResetPrice
                                    ]?.toLocaleString()} coins`
                                )
                        );
                    }
                }

                const toBeAdded = Functions.addXp(ctx.userData, xpReward, ctx.client, true);

                await ctx.makeMessage({
                    embeds: [
                        {
                            // 📜 **__Daily Quests:__** (${status.percent.toFixed(2)}%)\n
                            description: `${status.message}\n\n${ctx.translate(
                                "daily:REWARDS_MESSAGE",
                                {
                                    coins: coinReward.toLocaleString(),
                                    xp: toBeAdded.toLocaleString(),
                                    discordUnix: Functions.generateDiscordTimestamp(
                                        dateAtMidnight + 86400000,
                                        "FROM_NOW"
                                    ),
                                    dungeon_key: Functions.findItem("Dungeon").emoji,
                                }
                            )}`,
                            color: 0x70926c,
                            author: {
                                icon_url: ctx.user.displayAvatarURL(),
                                name: `📜 ${
                                    ctx.user.username
                                }'s Daily Quests (${status.percent.toFixed(2)}%)`,
                            },
                        },
                    ],
                    components: components.length !== 0 ? [Functions.actionRow(components)] : [],
                });

                if (components.length > 0) {
                    const filter = (i: MessageComponentInteraction) => {
                        return (
                            i.user.id === ctx.user.id &&
                            (i.customId === ctx.interaction.id + "daily-quests-claim" ||
                                i.customId === ctx.interaction.id + "daily-quests-reset")
                        );
                    };

                    const collector = ctx.channel.createMessageComponentCollector({
                        filter,
                        time: 30000,
                    });

                    collector.on("collect", async (i) => {
                        /**
                         * Priority:
                         * 1. Check if user is trying to cheat
                         * 2. Save user data
                         * 3. Set daily-quests-<id> to true
                         */
                        const currentRPGJson = JSON.stringify(ctx.userData);
                        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

                        if (currentRPGJson !== JSON.stringify(ctx.userData)) {
                            collector.stop("cheater");
                            return;
                        }
                        const oldData = cloneDeep(ctx.userData);

                        if (i.customId === ctx.interaction.id + "daily-quests-reset") {
                            const price =
                                dailyQuestResetPrice[
                                    ctx.userData.daily
                                        .dailyQuestsReset as keyof typeof dailyQuestResetPrice
                                ];
                            if (ctx.userData.coins < price) {
                                await i.reply({
                                    content: `You don't have enough coins to reset your daily quests. You need ${price.toLocaleString(
                                        "en-US"
                                    )} coins to reset your daily quests.`,
                                });
                                return;
                            }

                            ctx.userData.coins -= price;
                            ctx.userData.daily.quests = Functions.generateDailyQuests(
                                process.env.ENABLE_PRESTIGE
                                    ? Functions.getTrueLevel(ctx.userData)
                                    : ctx.userData.level
                            );
                            await ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);
                            if (!ctx.userData.daily.dailyQuestsReset) {
                                ctx.userData.daily.dailyQuestsReset = 0;
                            }
                            ctx.userData.daily.dailyQuestsReset++;
                            //await ctx.client.database.saveUserData(ctx.userData);
                            const transaction = await ctx.client.database.handleTransaction(
                                [
                                    {
                                        oldData,
                                        newData: ctx.userData,
                                    },
                                ],
                                "Daily Quest Reset"
                            );
                            if (!transaction) return i.reply("An error occurred.");
                            i.reply({
                                content: ctx.translate("daily:RESET_SUCCESS", {
                                    price: price.toLocaleString(),
                                }),
                            });
                            return;
                        }

                        Functions.addCoins(ctx.userData, coinReward);
                        Functions.addXp(ctx.userData, xpReward, ctx.client);
                        Functions.addItem(ctx.userData, Functions.findItem("Stand Arrow"));
                        Functions.addItem(ctx.userData, Functions.findItem("Dungeon"));

                        //await ctx.client.database.saveUserData(ctx.userData);
                        const transaction = await ctx.client.database.handleTransaction(
                            [
                                {
                                    oldData,
                                    newData: ctx.userData,
                                },
                            ],
                            "Daily Quest Claim"
                        );
                        if (!transaction) return i.reply("An error occurred.");
                        await ctx.client.database.redis.set(
                            `daily-quests-${ctx.userData.id}`,
                            "true"
                        );

                        await ctx.makeMessage({
                            components: [Functions.actionRow([components[0].setDisabled(true)])],
                        });

                        await ctx.followUp({
                            content: ctx.translate("daily:REWARDS_CLAIM_MESSAGE", {
                                coins: coinReward.toLocaleString(),
                                xp: xpReward.toLocaleString(),
                                dungeon_key: Functions.findItem("Dungeon").emoji,
                            }),
                        });
                    });
                }
                break;
            }
        }
    },
};

export default slashCommand;
