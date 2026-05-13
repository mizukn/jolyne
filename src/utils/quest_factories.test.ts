import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    findStand: vi.fn(),
    getTrueLevel: vi.fn(),
    isClaimXQuest: vi.fn(),
    getRewards: vi.fn(),
    pickOne: vi.fn(),
    randomInt: vi.fn(),
    chance: vi.fn(),
    shuffleInPlace: vi.fn(),
    generateRandomId: vi.fn(),
}));

vi.mock("../rpg/NPCs", () => ({
    FightableNPCS: {
        weakNpc: {
            id: "weak_npc",
            level: 10,
            private: false,
            stand: null,
            standsEvolved: {},
        },
        midNpc: {
            id: "mid_npc",
            level: 50,
            private: false,
            stand: null,
            standsEvolved: {},
        },
    },
}));

vi.mock("./lookup", () => ({ findStand: mocks.findStand }));

vi.mock("../services/UserService", () => ({
    getTrueLevel: mocks.getTrueLevel,
    isClaimXQuest: mocks.isClaimXQuest,
}));

vi.mock("./rewards", () => ({ getRewards: mocks.getRewards }));

vi.mock("./random", () => ({
    pickOne: mocks.pickOne,
    randomInt: mocks.randomInt,
    chance: mocks.chance,
    shuffleInPlace: mocks.shuffleInPlace,
    generateRandomId: mocks.generateRandomId,
}));

vi.mock("./quest_guards", () => ({
    isActionQuest: vi.fn(() => false),
    isBaseQuest: vi.fn(() => false),
    isClaimItemQuest: vi.fn(() => false),
    isFightNPCQuest: vi.fn(() => false),
    isMustReadEmailQuest: vi.fn(() => false),
    isStartDungeonQuest: vi.fn(() => false),
}));

vi.mock("../rpg/Quests/ActionQuests", () => ({}));

import { getDailyQuestRowRewards, generateDailyQuests } from "./quest_factories";
import * as guards from "./quest_guards";
import type { ClaimXQuest, FightNPCQuest, RPGUserQuest } from "../@types";

describe("getDailyQuestRowRewards", () => {
    const baseQuest = { id: "q", type: "x", completed: 0 } as unknown as RPGUserQuest;

    it("returns the flat baseline for an unrecognized quest shape", () => {
        const result = getDailyQuestRowRewards(baseQuest, { boosted: false });
        // base coins=100, xp=75 * 1.99 then round
        expect(result.coins).toBe(100);
        expect(result.xp).toBe(Math.round(75 * 1.99));
    });

    it("scales by goal for claim-x quests", () => {
        vi.mocked(guards.isClaimItemQuest).mockReturnValueOnce(true);
        const quest = { id: "q", type: "claimX", goal: 1000 } as unknown as ClaimXQuest;
        const result = getDailyQuestRowRewards(quest as RPGUserQuest, { boosted: false });
        expect(result.coins).toBe(200);
        expect(result.xp).toBe(Math.round((1000 / 15) * 1.99));
    });

    it("scales by NPC level for fight quests", () => {
        vi.mocked(guards.isFightNPCQuest).mockReturnValueOnce(true);
        const quest = { id: "q", type: "fight", npc: "mid_npc" } as unknown as FightNPCQuest;
        const result = getDailyQuestRowRewards(quest as RPGUserQuest, { boosted: false });
        expect(result.coins).toBe((50 + 1) * 100);
        expect(result.xp).toBe(Math.round((50 + 1) * 10 * 1.99));
    });

    it("applies a 1.1x XP multiplier when boosted", () => {
        const plain = getDailyQuestRowRewards(baseQuest, { boosted: false }).xp;
        const boosted = getDailyQuestRowRewards(baseQuest, { boosted: true }).xp;
        expect(boosted).toBe(Math.round(plain * 1.1));
    });
});

describe("generateDailyQuests", () => {
    const setupGenerator = ({ chanceResult }: { chanceResult: boolean }) => {
        mocks.shuffleInPlace.mockImplementation((arr: unknown[]) => arr);
        mocks.getTrueLevel.mockImplementation((npc: { level: number }) => npc.level);
        mocks.findStand.mockReturnValue(null);
        mocks.chance.mockReturnValue(chanceResult);
        mocks.pickOne.mockImplementation((arr: { id: string; level: number }[]) => arr[0]);
        mocks.randomInt.mockReturnValue(3);
        mocks.getRewards.mockReturnValue({ coins: 1000, xp: 1000 });
        mocks.generateRandomId.mockImplementation(() => Math.random().toString(36).slice(2));
    };

    it("returns an array even with chance() always false (only forced fight quests)", () => {
        setupGenerator({ chanceResult: false });
        const result = generateDailyQuests(100);
        expect(Array.isArray(result)).toBe(true);
        // i < 5 always pushes a fight quest even when chance(80) is false
        expect(result.length).toBeGreaterThanOrEqual(5);
    });

    it("pushes additional optional quests when chance() is true", () => {
        setupGenerator({ chanceResult: true });
        const result = generateDailyQuests(100);
        expect(result.length).toBeGreaterThan(5);
    });
});
