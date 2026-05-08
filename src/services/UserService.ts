// First slice of the user-domain service layer (PLAN.md §P1.1). This module
// is the source of truth for the listed helpers; Functions.ts re-exports them
// so existing call sites keep working unchanged.

import {
    defaultUserSettings,
    type ClaimXQuest,
    type EquipableItem,
    type FightableNPC,
    type LBData,
    type NPC,
    type RPGUserDataJSON,
    type RPGUserQuest,
    type SkillPoints,
    type Stand,
} from "../@types";
import type Jolyne from "../structures/JolyneClient";
import type { Fighter } from "../structures/FightHandler";
import { EVENT_IDS, isActive } from "./EventService";
import log from "../utils/Logger";

export const isClaimXQuest = (quest: RPGUserQuest): quest is ClaimXQuest => {
    return (quest as ClaimXQuest).type === "claimX";
};

interface UserServiceDependencies {
    findNPC: <T extends NPC | FightableNPC>(npc: string, fightable?: boolean) => T;
    findStand: (stand: string, evolution?: number) => Stand;
    getCurrentStand: (data: RPGUserDataJSON) => Stand;
    findEquipableItem: (item: string) => EquipableItem;
}

const missingDependencies: UserServiceDependencies = {
    findNPC: () => null,
    findStand: () => null,
    getCurrentStand: () => null,
    findEquipableItem: () => null,
};

let dependencies = missingDependencies;

export const configureUserService = (nextDependencies: Partial<UserServiceDependencies>): void => {
    dependencies = {
        ...dependencies,
        ...nextDependencies,
    };
};

export const isFighter = (data: Fighter | RPGUserDataJSON | FightableNPC): data is Fighter => {
    return (data as Fighter).isDefending !== undefined;
};

export const isRPGUserDataJSON = (
    data: RPGUserDataJSON | FightableNPC | Fighter,
): data is RPGUserDataJSON => {
    return (data as RPGUserDataJSON).adventureStartedAt !== undefined;
};

export const getSkillPointsBonus = (
    rpgData: RPGUserDataJSON | FightableNPC | Fighter,
): SkillPoints => {
    const skillPoints = { ...rpgData.skillPoints };
    const stand = isFighter(rpgData)
        ? rpgData.stand
        : isRPGUserDataJSON(rpgData)
          ? dependencies.getCurrentStand(rpgData)
          : dependencies.findStand(rpgData.stand, rpgData.standsEvolved[rpgData.stand]);

    if (stand) {
        for (const id of Object.keys(stand.skillPoints)) {
            skillPoints[id as keyof typeof skillPoints] +=
                stand.skillPoints[id as keyof typeof stand.skillPoints];
        }
    }
    for (const itemId of Object.keys(rpgData.equippedItems)) {
        const itemData = dependencies.findEquipableItem(itemId);
        if (!itemData) continue;
        if (itemData.effects.skillPoints) {
            for (const skill of Object.keys(itemData.effects.skillPoints)) {
                skillPoints[skill as keyof SkillPoints] +=
                    itemData.effects.skillPoints[skill as keyof SkillPoints];
            }
        }
    }
    return skillPoints;
};

export const getSkillPointsFromPrestige = (prestige: number): number => {
    let total = 0;

    while (prestige > 0) {
        if (prestige >= 20) {
            total += 1;
            prestige -= 1;
        } else if (prestige >= 10) {
            total += 2;
            prestige -= 1;
        } else if (prestige >= 4) {
            total += 5;
            prestige -= 1;
        } else if (prestige >= 1) {
            total += 10;
            prestige -= 1;
        }
    }

    return total;
};

export const getBaseHealth = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return 100 + Math.trunc(rpgData.level / 2);
};

export const getBaseStamina = 100;

export const getMaxHealthNoItem = (
    rpgData: RPGUserDataJSON | FightableNPC | Fighter,
): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseHealth = getBaseHealth(rpgData);

    return baseHealth + Math.round(skillPoints.defense * 11.55);
};

export const calcEquipableItemsBonus = function calcEquipableItemsBonus(
    userData: RPGUserDataJSON | FightableNPC | Fighter,
): {
    stamina: number;
    health: number;
    skillPoints: SkillPoints;
    xpBoost: number;
    standDisc: number;
} {
    let stamina = 0;
    let health = 0;
    let xpBoost = 0;
    let standDisc = 0;
    const skillPoints: SkillPoints = {
        strength: 0,
        perception: 0,
        stamina: 0,
        speed: 0,
        defense: 0,
    };

    for (const itemId of Object.keys(userData.equippedItems)) {
        const itemData = dependencies.findEquipableItem(itemId);
        if (!itemData) continue;
        if (itemData.effects.standDiscIncrease) standDisc += itemData.effects.standDiscIncrease;
        if (itemData.effects.stamina)
            stamina +=
                typeof itemData.effects.stamina === "number"
                    ? itemData.effects.stamina
                    : getMaxHealthNoItem(userData) * (parseInt(itemData.effects.stamina) / 100);
        if (itemData.effects.health)
            health +=
                typeof itemData.effects.health === "number"
                    ? itemData.effects.health
                    : getMaxHealthNoItem(userData) * (parseInt(itemData.effects.health) / 100);
        if (itemData.effects.skillPoints) {
            for (const skill of Object.keys(itemData.effects.skillPoints)) {
                skillPoints[skill as keyof SkillPoints] +=
                    itemData.effects.skillPoints[skill as keyof SkillPoints];
            }
        }
        if (itemData.effects.xpBoost) {
            xpBoost += itemData.effects.xpBoost;
        }
    }

    return {
        stamina,
        health,
        skillPoints,
        xpBoost,
        standDisc,
    };
};

export const getMaxHealth = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 100;
    if (rpgData.level <= 4 && dependencies.findNPC(rpgData.id)) return 100;
    return Math.round((getMaxHealthNoItem(rpgData) + calcEquipableItemsBonus(rpgData).health) * 3);
};

export const getMaxStaminaNoItem = (
    rpgData: RPGUserDataJSON | FightableNPC | Fighter,
): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseStamina = getBaseStamina;

    return Math.round(baseStamina + skillPoints.stamina * 1.98);
};

export const getMaxStamina = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return Math.round(getMaxStaminaNoItem(rpgData) + calcEquipableItemsBonus(rpgData).stamina);
};

export const getDodgeScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(skillPoints.perception / 1.1);
};

export const getSpeedScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(Math.round(skillPoints.speed / 1.1));
};

export const getTotalSkillPoints = (data: number | RPGUserDataJSON | FightableNPC): number => {
    if (typeof data === "number") return data * 4;
    else return data.level * 4;
};

export const getRawSkillPointsLeft = (user: RPGUserDataJSON | FightableNPC): number => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return (
        getTotalSkillPoints(user) -
        totalSkillPoints +
        (!isRPGUserDataJSON(user) ? 0 : getSkillPointsFromPrestige(user.prestige))
    );
};

export const skillPointsIsOK = (user: RPGUserDataJSON | FightableNPC): boolean => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return totalSkillPoints === getTotalSkillPoints(user);
};

export const userIsCommunityBanned = function userIsCommunityBanned(
    userData: RPGUserDataJSON | LBData,
): RPGUserDataJSON["communityBans"][0] {
    if (userData.communityBans?.length === 0 || !userData.communityBans) return;
    const activeCommunityBans = userData.communityBans.filter((v) => v.until > Date.now());
    if (activeCommunityBans.length === 0) return;
    return activeCommunityBans[0];
};

export const getMaxPrestigeLevel = (prestigeLevel: number): number => {
    if (prestigeLevel + 1 < 6) return (prestigeLevel + 1) * 100;
    return 500;
};

export const hasReachedMaxLevel = (data: RPGUserDataJSON): boolean => {
    const maxLevel = getMaxPrestigeLevel(data.prestige ?? 0);
    return data.level >= maxLevel;
};

export const isWeekend = (): boolean => {
    const date = new Date();
    return date.getDay() === 0 || date.getDay() === 6;
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

export const addXp = function addXp(
    userData: RPGUserDataJSON,
    amount: number,
    client: Jolyne,
    dontAdd?: boolean,
): number {
    if (calcEquipableItemsBonus(userData).xpBoost > 0) {
        amount += Math.round((amount * calcEquipableItemsBonus(userData).xpBoost) / 100);
    }
    if (isActive(EVENT_IDS.CHRISTMAS_2024) && isWeekend()) amount = Math.round(amount * 1.25);
    if (isActive(EVENT_IDS.THIRD_ANNIVERSARY)) amount = Math.round(amount * 1.15);
    let multiplier = 1;

    const patreonTier = client.patreons.find((v) => v.id === userData.id)?.level;

    if (patreonTier)
        switch (patreonTier) {
            case 4:
                multiplier += 0.1;
                break;
            case 3:
                multiplier += 0.07;
                break;
            case 2:
                multiplier += 0.05;
                break;
            case 1:
                multiplier += 0.04;
                break;
        }

    if (client.boosters.find((x) => x === userData.id)) multiplier += 0.03;

    amount = Math.round(amount * multiplier);
    if (userIsCommunityBanned(userData)) amount = Math.round(amount / 2);
    if (process.env.ENABLE_PRESTIGE && userData.level >= getMaxPrestigeLevel(userData.prestige)) {
        log(`Prestige level reached for user ${userData.id}`, "debug");
        amount = 0;
    }

    if (!dontAdd) {
        userData.xp += amount;
        for (const quests of [
            userData.daily.quests,
            userData.chapter.quests,
            ...userData.sideQuests.map((v) => v.quests),
        ]) {
            for (const quest of quests.filter((x) => isClaimXQuest(x) && x.x === "xp")) {
                (quest as ClaimXQuest).amount += amount;
            }
        }
    }
    return amount;
};

export const fixUserSettings = (data: RPGUserDataJSON): void => {
    if (!data.settings) {
        data.settings = defaultUserSettings;
        return;
    }

    for (const key of Object.keys(defaultUserSettings)) {
        if (data.settings[key] === undefined) {
            data.settings[key] = defaultUserSettings[key];
        }
    }

    for (const setting of Object.keys(data.settings)) {
        const defaultSetting = defaultUserSettings[setting];
        if (!defaultSetting) continue;

        for (const key of Object.keys(defaultSetting)) {
            if (data.settings[setting][key] === undefined) {
                data.settings[setting][key] = defaultSetting[key];
            }
        }
    }
};

export const userMeetsRequirementsForItem = (
    data: RPGUserDataJSON,
    item: EquipableItem,
): boolean => {
    if (!item.requirements) return true;

    if (item.requirements.level && data.level < item.requirements.level) return false;
    if (item.requirements.prestige && data.prestige < item.requirements.prestige) return false;

    if (item.requirements.skillPoints) {
        for (const key of Object.keys(item.requirements.skillPoints)) {
            if (
                data.skillPoints[key as keyof typeof data.skillPoints] <
                item.requirements.skillPoints[key as keyof typeof item.requirements.skillPoints]
            ) {
                return false;
            }
        }
    }

    return true;
};

export const getTrueLevel = (data: RPGUserDataJSON | FightableNPC): number => {
    const bonusSkillPoints =
        Object.values(getSkillPointsBonus(data)).reduce((acc, val) => acc + val, 0) +
        getRawSkillPointsLeft(data);
    const extraHealth = calcEquipableItemsBonus(data).health;
    const extraStamina = calcEquipableItemsBonus(data).stamina;

    return Math.round((bonusSkillPoints + extraHealth / 11.55 + extraStamina / 1.98) / 4);
};
