import type { Consumable, Item, RPGUserDataJSON } from "../@types";
import { isConsumable as isConsumableItem } from "../utils/item_guards";

interface InventoryServiceDependencies {
    findItem: (item: string) => Item;
}

let dependencies: InventoryServiceDependencies = {
    findItem: () => null,
};

export const configureInventoryService = (
    nextDependencies: Partial<InventoryServiceDependencies>,
): void => {
    dependencies = {
        ...dependencies,
        ...nextDependencies,
    };
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
