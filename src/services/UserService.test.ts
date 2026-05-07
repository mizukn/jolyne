import { describe, expect, it } from "vitest";
import {
    addCoins,
    addXp,
    getMaxHealth,
    getMaxStamina,
    getRawSkillPointsLeft,
    isClaimXQuest,
} from "./UserService";
import type { ClaimXQuest, RPGUserDataJSON, RPGUserQuest } from "../@types";
import type Jolyne from "../structures/JolyneClient";

// Importing utils/Functions here would pull in the entire data registry
// (Webhooks, SpecialItems, Stand-Disc generation, etc.) which has top-level
// side effects requiring real env vars to load. So we test the service in
// isolation; the Functions.ts side is a one-line `= UserService.addCoins`
// re-export, which the typechecker enforces is reference-equal.

const baseUser = (): RPGUserDataJSON =>
    ({
        id: "test-user",
        coins: 0,
        xp: 0,
        level: 50,
        prestige: 0,
        adventureStartedAt: Date.now(),
        stand: "",
        customStandsEvolved: {},
        standsEvolved: {},
        equippedItems: {},
        inventory: {},
        skillPoints: {
            strength: 0,
            defense: 0,
            stamina: 0,
            perception: 0,
            speed: 0,
        },
        communityBans: [],
        daily: { quests: [] as RPGUserQuest[] },
        chapter: { quests: [] as RPGUserQuest[] },
        sideQuests: [],
    }) as unknown as RPGUserDataJSON;

const claimXQuest = (overrides: Partial<ClaimXQuest> = {}): ClaimXQuest => ({
    type: "claimX",
    id: "test",
    x: "coin",
    amount: 0,
    goal: 100,
    ...overrides,
});

describe("UserService.isClaimXQuest", () => {
    it("classifies claimX quests", () => {
        expect(isClaimXQuest(claimXQuest())).toBe(true);
    });

    it("rejects non-claimX quests", () => {
        expect(isClaimXQuest({ type: "fight", id: "x" } as RPGUserQuest)).toBe(false);
        expect(isClaimXQuest({ type: "ClaimXQuest", id: "x" } as RPGUserQuest)).toBe(false);
    });
});

describe("UserService.addCoins", () => {
    it("adds coins to userData", () => {
        const user = baseUser();
        addCoins(user, 50);
        expect(user.coins).toBe(50);
    });

    it("rounds the amount before adding", () => {
        const user = baseUser();
        addCoins(user, 10.6);
        expect(user.coins).toBe(11);
    });

    it("returns the rounded amount on success", () => {
        const user = baseUser();
        const returned = addCoins(user, 25.4);
        expect(returned).toBe(25);
    });

    it("subtracts coins on a negative amount but does not return a value", () => {
        const user = baseUser();
        user.coins = 100;
        const returned = addCoins(user, -30);
        expect(user.coins).toBe(70);
        expect(returned).toBeUndefined();
    });

    it("increments coin-tracked claimX quests", () => {
        const user = baseUser();
        user.daily.quests.push(claimXQuest({ x: "coin" }), claimXQuest({ x: "xp" }));
        addCoins(user, 100);
        expect((user.daily.quests[0] as ClaimXQuest).amount).toBe(100);
        expect((user.daily.quests[1] as ClaimXQuest).amount).toBe(0);
    });

    it("ignores claimX quests on a negative amount", () => {
        const user = baseUser();
        user.daily.quests.push(claimXQuest({ x: "coin" }));
        addCoins(user, -50);
        expect((user.daily.quests[0] as ClaimXQuest).amount).toBe(0);
    });
});

describe("UserService stat math", () => {
    it("calculates max health from level and defense skill points", () => {
        const user = baseUser();
        user.skillPoints.defense = 100;

        expect(getMaxHealth(user)).toBe(3840);
    });

    it("calculates max stamina from stamina skill points", () => {
        const user = baseUser();
        user.skillPoints.stamina = 50;

        expect(getMaxStamina(user)).toBe(199);
    });

    it("calculates raw skill points left including prestige bonus", () => {
        const user = baseUser();
        user.level = 10;
        user.prestige = 2;
        user.skillPoints.strength = 5;

        expect(getRawSkillPointsLeft(user)).toBe(55);
    });
});

describe("UserService.addXp", () => {
    const client = {
        patreons: [],
        boosters: [],
    } as unknown as Jolyne;

    it("adds xp to userData", () => {
        const user = baseUser();
        addXp(user, 50, client);

        expect(user.xp).toBe(50);
    });

    it("increments xp-tracked claimX quests", () => {
        const user = baseUser();
        user.daily.quests.push(claimXQuest({ x: "xp" }));

        addXp(user, 100, client);

        expect((user.daily.quests[0] as ClaimXQuest).amount).toBe(100);
    });

    it("can calculate xp without mutating the user", () => {
        const user = baseUser();
        const amount = addXp(user, 25, client, true);

        expect(amount).toBe(25);
        expect(user.xp).toBe(0);
    });
});
