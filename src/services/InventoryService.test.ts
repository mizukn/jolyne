import { describe, expect, it } from "vitest";
import { configureInventoryService, isConsumable, removeItem } from "./InventoryService";
import type { Consumable, EquipableItem, RPGUserDataJSON } from "../@types";

const baseUser = (): RPGUserDataJSON =>
    ({
        inventory: {},
    }) as RPGUserDataJSON;

describe("InventoryService.removeItem", () => {
    it("removes an item amount from inventory", () => {
        const user = baseUser();
        user.inventory.apple = 3;

        expect(removeItem(user, { id: "apple" } as Consumable, 2)).toBe(true);
        expect(user.inventory.apple).toBe(1);
    });

    it("deletes the inventory entry when the amount reaches zero", () => {
        const user = baseUser();
        user.inventory.apple = 1;

        expect(removeItem(user, { id: "apple" } as Consumable)).toBe(true);
        expect(user.inventory.apple).toBeUndefined();
    });

    it("does not remove more than the user owns", () => {
        const user = baseUser();
        user.inventory.apple = 1;

        expect(removeItem(user, { id: "apple" } as Consumable, 2)).toBe(false);
        expect(user.inventory.apple).toBe(1);
    });

    it("can resolve item ids through configured dependencies", () => {
        const user = baseUser();
        user.inventory.apple = 1;
        configureInventoryService({
            findItem: (id) => ({ id }) as Consumable,
        });

        expect(removeItem(user, "apple")).toBe(true);
        expect(user.inventory.apple).toBeUndefined();
    });
});

describe("InventoryService.isConsumable", () => {
    it("detects consumables by effects", () => {
        expect(isConsumable({ id: "pizza", effects: { health: 10 } } as Consumable)).toBe(true);
    });

    it("rejects non-consumable items", () => {
        const equipable = {
            id: "helmet",
            effects: {},
            type: 1,
        } as EquipableItem;

        expect(isConsumable(equipable)).toBe(false);
    });
});
