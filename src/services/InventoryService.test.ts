import { describe, expect, it } from "vitest";
import { addItem, configureInventoryService, isConsumable, removeItem } from "./InventoryService";
import type { ClaimItemQuest, Consumable, EquipableItem, RPGUserDataJSON } from "../@types";

const baseUser = (): RPGUserDataJSON =>
    ({
        inventory: {},
        equippedItems: {},
        daily: { quests: [] },
        chapter: { quests: [] },
        sideQuests: [],
    }) as RPGUserDataJSON;

const item = (id: string, overrides: Partial<Consumable> = {}): Consumable =>
    ({
        id,
        storable: true,
        private: false,
        effects: {
            health: 10,
        },
        ...overrides,
    }) as Consumable;

const claimItemQuest = (itemId: string): ClaimItemQuest =>
    ({
        type: "ClaimXQuest",
        id: "quest",
        item: itemId,
        amount: 0,
        goal: 3,
    }) as ClaimItemQuest;

describe("InventoryService.addItem", () => {
    it("adds an item amount to inventory", () => {
        const user = baseUser();

        expect(addItem(user, item("apple"), 2)).toBe(true);
        expect(user.inventory.apple).toBe(2);
    });

    it("rejects private or non-storable items", () => {
        const user = baseUser();

        expect(addItem(user, item("secret", { private: true }))).toBe(false);
        expect(addItem(user, item("temporary", { storable: false }))).toBe(false);
        expect(user.inventory).toEqual({});
    });

    it("increments matching claim-item quests", () => {
        const user = baseUser();
        user.daily.quests.push(claimItemQuest("apple"));

        expect(addItem(user, item("apple"), 2)).toBe(true);
        expect((user.daily.quests[0] as ClaimItemQuest).amount).toBe(2);
    });
});

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
