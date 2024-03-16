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
import { Message, APIEmbed, InteractionResponse, ButtonBuilder, ButtonStyle } from "discord.js";
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
        description: "issou",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
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
                const dungeon = new DungeonHandler(ctx, totalPlayers);

                dungeon.on("end", async () => {
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

                    const players: RPGUserDataJSON[] = [];
                    for (const player of dungeon.players) {
                        const data = await ctx.client.database.getRPGUserData(player.id);
                        if (!data) continue;
                        players.push(data);
                    }
                    const newPlayers = cloneDeep(players);
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

                        if (player.id === ctx.userData.id)
                            Functions.removeItem(player, "dungeon_key", 1);

                        ctx.client.database.saveUserData(player);
                    }
                    ctx.makeMessage({
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
