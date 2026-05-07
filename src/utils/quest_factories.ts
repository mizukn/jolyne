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
    StartDungeonQuest,
    UseXCommandQuest,
    WaitQuest,
} from "../@types";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import { generateRandomId } from "./random";

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
