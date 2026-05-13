// Stand-related helpers. Shape checks for evolution stands, lookup of the
// current evolution index, and weighted-random pickers used by event NPCs
// and stand-disc generation.

import * as Stands from "../rpg/Stands";
import * as EquipableItems from "../rpg/Items/EquipableItems";
import { pickOne } from "./random";
import { isWeapon } from "./item_guards";
import type { Stand, EvolutionStand, Weapon, Rarity } from "../@types";

const totalStands: Stand[] = [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => ({
        ...x.evolutions[0],
        id: x.id,
    })),
];

const totalWeapons = Object.values(EquipableItems).filter((x) => isWeapon(x)) as Weapon[];

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
    const pool = includeRarity
        ? totalStands.filter((x) => includeRarity.includes(x.rarity))
        : totalStands;
    const randomStand = pickOne(pool);
    return { stand: randomStand, evolution: getStandEvolution(randomStand) };
};

export const getRandomWeapon = (includeRarity?: Rarity[]): Weapon => {
    const pool = includeRarity
        ? totalWeapons.filter((x) => includeRarity.includes(x.rarity))
        : totalWeapons;
    return pickOne(pool);
};
