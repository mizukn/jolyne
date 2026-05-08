import type { ClaimItemQuest, Consumable, Item, RPGUserDataJSON } from "../@types";
import type CommandInteractionContext from "../structures/CommandInteractionContext";
import { EVENT_IDS, getEvent, isActive } from "./EventService";
import { calcEquipableItemsBonus, getMaxPrestigeLevel } from "./UserService";
import { isConsumable as isConsumableItem } from "../utils/item_guards";
import { isClaimItemQuest } from "../utils/quest_guards";

interface InventoryServiceDependencies {
    findItem: (item: string) => Item;
    countStandsByRarity: (rarity: string) => number;
}

let dependencies: InventoryServiceDependencies = {
    findItem: () => null,
    countStandsByRarity: () => 0,
};

export const configureInventoryService = (
    nextDependencies: Partial<InventoryServiceDependencies>,
): void => {
    dependencies = {
        ...dependencies,
        ...nextDependencies,
    };
};

const Christmas2024LimitedItems = ["elf_hat", "santa_hat", "krampus_staff"];
const endOf2024ChristmasEvent = getEvent(EVENT_IDS.CHRISTMAS_2024)?.endsAt.getTime() ?? 0;

export const calcStandDiscLimit = function calcStandDiscLimit(
    ctx: CommandInteractionContext,
    userData?: RPGUserDataJSON,
): number {
    if (!ctx.userData.prestige) ctx.userData.prestige = 0;
    let limit = dependencies.countStandsByRarity("S") + ctx.userData.prestige * 5;
    const realUserData = userData ?? ctx.userData;

    if (process.env.ENABLE_PRESTIGE) {
        let currentLevel = realUserData.level;
        for (let i = 0; i < ctx.userData.prestige - 1; i++) {
            const maxLevel = getMaxPrestigeLevel(i);
            currentLevel += maxLevel;
        }
        limit += Math.floor(currentLevel / 50);
        limit += Math.floor(currentLevel / 100);
    } else {
        limit += Math.floor(realUserData.level / 50);
        limit += Math.floor(realUserData.level / 100);
    }
    if (userData?.id && process.env.OWNER_IDS?.split(",").includes(userData.id))
        limit = Infinity;

    const patronTier = ctx.client.patreons.find((v) => v.id === realUserData.id)?.level;
    if (patronTier) {
        switch (patronTier) {
            case 1:
                limit += 25;
                break;
            case 2:
                limit += 60;
                break;
            case 3:
            case 4:
                limit = Infinity;
                break;
        }
    }

    return limit + 4 + calcEquipableItemsBonus(realUserData).standDisc;
};

export const hasExceedStandLimit = function hasExceedStandLimit(
    ctx: CommandInteractionContext,
    userData?: RPGUserDataJSON,
    canBeEqual?: boolean,
): boolean {
    const realUserData = userData ?? ctx.userData;
    const limit = calcStandDiscLimit(ctx, realUserData);
    let discCount = 0;
    for (const item of Object.keys(realUserData.inventory)) {
        if (item.includes("$disc$")) discCount += realUserData.inventory[item];
    }

    if (canBeEqual) return discCount >= limit;
    else return discCount > limit;
};

export const addItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number,
    ignoreQuests?: boolean,
    ctx?: CommandInteractionContext,
): boolean => {
    if (typeof item === "string") {
        item = dependencies.findItem(item);
    }
    if (!item) return false;
    if (!item.storable || item.private) return false;
    if (isActive(EVENT_IDS.HALLOWEEN_2024) && item.id === "nix.$disc$") {
        const nixDisc = (userData.inventory["nix.$disc$"] || 0) + (amount || 1);
        if (nixDisc > 3) return false;
    }

    if (isActive(EVENT_IDS.THIRD_ANNIVERSARY)) {
        if (item.id === "pinata_hat" || item.id === "pinata_hammer") {
            let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
            for (const xitem of Object.keys(userData.equippedItems)) {
                if (xitem === item.id) itemLeft++;
            }
            const max = item.id === "pinata_hat" ? 7 : 3;
            if (itemLeft > max) return false;
        }
    }

    if (isActive(EVENT_IDS.WINTER_2025) && item.id === "frostblade") {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        if (itemLeft > 3) return false;
    }
    if (Date.now() < endOf2024ChristmasEvent && Christmas2024LimitedItems.includes(item.id)) {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        const max = item.id === "krampus_staff" ? 3 : 5;
        if (itemLeft > max) return false;
    }

    if (isActive(EVENT_IDS.CHINESE_NEW_YEAR_2025) && item.id === "snake_jian") {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        if (itemLeft > 3) return false;
    }

    if (isActive(EVENT_IDS.HALLOWEEN_2025) && item.id.includes("dead_revival")) {
        const totalItems = Object.keys(userData.inventory)
            .map((x) => {
                return {
                    id: x,
                    amount: userData.inventory[x],
                };
            })
            .filter((x) => x.id.includes("dead_revival"));
        const totalRevivalItems = totalItems.reduce((a, b) => a + b.amount, 0) + (amount || 1);
        if (totalRevivalItems > 3) return false;
    }

    if (item.id.includes("$disc$") && ctx) {
        const totalItems = Object.keys(userData.inventory)
            .map((x) => {
                return {
                    id: x,
                    amount: userData.inventory[x],
                };
            })
            .filter((x) => x.id.includes("$disc$"));
        const totalDiscs = totalItems.reduce((a, b) => a + b.amount, 0) + (amount || 1);
        if (totalDiscs > calcStandDiscLimit(ctx, userData)) return false;
    }
    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] += amount;
    } else {
        userData.inventory[item.id]++;
    }

    if (ignoreQuests) return true;
    for (const quests of [
        userData.daily.quests,
        userData.chapter.quests,
        ...userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter(
            (x) => isClaimItemQuest(x) && x.item === (item as Item).id,
        )) {
            (quest as ClaimItemQuest).amount += amount || 1;
        }
    }

    return true;
};

export const removeItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number,
): boolean => {
    if (typeof item === "string") {
        item = dependencies.findItem(item);
    }
    if (!item) return false;
    const amountLeft = userData.inventory[item.id] || 0;
    if (amountLeft < (amount || 1)) return false;

    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] -= amount;
    } else {
        userData.inventory[item.id]--;
    }

    if (userData.inventory[item.id] === 0) delete userData.inventory[item.id];

    return true;
};

export const isConsumable = (item: Item | string): item is Consumable => {
    if (typeof item === "string") {
        item = dependencies.findItem(item);
    }
    if (!item) return false;
    return isConsumableItem(item);
};
