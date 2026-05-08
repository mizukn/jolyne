import { describe, expect, it } from "vitest";
import {
    addItem,
    calcStandDiscLimit,
    configureInventoryService,
    hasExceedStandLimit,
    isConsumable,
    removeItem,
    useConsumableItem,
} from "./InventoryService";
import type { ClaimItemQuest, Consumable, EquipableItem, RPGUserDataJSON } from "../@types";
import type CommandInteractionContext from "../structures/CommandInteractionContext";

const baseUser = (): RPGUserDataJSON =>
    ({
        id: "test-user",
        level: 50,
        prestige: 0,
        adventureStartedAt: Date.now(),
        stand: "",
        standsEvolved: {},
        customStandsEvolved: {},
        health: 0,
        stamina: 0,
        skillPoints: {
            strength: 0,
            defense: 0,
            stamina: 0,
            perception: 0,
            speed: 0,
        },
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

describe("InventoryService stand disc limits", () => {
    it("detects equal and exceeded stand disc limits", () => {
        const user = baseUser();
        configureInventoryService({
            countStandsByRarity: () => 10,
        });
        const ctx = {
            userData: user,
            client: {
                patreons: [],
            },
        } as unknown as CommandInteractionContext;
        const limit = calcStandDiscLimit(ctx, user);
        user.inventory["star_platinum$disc$"] = limit;

        expect(limit).toBeGreaterThan(0);
        expect(hasExceedStandLimit(ctx, user)).toBe(false);
        expect(hasExceedStandLimit(ctx, user, true)).toBe(true);
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

describe("InventoryService.useConsumableItem", () => {
    it("applies health and stamina effects", () => {
        const user = baseUser();

        useConsumableItem(
            item("pizza", {
                effects: {
                    health: 10,
                    stamina: "10%",
                },
            }),
            user,
            2,
        );

        expect(user.health).toBe(20);
        expect(user.stamina).toBe(20);
    });

    it("adds item effects once per consumed amount", () => {
        const user = baseUser();
        configureInventoryService({
            findItem: (id) => item(id),
        });

        useConsumableItem(
            item("box", {
                effects: {
                    items: {
                        apple: 2,
                    },
                },
            }),
            user,
            2,
        );

        expect(user.inventory.apple).toBe(4);
    });
});
