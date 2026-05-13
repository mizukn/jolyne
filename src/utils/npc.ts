// NPC scaling helpers. `editNPCLevel` returns a deep-copied NPC with a new
// level and regenerated skill points; `fixNpcRewards` recomputes the XP /
// coin rewards from the level + stand rarity + equipped-weapon rarity, with
// the multiplier table inlined here.

import type { NPC, FightableNPC, Weapon } from "../@types";
import { generateSkillPoints } from "../services/UserService";
import { findStand, findItem } from "./lookup";
import { getMaxXp } from "./rewards";

const RARITY_MULTIPLIER: Record<string, number> = {
    SS: 1.65,
    S: 1.45,
    A: 1.2,
    B: 1.1,
    C: 1.05,
    T: 1.35,
};

export const editNPCLevel = (npc: NPC, level: number): NPC | FightableNPC => {
    const newNPC = JSON.parse(JSON.stringify({ ...npc })) as FightableNPC;
    newNPC.level = level;
    generateSkillPoints(newNPC);
    return newNPC;
};

export function fixNpcRewards(npc: FightableNPC): void {
    if (!npc.rewards) npc.rewards = {};
    const baseXp = 5000 + npc.level * 750 + getMaxXp(npc.level) * 0.005;
    let multiplier = 1;
    const stand = findStand(npc.stand, npc.standsEvolved[npc.stand]);
    if (stand) {
        multiplier = RARITY_MULTIPLIER[stand.rarity];
    }
    for (const type of Object.values(npc.equippedItems)) {
        if (type === 6) {
            const weapon = findItem(
                Object.keys(npc.equippedItems).find((x) => npc.equippedItems[x] === 6),
            ) as Weapon;
            if (weapon) {
                multiplier *= RARITY_MULTIPLIER[weapon.rarity];
            }
        }
    }

    npc.rewards.xp = Math.round(baseXp * multiplier);
    const baseCoins = 1000 + npc.level * 0.25 + getMaxXp(npc.level) * 0.0005;
    npc.rewards.coins = Math.round(baseCoins * multiplier);
}
