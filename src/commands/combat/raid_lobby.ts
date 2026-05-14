import { FightableNPC, RPGUserDataJSON, RaidBoss } from "../../@types";
import type CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import {
    MessageComponentInteraction,
    MessageFlags,
    StringSelectMenuInteraction,
} from "discord.js";
import { getIceShard, safeRaidFollowUp } from "./raid_results";

export interface RaidLobbyCustomIds {
    joinRaidID: string;
    leaveRaidID: string;
    banUserFromRaidID: string;
    startRaidID: string;
}

interface RaidLobbyInteractionOptions {
    ctx: CommandInteractionContext;
    interaction: MessageComponentInteraction;
    customIds: RaidLobbyCustomIds;
    joinedUsers: RPGUserDataJSON[];
    bannedUsers: RPGUserDataJSON[];
    cooldownedUsers: string[];
    raid: RaidBoss;
    raidCost: number;
    bossChosen: string;
    enhancedBoss: FightableNPC;
    refreshLobby: () => void;
    startRaid: () => void;
}

const warnOnce = (
    ctx: CommandInteractionContext,
    cooldownedUsers: string[],
    userId: string,
    message: string,
): void => {
    if (cooldownedUsers.find((id) => id === userId)) return;
    safeRaidFollowUp(ctx, message);
    cooldownedUsers.push(userId);
};

const handleJoinRaid = async (
    options: RaidLobbyInteractionOptions,
    usrData: RPGUserDataJSON,
): Promise<void> => {
    const {
        ctx,
        interaction,
        joinedUsers,
        bannedUsers,
        cooldownedUsers,
        raid,
        raidCost,
        bossChosen,
        enhancedBoss,
        refreshLobby,
    } = options;

    if (Functions.userIsCommunityBanned(usrData) || usrData.restingAtCampfire) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they are either resting at a campfire or community banned.`
        );
        return;
    }

    if (Functions.userIsCommunityBanned(ctx.userData)) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but the host is community banned.`
        );
        return;
    }
    if (!(await ctx.client.database.canUseRPGCommand(usrData.id, "raid"))) {
        return;
    }
    if (joinedUsers.length >= raid.maxPlayers) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but it is full.`
        );
        return;
    }
    if (bannedUsers.find((user) => user.id === interaction.user.id)) {
        return;
    }
    if (joinedUsers.find((user) => user.id === interaction.user.id)) {
        return;
    }
    if (await ctx.client.database.getCooldown(usrData.id)) {
        return;
    }
    if (usrData.level < raid.level) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they are too low level.`
        );
        return;
    }

    if (usrData.prestige < raid.prestige) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they are too low prestige.`
        );
        return;
    }
    if (usrData.coins < raidCost) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they don't have enough coins.`
        );
        return;
    }
    if (bossChosen === "ice_golem" && getIceShard(usrData) < 50) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they don't have enough Ice Shards.`
        );
        return;
    }

    joinedUsers.push(usrData);
    cooldownedUsers.slice(
        cooldownedUsers.findIndex((id) => id === interaction.user.id),
        1
    );
    ctx.interaction
        .followUp({
            content: `${usrData.tag} has joined the raid.`,
            flags: MessageFlags.Ephemeral,
        })
        .catch(() => undefined);
    ctx.client.database.setCooldown(
        usrData.id,
        `You are on a raid: ${enhancedBoss.name} cooldown!`
    );
    refreshLobby();
};

const handleLeaveRaid = (
    options: RaidLobbyInteractionOptions,
    usrData: RPGUserDataJSON,
): void => {
    const { ctx, interaction, joinedUsers, refreshLobby } = options;

    if (usrData.id === joinedUsers[0].id && joinedUsers.length > 1) {
        return;
    }
    if (!joinedUsers.find((user) => user.id === interaction.user.id)) {
        return;
    }
    joinedUsers.splice(
        joinedUsers.findIndex((user) => user.id === interaction.user.id),
        1
    );
    ctx.client.database.deleteCooldown(usrData.id);
    refreshLobby();
};

const handleBanUserFromRaid = (
    options: RaidLobbyInteractionOptions,
    usrData: RPGUserDataJSON,
): void => {
    const { ctx, interaction, joinedUsers, bannedUsers, refreshLobby } = options;

    if (usrData.id !== joinedUsers[0].id) {
        return;
    }
    if (joinedUsers.length <= 1) {
        return;
    }
    const userToBan = joinedUsers.find(
        (user) => user.id === (interaction as StringSelectMenuInteraction).values[0]
    );
    if (!userToBan) {
        return;
    }
    if (userToBan.id === ctx.userData.id) {
        return;
    }
    bannedUsers.push(userToBan);
    joinedUsers.splice(
        joinedUsers.findIndex((user) => user.id === userToBan.id),
        1
    );
    ctx.client.database.deleteCooldown(userToBan.id);
    refreshLobby();
};

export const handleRaidLobbyInteraction = async (
    options: RaidLobbyInteractionOptions,
): Promise<void> => {
    const { ctx, interaction, customIds, cooldownedUsers, startRaid } = options;

    interaction.deferUpdate().catch(() => undefined);
    const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
    if (!usrData) return;

    if (usrData.health < Functions.getMaxHealth(usrData) * 0.1) {
        warnOnce(
            ctx,
            cooldownedUsers,
            interaction.user.id,
            `<@${interaction.user.id}> tried to join the raid but they low in health.`
        );
        return;
    }

    switch (interaction.customId) {
        case customIds.joinRaidID:
            await handleJoinRaid(options, usrData);
            break;
        case customIds.leaveRaidID:
            handleLeaveRaid(options, usrData);
            break;
        case customIds.banUserFromRaidID:
            handleBanUserFromRaid(options, usrData);
            break;
        case customIds.startRaidID:
            if (usrData.id !== options.joinedUsers[0].id) {
                return;
            }
            startRaid();
            break;
    }
};
