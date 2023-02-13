import { SlashCommandFile, Chapter, ChapterPart } from "../../@types";
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

const slashCommand: SlashCommandFile = {
    data: {
        name: "chapter",
        description: "neeeega",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const status = Functions.getQuestsStats(ctx.userData.chapter.quests, ctx);
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

                const status = Functions.getQuestsStats(ctx.userData.chapter.quests, ctx);
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
            }\n\`\`\`\n\n${status.message}`,
            components: components.length === 0 ? [] : [Functions.actionRow(components)],
        });
    },
};

export default slashCommand;
