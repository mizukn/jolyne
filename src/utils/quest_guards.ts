import type {
    ActionQuest,
    AnswerChineseNewYearQuizQuest,
    ClaimItemQuest,
    FightNPCQuest,
    MustReadEmailQuest,
    Quest,
    Quests,
    RaidNPCQuest,
    RPGUserQuest,
    StartDungeonQuest,
    UseXCommandQuest,
    WaitQuest,
} from "../@types";

export const isAnswerChineseNewYearQuizQuest = (
    quest: RPGUserQuest | Quests,
): quest is AnswerChineseNewYearQuizQuest => quest.type === "answerChineseNewYearQuiz";

export const isBaseQuest = (quest: Quests | RPGUserQuest): quest is Quest =>
    (quest as Quest).type === "baseQuest";

export const isFightNPCQuest = (quest: Quests | RPGUserQuest): quest is FightNPCQuest =>
    (quest as FightNPCQuest).type === "fight";

export const isStartDungeonQuest = (quest: Quests | RPGUserQuest): quest is StartDungeonQuest =>
    quest.type === "startDungeon";

export const isRaidNPCQuest = (quest: Quests | RPGUserQuest): quest is RaidNPCQuest =>
    (quest as RaidNPCQuest).type === "raid";

export const isMustReadEmailQuest = (
    quest: Quests | RPGUserQuest,
): quest is MustReadEmailQuest => (quest as MustReadEmailQuest).type === "mustRead";

export const isActionQuest = (quest: Quests | RPGUserQuest): quest is ActionQuest =>
    (quest as ActionQuest).type === "action";

export const isUseXCommandQuest = (quest: Quests | RPGUserQuest): quest is UseXCommandQuest =>
    (quest as UseXCommandQuest).type === "UseXCommandQuest";

export const isClaimItemQuest = (quest: RPGUserQuest): quest is ClaimItemQuest =>
    (quest as ClaimItemQuest).type === "ClaimXQuest";

export const isWaitQuest = (quest: Quests | RPGUserQuest): quest is WaitQuest =>
    (quest as WaitQuest).type === "wait";
