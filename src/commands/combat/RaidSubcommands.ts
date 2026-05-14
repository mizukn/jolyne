import {
    RPGUserDataJSON,
    SlashCommandFile,
} from "../../@types";
import {
    Message,
    ApplicationCommandOptionType,
    MessageFlags,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { cloneDeep } from "lodash";
import { eventRaid, getFixedBosses } from "../../rpg/SeasonalRaids";
import { handleRaidLobbyInteraction } from "./raid_lobby";
import { buildRaidLobbyMessage, createRaidLobbyButtons } from "./raid_menu";
import {
    attachRaidFightResultHandlers,
    getIceShard,
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

        const buttons = createRaidLobbyButtons({
            bossChosen,
            joinRaidID,
            leaveRaidID,
            raidCost,
            startRaidID,
        });

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
            await handleRaidLobbyInteraction({
                ctx,
                interaction,
                customIds: {
                    joinRaidID,
                    leaveRaidID,
                    banUserFromRaidID,
                    startRaidID,
                },
                joinedUsers,
                bannedUsers,
                cooldownedUsers,
                raid,
                raidCost,
                bossChosen,
                enhancedBoss,
                refreshLobby: makeMenuMessage,
                startRaid: () => collector.stop(),
            });
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

            ctx.makeMessage(
                buildRaidLobbyMessage({
                    ctx,
                    raid,
                    enhancedBoss,
                    joinedUsers,
                    bannedUsers,
                    raidCost,
                    startRaid,
                    banUserFromRaidID,
                    buttons,
                })
            );
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
