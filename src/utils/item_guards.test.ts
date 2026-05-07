import { describe, expect, it } from "vitest";
import type { Consumable, EquipableItem, Garment, Special, Weapon } from "../@types";
import { isConsumable, isEquipableItem, isGarment, isSpecial, isWeapon } from "./item_guards";

describe("item guards", () => {
    it("detects item families by their discriminating fields", () => {
        expect(isGarment({ skillPoints: {} } as Garment)).toBe(true);
        expect(isSpecial({ use: (): null => null } as unknown as Special)).toBe(true);
        expect(isWeapon({ abilities: [] } as Weapon)).toBe(true);
        expect(isConsumable({ id: "fake_food", effects: { health: 10 } } as Consumable)).toBe(true);
    });

    it("recognizes registered equipable items", () => {
        const equipable = {
            id: "fake_hat",
            type: 1,
            effects: {},
        } as EquipableItem;

        expect(isEquipableItem(equipable)).toBe(true);
        expect(isConsumable(equipable as unknown as Consumable)).toBe(false);
    });
});
