import { SlashCommandFile, Chapter, ChapterPart, RPGUserQuest, ClaimXQuest } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import * as QuestsL from "../../rpg/Quests/Quests";
import * as ActionQuestsL from "../../rpg/Quests/ActionQuests";

export const isChapterPart = (chapter: Chapter | ChapterPart): chapter is ChapterPart => {
    return (chapter as ChapterPart).parent !== undefined;
};

export const makeChapterTitle = (
    chapter: Chapter | ChapterPart,
    userData: CommandInteractionContext["RPGUserData"]
): string => {
    const chapters = Object.values(Chapters).sort((a, b) => a.id - b.id);
    const parts = Object.values(ChapterParts).sort((a, b) => a.id - b.id);

    function getChapterNumber(chapter: Chapter): number {
        return chapters.indexOf(chapter) + 1;
    }
    function getPartNumber(part: ChapterPart): number {
        const commonParts = parts.filter((v) => v.parent.id === part.parent.id);
        return commonParts.indexOf(part) + 2;
    }

    if (!isChapterPart(chapter)) {
        // check if there are chapter parts with himself as parent. if true then it is part 1
        if (parts.some((v) => v.parent.id === chapter.id))
            return `🔱 Chapter \`${Functions.romanize(getChapterNumber(chapter))}\` - Part \`I\`: ${
                chapter.title[userData.language]
            }`;
        else
            return `🔱 Chapter \`${Functions.romanize(getChapterNumber(chapter))}\`: ${
                chapter.title[userData.language]
            }`;
    } else {
        return `🔱 Chapter \`${Functions.romanize(
            getChapterNumber(chapter.parent)
        )}\` - Part \`${Functions.romanize(getPartNumber(chapter))}\`: ${chapter.title}`;
    }
};

export const getQuestsStats = (
    quests: RPGUserQuest[],
    ctx: CommandInteractionContext
): { message: string; percent: number } => {
    const message: string[] = [];
    let totalPercent = 0;

    for (const quest of quests) {
        console.log(quest.id);
        let completed = false;
        let questPercent = 0;
        if (Functions.isMustReadEmailQuest(quest) || Functions.isActionQuest(quest)) {
            if (quest.completed) {
                completed = true;
                questPercent = 100;
            }
        }

        if (Functions.isWaitQuest(quest)) {
            if (quest.end > Date.now()) {
                questPercent = 100;
                completed = true;
            }
            let content = `${ctx.client.localEmojis.timerIcon} ${Functions.generateDiscordTimestamp(
                quest.end,
                "FROM_NOW"
            )}`;

            if (quest.email) content += ` (+:envelope: ${quest.email})`;
            if (quest.quest) content += ` (+:scroll: ${quest.quest})`;
            message.push(content);
            continue;
        }

        if (
            Functions.isClaimXQuest(quest) ||
            Functions.isClaimItemQuest(quest) ||
            Functions.isUseXCommandQuest(quest)
        ) {
            if (quest.goal <= quest.amount) {
                completed = true;
                questPercent = 100;
            } else questPercent = Math.round((quest.amount / quest.goal) * 100);

            let questMessage = `Claim **${quest.goal.toLocaleString(
                "en-US"
            )}** {{name}} ||(${quest.amount.toLocaleString("en-US")}/${quest.goal.toLocaleString(
                "en-US"
            )}) **${questPercent}%**||`;
            const questEnd = ` ||(${quest.amount.toLocaleString(
                "en-US"
            )}/${quest.goal.toLocaleString("en-US")}) **${questPercent}%**||`;

            if (Functions.isClaimItemQuest(quest)) {
                questMessage = questMessage.replace(
                    "{{name}}",
                    Functions.findItem(quest.item).name
                );
                questMessage = ctx.translate("quest:CLAIMX", {
                    cc: quest.goal.toLocaleString("en-US"),
                    s: Functions.s(quest.goal),
                    name: Functions.findItem(quest.item).name,
                });
            } else if (Functions.isUseXCommandQuest(quest)) {
                const cmd = ctx.client.getSlashCommandMention(quest.command);
                questMessage = ctx.translate("quest:USE_COMMAND", {
                    cmd,
                    cc: quest.goal.toLocaleString("en-US"),
                    s: Functions.s(quest.goal),
                });
            } else {
                questMessage = ctx.translate("quest:CLAIMX", {
                    cc: quest.goal.toLocaleString("en-US"),
                    s: Functions.s(quest.goal),
                    name:
                        quest.x +
                        (quest.x === "daily"
                            ? ` (${ctx.client.getSlashCommandMention("daily claim")})`
                            : ""),
                });
            }

            message.push(questMessage + questEnd);

            totalPercent += questPercent;
            continue;
        }

        if (Functions.isFightNPCQuest(quest)) {
            const npc = Object.values(FightableNPCS).find((v) => v.id === quest.npc);
            questPercent =
                quests.filter(
                    (r) => Functions.isFightNPCQuest(r) && r.npc === npc.id && r.completed
                ).length /
                quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id).length;
            if (questPercent === 1) completed = true;

            if (message.join(" ").includes(npc.name)) continue;
            if (
                quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id).length === 1
            ) {
                message.push(
                    `Defeat ${npc.name} ${npc.emoji} (${ctx.client.getSlashCommandMention(
                        "fight npc"
                    )}) ||(${questPercent === 1 ? ":white_check_mark:" : ":x:"})||`
                );
            } else
                message.push(
                    `Defeat ${
                        quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id)
                            .length
                    } ${npc.name} ${npc.emoji} (${ctx.client.getSlashCommandMention(
                        "fight npc"
                    )}) ||(${
                        quests.filter(
                            (r) => Functions.isFightNPCQuest(r) && r.npc === npc.id && r.completed
                        ).length
                    }/${
                        quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id)
                            .length
                    }) **${Math.round(questPercent * 100)}%**||`
                );
            totalPercent += questPercent * 100;
            continue;
        }

        // is base quest
        if (Object.keys(quest).length === 1) {
            const originalQuest = Object.values(QuestsL).find((v) => v.id === quest.id);
            if (!originalQuest) continue;

            const questPerc = originalQuest.completed(ctx.userData);
            totalPercent += questPerc;

            // prettier-ignore
            message.push(`${ctx.translate(`quest:${originalQuest.i18n_key}.DESCRIPTION`)} ${
                    originalQuest.emoji
                }${originalQuest.hintCommand ? ` (${ctx.client.getSlashCommandMention(originalQuest.hintCommand)})` : ""} ||(${questPerc}%)||`
            );
            continue;
        }
        // is action quest
        if (Object.keys(quest).length === 2) {
            const originalQuest = Object.values(ActionQuestsL).find((v) => v.id === quest.id);
            if (!originalQuest) continue;

            totalPercent += quest.completed ? 100 : 0;

            // prettier-ignore
            message.push(`${ctx.translate(`action:${originalQuest.i18n_key}.DESCRIPTION`)} ${
                    originalQuest.emoji
                } ({{command.action}}) ||(${totalPercent === 100 ? ":white_check:mark" : ":x:"})||`
            );
            continue;
        }
        message.push(`??? Unknown Quest (${quest.id}) ???::: ${JSON.stringify(quest)}`);
        totalPercent += 100;
    }

    return {
        message: message
            .map((v, i) => {
                // check if it is last message
                if (i === message.length - 1) return `${ctx.client.localEmojis.replyEnd} ${v}`;
                else return `${ctx.client.localEmojis.reply} ${v}`;
            })
            .join("\n"),
        percent: totalPercent / quests.length,
    };
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "chapter",
        description: "neeeega",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const status = getQuestsStats(ctx.userData.chapter.quests, ctx);
        const chapter =
            Object.values(Chapters).find((c) => c.id === ctx.userData.chapter.id) ||
            Object.values(ChapterParts).find((c) => c.id === ctx.userData.chapter.id);

        const components: ButtonBuilder[] = [];

        if (status.percent === 100) {
            components.push(
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next")
                    .setEmoji(ctx.client.localEmojis.arrowRight)
                    .setStyle(ButtonStyle.Primary)
            );
            const filter = (i: MessageComponentInteraction) => {
                i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                return i.customId === "next" && i.user.id === ctx.user.id;
            };
            const collector = ctx.interaction.channel.createMessageComponentCollector({
                filter,
                time: 30000,
            });
            collector.on("collect", async (i) => {
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

                const status = getQuestsStats(ctx.userData.chapter.quests, ctx);
                if (status.percent !== 100) {
                    collector.stop();
                    return;
                }
                // ...
            });
        }

        ctx.makeMessage({
            content: `${makeChapterTitle(chapter, ctx.userData)}\n\`\`\`\n${
                isChapterPart(chapter)
                    ? chapter.parent.description[ctx.userData.language]
                    : chapter.description[ctx.userData.language]
            }\n\`\`\`\n\n:scroll: **__Quests:__** (${status.percent.toFixed(2)}%)\n${
                status.message
            }`,
            components: components.length === 0 ? [] : [Functions.actionRow(components)],
        });
    },
};

export default slashCommand;
