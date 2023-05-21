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
    checkRPGCooldown: "raid",
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
                .setPlaceholder("[Select a user to ban (not)]")
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
                    await ctx.client.database.setRPGCooldown(user.id, "raid", 60000 * 10);
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
                ctx.followUp({
                    content: `The raid ended unexpectedly due to an error: \`${error}\`. Please report this to the developers Your data has been saved and no cooldown has been set for you.`,
                });
            });
        });

        collector.on("collect", async (interaction) => {
            interaction.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
            const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
            if (!usrData) return;
            if (Functions.userIsCommunityBanned(usrData)) {
                interaction
                    .reply({
                        content: `You are community banned and cannot participate in raids, trade and other RPG features that involve other users. If you think this is a mistake, please [contact the developers](https://discord.gg/jolyne). Reason: \`${Functions.userIsCommunityBanned(
                            usrData
                        )}\``,
                        ephemeral: true,
                    })
                    .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                return;
            }

            if (Functions.userIsCommunityBanned(ctx.userData)) {
                interaction
                    .reply({
                        content: `The host of this raid is community banned and cannot participate in raids, trade and other RPG features that involve other users.`,
                        ephemeral: true,
                    })
                    .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                return;
            }
            if (usrData.health < Functions.getMaxHealth(usrData) * 0.1) {
                interaction
                    .reply({
                        content: `You're too low on health to fight. Try to heal yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                            "inventory use"
                        )} or ${ctx.client.getSlashCommandMention("shop")})`,
                        ephemeral: true,
                    })
                    .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                return;
            }
            switch (interaction.customId) {
                case joinRaidID: {
                    if (joinedUsers.length >= raid.maxPlayers) {
                        interaction
                            .reply({
                                content: `Unofortunately, the raid is full. Better luck next time! (or just be faster next time smh)`,
                                ephemeral: true,
                            })
                            .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
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
                    ctx.interaction
                        .followUp({
                            content: `${usrData.tag} has joined the raid.`,
                            ephemeral: true,
                        })
                        .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
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
                    ctx.interaction
                        .followUp({
                            content: `${usrData.tag} has left the raid!`,
                            ephemeral: true,
                        })
                        .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    makeMenuMessage();
                    break;
                }
                case banUserFromRaidID: {
                    if (usrData.id !== joinedUsers[0].id) {
                        return;
                    }
                    if (joinedUsers.length <= 1) {
                        interaction.reply({
                            content: "There is no one to ban!",
                            ephemeral: true,
                        });
                        return;
                    }
                    const userToBan = joinedUsers.find(
                        (r) => r.id === (interaction as StringSelectMenuInteraction).values[0]
                    );
                    if (!userToBan) {
                        interaction.reply({
                            content: "That user doesn't exist!",
                            ephemeral: true,
                        });
                        return;
                    }
                    if (userToBan.id === ctx.userData.id) {
                        interaction.reply({
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
                    interaction.reply({
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

            const components = [
                Functions.actionRow([joinRaidButton]),
                Functions.actionRow([startRaidButton, leaveRaidButton]),
            ];
            if (joinedUsers.length > 1) {
                components.push(Functions.actionRow([generateBanUserFromRaid()]));
            }

            const embed: APIEmbed = {
                title: `${raid.boss.emoji} ${raid.boss.name} RAID`,
                description: `> \`Min Level Requirement:\` ${
                    raid.level
                }\n> \`Max Level Requirement:\` ${
                    raid.level
                }\n> \`Starts (auto):\` ${Functions.generateDiscordTimestamp(
                    startRaid,
                    "FROM_NOW"
                )}`,
                fields: [
                    {
                        name: "Rewards",
                        value: `- **${(raid.baseRewards.coins ?? 0).toLocaleString(
                            "en-US"
                        )}** coins ${ctx.client.localEmojis.jocoins}\n- **${(
                            raid.baseRewards.xp ?? 0
                        ).toLocaleString("en-US")}** xp ${
                            ctx.client.localEmojis.xp
                        }\n${raid.baseRewards.items
                            .map((i) => {
                                const itemData = Functions.findItem(i.item);
                                if (!itemData) return null;
                                return `- **${i.amount.toLocaleString("en-US")}x** ${
                                    itemData.name
                                } ${itemData.emoji}${i.chance ? ` (${i.chance}%)` : ""}`;
                            })
                            .filter((r) => r)
                            .join("\n")}`,
                    },
                    {
                        name: `Joined Users [${joinedUsers.length}/${raid.maxPlayers}]:`,
                        value: `\n${joinedUsers
                            .map(
                                (r) =>
                                    `- ${r.tag} (LEVEL: ${r.level}) [${r.health.toLocaleString(
                                        "en-US"
                                    )}/${Functions.getMaxHealth(r).toLocaleString(
                                        "en-US"
                                    )} :heart:]`
                            )
                            .join("\n")}`,
                    },
                    /*
                    {
                        name: "\u200b",
                        value: `\`Starts (auto) in:\` ${Functions.generateDiscordTimestamp(
                            startRaid,
                            "FROM_NOW"
                        )}`,
                    },*/
                ],
                thumbnail: {
                    url: raid.boss.avatarURL,
                },
                color: 0x70926c,
            };

            if (bannedUsers.length !== 0) {
                embed.fields.push({
                    name: `Banned Users [${bannedUsers.length}]:`,
                    value: `\n${bannedUsers.map((r) => `${r.tag} (LEVEL: ${r.level})`).join("\n")}`,
                });
            }
            ctx.makeMessage({
                embeds: [embed],
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
