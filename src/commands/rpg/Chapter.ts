import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserQuest,
    ClaimXQuest,
    Quest,
} from "../../@types";
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

export const nextChapter = (chapterId: number): Chapter | ChapterPart => {
    const chapters = Object.values(Chapters).sort((a, b) => a.id - b.id);
    const parts = Object.values(ChapterParts).sort((a, b) => a.id - b.id);

    const chapter =
        chapters.find((v) => v.id === chapterId) || parts.find((v) => v.id === chapterId);
    if (chapter) {
        // warning: chapters are not 1, 2, 3 etc... it can be 1.1, 2.6 etc...
        const nextChapters = chapters.filter((v) => v.id > chapter.id);
        const nextPars = parts.filter((v) => v.id > chapter.id);
        if (nextChapters[0]?.id > nextPars[0]?.id) return nextPars[0];
        else return nextChapters[0];
    }
    return null;
};

console.log(nextChapter(1));
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
        )}\` - Part \`${Functions.romanize(getPartNumber(chapter))}\`: ${
            chapter.parent.title[userData.language]
        }`;
    }
};

export const getQuestsStats = (
    quests: RPGUserQuest[],
    ctx: CommandInteractionContext
): { message: string; percent: number } => {
    const message: string[] = [];
    let totalPercent = 0;

    for (const quest of quests) {
        let completed = false;
        let questPercent = 0;
        /*
        if (Functions.isMustReadEmailQuest(quest) || Functions.isActionQuest(quest)) {
            if (quest.completed) {
                completed = true;
                questPercent = 100;
            }
        }*/

        if (Functions.isWaitQuest(quest)) {
            questPercent = (Date.now() * 100) / quest.end;
            if (questPercent >= 100) {
                completed = true;
                questPercent = 100;
            }

            let content = `${
                quest.i18n_key
                    ? ctx.translate(`quest:${quest.i18n_key}.CHAP_DESC`)
                    : ctx.client.localEmojis.timerIcon
            } Quest ends ${Functions.generateDiscordTimestamp(quest.end, "FROM_NOW")}`;

            if (quest.email) {
                const mailData = Functions.findEmail(quest.email);
                content += ` (:envelope: You'll receive an email from **${mailData.author.name}**)`;
            }
            if (quest.quest) content += ` (+📜 ${quest.quest})`;
            content += ` ||(${questPercent}%)||`;
            message.push(content);
            totalPercent += questPercent;
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
                    emoji: Functions.findItem(quest.item).emoji,
                });
            } else if (Functions.isUseXCommandQuest(quest)) {
                const cmd = ctx.client.getSlashCommandMention(quest.command);
                questMessage = ctx.translate("quest:USE_COMMAND", {
                    cmd,
                    cc: quest.goal.toLocaleString("en-US"),
                    s: Functions.s(quest.goal),
                });
            } else {
                const emoji = {
                    daily: "📆",
                    coin: ctx.client.localEmojis.jocoins,
                    xp: ctx.client.localEmojis.xp,
                }[quest.x];

                questMessage = ctx.translate("quest:CLAIMX", {
                    cc: quest.goal.toLocaleString("en-US"),
                    s: Functions.s(quest.goal),
                    emoji,
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

            if (
                quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id).length === 1
            ) {
                if (!message.join(" ").includes(npc.name))
                    message.push(
                        `Defeat ${npc.name} ${npc.emoji} (${ctx.client.getSlashCommandMention(
                            "fight npc"
                        )}) ||(${questPercent === 1 ? ":white_check_mark:" : ":x:"})||`
                    );
            } else {
                if (!message.join(" ").includes(npc.name))
                    message.push(
                        `Defeat ${
                            quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id)
                                .length
                        } ${npc.name} ${npc.emoji} (${ctx.client.getSlashCommandMention(
                            "fight npc"
                        )}) ||(${
                            quests.filter(
                                (r) =>
                                    Functions.isFightNPCQuest(r) && r.npc === npc.id && r.completed
                            ).length
                        }/${
                            quests.filter((r) => Functions.isFightNPCQuest(r) && r.npc === npc.id)
                                .length
                        }) **${Math.round(questPercent * 100)}%**||`
                    );
            }
            totalPercent += questPercent * 100;
            continue;
        }

        if (Functions.isBaseQuest(quest)) {
            const originalQuest = Object.values(QuestsL).find((v) => v.id === quest.id);
            if (!originalQuest) {
                message.push(
                    `??? Unknown Base Quest (${quest.id}) ???::: ${JSON.stringify(quest)}`
                );
                totalPercent += 100;
                continue;
            }

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
        if (Functions.isActionQuest(quest)) {
            const originalQuest = Object.values(ActionQuestsL).find((v) => v.id === quest.id);
            if (!originalQuest) {
                message.push(
                    `??? Unknown Action Quest (${quest.id}) ???::: ${JSON.stringify(quest)}`
                );
                totalPercent += 100;
                continue;
            }

            questPercent += quest.completed ? 100 : 0;

            // prettier-ignore
            message.push(`${ctx.translate(`action:${originalQuest.i18n_key}.DESCRIPTION`)} ${
                    originalQuest.emoji
                } (${ctx.client.getSlashCommandMention("action")}) ||(${questPercent === 100 ? ":white_check_mark:" : ":x:"})||`
            );
            totalPercent += questPercent;
            continue;
        }
        if (Functions.isMustReadEmailQuest(quest)) {
            const emailData = Functions.findEmail(quest.email);
            if (!emailData) {
                totalPercent += 100;
                message.push(`??? Unknown Email (${quest.email}) ???::: ${JSON.stringify(quest)}`);
            } else {
                totalPercent += quest.completed ? 100 : 0;
                message.push(
                    `:envelope: Read the e-mail from **${emailData.author.name}** (subject: ${
                        emailData.subject
                    }) (${ctx.client.getSlashCommandMention("emails view")}) ||(${
                        quest.completed ? ":white_check_mark:" : ":x:"
                    })||`
                );
            }
            continue;
        }
        message.push(`??? Unknown Quest (${quest.id}) ???::: ${JSON.stringify(quest)}`);
        totalPercent += questPercent;
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

function getChapterOrChapterPartInfos(id: number): Chapter | ChapterPart {
    return (
        Object.values(Chapters).find((c) => c.id === id) ||
        Object.values(ChapterParts).find((c) => c.id === id) ||
        null
    );
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "chapter",
        description: "Show your current chapter progress",
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
                if (await ctx.antiCheat(true)) return;

                let status = getQuestsStats(ctx.userData.chapter.quests, ctx);
                if (status.percent !== 100) {
                    collector.stop();
                    return;
                }

                const newChap = nextChapter(ctx.userData.chapter.id);

                if (!newChap || newChap.private) {
                    collector.stop();
                    ctx.followUp({
                        content: `We're sorry, but this is the last chapter for now. We're working on new content!`,
                        ephemeral: true,
                    });
                    return;
                }

                if (newChap.rewardsWhenComplete) {
                    const winContent: string[] = [];

                    if (newChap.rewardsWhenComplete.coins) {
                        winContent.push(
                            `+**${newChap.rewardsWhenComplete.coins}** ${ctx.client.localEmojis.jocoins}`
                        );
                        Functions.addCoins(ctx.userData, newChap.rewardsWhenComplete.coins);
                    }

                    if (newChap.rewardsWhenComplete.email) {
                        const emailData = Functions.findEmail(newChap.rewardsWhenComplete.email);
                        if (emailData) {
                            Functions.addEmail(ctx.userData, newChap.rewardsWhenComplete.email);
                            winContent.push(
                                `+**${emailData.author.name}**:${emailData.subject} :envelope:`
                            );
                        }
                    }

                    if (newChap.rewardsWhenComplete.items)
                        for (const item of newChap.rewardsWhenComplete.items) {
                            Functions.addItem(
                                ctx.userData,
                                Functions.findItem(item.item),
                                item.amount
                            );
                            winContent.push(
                                `+${item.amount} ${Functions.findItem(item.item).name} ${
                                    Functions.findItem(item.item).emoji
                                }`
                            );
                        }
                    ctx.followUp({
                        content: `You have completed the chapter and received the following rewards:\n${winContent.join(
                            ", "
                        )}`,
                    });
                }

                ctx.userData.chapter.quests = newChap.quests.map((x) => Functions.pushQuest(x));
                ctx.userData.chapter.id = newChap.id;

                status = getQuestsStats(ctx.userData.chapter.quests, ctx);

                await ctx.client.database.saveUserData(ctx.userData);

                ctx.followUp({
                    content: `${makeChapterTitle(newChap, ctx.userData)}\n\`\`\`\n${
                        newChap.description[ctx.userData.language]
                    }\n\`\`\`\n\n📜 **__Quests:__** (${status.percent.toFixed(2)}%)\n${
                        status.message
                    }`,
                });

                // TODO: if chap dialogues...

                // ...
            });
        }

        ctx.makeMessage({
            content: `${makeChapterTitle(chapter, ctx.userData)}\n\`\`\`\n${
                chapter.description[ctx.userData.language]
            }\n\`\`\`\n\n📜 **__Quests:__** (${status.percent.toFixed(2)}%)\n${status.message}`,
            components: components.length === 0 ? [] : [Functions.actionRow(components)],
        });
    },
};

export default slashCommand;
