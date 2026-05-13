import {
    RPGUserDataJSON,
    SlashCommandFile,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import { cloneDeep } from "lodash";
import { eventRaid, getFixedBosses } from "../../rpg/SeasonalRaids";
import {
    attachRaidFightResultHandlers,
    getIceShard,
    safeRaidFollowUp,
} from "./raid_results";

const slashCommand: SlashCommandFile = {
    data: {
        name: "raid",
        description: "Raid a boss.",
        options: [
            {
                name: "npc",
                description:
                    "It is preferred to raid a NPC with other players, unless you're the same level as the Boss.",
                type: ApplicationCommandOptionType.String, // 3
                autocomplete: true,
                required: true,
            },
        ],
    },
    checkRPGCooldown: "raid",
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        try {
            await ctx.channel.sendTyping();
        } catch (e) {
            return void ctx.makeMessage({
                content: "I don't have permission to send messages in this channel.",
                embeds: [],
                components: [],
            });
        }

        const fixedBosses = getFixedBosses();

        if (Date.now() < 1707606000000) {
            if (Functions.isTimeNext15(new Date(Date.now()))) {
                fixedBosses.push(eventRaid);
            } else {
                if (ctx.options.getString("npc", true) === "confetti_golem") {
                    return void ctx.makeMessage({
                        content: `${ctx.client.localEmojis["2ndAnniversaryBackpack"]}${
                            ctx.client.localEmojis["ConfettiBazooka"]
                        } | Looking for the event raid? It will be available ${Functions.generateDiscordTimestamp(
                            Functions.roundToNext15Minutes(new Date()),
                            "FROM_NOW"
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/PQBS32q9Br`,
                    });
                } else {
                    ctx.followUpQueue.push({
                        content: `${ctx.client.localEmojis["2ndAnniversaryBackpack"]}${
                            ctx.client.localEmojis["ConfettiBazooka"]
                        } | Looking for the event raid? It will be available ${Functions.generateDiscordTimestamp(
                            Functions.roundToNext15Minutes(new Date()),
                            "FROM_NOW"
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/PQBS32q9Br`,
                    });
                }
            }
        }

        /*if (Date.now() < endOf3rdAnnivesaryEvent.getTime()) {
            if (Functions.isTimeNext15(new Date(Date.now()))) {
                fixedBosses.push(PinataTitan);
            } else {
                if (ctx.options.getString("npc", true) === "pinata_titan") {
                    return void ctx.makeMessage({
                        content: `<:pinata_hammer:1345192028790849667><:pinata_hat:1345192118267936859> | Looking for the event raid? It will be available ${Functions.generateDiscordTimestamp(
                            Functions.roundToNext15Minutes(new Date()),
                            "FROM_NOW"
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/PQBS32q9Br`,
                    });
                } else {
                    ctx.followUpQueue.push({
                        content: `<:pinata_hammer:1345192028790849667><:pinata_hat:1345192118267936859> | Looking for the event raid? It will be available ${Functions.generateDiscordTimestamp(
                            Functions.roundToNext15Minutes(new Date()),
                            "FROM_NOW"
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/PQBS32q9Br`,
                    });
                }
            }
        }*/

        if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
            ctx.makeMessage({
                content: `You're too low on health to fight. Try to  ${ctx.client.getSlashCommandMention(
                    "heal"
                )} yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                    "item use"
                )} or ${ctx.client.getSlashCommandMention("shop")})`,
                embeds: [],
                components: [],
            });
            return;
        }

        const bossChosen = ctx.options.getString("npc", true);

        if (
            (bossChosen === "confetti_golem" ||
                bossChosen === "pinata_titan" ||
                (bossChosen === "pale_dark" && ctx.userData.level < 150) ||
                bossChosen === "pale_dark_elite" ||
                (bossChosen === "krampus" && ctx.userData.level < 400)) &&
            ctx.guild.id !== "923608916540145694"
        ) {
            ctx.followUpQueue.push({
                content: `Looks like you're trying to raid the event boss. If you're alone and can't solo this boss, try to find people here --> https://discord.gg/jolyne-support-923608916540145694`,
                flags: MessageFlags.Ephemeral,
            });
        }
        const raid = fixedBosses.find((r) => r.boss.id === bossChosen);
        if (!raid) {
            ctx.makeMessage({
                content: "That boss doesn't exist!",
            });
            return;
        }

        const raidCost = (raid.baseRewards?.coins ?? 25000) * 3;
        if (raid.level > ctx.userData.level) {
            ctx.makeMessage({
                content: `You must to be at least level **${raid.level}** to raid this boss.`,
            });
            return;
        }

        if (raid.prestige && ctx.userData.prestige < raid.prestige) {
            ctx.makeMessage({
                content: `You must to be at least prestige **${raid.prestige}** to raid this boss.`,
            });
            return;
        }
        if (raidCost > ctx.userData.coins) {
            ctx.makeMessage({
                content: `You need ${raidCost.toLocaleString()} ${
                    ctx.client.localEmojis.jocoins
                } to raid this boss.`,
            });
            return;
        }
        if (bossChosen === "ice_golem" && getIceShard(ctx.userData) < 50) {
            return void ctx.makeMessage({
                content: `You need 50 <:ice_shard:1323363296719536158> Ice Shards to raid this boss.`,
            });
        }
        const joinRaidID = Functions.generateRandomId();
        const leaveRaidID = Functions.generateRandomId();
        const banUserFromRaidID = Functions.generateRandomId();
        const startRaidID = Functions.generateRandomId();
        const cooldownedUsers: string[] = [];

        const joinedUsers: RPGUserDataJSON[] = [ctx.userData];
        const bannedUsers: RPGUserDataJSON[] = [];

        const protectedBoss = Object.assign({}, cloneDeep(raid.boss));
        const enhancedBoss = {
            ...protectedBoss,
            level: Math.round(protectedBoss.level * 1.25),
        };

        Functions.generateSkillPoints(enhancedBoss, true);

        const joinRaidButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(joinRaidID)
            .setLabel(
                bossChosen === "ice_golem"
                    ? `Join Raid (${raidCost.toLocaleString(
                          "en-US"
                      )} coins and 50 Ice Shards required)`
                    : `Join Raid (${raidCost.toLocaleString()} coins required)`
            )
            .setEmoji(bossChosen === "ice_golem" ? "1323363296719536158" : "927974784187392061");
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
            `You are on a raid: ${enhancedBoss.name} cooldown!`
        );

        collector.on("end", () => {
            if (joinedUsers.length === 0) return;
            const users = [];
            if (raid.allies) for (const ally of raid.allies) users.push(ally);
            for (const user of joinedUsers) users.push(user);
            ctx.makeMessage({
                components: [],
            });

            const fight = new FightHandler(
                ctx,
                [[enhancedBoss, ...raid.minions], [...users]],
                FightTypes.Boss
            );
            attachRaidFightResultHandlers({
                ctx,
                fight,
                joinedUsers,
                enhancedBoss,
                raid,
                raidCost,
                bossChosen,
            });
        });

        collector.on("collect", async (interaction) => {
            interaction.deferUpdate().catch(() => {});
            const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
            if (!usrData) return;

            if (usrData.health < Functions.getMaxHealth(usrData) * 0.1) {
                if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                    safeRaidFollowUp(
                        ctx,
                        `<@${interaction.user.id}> tried to join the raid but they low in health.`
                    );
                    cooldownedUsers.push(interaction.user.id);
                }
                return;
            }
            switch (interaction.customId) {
                case joinRaidID: {
                    if (Functions.userIsCommunityBanned(usrData) || usrData.restingAtCampfire) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but they are either resting at a campfire or community banned.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }
                        return;
                    }

                    if (Functions.userIsCommunityBanned(ctx.userData)) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but the host is community banned.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }

                        return;
                    }
                    if (!(await ctx.client.database.canUseRPGCommand(usrData.id, "raid"))) {
                        return;
                    }
                    if (joinedUsers.length >= raid.maxPlayers) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but it is full.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }
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
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but they are too low level.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }

                        return;
                    }

                    if (usrData.prestige < raid.prestige) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but they are too low prestige.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }
                        return;
                    }
                    if (usrData.coins < raidCost) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but they don't have enough coins.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }
                        return;
                    }
                    if (bossChosen === "ice_golem" && getIceShard(usrData) < 50) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            safeRaidFollowUp(
                                ctx,
                                `<@${interaction.user.id}> tried to join the raid but they don't have enough Ice Shards.`
                            );
                            cooldownedUsers.push(interaction.user.id);
                        }
                        return;
                    }

                    joinedUsers.push(usrData);
                    cooldownedUsers.slice(
                        cooldownedUsers.findIndex((r) => r === interaction.user.id),
                        1
                    );
                    ctx.interaction
                        .followUp({
                            content: `${usrData.tag} has joined the raid.`,
                            flags: MessageFlags.Ephemeral,
                        })
                        .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    ctx.client.database.setCooldown(
                        usrData.id,
                        `You are on a raid: ${enhancedBoss.name} cooldown!`
                    );
                    makeMenuMessage();
                    break;
                }
                case leaveRaidID: {
                    // prevent host from leaving
                    if (usrData.id === joinedUsers[0].id && joinedUsers.length > 1) {
                        return;
                    }
                    if (!joinedUsers.find((r) => r.id === interaction.user.id)) {
                        return;
                    }
                    joinedUsers.splice(
                        joinedUsers.findIndex((r) => r.id === interaction.user.id),
                        1
                    );
                    ctx.client.database.deleteCooldown(usrData.id);
                    makeMenuMessage();
                    break;
                }
                case banUserFromRaidID: {
                    if (usrData.id !== joinedUsers[0].id) {
                        return;
                    }
                    if (joinedUsers.length <= 1) {
                        return;
                    }
                    const userToBan = joinedUsers.find(
                        (r) => r.id === (interaction as StringSelectMenuInteraction).values[0]
                    );
                    if (!userToBan) {
                        return;
                    }
                    if (userToBan.id === ctx.userData.id) {
                        return;
                    }
                    bannedUsers.push(userToBan);
                    joinedUsers.splice(
                        joinedUsers.findIndex((r) => r.id === userToBan.id),
                        1
                    );
                    ctx.client.database.deleteCooldown(userToBan.id);
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
                title: `${enhancedBoss.emoji} ${enhancedBoss.name} RAID`,
                description: `> \`Boss Level:\` ${enhancedBoss.level}\n> \`Coins required:\` ${
                    ctx.client.localEmojis.jocoins
                } ${raidCost.toLocaleString()}\n${
                    raid.prestige ? `> \`Prestige Requirement:\` ${raid.prestige}\n` : ""
                }> \`Min Level Requirement:\` ${
                    raid.level
                }\n> \`Maximum Level Requirement:\` ${raid.maxLevel.toLocaleString(
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
                            .map((i) => {
                                const itemData = Functions.findItem(i.item);
                                if (!itemData) return null;
                                return `> • **${i.amount.toLocaleString()}x** ${itemData.name} ${
                                    itemData.emoji
                                }${i.chance ? ` (** ${i.chance}% **)` : ""}`;
                            })
                            .filter((r) => r)
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
                                (r) =>
                                    `- ${r.tag} (Level: ${r.level}) [${r.health.toLocaleString(
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
                        .map((r) => `- ${r.emoji} ${r.name} (LEVEL: ${r.level})`)
                        .join("\n")}`,
                });
            if (raid.minions.length !== 0) {
                embed.fields.push({
                    name: `Minions [${raid.minions.length}]:`,
                    value: `\n${raid.minions
                        .map((r) => `- ${r.emoji} ${r.name} (LEVEL: ${r.level})`)
                        .join("\n")}`,
                });
            }

            if (bannedUsers.length !== 0) {
                embed.fields.push({
                    name: `Banned Users [${bannedUsers.length}]:`,
                    value: `\n${bannedUsers.map((r) => `${r.tag} (LEVEL: ${r.level})`).join("\n")}`,
                });
            }
            ctx.makeMessage({
                embeds: Functions.fixEmbeds([embed]),
                components,
            });
        }
        makeMenuMessage();
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const fixedBosses = getFixedBosses();

        const availableBosses = fixedBosses; //.filter((r) => r.level <= userData.level);

        interaction.respond(
            availableBosses
                .map((r) => {
                    return {
                        name: `${r.boss.name} (Level Requirement: ${r.level})`,
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
