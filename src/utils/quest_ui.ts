import type { ClaimXQuest, NPC, RequirementStatus, RPGUserQuest, SideQuest } from "../@types";
import type CommandInteractionContext from "../structures/CommandInteractionContext";
import {
    isActionQuest,
    isAnswerChineseNewYearQuizQuest,
    isClaimItemQuest,
    isFightNPCQuest,
    isMustReadEmailQuest,
    isRaidNPCQuest,
    isStartDungeonQuest,
    isUseXCommandQuest,
    isWaitQuest,
} from "./quest_guards";

const isClaimXQuest = (quest: RPGUserQuest): quest is ClaimXQuest => {
    return (quest as ClaimXQuest).type === "claimX";
};

const findItemEmoji = (itemId: string): string | undefined => {
    // Lazy load to keep this UI module from pulling the whole RPG registry during tests.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { findItem } = require("./lookup") as typeof import("./lookup");
    return findItem(itemId)?.emoji;
};

export const QUEST_LIST_ACCENT_COLOR = 0xf5a14f;
export const QUEST_LIST_ITEMS_PER_PAGE = 3;

export const makeNPCLine = (npc: Pick<NPC, "emoji" | "name">, text: string): string => {
    return `${npc.emoji ?? ""} **${npc.name}:** ${text}`.trim();
};

const normalizeQuestProgressText = (progress: string): string => {
    return progress
        .trim()
        .replace(/^\((.*)\)$/, "$1")
        .replace(/\*\*/g, "")
        .replace(/:white_check_mark:/g, "✅")
        .replace(/:x:/g, "❌");
};

export const formatQuestListLine = (line: string): string => {
    return line
        .replace(/^<a?:reply(?:End)?:\d+>\s*/i, "")
        .replace(/^<a?:[^:]+:\d+>\s*/i, "")
        .replace(/\s*\|\|(.*?)\|\|/g, (_, progress: string) => {
            return `\n> Progression: ${normalizeQuestProgressText(progress)}`;
        })
        .replace(/[^\S\n]{2,}/g, " ")
        .trim();
};

export const getQuestProgressText = (line: string): string => {
    const progress = line.match(/\|\|(.*?)\|\|/)?.[1];
    if (!progress) return "In progress";
    return normalizeQuestProgressText(progress);
};

export const getQuestDisplayEmoji = (
    quest: RPGUserQuest,
    ctx: CommandInteractionContext,
): string => {
    if (isFightNPCQuest(quest)) return "⚔️";
    if (isRaidNPCQuest(quest)) return "💣";
    if (isStartDungeonQuest(quest)) return "🗝️";
    if (isMustReadEmailQuest(quest)) return "✉️";
    if (isWaitQuest(quest)) return ctx.client.localEmojis.timerIcon ?? "⏳";
    if (isActionQuest(quest)) return quest.emoji ?? "✨";
    if (isAnswerChineseNewYearQuizQuest(quest)) return "❓";
    if (isClaimItemQuest(quest)) return findItemEmoji(quest.item) ?? "🎁";
    if (isClaimXQuest(quest)) {
        return {
            coin: ctx.client.localEmojis.jocoins,
            xp: ctx.client.localEmojis.xp,
            daily: "📆",
            social_credit: ctx.client.localEmojis.social_credit,
        }[quest.x];
    }
    if (isUseXCommandQuest(quest)) {
        return (
            {
                assault: "⚔️",
                loot: "🎁",
                raid: "💣",
                dungeon: "🗝️",
                slots: "🎰",
                blackjack: "🃏",
            }[quest.command] ?? "▶️"
        );
    }
    return "emoji" in quest && typeof quest.emoji === "string" ? quest.emoji : "📜";
};

export const buildQuestListRows = (
    ctx: CommandInteractionContext,
    quests: RPGUserQuest[],
    statusMessage: string,
    _customIdPrefix?: string,
    rewardLine?: (quest: RPGUserQuest, index: number) => string | null,
): { text: string }[] => {
    return statusMessage
        .split("\n")
        .filter(Boolean)
        .map((line) => line.trim())
        .map((line, index) => {
            const quest = quests[index] ?? quests[0];
            const cleanedLine = formatQuestListLine(line).split("\n> Progression:")[0].trim();
            const rewards = quest ? rewardLine?.(quest, index) : null;
            const rewardText = rewards ? `\n> Rewards: ${rewards}` : "";

            return {
                text:
                    `${quest ? getQuestDisplayEmoji(quest, ctx) : "📜"} **${index + 1}.** ${cleanedLine}` +
                    rewardText +
                    `\n> Progression: ${getQuestProgressText(line)}`,
            };
        });
};

export const fieldSections = (fields: { name: string; value: string }[]): { text: string }[] => {
    return fields.map((field) => ({
        text: `**${field.name}**\n${field.value}`,
    }));
};

export const getSideQuestRequirements = (
    sideQuest: SideQuest,
    ctx: CommandInteractionContext,
): {
    status: boolean;
    message: string;
    notMeet: string;
} => {
    const req = sideQuest.requirements(ctx);
    const notMeet = req.filter((x) => !x.status);
    const mapper = (x: RequirementStatus, i: number) =>
        `${i + 1}. ${x.requirement} (${x.status ? "✅" : "❌"})`;

    return {
        status: notMeet.length === 0,
        message: req.map(mapper).join("\n"),
        notMeet: notMeet.map(mapper).join("\n"),
    };
};
