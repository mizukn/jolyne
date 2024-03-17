import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
    RPGUserDataJSON,
} from "../../@types";
import {
    Message,
    APIEmbed,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import DungeonHandler from "../../structures/DungeonHandler";
import { cloneDeep } from "lodash";

const rewards = [
    {
        id: "stand_arrow",
        percent: 70,
    },
    {
        id: "rare_stand_arrow",
        percent: 35,
    },
    {
        id: "dungeon_key",
        percent: 3,
    },
    {
        id: "broken_arrow",
        percent: 100,
    },
    {
        id: "bloody_knife",
        percent: 0.5,
    },
    {
        id: "gauntlets_of_the_berserker",
        percent: 0.3,
    },
    {
        id: "dios_knives",
        percent: 0.2,
    },
    {
        id: "megumins_wand",
        percent: 0.2,
    },
];

const slashCommand: SlashCommandFile = {
    data: {
        name: "dungeon",
        description: "Start a dungeon.",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const clientMember =
            ctx.interaction.guild.members.cache.get(ctx.user.id) ||
            (await ctx.interaction.guild.members.fetch(ctx.user.id));
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

        await ctx.makeMessage({
            content: `<:kars:1057261454421676092> **Kars:** ${ctx.userData.tag} is hosting a dungeon! (1/2)`,
            embeds: [],
            components: [Functions.actionRow([joinButton, startButton, cancelButton])],
        });
        const collector = ctx.channel.createMessageComponentCollector({
            time: 60000,
            filter: (i) => i.customId.includes(ctx.interaction.id),
        });

        collector.on("collect", async (i) => {
            if (i.customId === "join_dungeon" + ctx.interaction.id) {
                if (totalPlayers.length >= 2) {
                    return void i.reply({
                        content: "This dungeon is full.",
                        ephemeral: true,
                    });
                }

                if (totalPlayers.find((f) => f.id === i.user.id)) {
                    return void i.reply({
                        content: "You're already in this dungeon.",
                        ephemeral: true,
                    });
                }
                const data = await ctx.client.database.getRPGUserData(i.user.id);
                if (!data) return;
                totalPlayers.push(data);
                i.reply({
                    content: "You've joined the dungeon.",
                    ephemeral: true,
                });
                await ctx.makeMessage({
                    content: `<:kars:1057261454421676092> **Kars:** ${data.tag} has joined the dungeon! (${totalPlayers.length}/2)`,
                    embeds: [],
                    components: [Functions.actionRow([startButton, cancelButton])],
                });
            } else if (i.customId === "start_dungeon" + ctx.interaction.id) {
                const message = await ctx.interaction.channel.send(`Initializing dungeon...`);
                ctx.makeMessage({
                    content: `<:kars:1057261454421676092> **Kars:** The dungeon has started! ${Functions.generateMessageLink(
                        message
                    )}`,
                    embeds: [],
                    components: [],
                });

                const dungeon = new DungeonHandler(ctx, totalPlayers, message);

                dungeon.on("end", async (reason: string) => {
                    if (reason === "maintenance" || ctx.client.maintenanceReason) {
                        message.reply({
                            content: `The dungeon has ended due to maintenance: \`${ctx.client.maintenanceReason}\`. The host has been refunded a dungeon key but you still get the rewards.`,
                        });
                    }

                    let xpRewards = 0;
                    let coinRewards = 0;

                    for (const enemy of dungeon.beatenEnemies) {
                        xpRewards += enemy.level * 1000;
                        coinRewards += enemy.level * 100;
                        if (enemy.rewards) {
                            if (enemy.rewards.xp) xpRewards += enemy.rewards.xp;
                            if (enemy.rewards.coins) coinRewards += enemy.rewards.coins;
                        }
                    }

                    xpRewards += dungeon.stage * 1000;
                    coinRewards += dungeon.stage * 100;
                    xpRewards = Math.round(xpRewards / 2.5);

                    const players: RPGUserDataJSON[] = [];
                    for (const player of dungeon.players) {
                        const data = await ctx.client.database.getRPGUserData(player.id);
                        if (!data) continue;
                        players.push(data);
                    }
                    const newPlayers = cloneDeep(players);
                    const userData = players.find((f) => f.id === ctx.userData.id);
                    if ((userData.inventory["dungeon_key"] ?? 0) < 1) {
                        ctx.client.users.fetch("239739781238620160").then((c) => {
                            c.send(
                                `**${ctx.userData.tag}** (${
                                    ctx.userData.id
                                }) with players (${newPlayers
                                    .map((x) => x.id)
                                    .join(", ")}) has tried to scam the dungeon system.`
                            );
                        });
                        return ctx.makeMessage({
                            content:
                                "<:kars:1057261454421676092> **Kars:** Wait, where's your key? Did you just scam me? [ANTICHEAT ERROR]",
                            embeds: [],
                            components: [],
                        });
                    }
                    const totalDamage = Object.values(dungeon.damageDealt).reduce(
                        (a, b) => a + b,
                        0
                    );

                    for (const player of newPlayers) {
                        for (let i = 0; i < Math.round(dungeon.stage / 3); i++) {
                            for (const item of rewards) {
                                const percent =
                                    (dungeon.damageDealt[player.id] / totalDamage) * item.percent;
                                if (Functions.percent(percent)) {
                                    Functions.addItem(player, item.id, 1);
                                }
                            }
                        }

                        player.xp += Math.round(
                            (dungeon.damageDealt[player.id] / totalDamage) * xpRewards
                        );
                        player.coins += coinRewards;
                        player.health = 0;
                        player.stamina = 0;

                        if (player.id === ctx.userData.id && !ctx.client.maintenanceReason)
                            Functions.removeItem(player, "dungeon_key", 1);

                        ctx.client.database.saveUserData(player);
                    }
                    message.edit({
                        content: `<:kars:1057261454421676092> **Kars:** well done, you've survived **${dungeon.getRoom()}** waves and beaten **${
                            dungeon.beatenEnemies.length
                        }** enemies (total damage: ${totalDamage.toLocaleString(
                            "en-US"
                        )}).\n\n${Object.keys(dungeon.damageDealt)
                            .map((x) => {
                                return `- **${dungeon.players.find((f) => f.id === x).tag}**: ${(
                                    dungeon.damageDealt[x] ?? 0
                                ).toLocaleString(
                                    "en-US"
                                )} damages dealt\n- - ${Functions.getRewardsCompareData(
                                    players.find((f) => f.id === x),
                                    newPlayers.find((f) => f.id === x)
                                ).join("\n- - ")}`;
                            })
                            .join("\n\n")}`,
                        embeds: [],
                        components: [],
                    });
                });
                collector.stop("start");
            } else if (i.customId === "cancel_dungeon" + ctx.interaction.id) {
                ctx.interaction.deleteReply();
                collector.stop("cancel");
            }
        });
    },
};

export default slashCommand;
