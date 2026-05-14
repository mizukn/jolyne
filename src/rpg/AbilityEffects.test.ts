import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/Functions", () => ({
    getAbilityDamage: vi.fn(() => 100),
    generateRandomId: vi.fn(() => "test-id"),
}));

import { runAbilityEffects } from "./AbilityEffects";
import type { Ability, FightPromise } from "../@types";
import type { Fighter } from "../structures/Fighter";
import type { FightHandler } from "../structures/FightHandler";

const baseAbility: Ability = {
    name: "Test",
    description: "Test ability",
    cooldown: 0,
    extraTurns: 0,
    damage: 0,
    stamina: 0,
    dodgeScore: 0,
    target: "enemy",
};

const makeFighter = (id: string, name: string, health = 1000): Fighter =>
    ({
        id,
        name,
        health,
        totalDamageDealt: 0,
    }) as unknown as Fighter;

interface FlushableFight extends FightHandler {
    _flush: () => void;
}

const makeFight = (fighters: Fighter[]): FlushableFight => {
    const nextTurnPromises: FightPromise[] = [];
    const turns = [{ logs: [] as string[] }];
    const fight = {
        fighters,
        nextTurnPromises,
        nextRoundPromises: [] as FightPromise[],
        turns,
    } as unknown as FlushableFight;
    fight._flush = () => {
        for (const p of [...nextTurnPromises]) p.promise(fight);
    };
    return fight;
};

describe("runAbilityEffects — bleed", () => {
    it("no-ops when the ability has no effects", () => {
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target");
        const fight = makeFight([user, target]);

        runAbilityEffects(baseAbility, user, target, 50, fight);
        expect(fight.nextTurnPromises).toHaveLength(0);
    });

    it("schedules a bleed tick on nextTurnPromises with the right cooldown", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "bleed", damageDivisor: 10, turns: 3 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target");
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 50, fight);
        expect(fight.nextTurnPromises).toHaveLength(1);
        expect(fight.nextTurnPromises[0].cooldown).toBe(3);
        expect(fight.nextTurnPromises[0].executeOnlyOnce).toBe(false);
        expect(fight.nextTurnPromises[0].callerId).toBe("u");
    });

    it("scales tick damage from dealtDamage with source=dealt (default)", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "bleed", damageDivisor: 10, turns: 1 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 1000);
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 50, fight);
        fight._flush();

        expect(target.health).toBe(995); // 1000 - round(50 / 10)
        expect(user.totalDamageDealt).toBe(5);
        expect(fight.turns[0].logs[0]).toContain("took **5** bleed damage");
    });

    it("scales tick damage from getAbilityDamage with source=ability", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [
                { type: "bleed", damageDivisor: 10, turns: 1, source: "ability" },
            ],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 1000);
        const fight = makeFight([user, target]);

        // dealtDamage (5) is ignored; mocked getAbilityDamage returns 100.
        runAbilityEffects(ability, user, target, 5, fight);
        fight._flush();

        expect(target.health).toBe(990); // 1000 - round(100 / 10)
        expect(user.totalDamageDealt).toBe(10);
    });

    it("logs death and clamps health when bleed kills the target", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "bleed", damageDivisor: 1, turns: 1 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 10);
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 50, fight);
        fight._flush();

        expect(target.health).toBe(0);
        expect(fight.turns[0].logs[0]).toContain("died from bleed damage");
    });

    it("stacks multiple effects in one ability", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [
                { type: "bleed", damageDivisor: 10, turns: 2 },
                { type: "bleed", damageDivisor: 5, turns: 1, source: "ability" },
            ],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target");
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 50, fight);
        expect(fight.nextTurnPromises).toHaveLength(2);
    });
});

describe("runAbilityEffects — poison", () => {
    it("queues on nextRoundPromises (not nextTurnPromises)", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "poison", damageDivisor: 10, turns: 2 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target");
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 30, fight);
        expect(fight.nextTurnPromises).toHaveLength(0);
        expect(fight.nextRoundPromises).toHaveLength(1);
        expect(fight.nextRoundPromises[0].cooldown).toBe(2);
    });

    it("logs the static tick damage and applies it when target is alive", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "poison", damageDivisor: 10, turns: 1 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 1000);
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 30, fight);
        fight.nextRoundPromises[0].promise(fight);

        expect(target.health).toBe(997); // 1000 - round(30 / 10)
        expect(user.totalDamageDealt).toBe(3);
        expect(fight.turns[0].logs[0]).toContain("took **3** poison damage");
    });

    it("logs death after damage when poison kills the target", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "poison", damageDivisor: 1, turns: 1 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 10);
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 50, fight);
        fight.nextRoundPromises[0].promise(fight);

        expect(target.health).toBe(0);
        expect(fight.turns[0].logs).toEqual([
            expect.stringContaining("took **50** poison damage"),
            expect.stringContaining("died from poison damage"),
        ]);
    });

    it("still logs the tick line when the target was already dead (legacy parity)", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [{ type: "poison", damageDivisor: 10, turns: 1 }],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target", 0);
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 30, fight);
        fight.nextRoundPromises[0].promise(fight);

        // Bug-like behavior preserved from `poisonDamagePromise`: the
        // "took N damage" line fires unconditionally, even if the target was
        // already at 0 HP and no further damage applies.
        expect(target.health).toBe(0);
        expect(user.totalDamageDealt).toBe(0);
        expect(fight.turns[0].logs).toHaveLength(1);
        expect(fight.turns[0].logs[0]).toContain("took **3** poison damage");
    });

    it("mixes poison and bleed on the same ability", () => {
        const ability: Ability = {
            ...baseAbility,
            effects: [
                { type: "poison", damageDivisor: 3, turns: 2 },
                { type: "bleed", damageDivisor: 3, turns: 2 },
            ],
        };
        const user = makeFighter("u", "User");
        const target = makeFighter("t", "Target");
        const fight = makeFight([user, target]);

        runAbilityEffects(ability, user, target, 30, fight);
        expect(fight.nextRoundPromises).toHaveLength(1);
        expect(fight.nextTurnPromises).toHaveLength(1);
    });
});
