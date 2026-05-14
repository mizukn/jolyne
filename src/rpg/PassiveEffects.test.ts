import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/Functions", () => ({}));

import { runPassiveEffects } from "./PassiveEffects";
import type { Passive } from "../@types";
import type { Fighter } from "../structures/Fighter";
import type { FightHandler } from "../structures/FightHandler";

const basePassive: Passive = {
    name: "Test",
    description: "Test passive",
    type: "round",
    getId: () => "x",
};

interface FakeFighter {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    totalHealingDone: number;
    weapon: { emoji: string } | undefined;
    incrHealth: (delta: number) => number;
    incrStamina: (delta: number) => number;
}

const makeFighter = (id: string, name: string, maxHealth = 100, maxStamina = 100): FakeFighter => {
    const fighter: FakeFighter = {
        id,
        name,
        health: maxHealth,
        maxHealth,
        stamina: maxStamina,
        maxStamina,
        totalHealingDone: 0,
        weapon: { emoji: "🗡️" },
        // incrHealth returns negative of the amount actually healed (capped at maxHealth).
        incrHealth: function (delta: number) {
            const before = this.health;
            this.health = Math.min(this.maxHealth, this.health + delta);
            return -(this.health - before);
        },
        incrStamina: function (delta: number) {
            const before = this.stamina;
            this.stamina = Math.min(this.maxStamina, this.stamina + delta);
            return -(this.stamina - before);
        },
    };
    return fighter;
};

const makeFight = (id = "f"): FightHandler =>
    ({
        id,
        cache: new Map<string, string | number>(),
        turns: [{ logs: [] as string[] }],
    }) as unknown as FightHandler;

const cast = (f: FakeFighter): Fighter => f as unknown as Fighter;

describe("runPassiveEffects — regen", () => {
    it("no-ops when the passive has no effects", () => {
        const user = makeFighter("u", "User", 100);
        user.health = 50;
        const fight = makeFight();

        runPassiveEffects(basePassive, cast(user), fight);
        expect(user.health).toBe(50);
        expect(fight.turns[0].logs).toHaveLength(0);
    });

    it("heals healthPercent of maxHealth and logs", () => {
        const passive: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "regeneration",
                    healthPercent: 0.02,
                    staminaPercent: 0,
                    capPercent: 0.1,
                },
            ],
        };
        const user = makeFighter("u", "User", 1000);
        user.health = 500;
        const fight = makeFight("F1");

        runPassiveEffects(passive, cast(user), fight);

        expect(user.health).toBe(520);
        expect(user.totalHealingDone).toBe(20);
        expect(fight.turns[0].logs[0]).toContain("regenerated **20** health.");
    });

    it("includes stamina in the log when staminaPercent > 0", () => {
        const passive: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "regeneration_alter",
                    healthPercent: 0.04,
                    staminaPercent: 0.04,
                    capPercent: 0.1,
                },
            ],
        };
        const user = makeFighter("u", "User", 1000, 1000);
        user.health = 500;
        user.stamina = 500;
        const fight = makeFight("F2");

        runPassiveEffects(passive, cast(user), fight);

        expect(user.health).toBe(540);
        expect(user.stamina).toBe(540);
        expect(fight.turns[0].logs[0]).toContain(
            "regenerated **40** health and **40** stamina.",
        );
    });

    it("stops firing once totalHealingDone >= baseHealth * capPercent", () => {
        const passive: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "regeneration",
                    healthPercent: 0.04,
                    staminaPercent: 0,
                    capPercent: 0.1,
                },
            ],
        };
        const user = makeFighter("u", "User", 1000);
        user.health = 500;
        const fight = makeFight("F3");

        // 1000 * 0.04 = 40 per fire. Cap = 100. Should fire 3 times (40+40+40=120 >= 100 stops on the 4th).
        runPassiveEffects(passive, cast(user), fight); // 540 / total=40
        runPassiveEffects(passive, cast(user), fight); // 580 / total=80
        runPassiveEffects(passive, cast(user), fight); // 620 / total=120
        runPassiveEffects(passive, cast(user), fight); // gated, no-op
        runPassiveEffects(passive, cast(user), fight); // gated, no-op

        expect(user.health).toBe(620);
        expect(fight.turns[0].logs).toHaveLength(3);
    });

    it("doesn't log when no healing actually happened (already at max)", () => {
        const passive: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "regeneration",
                    healthPercent: 0.02,
                    staminaPercent: 0,
                    capPercent: 0.1,
                },
            ],
        };
        const user = makeFighter("u", "User", 1000);
        // already at full health
        const fight = makeFight("F4");

        runPassiveEffects(passive, cast(user), fight);

        expect(user.health).toBe(1000);
        expect(fight.turns[0].logs).toHaveLength(0);
    });

    it("uses the cacheKey to namespace cache slots per passive", () => {
        const a: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "regeneration",
                    healthPercent: 0.02,
                    staminaPercent: 0,
                    capPercent: 0.1,
                },
            ],
        };
        const b: Passive = {
            ...basePassive,
            effects: [
                {
                    type: "regen",
                    cacheKey: "jingle",
                    healthPercent: 0.02,
                    staminaPercent: 0,
                    capPercent: 0.1,
                },
            ],
        };
        const user = makeFighter("u", "User", 1000);
        user.health = 500;
        const fight = makeFight("F5");

        runPassiveEffects(a, cast(user), fight);
        runPassiveEffects(b, cast(user), fight);

        // Both should have fired once each — they don't share cache.
        expect(fight.cache.get("regeneration_u_F5.totalhealingdone")).toBe(20);
        expect(fight.cache.get("jingle_u_F5.totalhealingdone")).toBe(20);
    });
});
