import { describe, expect, it, vi } from "vitest";

vi.mock("../rpg/Stands", () => ({
    Stands: {
        sticky: {
            id: "sticky",
            name: "Sticky Fingers",
            rarity: "SS",
            color: 0,
            skillPoints: {},
        },
        crazy: {
            id: "crazy",
            name: "Crazy Diamond",
            rarity: "S",
            color: 0,
            skillPoints: {},
        },
    },
    EvolutionStands: {
        gold: {
            id: "gold",
            evolutions: [
                {
                    id: "gold",
                    name: "Gold Experience",
                    rarity: "S",
                    color: 0,
                    skillPoints: {},
                },
                {
                    id: "gold",
                    name: "Gold Experience Requiem",
                    rarity: "SS",
                    color: 0,
                    skillPoints: {},
                },
            ],
        },
    },
}));

vi.mock("../rpg/Items/EquipableItems", () => ({
    bronzeSword: {
        id: "bronze_sword",
        name: "Bronze Sword",
        type: 6,
        rarity: "C",
        abilities: [],
        effects: { skillPoints: {} },
    },
    ironSword: {
        id: "iron_sword",
        name: "Iron Sword",
        type: 6,
        rarity: "B",
        abilities: [],
        effects: { skillPoints: {} },
    },
    helmet: {
        id: "helmet",
        name: "Helmet",
        type: 1,
        rarity: "B",
        effects: { skillPoints: {} },
    },
}));

import {
    isEvolvableStand,
    isEvolutionStand,
    getStandEvolution,
    getRandomStand,
    getRandomWeapon,
} from "./stand";
import * as Stands from "../rpg/Stands";
import type { Stand, EvolutionStand } from "../@types";

describe("stand helpers", () => {
    const mockedStands = Stands.Stands as unknown as Record<string, Stand>;
    const mockedEvolutions = Stands.EvolutionStands as unknown as Record<
        string,
        EvolutionStand
    >;
    const regularStand = mockedStands.sticky;
    const evolvableStand = mockedEvolutions.gold;

    it("isEvolvableStand returns true for evolution stand definitions", () => {
        expect(isEvolvableStand(evolvableStand)).toBe(true);
        expect(isEvolvableStand(regularStand)).toBe(false);
    });

    it("isEvolutionStand narrows the type", () => {
        expect(isEvolutionStand(evolvableStand)).toBe(true);
        expect(isEvolutionStand(regularStand)).toBe(false);
    });

    it("getStandEvolution returns 0 for regular stands", () => {
        expect(getStandEvolution(regularStand)).toBe(0);
    });

    it("getStandEvolution returns the matching index for evolution variants", () => {
        const base = { ...evolvableStand.evolutions[0], id: evolvableStand.id } as Stand;
        expect(getStandEvolution(base)).toBe(0);

        const next = { ...evolvableStand.evolutions[1], id: evolvableStand.id } as Stand;
        expect(getStandEvolution(next)).toBe(1);
    });

    it("getRandomStand returns a valid pick from the mocked pool", () => {
        const { stand, evolution } = getRandomStand();
        expect(stand).toBeDefined();
        expect(typeof stand.id).toBe("string");
        expect(typeof evolution).toBe("number");
    });

    it("getRandomStand honors rarity filter", () => {
        const { stand } = getRandomStand(["SS"]);
        expect(stand.rarity).toBe("SS");
    });

    it("getRandomWeapon returns only weapons (filters out other equippables)", () => {
        const weapon = getRandomWeapon();
        expect(weapon).toBeDefined();
        expect(weapon.type).toBe(6);
        expect(weapon.id === "bronze_sword" || weapon.id === "iron_sword").toBe(true);
    });

    it("getRandomWeapon honors rarity filter", () => {
        const weapon = getRandomWeapon(["B"]);
        expect(weapon.rarity).toBe("B");
        expect(weapon.id).toBe("iron_sword");
    });
});
