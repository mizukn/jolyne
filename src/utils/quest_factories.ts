import type {
    ActionQuest,
    AnswerChineseNewYearQuizQuest,
    ClaimItemQuest,
    ClaimXQuest,
    Email,
    FightNPCQuest,
    MustReadEmailQuest,
    NPC,
    Quest,
    RaidNPCQuest,
    RPGUserEmail,
    RPGUserQuest,
    StartDungeonQuest,
    UseXCommandQuest,
    WaitQuest,
    Quests,
} from "../@types";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import { generateRandomId } from "./random";
import {
    isActionQuest,
    isBaseQuest,
    isFightNPCQuest,
    isMustReadEmailQuest,
    isStartDungeonQuest,
} from "./quest_guards";

export const pushItemWhenCompleted = (
    quest: Quests,
    arr: Quests["pushItemWhenCompleted"],
): Quests => {
    quest.pushItemWhenCompleted = arr;
    return quest;
};

export const pushEmailWhenCompleted = (
    quest: Quests,
    obj: Quests["pushEmailWhenCompleted"],
): Quests => {
    quest.pushEmailWhenCompleted = obj;
    return quest;
};

export const pushQuestWhenCompleted = (
    quest: Quests,
    id: Quests["pushQuestWhenCompleted"],
): Quests => {
    quest.pushQuestWhenCompleted = id;
    return quest;
};

export const pushQuest = (quest: Quests): RPGUserQuest => {
    const questData: Quests = {
        ...quest,
    };
    if (isBaseQuest(questData)) {
        delete questData.i18n_key;
        delete questData.hintCommand;
    }
    if (
        !isActionQuest(questData) &&
        !isFightNPCQuest(questData) &&
        !isMustReadEmailQuest(questData) &&
        !isStartDungeonQuest(questData)
    ) {
        delete (questData as Quest).completed;
        delete (questData as Quest).emoji;
    }

    if (isActionQuest(questData)) {
        delete questData.use;
        delete questData.emoji;
        questData.completed = false;
    }

    return questData as RPGUserQuest;
};

export const pushEmail = (email: Email): RPGUserEmail => {
    const emailData: RPGUserEmail = {
        id: email.id,
        read: false,
        archived: false,
        date: Date.now(),
    };
    if (email.expiresAt) {
        emailData.expiresAt = email.expiresAt + Date.now();
    }

    return emailData;
};

export const generateFightQuest = (
    npc: NPC,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
    pushItemWhenCompleted?: Quest["pushItemWhenCompleted"],
): FightNPCQuest => ({
    type: "fight",
    id: generateRandomId(),
    completed: false,
    npc: npc.id,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
    pushItemWhenCompleted,
});

export const generataRaidQuest = (
    boss: NPC,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
    pushItemWhenCompleted?: Quest["pushItemWhenCompleted"],
): RaidNPCQuest => ({
    type: "raid",
    id: generateRandomId(),
    completed: false,
    boss: boss.id,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
    pushItemWhenCompleted,
});

export const generateStartDungeonQuest = (
    total: number,
    stage?: number,
    modifiers?: StartDungeonQuest["modifiers"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): StartDungeonQuest => ({
    type: "startDungeon",
    id: generateRandomId(),
    completed: 0,
    total,
    stage,
    modifiers,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateMustReadEmailQuest = (
    email: Email,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): MustReadEmailQuest => ({
    type: "mustRead",
    id: generateRandomId(),
    completed: false,
    email: email.id,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateActionQuest = (
    id: ActionQuest["id"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): ActionQuest => ({
    type: "action",
    ...Object.values(ActionQuests).find((actionQuest) => actionQuest.id === id),
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateClaimXQuest = (
    x: ClaimXQuest["x"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): ClaimXQuest => ({
    type: "claimX",
    id: generateRandomId(),
    amount: 0,
    x,
    goal,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateClaimItemQuest = (
    item: ClaimItemQuest["item"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): ClaimItemQuest => ({
    type: "ClaimXQuest",
    id: generateRandomId(),
    amount: 0,
    item,
    goal,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateUseXCommandQuest = (
    command: UseXCommandQuest["command"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): UseXCommandQuest => ({
    type: "UseXCommandQuest",
    id: generateRandomId(),
    amount: 0,
    command,
    goal,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateAnswerChineseNewYearQuizQuest = (
    goal: AnswerChineseNewYearQuizQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
): AnswerChineseNewYearQuizQuest => ({
    type: "answerChineseNewYearQuiz",
    id: generateRandomId(),
    goal,
    amount: 0,
    pushEmailWhenCompleted,
    pushQuestWhenCompleted,
});

export const generateWaitQuest = (
    time: number,
    email?: WaitQuest["email"],
    quest?: WaitQuest["quest"],
    i18n_key?: WaitQuest["i18n_key"],
    mustRead?: WaitQuest["mustRead"],
): WaitQuest => {
    const questData: WaitQuest = {
        type: "wait",
        end: Date.now() + time,
        id: generateRandomId(),
        email,
        quest,
        i18n_key,
        mustRead,
    };

    if (!email) delete questData.email;
    if (!quest) delete questData.quest;
    if (!i18n_key) delete questData.i18n_key;

    return questData;
};
