import {
    FightableNPC,
    RPGUserDataJSON,
    RaidBoss,
    RaidNPCQuest,
    SlashCommandFile,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Bosses from "../../rpg/Raids";
import { raidWebhook } from "../../utils/Webhooks";
import { cloneDeep } from "lodash";
import { FightableNPCS } from "../../rpg/NPCs";

const eventRaid: RaidBoss = {
    boss: FightableNPCS.ConfettiGolem,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 50000,
        xp: Functions.getMaxXp(FightableNPCS.ConfettiGolem.level),
        items: [
            {
                item: Functions.findItem("Confetti").id,
                amount: 1,
                chance: 50,
            },
            {
                item: Functions.findItem("second").id,
                amount: 1,
                chance: 15,
            },
        ],
    },
    allies: [FightableNPCS.Jolyne],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000,
};

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
        const fixedBosses = cloneDeep(Object.values(Bosses));
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
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/jolyne-support-923608916540145694`,
                    });
                } else {
                    ctx.followUpQueue.push({
                        content: `${ctx.client.localEmojis["2ndAnniversaryBackpack"]}${
                            ctx.client.localEmojis["ConfettiBazooka"]
                        } | Looking for the event raid? It will be available ${Functions.generateDiscordTimestamp(
                            Functions.roundToNext15Minutes(new Date()),
                            "FROM_NOW"
                        )} at **this exact time**. If the boss is too strong for you, make sure to ask help in the support server! https://discord.gg/jolyne-support-923608916540145694`,
                    });
                }
            }
        }

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

        if (bossChosen === "confetti_golem" && ctx.guild.id !== "923608916540145694") {
            ctx.followUpQueue.push({
                content: `Looks like you're trying to raid the event boss. If you're alone and can't solo this boss, try to find people here --> https://discord.gg/jolyne-support-923608916540145694`,
            });
            return;
        }
        const raid = fixedBosses.find((r) => r.boss.id === bossChosen);
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
        const cooldownedUsers: string[] = [];

        const joinedUsers: RPGUserDataJSON[] = [ctx.userData];
        const bannedUsers: RPGUserDataJSON[] = [];

        const protectedBoss = Object.assign({}, cloneDeep(raid.boss));
        const enhancedBoss = {
            ...protectedBoss,
            level: Math.round(protectedBoss.level * 1.25),
        };

        Functions.generateSkillPoints(enhancedBoss);

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
            `You are on a raid: ${enhancedBoss.name} cooldown!`
        );

        collector.on("end", () => {
            if (joinedUsers.length === 0) return;
            const users = [];
            if (raid.allies) for (const ally of raid.allies) users.push(ally);
            for (const user of joinedUsers) users.push(user);

            const fight = new FightHandler(
                ctx,
                [[enhancedBoss, ...raid.minions], [...users]],
                FightTypes.Boss
            );
            fight.on("end", async (winners, losers) => {
                for (const user of joinedUsers) {
                    ctx.client.database.deleteCooldown(user.id);
                    await ctx.client.database.setRPGCooldown(user.id, "raid", raid.cooldown);
                }
                raidWebhook.send({
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
                                    value: losers
                                        .map((team) => team.map((r) => r.name).join(", "))
                                        .join("\n"),
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
                });
                if (winners.find((r) => r.id === joinedUsers[0].id)) {
                    for (const winner of winners) {
                        console.log("winner:", winner.id);
                        if (!joinedUsers.find((r) => r.id === winner.id)) continue;
                        console.log("found human:", winner.id);
                        const winnerData = await ctx.client.database.getRPGUserData(winner.id);
                        if (!winnerData) continue;
                        console.log("winnerData:", winnerData.id);
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
                            // only give xps based of winner.totalDamageDealt . If totalDamageDealth is the boss.raid.health or higher, give full xp. Faites le proportionnellement
                            let xp = /*Math.round(
                                winner.health === 0 ? raid.baseRewards.xp / 4 : raid.baseRewards.xp
                            );*/ Math.round(
                                (winner.totalDamageDealt / Functions.getMaxHealth(enhancedBoss)) *
                                    raid.baseRewards.xp
                            );

                            xp = Functions.addXp(winnerData, xp);
                            winContent.push(
                                `+**${xp.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp}`
                            );
                        }
                        if (raid.baseRewards.items.length > 0) {
                            for (const item of raid.baseRewards.items) {
                                const chance = Math.round(
                                    (winner.totalDamageDealt /
                                        Functions.getMaxHealth(enhancedBoss)) *
                                        item.chance
                                );
                                if (item.chance && Functions.RNG(0, 100) > chance) continue;
                                const itemData = Functions.findItem(item.item);
                                if (!itemData) continue;
                                Functions.addItem(winnerData, itemData.id, item.amount);
                                winContent.push(
                                    `${item.amount}x ${itemData.emoji} **${itemData.name}** (${chance}%)`
                                );
                            }
                        }
                        winnerData.health = winner.health;
                        if (winnerData.stamina > winner.stamina)
                            winnerData.stamina = winner.stamina;

                        for (const quests of [
                            winnerData.daily.quests,
                            winnerData.chapter.quests,
                            ...winnerData.sideQuests.map((v) => v.quests),
                        ]) {
                            for (const quest of quests.filter((x) => Functions.isRaidNPCQuest(x))) {
                                console.log(quest);
                                if (
                                    (quest as RaidNPCQuest).boss === enhancedBoss.id &&
                                    !quest.completed
                                ) {
                                    quest.completed = true;
                                    ctx.followUp({
                                        content: `:white_check_mark: <@${winner.id}> Your RaidQUEST has been completed (\`${quest.id}\`)`,
                                    });
                                    break;
                                }
                            }
                        }

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
                            if (!joinedUsers.find((r) => r.id === loser.id)) continue;
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
            interaction.deferUpdate().catch(() => {});
            const usrData = await ctx.client.database.getRPGUserData(interaction.user.id);
            if (!usrData) return;
            if (Functions.userIsCommunityBanned(usrData) || usrData.restingAtCampfire) {
                if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                    ctx.followUp({
                        content: `<@${interaction.user.id}> tried to join the raid but they are either resting at a campfire or community banned.`,
                    });
                    cooldownedUsers.push(interaction.user.id);
                }
                return;
            }

            if (Functions.userIsCommunityBanned(ctx.userData)) {
                if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                    ctx.followUp({
                        content: `<@${ctx.userData.id}> tried to join the raid but the host is community banned.`,
                    });
                    cooldownedUsers.push(interaction.user.id);
                }

                return;
            }
            if (usrData.health < Functions.getMaxHealth(usrData) * 0.1) {
                if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                    ctx.followUp({
                        content: `<@${interaction.user.id}> tried to join the raid but they low in health.`,
                    });
                    cooldownedUsers.push(interaction.user.id);
                }
                return;
            }
            switch (interaction.customId) {
                case joinRaidID: {
                    if (joinedUsers.length >= raid.maxPlayers) {
                        if (!cooldownedUsers.find((r) => r === interaction.user.id)) {
                            ctx.followUp({
                                content: `<@${interaction.user.id}> tried to join the raid but it is full.`,
                            });
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
                            ctx.followUp({
                                content: `<@${interaction.user.id}> tried to join the raid but they are too low level.`,
                            });
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
                            ephemeral: true,
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
                description: `> \`Min Level Requirement:\` ${
                    raid.level
                }\n> \`Maximum Level Requirement:\` ${
                    raid.maxLevel
                }\n> \`Cooldown:\` ${Functions.msToString(
                    raid.cooldown
                )}\n> \`Auto Starts\` ${Functions.generateDiscordTimestamp(startRaid, "FROM_NOW")}`,
                fields: [
                    {
                        name: "Rewards:",

                        value: `> - **${(raid.baseRewards.coins ?? 0).toLocaleString("en-US")}**${
                            ctx.client.localEmojis.jocoins
                        }\n> - **${(raid.baseRewards.xp ?? 0).toLocaleString("en-US")}**${
                            ctx.client.localEmojis.xp
                        }\n${raid.baseRewards.items
                            .map((i) => {
                                const itemData = Functions.findItem(i.item);
                                if (!itemData) return null;
                                return `> • **${i.amount.toLocaleString("en-US")}x** ${
                                    itemData.name
                                } ${itemData.emoji}${i.chance ? ` (** ${i.chance}% **)` : ""}`;
                            })
                            .filter((r) => r)
                            .join("\n")}${
                            raid.baseRewards.items.length !== 0
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
                ],
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
        const fixedBosses = cloneDeep(Object.values(Bosses));
        if (Date.now() < 1707606000000) {
            fixedBosses.push(eventRaid);
        }

        const availableBosses = fixedBosses.filter((r) => r.level <= userData.level);

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
