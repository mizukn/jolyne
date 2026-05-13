import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    generateSkillPoints: vi.fn(),
    findStand: vi.fn(),
    findItem: vi.fn(),
}));

vi.mock("../services/UserService", () => ({
    generateSkillPoints: mocks.generateSkillPoints,
}));

vi.mock("./lookup", () => ({
    findStand: mocks.findStand,
    findItem: mocks.findItem,
}));

vi.mock("./rewards", () => ({
    getMaxXp: (level: number) => level * 1000,
}));

import { editNPCLevel, fixNpcRewards } from "./npc";
import type { FightableNPC, NPC } from "../@types";

const makeNPC = (overrides: Partial<FightableNPC> = {}): FightableNPC =>
    ({
        id: "test_npc",
        name: "Test NPC",
        level: 50,
        emoji: ":test:",
        stand: null,
        standsEvolved: {},
        equippedItems: {},
        skillPoints: { strength: 0, defense: 0, perception: 0, speed: 0, stamina: 0 },
        rewards: {},
        ...overrides,
    }) as unknown as FightableNPC;

describe("editNPCLevel", () => {
    it("returns a deep-copied NPC with the new level set", () => {
        const original = makeNPC({ level: 50, equippedItems: { sword: 6 } });
        const updated = editNPCLevel(original as NPC, 100) as FightableNPC;

        expect(updated).not.toBe(original);
        expect(updated.level).toBe(100);
        expect(original.level).toBe(50);

        updated.equippedItems.shield = 1;
        expect(original.equippedItems.shield).toBeUndefined();
    });

    it("regenerates skill points for the new level", () => {
        const npc = makeNPC();
        editNPCLevel(npc as NPC, 200);
        expect(mocks.generateSkillPoints).toHaveBeenCalled();
        const argLevel = (mocks.generateSkillPoints.mock.calls.at(-1)?.[0] as FightableNPC)
            .level;
        expect(argLevel).toBe(200);
    });
});

describe("fixNpcRewards", () => {
    it("creates rewards with baseline multiplier when no stand or weapon", () => {
        mocks.findStand.mockReturnValueOnce(undefined);
        const npc = makeNPC({ level: 50 });
        delete (npc as { rewards?: unknown }).rewards;

        fixNpcRewards(npc);

        expect(npc.rewards.xp).toBe(Math.round(5000 + 50 * 750 + 50 * 1000 * 0.005));
        expect(npc.rewards.coins).toBe(Math.round(1000 + 50 * 0.25 + 50 * 1000 * 0.0005));
    });

    it("scales rewards by stand rarity multiplier", () => {
        mocks.findStand.mockReturnValueOnce({ rarity: "S" });
        const npc = makeNPC({ level: 100, stand: "the_world", standsEvolved: { the_world: 0 } });

        fixNpcRewards(npc);

        const expectedXpBase = 5000 + 100 * 750 + 100 * 1000 * 0.005;
        expect(npc.rewards.xp).toBe(Math.round(expectedXpBase * 1.45));
    });

    it("stacks weapon rarity multiplier on top of stand rarity", () => {
        mocks.findStand.mockReturnValueOnce({ rarity: "A" });
        mocks.findItem.mockReturnValueOnce({ rarity: "B" });
        const npc = makeNPC({
            level: 100,
            stand: "stand_a",
            standsEvolved: { stand_a: 0 },
            equippedItems: { my_sword: 6 },
        });

        fixNpcRewards(npc);

        const expectedXpBase = 5000 + 100 * 750 + 100 * 1000 * 0.005;
        expect(npc.rewards.xp).toBe(Math.round(expectedXpBase * 1.2 * 1.1));
    });
});
