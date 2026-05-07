import { describe, expect, it } from "vitest";
import { addCoins, isClaimXQuest } from "./UserService";
import type { ClaimXQuest, RPGUserDataJSON, RPGUserQuest } from "../@types";

// Importing utils/Functions here would pull in the entire data registry
// (Webhooks, SpecialItems, Stand-Disc generation, etc.) which has top-level
// side effects requiring real env vars to load. So we test the service in
// isolation; the Functions.ts side is a one-line `= UserService.addCoins`
// re-export, which the typechecker enforces is reference-equal.

const baseUser = (): RPGUserDataJSON =>
    ({
        coins: 0,
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
