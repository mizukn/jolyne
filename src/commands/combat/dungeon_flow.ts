import type { possibleModifiers as PossibleModifierId, RPGUserDataJSON } from "../../@types";
import type CommandInteractionContext from "../../structures/CommandInteractionContext";
import DungeonHandler from "../../structures/DungeonHandler";
import * as Functions from "../../utils/Functions";
import { containers } from "../../utils/containers";
import {
    ButtonBuilder,
    InteractionResponse,
    Message,
    MessageComponentInteraction,
    MessageFlags,
    StringSelectMenuInteraction,
} from "discord.js";
import { possibleModifiers } from "./dungeon_config";
import {
    consumeDungeonKeyOnly,
    finalizeDungeonRewards,
    hasDungeonProgress,
    isMessageAccessFailure,
    recordDungeonAttempt,
    safeDungeonReply,
} from "./dungeon_lifecycle";
import { karsLine } from "./dungeon_lobby";

interface DungeonLobbyFlowOptions {
    ctx: CommandInteractionContext;
    interaction: MessageComponentInteraction;
    totalPlayers: RPGUserDataJSON[];
    selectedModifiers: PossibleModifierId[];
    stage?: number;
    joinButton: ButtonBuilder;
    startButton: ButtonBuilder;
    cancelButton: ButtonBuilder;
    sendLobby: (
        buttons: ButtonBuilder[],
    ) => Promise<Message<boolean> | InteractionResponse<boolean>>;
    stopCollector: (reason: string) => void;
}

const handleJoinDungeon = async (options: DungeonLobbyFlowOptions): Promise<void> => {
    const { ctx, interaction, totalPlayers, startButton, cancelButton, sendLobby } = options;

    if (Functions.userIsCommunityBanned(ctx.userData)) {
        return void interaction.reply({
            content: "The host is community banned.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (totalPlayers.length >= 2) {
        return void interaction.reply({
            content: "This dungeon is full.",
            flags: MessageFlags.Ephemeral,
        });
    }

    const dungeonDoneToday = await ctx.client.database.getString(
        `dungeonDone:${interaction.user.id}:${Functions.getTodayString()}`
    );
    const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
    const dateAtMidnight = new Date().setHours(0, 0, 0, 0);
    const nextDate = dateAtMidnight + 86400000;

    if (dungeonDoneTodayCount >= 4) {
        const timeLeft = nextDate - Date.now();
        return void interaction.reply({
            content: `You've already done 4 dungeons today. Come back ${Functions.generateDiscordTimestamp(
                Date.now() + timeLeft,
                "FROM_NOW"
            )}.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
    if (!usrData) return;

    if (Functions.userIsCommunityBanned(usrData)) {
        return void interaction.reply({
            content: "You're community banned.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (totalPlayers.find((player) => player.id === interaction.user.id)) {
        return void interaction.reply({
            content: "You're already in this dungeon.",
            flags: MessageFlags.Ephemeral,
        });
    }
    const data = await ctx.client.database.getRPGUserData(interaction.user.id);
    if (!data) return;
    totalPlayers.push(data);
    interaction.reply({
        content: "You've joined the dungeon.",
        flags: MessageFlags.Ephemeral,
    });
    await sendLobby([startButton, cancelButton]);
    ctx.client.database.setCooldown(
        interaction.user.id,
        `You are in a dungeon with ${ctx.userData.tag} (${ctx.userData.id})`,
    );
};

const attachDungeonResultHandlers = (
    dungeon: DungeonHandler,
    options: DungeonLobbyFlowOptions,
): void => {
    const { ctx, totalPlayers, selectedModifiers } = options;

    dungeon.on("unexpectedEnd", async (reason: string) => {
        for (const player of totalPlayers) {
            ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
            ctx.client.database.deleteCooldown(player.id);
        }
        const hasProgress = hasDungeonProgress(dungeon);
        const isAccessFailure = isMessageAccessFailure(reason);
        if (isAccessFailure) {
            await safeDungeonReply(
                dungeon,
                ctx,
                hasProgress
                    ? `The dungeon has ended because I lost message access in this channel. Your dungeon key was used and you still get the rewards.`
                    : `The dungeon has ended because I lost message access in this channel. Your dungeon key was used, but no rewards were generated because the dungeon did not start.`,
            );
        } else if (reason === "maintenance" || ctx.client.maintenanceReason) {
            await safeDungeonReply(
                dungeon,
                ctx,
                hasProgress
                    ? `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. The host has been refunded a dungeon key but you still get the rewards.`
                    : `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. No rewards were generated because the dungeon did not start.`,
            );
        } else {
            await safeDungeonReply(
                dungeon,
                ctx,
                hasProgress
                    ? `The dungeon has ended unexpectedly: \`${reason}\`. The host has been refunded a dungeon key but you still get the rewards.`
                    : `The dungeon has ended unexpectedly: \`${reason}\`. No rewards were generated because the dungeon did not start.`,
            );
        }

        if (hasProgress) {
            await finalizeDungeonRewards(dungeon, ctx, selectedModifiers, {
                consumeKey: isAccessFailure,
            });
            if (isAccessFailure) {
                await recordDungeonAttempt(ctx, totalPlayers);
            }
        } else if (isAccessFailure) {
            await consumeDungeonKeyOnly(ctx, dungeon);
            await recordDungeonAttempt(ctx, totalPlayers);
        }
    });

    dungeon.on("end", async (reason: string) => {
        for (const player of totalPlayers) {
            ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
            ctx.client.database.deleteCooldown(player.id);
        }
        if (reason === "maintenance" || ctx.client.maintenanceReason) {
            await safeDungeonReply(
                dungeon,
                ctx,
                `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. The host has been refunded a dungeon key but you still get the rewards.`,
            );
        } else {
            await recordDungeonAttempt(ctx, totalPlayers);
        }

        await finalizeDungeonRewards(dungeon, ctx, selectedModifiers, {
            consumeKey: true,
        });
    });
};

const handleStartDungeon = async (options: DungeonLobbyFlowOptions): Promise<void> => {
    const { ctx, totalPlayers, selectedModifiers, stage, stopCollector } = options;

    for (const player of totalPlayers) {
        if (await ctx.client.database.getString(`tempCache_${player.id}:dungeon`)) {
            ctx.makeMessage(
                containers.error(karsLine(`Are you trying to scam me? <@${player.id}>`)),
            );
            stopCollector("scam");
            return;
        }
    }
    const message = await ctx.interaction.channel.send(`Initializing dungeon...`);
    ctx.makeMessage(
        containers.success(
            karsLine(`The dungeon has started! ${Functions.generateMessageLink(message)}`),
        ),
    );

    const dungeon = new DungeonHandler(ctx, totalPlayers, message, selectedModifiers, stage);
    for (const player of totalPlayers) {
        ctx.client.database.setString(`tempCache_${player.id}:dungeon`, "true");
        ctx.client.database.deleteCooldown(player.id);
    }

    attachDungeonResultHandlers(dungeon, options);
    stopCollector("start");
};

const handleCancelDungeon = (options: DungeonLobbyFlowOptions): void => {
    const { ctx, totalPlayers, stopCollector } = options;

    ctx.interaction.deleteReply();
    ctx.client.database.deleteCooldown(ctx.user.id);
    for (const player of totalPlayers) {
        ctx.client.database.deleteCooldown(player.id);
        ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
    }
    stopCollector("cancel");
};

const handleDungeonModifiers = async (options: DungeonLobbyFlowOptions): Promise<void> => {
    const {
        interaction,
        selectedModifiers,
        joinButton,
        startButton,
        cancelButton,
        sendLobby,
    } = options;

    interaction.deferUpdate().catch(() => undefined);
    selectedModifiers.length = 0;
    for (const value of (interaction as StringSelectMenuInteraction).values) {
        if (possibleModifiers.find((modifier) => modifier.id === value)) {
            selectedModifiers.push(value as PossibleModifierId);
        }
    }
    await sendLobby([joinButton, startButton, cancelButton]);
};

export const handleDungeonLobbyInteraction = async (
    options: DungeonLobbyFlowOptions,
): Promise<void> => {
    const { ctx, interaction } = options;

    if (interaction.customId === "join_dungeon" + ctx.interaction.id) {
        await handleJoinDungeon(options);
    } else if (interaction.customId === "start_dungeon" + ctx.interaction.id) {
        await handleStartDungeon(options);
    } else if (interaction.customId === "cancel_dungeon" + ctx.interaction.id) {
        handleCancelDungeon(options);
    } else if (interaction.customId === "dungeon_modifiers" + ctx.interaction.id) {
        await handleDungeonModifiers(options);
    }
};
