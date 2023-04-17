import { FightableNPC, RPGUserDataJSON, RPGUserQuest, SlashCommandFile } from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { InteractionType } from "discord.js";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Bosses from "../../rpg/Raids";

const slashCommand: SlashCommandFile = {
    data: {
        name: "raid",
        description: "neeeega",
        options: [
            {
                name: "npc",
                description: "npc",
                type: ApplicationCommandOptionType.String, // 3
                autocomplete: true,
                required: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
            ctx.makeMessage({
                content: `You're too low on health to fight. Try to heal yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} or ${ctx.client.getSlashCommandMention("shop")})`,
                embeds: [],
                components: [],
            });
            return;
        }

        const bossChosen = ctx.options.getString("npc", true);
        const raid = Object.values(Bosses).find((r) => r.boss.id === bossChosen);
        if (!raid) {
            ctx.makeMessage({
                content: "That boss doesn't exist!",
            });
            return;
        }
        if (raid.level > ctx.userData.level) {
            ctx.makeMessage({
                content: "You can't raid this boss yet.",
            });
            return;
        }
        const joinRaidID = Functions.generateRandomId();
        const leaveRaidID = Functions.generateRandomId();
        const banUserFromRaidID = Functions.generateRandomId();
        const startRaidID = Functions.generateRandomId();

        const joinedUsers: RPGUserDataJSON[] = [ctx.userData];
        const bannedUsers: RPGUserDataJSON[] = [];

        const joinRaidButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(joinRaidID)
            .setLabel("Join Raid")
            .setEmoji("➕");
        const leaveRaidButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(leaveRaidID)
            .setLabel("Leave Raid")
            .setEmoji("➖");
        const startRaidButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId(startRaidID)
            .setLabel("Start Raid")
            .setEmoji("👊");

        function generateBanUserFromRaid() {
            return new StringSelectMenuBuilder()
                .setCustomId(banUserFromRaidID)
                .setPlaceholder("[BAN USER FROM RAID]")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    joinedUsers.map((r) => {
                        return {
                            label: `${r.tag} (LEVEL: ${r.level})`,
                            value: r.id,
                        };
                    })
                );
        }
        const startRaid = Date.now() + 120000;
        const collector = ctx.channel.createMessageComponentCollector({
            filter: (interaction) =>
                interaction.customId === joinRaidID ||
                interaction.customId === leaveRaidID ||
                interaction.customId === banUserFromRaidID ||
                interaction.customId === startRaidID,
            time: startRaid - Date.now(),
        });
        ctx.client.database.setCooldown(
            ctx.userData.id,
            `You are on a raid: ${raid.boss.name} cooldown!`
        );

        collector.on("end", () => {
            if (joinedUsers.length === 0) return;
            const fight = new FightHandler(
                ctx,
                [[...raid.minions, raid.boss], [...joinedUsers]],
                FightTypes.Boss
            );
            fight.on("end", async (winners, losers) => {
                for (const user of joinedUsers) {
                    ctx.client.database.deleteCooldown(user.id);
                }
                if (joinedUsers.find((r) => r.id === winners[0].id)) {
                    for (const winner of winners) {
                        const winnerData = await ctx.client.database.getRPGUserData(winner.id);
                        if (!winnerData) continue;
                        const winContent: string[] = [];
                        if (raid.baseRewards.coins) {
                            const coins = Math.round(
                                winner.health === 0
                                    ? raid.baseRewards.coins / 4
                                    : raid.baseRewards.coins
                            );
                            Functions.addCoins(winnerData, coins);
                            winContent.push(
                                `+**${coins.toLocaleString("en-US")}** ${
                                    ctx.client.localEmojis.jocoins
                                }`
                            );
                        }
                        if (raid.baseRewards.xp) {
                            const xp = Math.round(
                                winner.health === 0 ? raid.baseRewards.xp / 4 : raid.baseRewards.xp
                            );
                            Functions.addXp(winnerData, xp);
                            winContent.push(
                                `+**${xp.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp}`
                            );
                        }
                        if (raid.baseRewards.items.length > 0) {
                            for (const item of raid.baseRewards.items) {
                                const chance = winner.health === 0 ? item.chance / 2 : item.chance;
                                if (item.chance && Functions.RNG(0, 100) > chance) continue;
                                const itemData = Functions.findItem(item.item);
                                if (!itemData) continue;
                                Functions.addItem(winnerData, itemData.id);
                                winContent.push(
                                    `${item.amount}x ${itemData.emoji} **${itemData.name}** (${chance}%)`
                                );
                            }
                        }
                        winnerData.health = winner.health;
                        winnerData.stamina = winner.stamina;

                        ctx.followUp({
                            content: `<@${winner.id}> won the raid ${
                                winner.health === 0
                                    ? " but they died, so they only got the following rewards"
                                    : "and got the following rewards"
                            }:\n${winContent.join(", ")}`,
                        });
                        ctx.client.database.saveUserData(winnerData);
                    }
                } else {
                    for (const team of losers) {
                        for (const loser of team) {
                            const loserData = await ctx.client.database.getRPGUserData(loser.id);
                            if (!loserData) continue;
                            loserData.health = 0;
                            loserData.stamina = 0;
                            ctx.followUp({
                                content: `<@${loser.id}> lost the raid and died.`,
                            });
                            ctx.client.database.saveUserData(loserData);
                        }
                    }
                }
            });

            fight.on("unexpectedEnd", (error) => {
                for (const user of joinedUsers) {
                    ctx.client.database.deleteCooldown(user.id);
                }
            });
        });

        collector.on("collect", async (interaction) => {
            interaction.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
            const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
            if (!usrData) return;
            if (usrData.health < Functions.getMaxHealth(usrData) * 0.1) {
                ctx.interaction.followUp({
                    content: `${usrData.tag} tried to join but they are too low on health.`,
                    ephemeral: true,
                });
                return;
            }
            switch (interaction.customId) {
                case joinRaidID: {
                    if (joinedUsers.length >= raid.maxPlayers) {
                        ctx.interaction.followUp({
                            content: `${usrData.tag} tried to join but the raid is full.`,
                            ephemeral: true,
                        });
                        return;
                    }
                    if (bannedUsers.find((r) => r.id === interaction.user.id)) {
                        return;
                    }
                    if (joinedUsers.find((r) => r.id === interaction.user.id)) {
                        return;
                    }
                    if (await ctx.client.database.getCooldown(usrData.id)) {
                        return;
                    }
                    if (usrData.level < raid.level) {
                        return;
                    }
                    joinedUsers.push(usrData);
                    ctx.interaction.followUp({
                        content: `${usrData.tag} has joined the raid.`,
                        ephemeral: true,
                    });
                    ctx.client.database.setCooldown(
                        usrData.id,
                        `You are on a raid: ${raid.boss.name} cooldown!`
                    );
                    makeMenuMessage();
                    break;
                }
                case leaveRaidID: {
                    if (!joinedUsers.find((r) => r.id === interaction.user.id)) {
                        return;
                    }
                    joinedUsers.splice(
                        joinedUsers.findIndex((r) => r.id === interaction.user.id),
                        1
                    );
                    ctx.client.database.deleteCooldown(usrData.id);
                    ctx.interaction.followUp({
                        content: `${usrData.tag} has left the raid!`,
                        ephemeral: true,
                    });
                    makeMenuMessage();
                    break;
                }
                case banUserFromRaidID: {
                    if (usrData.id !== joinedUsers[0].id) {
                        return;
                    }
                    if (joinedUsers.length <= 1) {
                        ctx.interaction.followUp({
                            content: "There is no one to ban!",
                            ephemeral: true,
                        });
                        return;
                    }
                    const userToBan = joinedUsers.find(
                        (r) => r.id === (interaction as StringSelectMenuInteraction).values[0]
                    );
                    if (!userToBan) {
                        ctx.interaction.followUp({
                            content: "That user doesn't exist!",
                            ephemeral: true,
                        });
                        return;
                    }
                    if (userToBan.id === ctx.userData.id) {
                        ctx.interaction.followUp({
                            content: "You can't ban yourself!",
                            ephemeral: true,
                        });
                        return;
                    }
                    bannedUsers.push(userToBan);
                    joinedUsers.splice(
                        joinedUsers.findIndex((r) => r.id === userToBan.id),
                        1
                    );
                    ctx.client.database.deleteCooldown(usrData.id);
                    ctx.interaction.followUp({
                        content: `You have banned ${userToBan.tag} from the raid!`,
                        ephemeral: true,
                    });
                    makeMenuMessage();
                    break;
                }
                case startRaidID: {
                    if (usrData.id !== joinedUsers[0].id) {
                        return;
                    }
                    collector.stop();
                    break;
                }
            }
        });

        function makeMenuMessage(): void {
            if (joinedUsers.length === 0) {
                ctx.makeMessage({
                    content: "The raid has been cancelled.",
                    components: [],
                    embeds: [],
                });
                collector.stop();
                return;
            }

            const components = [Functions.actionRow([joinRaidButton, leaveRaidButton])];
            if (joinedUsers.length > 1) {
                components.push(Functions.actionRow([generateBanUserFromRaid()]));
            }
            components.push(Functions.actionRow([startRaidButton]));

            ctx.makeMessage({
                embeds: [
                    {
                        title: `${raid.boss.emoji} ${raid.boss.name} RAID`,
                        description: `**LEVEL REQUIREMENT: ${raid.level}**\n\n**JOINED USERS [${
                            joinedUsers.length
                        }/${raid.maxPlayers}]:**\n${joinedUsers
                            .map(
                                (r) =>
                                    `- ${r.tag} (LEVEL: ${r.level}) [${r.health.toLocaleString(
                                        "en-US"
                                    )}/${Functions.getMaxHealth(r).toLocaleString(
                                        "en-US"
                                    )} :heart:]`
                            )
                            .join("\n")}${
                            bannedUsers.length !== 0
                                ? `\n\n**BANNED USERS:**\n${bannedUsers
                                      .map((r) => `${r.tag} (LEVEL: ${r.level})`)
                                      .join("\n")}`
                                : ""
                        }\n\n**STARTS IN:** ${Functions.generateDiscordTimestamp(
                            startRaid,
                            "FROM_NOW"
                        )}`,
                        thumbnail: {
                            url: raid.boss.avatarURL,
                        },
                        color: 0x00ff00,
                    },
                ],
                components,
            });
        }
        makeMenuMessage();
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const availableBosses = Object.values(Bosses).filter((r) => r.level <= userData.level);

        interaction.respond(
            availableBosses
                .map((r) => {
                    return {
                        name: `${r.boss.name} (LEVEL REQUIREMENT: ${r.level})`,
                        value: r.boss.id,
                    };
                })
                .filter(
                    (raid) =>
                        raid.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        raid.value.toLowerCase().includes(currentInput.toLowerCase())
                )
        );
    },
};

export default slashCommand;
