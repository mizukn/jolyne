import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
    RPGUserDataJSON,
    possibleModifiers as PossibleModifierId,
} from "../../@types";
import {
    Message,
    APIEmbed,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "../adventure/Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import DungeonHandler from "../../structures/DungeonHandler";
import {
    possibleModifiers,
    getTotalXpIncrease,
    getTotalDropIncrease,
} from "./dungeon_config";
import { giveRewards } from "./dungeon_rewards";

const slashCommand: SlashCommandFile = {
    data: {
        name: "dungeon",
        description: "Start a dungeon.",
        options: [],
    },
    checkRPGCooldown: "dungeon",
    execute: async (
        ctx: CommandInteractionContext,
        stage?: number
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const dungeonDoneToday = await ctx.client.database.getString(
            `dungeonDone:${ctx.userData.id}:${Functions.getTodayString()}`
        );
        const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
        const dateAtMidnight = new Date().setHours(0, 0, 0, 0);
        const nextDate = dateAtMidnight + 86400000;
        if (ctx.userData.health <= 0) {
            return ctx.makeMessage({
                content: "<:kars:1057261454421676092> **Kars:** You're dead, you can't do that.",
                embeds: [],
                components: [],
            });
        }

        if (
            dungeonDoneTodayCount >= 4 &&
            !ctx.client.user.username.includes("Beta") &&
            !ctx.client.user.username.includes("Alpha")
        ) {
            const timeLeft = nextDate - Date.now();
            return ctx.makeMessage({
                content: `<:kars:1057261454421676092> **Kars:** You've already done 4 dungeons today. Come back ${Functions.generateDiscordTimestamp(
                    Date.now() + timeLeft,
                    "FROM_NOW"
                )}.`,
                embeds: [],
                components: [],
            });
        }
        if (await ctx.client.database.getString(`tempCache_${ctx.userData.id}:dungeon`)) {
            /*ctx.client.users.fetch("239739781238620160").then((c) => {
                c.send(
                    `**${ctx.userData.tag}** (${
                        ctx.userData.id
                    }) has tried to start.`
                );
            });*/
            return ctx.makeMessage({
                content: "<:kars:1057261454421676092> **Kars:** Are you trying to scam me?",
                embeds: [],
                components: [],
            });
        }
        try {
            await ctx.channel.sendTyping();
        } catch (e) {
            return void ctx.makeMessage({
                content: "I don't have permission to send messages in this channel.",
                embeds: [],
                components: [],
            });
        }
        if ((ctx.userData.inventory["dungeon_key"] ?? 0) < 1) {
            return ctx.makeMessage({
                content:
                    "<:kars:1057261454421676092> **Kars:** HA! Where's your key? You can't enter without it!",
                embeds: [],
                components: [],
            });
        }

        const joinButton = new ButtonBuilder()
            .setCustomId("join_dungeon" + ctx.interaction.id)
            .setLabel("Join")
            .setStyle(ButtonStyle.Primary);
        const startButton = new ButtonBuilder()
            .setCustomId("start_dungeon" + ctx.interaction.id)
            .setLabel("Start")
            .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel_dungeon" + ctx.interaction.id)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const totalPlayers = [ctx.userData];
        const modifiersStringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("dungeon_modifiers" + ctx.interaction.id)
            .setPlaceholder("Select modifiers to apply to the dungeon.")
            .addOptions(
                possibleModifiers.map((x) => {
                    return {
                        label: Functions.capitalize(x.id.replace(/_/g, " ")),
                        value: x.id,
                        description: x.description.slice(0, 100),
                        emoji: x.emoji,
                    };
                })
            )
            .setMinValues(0)
            .setMaxValues(possibleModifiers.length);

        const selectedModifiers: PossibleModifierId[] = [];
        ctx.client.database.setCooldown(ctx.user.id, `You are in a dungeon.`);

        await ctx.makeMessage({
            content: `<:kars:1057261454421676092> **Kars:** ${
                ctx.userData.tag
            } is hosting a dungeon! (${totalPlayers.length}/2)\n\n**__Modifiers:__**${
                selectedModifiers.length
                    ? "\n" +
                      selectedModifiers
                          .map((x) => {
                              const modifier = possibleModifiers.find((f) => f.id === x);
                              return `- ${modifier?.emoji} ${Functions.capitalize(
                                  x.replace(/_/g, " ")
                              )}: ${modifier?.description}`;
                          })
                          .join("\n")
                    : ":x:"
            }\n**Total XP Increase:** ${getTotalXpIncrease(
                selectedModifiers
            )}x\n**Total Drop Increase:** ${getTotalDropIncrease(selectedModifiers)}x`,
            embeds: [],
            components: [
                Functions.actionRow([joinButton, startButton, cancelButton]),
                Functions.actionRow([modifiersStringSelectMenu]),
            ],
        });
        const collector = ctx.channel.createMessageComponentCollector({
            time: 60000,
            filter: (i) =>
                i.customId.includes(ctx.interaction.id) &&
                (i.customId.includes("join_dungeon") ? true : i.user.id === ctx.userData.id),
        });

        collector.on("collect", async (i) => {
            if (i.customId === "join_dungeon" + ctx.interaction.id) {
                if (Functions.userIsCommunityBanned(ctx.userData)) {
                    return void i.reply({
                        content: "The host is community banned.",
                        flags: MessageFlags.Ephemeral,
                    });
                }

                if (totalPlayers.length >= 2) {
                    return void i.reply({
                        content: "This dungeon is full.",
                        flags: MessageFlags.Ephemeral,
                    });
                }

                // check if has done 5 dungeons today
                const dungeonDoneToday = await ctx.client.database.getString(
                    `dungeonDone:${i.user.id}:${Functions.getTodayString()}`
                );
                const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
                const dateAtMidnight = new Date().setHours(0, 0, 0, 0);
                const nextDate = dateAtMidnight + 86400000;

                if (dungeonDoneTodayCount >= 4) {
                    const timeLeft = nextDate - Date.now();
                    return void i.reply({
                        content: `You've already done 4 dungeons today. Come back ${Functions.generateDiscordTimestamp(
                            Date.now() + timeLeft,
                            "FROM_NOW"
                        )}.`,
                        flags: MessageFlags.Ephemeral,
                    });
                }

                const usrData = await ctx.client.database.getRPGUserData(i.user.id);
                if (!usrData) return;

                if (Functions.userIsCommunityBanned(usrData)) {
                    return void i.reply({
                        content: "You're community banned.",
                        flags: MessageFlags.Ephemeral,
                    });
                }

                if (totalPlayers.find((f) => f.id === i.user.id)) {
                    return void i.reply({
                        content: "You're already in this dungeon.",
                        flags: MessageFlags.Ephemeral,
                    });
                }
                const data = await ctx.client.database.getRPGUserData(i.user.id);
                if (!data) return;
                totalPlayers.push(data);
                i.reply({
                    content: "You've joined the dungeon.",
                    flags: MessageFlags.Ephemeral,
                });
                await ctx.makeMessage({
                    content: `<:kars:1057261454421676092> **Kars:** ${
                        data.tag
                    } has joined the dungeon! (${totalPlayers.length}/2)\n\n**__Modifiers:__**${
                        selectedModifiers.length
                            ? "\n" +
                              selectedModifiers
                                  .map((x) => {
                                      const modifier = possibleModifiers.find((f) => f.id === x);
                                      return `- ${modifier?.emoji} ${Functions.capitalize(
                                          x.replace(/_/g, " ")
                                      )}: ${modifier?.description}`;
                                  })
                                  .join("\n")
                            : ":x:"
                    }\n**Total XP Increase:** ${getTotalXpIncrease(
                        selectedModifiers
                    )}x\n**Total Drop Increase:** ${getTotalDropIncrease(selectedModifiers)}x`,
                    embeds: [],
                    components: [
                        Functions.actionRow([startButton, cancelButton]),
                        Functions.actionRow([modifiersStringSelectMenu]),
                    ],
                });
                ctx.client.database.setCooldown(
                    i.user.id,
                    `You are in a dungeon with ${ctx.userData.tag} (${ctx.userData.id})`
                );
            } else if (i.customId === "start_dungeon" + ctx.interaction.id) {
                for (const player of totalPlayers) {
                    if (await ctx.client.database.getString(`tempCache_${player.id}:dungeon`)) {
                        /*ctx.client.users.fetch("239739781238620160").then((c) => {
                            c.send(
                                `**${ctx.userData.tag}** (${
                                    ctx.userData.id
                                }) has tried to start.`
                            );
                        });*/
                        ctx.makeMessage({
                            content: `<:kars:1057261454421676092> **Kars:** Are you trying to scam me? <@${player.id}>`,
                            embeds: [],
                            components: [],
                        });
                        collector.stop("scam");
                        return;
                    }
                }
                const message = await ctx.interaction.channel.send(`Initializing dungeon...`);
                ctx.makeMessage({
                    content: `<:kars:1057261454421676092> **Kars:** The dungeon has started! ${Functions.generateMessageLink(
                        message
                    )}`,
                    embeds: [],
                    components: [],
                });

                const dungeon = new DungeonHandler(
                    ctx,
                    totalPlayers,
                    message,
                    selectedModifiers,
                    stage
                );
                for (const player of totalPlayers) {
                    ctx.client.database.setString(`tempCache_${player.id}:dungeon`, "true");
                    ctx.client.database.deleteCooldown(player.id);
                }

                dungeon.on("unexpectedEnd", async (reason: string) => {
                    for (const player of totalPlayers) {
                        ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
                        ctx.client.database.deleteCooldown(player.id);
                    }
                    if (reason === "maintenance" || ctx.client.maintenanceReason) {
                        dungeon.message.reply({
                            content: `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. The host has been refunded a dungeon key but you still get the rewards.`,
                        });
                    } else {
                        dungeon.message.reply({
                            content: `The dungeon has ended unexpectedly: \`${reason}\`. The host has been refunded a dungeon key but you still get the rewards.`,
                        });
                    }

                    giveRewards(dungeon, ctx, selectedModifiers, true);
                });

                dungeon.on("end", async (reason: string) => {
                    for (const player of totalPlayers) {
                        ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
                        ctx.client.database.deleteCooldown(player.id);
                    }
                    if (reason === "maintenance" || ctx.client.maintenanceReason) {
                        dungeon.message.reply({
                            content: `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. The host has been refunded a dungeon key but you still get the rewards.`,
                        });
                    } else {
                        for (const player of totalPlayers) {
                            await ctx.client.database.setRPGCooldown(
                                player.id,
                                "dungeon",
                                1000 * 60 * 15
                            );
                            // incr dungeon done today
                            const dungeonDoneToday = await ctx.client.database.getString(
                                `dungeonDone:${player.id}:${Functions.getTodayString()}`
                            );
                            const dungeonDoneTodayCount = dungeonDoneToday
                                ? parseInt(dungeonDoneToday)
                                : 0;
                            await ctx.client.database.redis.set(
                                `dungeonDone:${player.id}:${Functions.getTodayString()}`,
                                (dungeonDoneTodayCount + 1).toString()
                            );
                        }
                    }

                    giveRewards(dungeon, ctx, selectedModifiers);
                });
                collector.stop("start");
            } else if (i.customId === "cancel_dungeon" + ctx.interaction.id) {
                ctx.interaction.deleteReply();
                ctx.client.database.deleteCooldown(ctx.user.id);
                for (const player of totalPlayers) {
                    ctx.client.database.deleteCooldown(player.id);
                    ctx.client.database.redis.del(`tempCache_${player.id}:dungeon`);
                }
                collector.stop("cancel");
            } else if (i.customId === "dungeon_modifiers" + ctx.interaction.id) {
                i.deferUpdate().catch(() => {});
                selectedModifiers.length = 0;
                for (const value of (i as StringSelectMenuInteraction).values) {
                    if (possibleModifiers.find((f) => f.id === value)) {
                        selectedModifiers.push(value as PossibleModifierId);
                    }
                }
                await ctx.makeMessage({
                    content: `<:kars:1057261454421676092> **Kars:** ${
                        ctx.userData.tag
                    } is hosting a dungeon! (${totalPlayers.length}/2)\n\n**__Modifiers:__**${
                        selectedModifiers.length
                            ? "\n" +
                              selectedModifiers
                                  .map((x) => {
                                      const modifier = possibleModifiers.find((f) => f.id === x);
                                      return `- ${modifier?.emoji} ${Functions.capitalize(
                                          x.replace(/_/g, " ")
                                      )}: ${modifier?.description}`;
                                  })
                                  .join("\n")
                            : ":x:"
                    }\n**Total XP Increase:** ${getTotalXpIncrease(
                        selectedModifiers
                    )}x\n**Total Drop Increase:** ${getTotalDropIncrease(selectedModifiers)}x`,
                    embeds: [],
                    components: [
                        Functions.actionRow([joinButton, startButton, cancelButton]),
                        Functions.actionRow([modifiersStringSelectMenu]),
                    ],
                });
            }
        });
    },
};

export default slashCommand;
