import { FightableNPC, RPGUserDataJSON, RaidBoss } from "../../@types";
import type CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import {
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    InteractionReplyOptions,
    StringSelectMenuBuilder,
} from "discord.js";

interface RaidLobbyButtonIds {
    joinRaidID: string;
    leaveRaidID: string;
    startRaidID: string;
}

export interface RaidLobbyButtons {
    joinRaidButton: ButtonBuilder;
    leaveRaidButton: ButtonBuilder;
    startRaidButton: ButtonBuilder;
}

interface CreateRaidLobbyButtonsOptions extends RaidLobbyButtonIds {
    bossChosen: string;
    raidCost: number;
}

export const createRaidLobbyButtons = (
    options: CreateRaidLobbyButtonsOptions,
): RaidLobbyButtons => {
    const { bossChosen, joinRaidID, leaveRaidID, raidCost, startRaidID } = options;

    return {
        joinRaidButton: new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(joinRaidID)
            .setLabel(
                bossChosen === "ice_golem"
                    ? `Join Raid (${raidCost.toLocaleString(
                          "en-US"
                      )} coins and 50 Ice Shards required)`
                    : `Join Raid (${raidCost.toLocaleString()} coins required)`
            )
            .setEmoji(bossChosen === "ice_golem" ? "1323363296719536158" : "927974784187392061"),
        leaveRaidButton: new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(leaveRaidID)
            .setLabel("Leave Raid")
            .setEmoji("➖"),
        startRaidButton: new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId(startRaidID)
            .setLabel("Start Raid")
            .setEmoji("👊"),
    };
};

const buildBanUserSelect = (
    customId: string,
    joinedUsers: RPGUserDataJSON[],
): StringSelectMenuBuilder =>
    new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("[Select a user to ban (not)]")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            joinedUsers.map((user) => ({
                label: `${user.tag} (LEVEL: ${user.level})`,
                value: user.id,
            }))
        );

interface BuildRaidLobbyMessageOptions {
    ctx: CommandInteractionContext;
    raid: RaidBoss;
    enhancedBoss: FightableNPC;
    joinedUsers: RPGUserDataJSON[];
    bannedUsers: RPGUserDataJSON[];
    raidCost: number;
    startRaid: number;
    banUserFromRaidID: string;
    buttons: RaidLobbyButtons;
}

export const buildRaidLobbyMessage = (
    options: BuildRaidLobbyMessageOptions,
): InteractionReplyOptions => {
    const {
        ctx,
        raid,
        enhancedBoss,
        joinedUsers,
        bannedUsers,
        raidCost,
        startRaid,
        banUserFromRaidID,
        buttons,
    } = options;

    const components = [
        Functions.actionRow([buttons.joinRaidButton]),
        Functions.actionRow([buttons.startRaidButton, buttons.leaveRaidButton]),
    ];
    if (joinedUsers.length > 1) {
        components.push(Functions.actionRow([buildBanUserSelect(banUserFromRaidID, joinedUsers)]));
    }

    const embed: APIEmbed = {
        title: `${enhancedBoss.emoji} ${enhancedBoss.name} RAID`,
        description: `> \`Boss Level:\` ${enhancedBoss.level}\n> \`Coins required:\` ${
            ctx.client.localEmojis.jocoins
        } ${raidCost.toLocaleString()}\n${
            raid.prestige ? `> \`Prestige Requirement:\` ${raid.prestige}\n` : ""
        }> \`Min Level Requirement:\` ${raid.level}\n> \`Maximum Level Requirement:\` ${raid.maxLevel.toLocaleString(
            "en-US"
        )}\n> \`Cooldown:\` ${Functions.msToString(
            raid.cooldown
        )}\n> \`Auto Starts\` ${Functions.generateDiscordTimestamp(startRaid, "FROM_NOW")}`,
        fields: Functions.fixFields([
            {
                name: "Rewards:",

                value: `> - **${(raid.baseRewards?.coins ?? 0).toLocaleString()}**${
                    ctx.client.localEmojis.jocoins
                }\n> - **${(raid.baseRewards?.xp ?? 0).toLocaleString()}**${
                    ctx.client.localEmojis.xp
                }\n${raid.baseRewards?.items
                    .map((item) => {
                        const itemData = Functions.findItem(item.item);
                        if (!itemData) return null;
                        return `> • **${item.amount.toLocaleString()}x** ${itemData.name} ${
                            itemData.emoji
                        }${item.chance ? ` (** ${item.chance}% **)` : ""}`;
                    })
                    .filter((reward) => reward)
                    .join("\n")}${
                    raid.baseRewards?.items.length !== 0
                        ? "\n\n\\- The drop rate of an item is determined by the damage you deal. If there is a 100% chance of getting an item, and you deal 50% damage, you'll have a 50% to get the item. This logic applies to every reward."
                        : ""
                }`,
            },
            {
                name: `Joined Users [${joinedUsers.length}/${raid.maxPlayers}]:`,
                value: `\n${joinedUsers
                    .map(
                        (user) =>
                            `- ${user.tag} (Level: ${user.level}) [${user.health.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxHealth(user).toLocaleString("en-US")} :heart:]`
                    )
                    .join("\n")}`,
            },
        ]),
        thumbnail: {
            url: enhancedBoss.avatarURL,
        },
        color: 0x70926c,
    };
    if (raid.allies)
        embed.fields.push({
            name: `Allies [${raid.allies.length}]:`,
            value: `\n${raid.allies
                .map((ally) => `- ${ally.emoji} ${ally.name} (LEVEL: ${ally.level})`)
                .join("\n")}`,
        });
    if (raid.minions.length !== 0) {
        embed.fields.push({
            name: `Minions [${raid.minions.length}]:`,
            value: `\n${raid.minions
                .map((minion) => `- ${minion.emoji} ${minion.name} (LEVEL: ${minion.level})`)
                .join("\n")}`,
        });
    }

    if (bannedUsers.length !== 0) {
        embed.fields.push({
            name: `Banned Users [${bannedUsers.length}]:`,
            value: `\n${bannedUsers.map((user) => `${user.tag} (LEVEL: ${user.level})`).join("\n")}`,
        });
    }

    return {
        embeds: Functions.fixEmbeds([embed]),
        components,
    };
};
