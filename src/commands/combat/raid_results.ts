import {
    EquipableItem,
    FightableNPC,
    Item,
    RPGUserDataJSON,
    RaidBoss,
    RaidNPCQuest,
    Special,
    Weapon,
} from "../../@types";
import type CommandInteractionContext from "../../structures/CommandInteractionContext";
import type { FightHandler } from "../../structures/FightHandler";
import type { Fighter } from "../../structures/Fighter";
import * as Functions from "../../utils/Functions";
import { raidWebhook } from "../../utils/Webhooks";
import type { Message } from "discord.js";
import { cloneDeep } from "lodash";

export const getIceShard = (data: RPGUserDataJSON): number => {
    return data.inventory["ice_shard"] ?? 0;
};

export const safeRaidFollowUp = async (
    ctx: CommandInteractionContext,
    content: string,
): Promise<Message | null> =>
    ctx
        .followUp({ content })
        .then((message) => message)
        .catch(() => null);

interface RaidResultHandlerOptions {
    ctx: CommandInteractionContext;
    fight: FightHandler;
    joinedUsers: RPGUserDataJSON[];
    enhancedBoss: FightableNPC;
    raid: RaidBoss;
    raidCost: number;
    bossChosen: string;
}

const sendRaidWebhook = (
    options: RaidResultHandlerOptions,
    winners: Fighter[],
    losers: Fighter[][],
): void => {
    const { ctx, joinedUsers, enhancedBoss } = options;

    raidWebhook
        .send({
            embeds: [
                {
                    title: `${enhancedBoss.name} Raid`,
                    description: `${joinedUsers
                        .map((x) => "**" + x.tag + "**")
                        .join(", ")} raided **${enhancedBoss.name}** and ${
                        joinedUsers.find((r) => r.id === winners[0].id) ? "won" : "lost"
                    }!`,
                    color: 0x70926c,
                    fields: [
                        {
                            name: "Host",
                            value: ctx.user.username,
                            inline: true,
                        },
                        {
                            name: "Winners",
                            value: winners.map((r) => r.name).join(", "),
                            inline: true,
                        },
                        {
                            name: "Losers",
                            value: losers.map((team) => team.map((r) => r.name).join(", ")).join("\n"),
                            inline: true,
                        },
                        {
                            name: "Guild info",
                            value: `${ctx.guild.name} (${ctx.guild.id})`,
                            inline: true,
                        },
                        {
                            name: "Total damages",
                            value: [...winners, ...losers.flat()]
                                .sort((a, b) => b.totalDamageDealt - a.totalDamageDealt)
                                .map(
                                    (r) =>
                                        `- ${r.name}: **${r.totalDamageDealt.toLocaleString(
                                            "en-US"
                                        )}**`
                                )
                                .join("\n"),
                        },
                    ],
                    thumbnail: {
                        url:
                            enhancedBoss.avatarURL ??
                            `https://cdn.discordapp.com/emojis/${Functions.getEmojiId(
                                enhancedBoss.emoji
                            )}.png`,
                    },
                },
            ],
        })
        .catch(() => undefined);
};

const applyRaidWinnerRewards = async (
    options: RaidResultHandlerOptions,
    winners: Fighter[],
): Promise<void> => {
    const { ctx, fight, joinedUsers, enhancedBoss, raid, raidCost, bossChosen } = options;
    const fixedWinners: {
        oldData: RPGUserDataJSON;
        newData: RPGUserDataJSON;
    }[] = [];

    for (const winner of winners) {
        const itemDidntDrop: {
            percentage: number;
            item: Item | EquipableItem | Special | Weapon;
        }[] = [];
        if (!joinedUsers.find((r) => r.id === winner.id)) continue;
        const winnerData = await ctx.client.database.getRPGUserData(winner.id);
        if (!winnerData) continue;
        const oldWinnerData = cloneDeep(winnerData);

        const winContent: string[] = [];
        if (raid.baseRewards?.coins) {
            const coins = Math.round(
                winner.health === 0 ? raid.baseRewards.coins / 4 : raid.baseRewards.coins
            );
            Functions.addCoins(winnerData, coins);
            winContent.push(`+**${coins.toLocaleString()}** ${ctx.client.localEmojis.jocoins}`);
        }
        if (raid.baseRewards?.xp) {
            const xp = Functions.addXp(
                winnerData,
                Math.round(
                    (winner.totalDamageDealt / Functions.getMaxHealth(enhancedBoss)) *
                        raid.baseRewards.xp
                ),
                ctx.client
            );
            winContent.push(`+**${xp.toLocaleString()}** ${ctx.client.localEmojis.xp}`);
        }
        if (raid.baseRewards && raid.baseRewards?.items.length > 0) {
            for (const item of raid.baseRewards.items) {
                const chance =
                    (winner.totalDamageDealt / Functions.getMaxHealth(enhancedBoss)) *
                    item.chance;
                const itemData = Functions.findItem(item.item);
                if (item.chance && !Functions.percent(chance)) {
                    itemDidntDrop.push({
                        percentage: chance,
                        item: itemData,
                    });
                    continue;
                }
                if (!itemData) continue;
                const status = Functions.addItem(winnerData, itemData.id, item.amount);
                winContent.push(
                    `${status ? "" : "~~"}${item.amount}x ${itemData.emoji} **${
                        itemData.name
                    }** (${chance.toFixed(2)}%)${status ? "" : "~~"}`
                );
            }
        }
        winnerData.health = winner.health;
        if (winnerData.stamina > winner.stamina) winnerData.stamina = winner.stamina;
        if (raid.boss.id.includes("nian")) {
            Functions.addSocialCredits(winnerData, 50);
            fight.message
                .reply({
                    content: `${ctx.client.localEmojis.social_credit} | 伟大的！You earned 50 social credits <@${winner.id}>!`,
                })
                .catch(() => undefined);
        }

        for (const quests of [
            winnerData.daily.quests,
            winnerData.chapter.quests,
            ...winnerData.sideQuests.map((v) => v.quests),
        ]) {
            for (const quest of quests.filter((x) => Functions.isRaidNPCQuest(x))) {
                if ((quest as RaidNPCQuest).boss === enhancedBoss.id && !quest.completed) {
                    quest.completed = true;
                    safeRaidFollowUp(
                        ctx,
                        `:white_check_mark: <@${winner.id}> Your RaidQUEST has been completed (\`${quest.id}\`)`
                    );
                    break;
                }
            }
        }
        Functions.addCoins(winnerData, -raidCost);

        safeRaidFollowUp(
            ctx,
            `<@${winner.id}> won the raid ${
                winner.health === 0
                    ? " but they died, so they only got the following rewards"
                    : "and got the following rewards"
            }:\n${winContent.join(", ")}`
        );

        const status = bossChosen !== "ice_golem" ? null : getIceShard(winnerData) >= 50;
        if (status === true) {
            winnerData.inventory["ice_shard"] -= 50;
        }

        fixedWinners.push({
            oldData: oldWinnerData,
            newData: status !== false ? winnerData : oldWinnerData,
        });
        if (status === false) {
            safeRaidFollowUp(
                ctx,
                `<@${winner.id}> didn't have enough Ice Shards to raid the Ice Golem, so they didn't get the rewards.`
            );
        }
    }

    const transaction = await ctx.client.database.handleTransaction(
        fixedWinners,
        `Raided ${enhancedBoss.name}`
    );
    if (!transaction) {
        safeRaidFollowUp(
            ctx,
            `IGNORE THE MESSAGES ABOVE::: An error occurred while saving the data and no changes were made. Is somebody community banned? Is someone trying to cheat/dupe items...?`
        );
    }
};

const applyRaidLoserPenalties = async (
    options: RaidResultHandlerOptions,
    losers: Fighter[][],
): Promise<void> => {
    const { ctx, joinedUsers, raidCost } = options;

    for (const team of losers) {
        for (const loser of team) {
            if (!joinedUsers.find((r) => r.id === loser.id)) continue;
            const loserData = await ctx.client.database.getRPGUserData(loser.id);
            if (!loserData) continue;
            loserData.health = 0;
            loserData.stamina = 0;
            Functions.addCoins(loserData, -raidCost);
            safeRaidFollowUp(ctx, `<@${loser.id}> lost the raid and died.`);
            ctx.client.database.saveUserData(loserData);
        }
    }
};

export const attachRaidFightResultHandlers = (options: RaidResultHandlerOptions): void => {
    const { ctx, fight, joinedUsers, enhancedBoss, raid } = options;

    fight.on("end", async (winners, losers) => {
        for (const user of joinedUsers) {
            ctx.client.database.deleteCooldown(user.id);
            await ctx.client.database.setRPGCooldown(
                user.id,
                "raid",
                Functions.hasVotedRecenty(user, ctx.client) ? 30000 : raid.cooldown
            );
        }

        sendRaidWebhook(options, winners, losers);

        if (winners?.find((r) => r.id === joinedUsers[0].id)) {
            await applyRaidWinnerRewards(options, winners);
        } else {
            await applyRaidLoserPenalties(options, losers);
        }
    });

    fight.on("unexpectedEnd", (error) => {
        for (const user of joinedUsers) {
            ctx.client.database.deleteCooldown(user.id);
        }
        safeRaidFollowUp(
            ctx,
            `The raid ended unexpectedly due to an error: \`${error}\`. Please report this to the developers Your data has been saved and no cooldown has been set for you.`
        );
    });
};
