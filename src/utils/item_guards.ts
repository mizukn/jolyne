import type { Consumable, EquipableItem, Garment, Item, Special, Weapon } from "../@types";

const equipableItemTypeValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const isGarment = (item: Item): item is Garment => {
    return (item as Garment).skillPoints !== undefined;
};

export const isSpecial = (item: Item): item is Special => {
    return (item as Special)["use"] !== undefined;
};

export const isWeapon = (item: EquipableItem | Item | Weapon): item is Weapon => {
    return (item as Weapon).abilities !== undefined;
};

export const isEquipableItem = (item: Item): item is EquipableItem => {
    const type = (item as EquipableItem).type;
    return typeof type === "number" && equipableItemTypeValues.includes(type);
};

export const isConsumable = (item: Item): item is Consumable => {
    if (!item) return false;
    return (item as Consumable)["effects"] !== undefined && !isEquipableItem(item);
};
