// Stand-related helpers. Shape checks for evolution stands, lookup of the
// current evolution index, and weighted-random pickers used by event NPCs
// and stand-disc generation.

import * as Stands from "../rpg/Stands";
import * as EquipableItems from "../rpg/Items/EquipableItems";
import { pickOne } from "./random";
import { isWeapon } from "./item_guards";
import type { Stand, EvolutionStand, Weapon, Rarity } from "../@types";

// Computed lazily on first use. `Stands` and `EquipableItems` form an
// import cycle through `Items/SpecialItems.ts`, so reading their values at
// module-init time can yield empty namespaces depending on which side
// of the cycle loaded first.
let cachedStands: Stand[] | null = null;
const getAllStands = (): Stand[] => {
    if (cachedStands) return cachedStands;
    cachedStands = [
        ...Object.values(Stands.Stands),
        ...Object.values(Stands.EvolutionStands).map((x) => ({
            ...x.evolutions[0],
            id: x.id,
        })),
    ];
    return cachedStands;
};

let cachedWeapons: Weapon[] | null = null;
const getAllWeapons = (): Weapon[] => {
    if (cachedWeapons) return cachedWeapons;
    cachedWeapons = Object.values(EquipableItems).filter((x) => isWeapon(x)) as Weapon[];
    return cachedWeapons;
};

export const isEvolvableStand = (stand: Stand | EvolutionStand): boolean => {
    return (stand as EvolutionStand).evolutions !== undefined;
};

export const isEvolutionStand = (stand: Stand | EvolutionStand): stand is EvolutionStand => {
    return (stand as EvolutionStand).evolutions !== undefined;
};

export const getStandEvolution = (stand: Stand): number => {
    const baseStand = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id);
    if (!baseStand) return 0;
    return baseStand.evolutions.findIndex((x) => x.name === stand.name);
};

export const getRandomStand = (
    includeRarity?: Rarity[],
): { stand: Stand; evolution: number } => {
    const all = getAllStands();
    const pool = includeRarity ? all.filter((x) => includeRarity.includes(x.rarity)) : all;
    const randomStand = pickOne(pool);
    return { stand: randomStand, evolution: getStandEvolution(randomStand) };
};

export const getRandomWeapon = (includeRarity?: Rarity[]): Weapon => {
    const all = getAllWeapons();
    const pool = includeRarity ? all.filter((x) => includeRarity.includes(x.rarity)) : all;
    return pickOne(pool);
};
