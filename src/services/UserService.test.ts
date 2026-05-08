import { describe, expect, it } from "vitest";
import {
    addCoins,
    addHealth,
    addPrestigeShards,
    addSocialCredits,
    addStamina,
    addXp,
    fixUserSettings,
    getDodgeScore,
    getHealthEffect,
    getMaxHealth,
    getMaxStamina,
    getRawSkillPointsLeft,
    getRPGUserDataChanges,
    getSpeedScore,
    getStaminaEffect,
    getTrueLevel,
    hasReachedMaxLevel,
    isClaimXQuest,
    PrestigeShardReward,
    prestigeUser,
    prestigeUserMethod2,
    userMeetsRequirementsForItem,
} from "./UserService";
import type {
    ClaimXQuest,
    Consumable,
    EquipableItem,
    RPGUserDataJSON,
    RPGUserQuest,
} from "../@types";
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

describe("UserService currency and resource mutations", () => {
    it("adds social credits and increments tracked quests", () => {
        const user = baseUser();
        user.social_credits_2025 = 0;
        user.daily.quests.push(claimXQuest({ x: "social_credit" }));

        const returned = addSocialCredits(user, 75.4);

        expect(returned).toBe(75);
        expect(user.social_credits_2025).toBe(75);
        expect((user.daily.quests[0] as ClaimXQuest).amount).toBe(75);
    });

    it("adds prestige shards only when prestige is enabled", () => {
        const user = baseUser();
        const previous = process.env.ENABLE_PRESTIGE;
        process.env.ENABLE_PRESTIGE = "1";

        try {
            const returned = addPrestigeShards(user, 12.6);

            expect(returned).toBe(13);
            expect(user.prestige_shards).toBe(13);
        } finally {
            if (previous === undefined) delete process.env.ENABLE_PRESTIGE;
            else process.env.ENABLE_PRESTIGE = previous;
        }
    });

    it("caps health and stamina at their maximums", () => {
        const user = baseUser();
        user.health = 10;
        user.stamina = 10;

        addHealth(user, 5000);
        addStamina(user, 5000);

        expect(user.health).toBe(getMaxHealth(user));
        expect(user.stamina).toBe(getMaxStamina(user));
    });

    it("calculates flat and percentage consumable effects", () => {
        const user = baseUser();
        const item = {
            effects: {
                health: "10%",
                stamina: 25,
            },
        } as unknown as Consumable;

        expect(getHealthEffect(item, user)).toBe(getMaxHealth(user) * 0.1);
        expect(getStaminaEffect(item, user)).toBe(25);
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

    it("calculates dodge and speed scores from perception and speed", () => {
        const user = baseUser();
        user.skillPoints.perception = 22;
        user.skillPoints.speed = 33;

        expect(getDodgeScore(user)).toBe(20);
        expect(getSpeedScore(user)).toBe(30);
    });

    it("calculates true level from spent and unspent skill points", () => {
        const user = baseUser();
        user.level = 10;
        user.skillPoints.strength = 4;

        expect(getTrueLevel(user)).toBe(10);
    });

    it("detects the prestige level cap", () => {
        const user = baseUser();
        user.level = 100;
        user.prestige = 0;

        expect(hasReachedMaxLevel(user)).toBe(true);

        user.level = 99;
        expect(hasReachedMaxLevel(user)).toBe(false);
    });

    it("prestiges a capped user with method 2", () => {
        const user = baseUser();
        user.level = 100;
        user.prestige = 0;
        user.prestige_shards = 0;
        user.skillPoints.strength = 10;

        expect(prestigeUserMethod2(user)).toBe(true);
        expect(user.prestige).toBe(1);
        expect(user.level).toBe(1);
        expect(user.skillPoints.strength).toBe(0);
        expect(user.prestige_shards).toBe(PrestigeShardReward);
    });

    it("requires the prestige feature flag for prestigeUser", () => {
        const user = baseUser();
        user.level = 100;
        user.prestige_shards = 0;
        const previous = process.env.ENABLE_PRESTIGE;
        delete process.env.ENABLE_PRESTIGE;

        try {
            expect(prestigeUser(user)).toBe(false);
            expect(user.prestige).toBe(0);
        } finally {
            if (previous !== undefined) process.env.ENABLE_PRESTIGE = previous;
        }
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

describe("UserService user validation", () => {
    it("fills missing settings with defaults", () => {
        const user = baseUser();
        (user as { settings?: RPGUserDataJSON["settings"] }).settings = undefined;

        fixUserSettings(user);

        expect(user.settings.fight.auto_target_lock).toBe(true);
        expect(user.settings.notifications.email).toBe(true);
        expect(user.settings.auto_heal.excluded_items).toEqual([]);
    });

    it("fills missing nested settings without replacing existing choices", () => {
        const user = baseUser();
        user.settings = {
            notifications: {
                email: false,
            },
        };

        fixUserSettings(user);

        expect(user.settings.notifications.email).toBe(false);
        expect(user.settings.notifications.low_health_or_stamina).toBe(true);
        expect(user.settings.fight.auto_target_lock).toBe(true);
    });

    it("checks item level, prestige, and skill point requirements", () => {
        const user = baseUser();
        user.level = 20;
        user.prestige = 1;
        user.skillPoints.strength = 10;
        const item = {
            requirements: {
                level: 10,
                prestige: 1,
                skillPoints: {
                    strength: 5,
                },
            },
        } as EquipableItem;

        expect(userMeetsRequirementsForItem(user, item)).toBe(true);

        item.requirements.skillPoints.strength = 15;
        expect(userMeetsRequirementsForItem(user, item)).toBe(false);
    });
});

describe("UserService.getRPGUserDataChanges", () => {
    it("reports top-level and inventory changes", () => {
        const before = baseUser();
        const after = baseUser();
        before.inventory.arrow = 1;
        after.inventory.arrow = 3;
        after.coins = 250;

        expect(getRPGUserDataChanges(before, after)).toEqual(
            expect.arrayContaining([
                { name: "coins", before: "0", after: "250" },
                { name: "inventory[arrow]", before: "1", after: "3" },
            ]),
        );
    });

    it("reports nested daily quest changes", () => {
        const before = baseUser();
        const after = baseUser();
        before.daily.quests.push(claimXQuest({ amount: 1 }));
        after.daily.quests.push(claimXQuest({ amount: 4 }));

        expect(getRPGUserDataChanges(before, after)).toContainEqual({
            name: "daily.quests[0].amount",
            before: "1",
            after: "4",
        });
    });
});
