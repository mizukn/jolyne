// First slice of the user-domain service layer (PLAN.md §P1.1). This module
// is the source of truth for the listed helpers; Functions.ts re-exports them
// so existing call sites keep working unchanged. Subsequent extractions
// (getMaxHealth, getMaxStamina, getRawSkillPointsLeft, addXp) will move here
// in follow-up commits — those depend on a wider helper closure that needs
// to be teased out of Functions.ts first.

import { ClaimXQuest, RPGUserDataJSON, RPGUserQuest } from "../@types";

export const isClaimXQuest = (quest: RPGUserQuest): quest is ClaimXQuest => {
    return (quest as ClaimXQuest).type === "claimX";
};

export const addCoins = function addCoins(
    userData: RPGUserDataJSON,
    amount: number,
): number {
    userData.coins += Math.round(amount);
    if (amount < 0) return;

    amount = Math.round(amount);
    for (const quests of [
        userData.daily.quests,
        userData.chapter.quests,
        ...userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter(
            (x) => isClaimXQuest(x) && x.x === "coin",
        )) {
            (quest as ClaimXQuest).amount += amount;
        }
    }
    return amount;
};
