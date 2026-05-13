// Post-dungeon rewards/finalize flow. Runs after the player(s) clear the
// last room of a `/dungeon` run: scales drops by damage share + modifiers,
// commits a transaction, edits the dungeon message with a per-player
// breakdown, and posts a webhook log with a side-by-side avatar canvas.

import { AttachmentBuilder } from "discord.js";
import { Image, createCanvas, loadImage } from "canvas";
import { cloneDeep } from "lodash";
import type { RPGUserDataJSON, StartDungeonQuest } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import DungeonHandler from "../../structures/DungeonHandler";
import * as Functions from "../../utils/Functions";
import { dungeonLogsWebhook } from "../../utils/Webhooks";
import { containers, COLORS, SectionData } from "../../utils/containers";
import {
    possibleModifiers,
    getTotalXpIncrease,
    getTotalDropIncrease,
    dungeonRewards as rewards,
} from "./dungeon_config";

const KARS = { emoji: "<:kars:1057261454421676092>", name: "Kars" } as const;
const karsLine = (text: string): string =>
    `${KARS.emoji} **${KARS.name}:** ${text}`;

const timeFn = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return {
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60,
    };
};

const msInMessage = (ms: number): string => {
    const time = timeFn(ms);
    return `${time.hours ? `${time.hours} hour${time.hours > 1 ? "s" : ""}, ` : ""}${
        time.minutes ? `${time.minutes} minute${time.minutes > 1 ? "s" : ""} and ` : ""
    }${time.seconds} second${time.seconds > 1 ? "s" : ""}`;
};

export async function giveRewards(
    dungeon: DungeonHandler,
    ctx: CommandInteractionContext,
    selectedModifiers: string[],
    endedUnexpectedly = false,
): Promise<void> {
    let xpRewards = 60000;
    let coinRewards = 0;
    let counter1 = 1;
    let counter2 = 1;

    for (const enemy of dungeon.beatenEnemies) {
        counter1++;
        if (counter1 > 5) {
            counter1 = 1;
            counter2 += 0.25;
        }
        xpRewards += (enemy.level * 1000) / counter2;
        coinRewards += (enemy.level * 100) / counter2;
        if (enemy.rewards) {
            if (enemy.rewards.xp) xpRewards += enemy.rewards.xp / 2 / counter2;
            if (enemy.rewards.coins) coinRewards += enemy.rewards.coins / 4 / counter2;
        }
    }

    xpRewards += dungeon.stage * 1000;
    coinRewards += dungeon.stage * 100;
    xpRewards = Math.round(xpRewards / 3.75);

    const players: RPGUserDataJSON[] = [];
    for (const player of dungeon.players) {
        const data = await ctx.client.database.getRPGUserData(player.id);
        if (!data) continue;
        players.push(data);
    }
    const newPlayers = cloneDeep(players);
    const userData = players.find((f) => f.id === ctx.userData.id);
    if ((userData.inventory["dungeon_key"] ?? 0) < 1) {
        const ownerId = process.env.OWNER_IDS?.split(",")[0];
        if (ownerId)
            ctx.client.users.fetch(ownerId).then((c) => {
                c.send(
                    `**${ctx.userData.tag}** (${ctx.userData.id}) with players (${newPlayers
                        .map((x) => x.id)
                        .join(", ")}) has tried to scam the dungeon system.`,
                );
            });
        return void ctx.makeMessage(
            containers.error(
                karsLine("Wait, where's your key? Did you just scam me? [ANTICHEAT ERROR]"),
            ),
        );
    }
    const totalDamage = Object.values(dungeon.damageDealt).reduce((a, b) => a + b, 0);

    const fixedPlayers: {
        oldData: RPGUserDataJSON;
        newData: RPGUserDataJSON;
    }[] = [];
    const results: boolean[] = [];
    for (const player of newPlayers) {
        const oldPlayer = cloneDeep(player);
        for (
            let i = 0;
            i < Math.round(dungeon.stage / 3) * getTotalDropIncrease(selectedModifiers);
            i++
        ) {
            for (const item of rewards) {
                const percent = (dungeon.damageDealt[player.id] / totalDamage) * item.percent;
                if (Functions.percent(percent)) {
                    Functions.addItem(player, item.id, 1);
                }
            }
        }

        const playerDiffPercent =
            players.length === 1
                ? 0
                : Math.abs(
                      (players[0].level - players[1].level) /
                          Math.max(players[0].level, players[1].level),
                  );
        Functions.addXp(
            player,
            Math.round(
                Math.round(
                    (dungeon.damageDealt[player.id] / totalDamage) *
                        xpRewards *
                        (players.length === 2
                            ? playerDiffPercent <= 0.5
                                ? 1.2
                                : Math.max(players[0].level, players[1].level) < 60
                                  ? 1.2
                                  : 1
                            : 1),
                ) * getTotalXpIncrease(selectedModifiers),
            ),
            ctx.client,
        );
        player.coins += coinRewards;
        player.health = 0;
        player.stamina = 0;

        for (const quests of [
            player.daily.quests,
            player.chapter.quests,
            ...player.sideQuests.map((v) => v.quests),
        ]) {
            for (const quest of quests.filter((x) => Functions.isStartDungeonQuest(x))) {
                let accepted = true;
                const realQuest = quest as unknown as StartDungeonQuest;
                if (!realQuest.completed) realQuest.completed = 0;
                if (realQuest.completed >= realQuest.total) {
                    continue;
                }
                if (realQuest.stage && realQuest.stage > dungeon.stage) {
                    accepted = false;
                }

                if (realQuest.modifiers) {
                    if (typeof realQuest.modifiers === "number") {
                        if (selectedModifiers.length < realQuest.modifiers) {
                            accepted = false;
                        }
                    } else if (!realQuest.modifiers.every((x) => selectedModifiers.includes(x))) {
                        accepted = false;
                    }
                }

                if (accepted) {
                    realQuest.completed++;
                    ctx.followUp({
                        content: `:white_check_mark: <@${player.id}> Your DungeonQUEST has been completed (\`${realQuest.id}\`)`,
                    });
                }
            }
        }

        if (
            player.id === ctx.userData.id &&
            (!ctx.client.maintenanceReason || !endedUnexpectedly)
        ) {
            results.push(Functions.removeItem(player, "dungeon_key", 1));
        }

        fixedPlayers.push({
            oldData: oldPlayer,
            newData: player,
        });
    }
    const Transaction = await ctx.client.database.handleTransaction(
        fixedPlayers,
        `Started a dungeon:: total of ${dungeon.stage} waves and beaten ${dungeon.beatenEnemies.length} enemies.`,
        results,
    );
    if (!Transaction) {
        dungeon.message
            .edit({ ...containers.error(karsLine("An error occurred.")) })
            .catch(() => {});
        return;
    }

    const playerSections: SectionData[] = Object.keys(dungeon.damageDealt).map((x) => {
        const tag = dungeon.players.find((f) => f.id === x)?.tag ?? x;
        const dmg = (dungeon.damageDealt[x] ?? 0).toLocaleString();
        const diff = Functions.getRewardsCompareData(
            players.find((f) => f.id === x),
            newPlayers.find((f) => f.id === x),
        )
            .map((line) => `> - ${line}`)
            .join("\n");
        return { text: `### 🗡️ **${tag}**\n> Damages dealt: **${dmg}**\n${diff}` };
    });

    const modifierLines = selectedModifiers.length
        ? selectedModifiers
              .map((x) => {
                  const modifier = possibleModifiers.find((f) => f.id === x);
                  return `> ${modifier?.emoji} **${Functions.capitalize(
                      x.replace(/_/g, " "),
                  )}:** ${modifier?.description}`;
              })
              .join("\n")
        : "> *None*";

    const summary = containers.primary({
        title: "# 🗝️ Dungeon Cleared",
        description: karsLine(
            `Well done, you survived **${dungeon.getRoom()}** waves and beat **${
                dungeon.beatenEnemies.length
            }** enemies (total damage: ${totalDamage.toLocaleString()}).`,
        ),
        descriptionDivider: true,
        sections: [
            ...playerSections,
            {
                text:
                    `### 🎲 Modifiers (x${getTotalXpIncrease(selectedModifiers)} XP, ` +
                    `x${getTotalDropIncrease(selectedModifiers)} Drop)\n${modifierLines}`,
            },
        ],
        sectionDividers: true,
        color: COLORS.primary,
    });
    dungeon.message.edit({ ...summary });
    const canvas = players.length === 2 ? createCanvas(1024, 512) : createCanvas(512, 512);
    const ctxCanvas = canvas.getContext("2d");

    const images: Image[] = [];
    for (const player of players) {
        const playerUser = await ctx.client.users.fetch(player.id);
        const image = await loadImage(playerUser.displayAvatarURL({ size: 512, extension: "png" }));
        images.push(image);
    }

    if (players.length === 2) {
        ctxCanvas.drawImage(images[0], 0, 0, 512, 512);
        ctxCanvas.drawImage(images[1], 512, 0, 512, 512);
    } else {
        ctxCanvas.drawImage(images[0], 0, 0, 512, 512);
    }

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "dungeon.png",
    });
    dungeonLogsWebhook.send({
        embeds: [
            {
                title: `Dungeon`,
                description: `cleared **${dungeon.getRoom()}** waves and beaten **${
                    dungeon.beatenEnemies.length
                }** enemies (total stage = ${dungeon.stage})`,
                color: 0x70926c,
                fields: [
                    {
                        name: "Host",
                        value: ctx.userData.tag,
                        inline: true,
                    },
                    {
                        name: "Time taken",
                        value: `${msInMessage(
                            Date.now() - dungeon.startedAt,
                        )} (started: ${Functions.generateDiscordTimestamp(
                            dungeon.startedAt,
                            "FULL_DATE",
                        )})`,
                        inline: true,
                    },
                    {
                        name: "Guild info",
                        value: `${ctx.guild.name} (${ctx.guild.id})`,
                        inline: true,
                    },
                    {
                        name: "Total damages",
                        value: Object.keys(dungeon.damageDealt)
                            .sort((a, b) => dungeon.damageDealt[b] - dungeon.damageDealt[a])
                            .map(
                                (r) =>
                                    `- ${
                                        dungeon.players.find((f) => f.id === r).tag
                                    } (${r}): **${dungeon.damageDealt[r].toLocaleString()}**`,
                            )
                            .join("\n"),
                    },
                    {
                        name: "Last enemy of the current wave",
                        value: dungeon.enemies[dungeon.enemies.length - 1]
                            ? `${dungeon.enemies[dungeon.enemies.length - 1].emoji} | ${
                                  dungeon.enemies[dungeon.enemies.length - 1].name
                              } (level ${dungeon.enemies[dungeon.enemies.length - 1].level})`
                            : "none, too bad",
                        inline: true,
                    },
                    {
                        name: "Rewards",
                        value: Object.keys(dungeon.damageDealt)
                            .map((r) => {
                                const player = players.find((f) => f.id === r);
                                const newPlayer = newPlayers.find((f) => f.id === r);
                                return `- **${player.tag}**: \n${Functions.getRewardsCompareData(
                                    player,
                                    newPlayer,
                                ).join("\n")}`;
                            })
                            .join("\n\n"),
                    },
                    {
                        name: "Modifiers",
                        value: selectedModifiers.length
                            ? selectedModifiers
                                  .map((x) => {
                                      const modifier = possibleModifiers.find((f) => f.id === x);
                                      return `- ${modifier?.emoji} ${Functions.capitalize(
                                          x.replace(/_/g, " "),
                                      )}: ${modifier?.description}`;
                                  })
                                  .join("\n")
                            : "None",
                    },
                ],
                image: {
                    url: "attachment://dungeon.png",
                },
                thumbnail: {
                    url: ctx.guild.iconURL(),
                },
                timestamp: new Date().toISOString(),
            },
        ],
        files: [attachment],
    });
}
