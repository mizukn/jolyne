import type { FightableNPC, NPC, Stand, Weapon } from "../../@types";
import * as EquipableItems from "../Items/EquipableItems";
import * as FightableNPCs from "./FightableNPCs";
import * as NPCs from "./NPCs";
import * as PRESTIGEJSON from "../../prestigeNPCs.json";
import * as JSONNPC from "../../NPCs.json";
import * as Stands from "../Stands";
import { seededInt } from "../../utils/random";

const npcRegistry = NPCs as unknown as Record<string, NPC>;
const fightableNPCRegistry = FightableNPCs as unknown as Record<string, FightableNPC>;

const stableLevel = (id: string, min: number, max: number): number =>
    seededInt(`${process.env.ENABLE_PRESTIGE ? "prestige" : "normal"}::${id}`, min, max);

const getPrestigeAdd = (x: Stand | Weapon): number => {
    return x.rarity === "C"
        ? 5
        : x.rarity === "B"
        ? 10
        : x.rarity === "A"
        ? 25
        : x.rarity === "S"
        ? 75
        : x.rarity === "SS"
        ? 300
        : 30;
};

const getWeapons = (): Weapon[] =>
    Object.values(EquipableItems).filter((x) => (x as Weapon).abilities !== undefined) as Weapon[];

const getStoredStandUserLevels = (): Record<string, number> => ({
    ...((process.env.ENABLE_PRESTIGE ? PRESTIGEJSON : JSONNPC) as unknown as Record<string, number>),
});

const getStandUserKey = (stand: Stand): string => `${stand.name.replace(" ", "")}User`;

const getGeneratedStands = (): Stand[] => [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).flatMap((x) =>
        x.evolutions.map((y) => ({
            ...y,
            id: x.id,
        })),
    ),
];

const getBaseMinLevel = (standOrWeapon: Stand | Weapon): number =>
    standOrWeapon.rarity === "C"
        ? 1
        : standOrWeapon.rarity === "B"
        ? 10
        : standOrWeapon.rarity === "A"
        ? 20
        : standOrWeapon.rarity === "S"
        ? 100
        : standOrWeapon.rarity === "SS"
        ? 200
        : 30;

const applyAprilFoolsStandSkin = (stand: Stand): void => {
    if (new Date().getMonth() !== 3 || new Date().getDate() !== 1) return;
    stand.emoji = "🤡";
    stand.image = "https://i.pinimg.com/originals/32/f2/ed/32f2eddb36d15d979a29c9728ac89472.jpg";
};

const getStandEvolutionIndex = (stand: Stand): number => {
    const evolutionStand = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id);
    if (!evolutionStand) return 0;
    return evolutionStand.evolutions.findIndex((x) => x.name === stand.name);
};

const buildStandArrowRewards = (level: number): FightableNPC["rewards"] => {
    const rewards: FightableNPC["rewards"] = { items: [] };
    for (let i = 0; i < level; i += 10) {
        rewards.items.push({
            item: "stand_arrow",
            amount: 1,
            chance: 5,
        });
    }

    if (rewards.items.length === 0) rewards.items = undefined;
    return rewards;
};

export const registerStandUserNPCs = (): void => {
    const formattedStandUsers = getStoredStandUserLevels();
    const weapons = getWeapons().filter((x) => !x.private);

    for (const stand of getGeneratedStands()) {
        applyAprilFoolsStandSkin(stand);
        if (!stand.available || stand.name.toLocaleLowerCase() === "mommy queen") continue;

        const standUserKey = getStandUserKey(stand);
        npcRegistry[standUserKey] = {
            id: `${stand.name.replace(" ", "")}_user`,
            name: `${stand.name} User`,
            emoji: stand.emoji,
        };

        if (!formattedStandUsers[standUserKey]) {
            let minLevel = getBaseMinLevel(stand);
            let maxLevel = minLevel * 12;
            if (process.env.ENABLE_PRESTIGE) {
                minLevel = getPrestigeAdd(stand);
                maxLevel = minLevel * 2;
            }
            formattedStandUsers[standUserKey] = stableLevel(
                standUserKey,
                Math.round(minLevel * 1.5),
                maxLevel,
            );
        }

        const standUserLevel = formattedStandUsers[standUserKey];
        const rewards = buildStandArrowRewards(standUserLevel);
        const evolution = getStandEvolutionIndex(stand);

        fightableNPCRegistry[standUserKey] = {
            ...npcRegistry[standUserKey],
            level: standUserLevel,
            skillPoints: {
                defense: 0,
                strength: 0,
                speed: 0,
                perception: 0,
                stamina: 0,
            },
            stand: stand.id,
            equippedItems: {},
            private: stand.adminOnly ? true : false,
            standsEvolved: {
                [stand.id]: evolution,
            },
            rewards: {
                items: rewards.items,
            },
        };

        for (const weapon of weapons) {
            const id = `${stand.name.replace(" ", "")}User${weapon.id}`;
            npcRegistry[id] = {
                id,
                name: `${stand.name} [${weapon.name}] User`,
                emoji: stand.emoji,
            };

            if (!formattedStandUsers[id]) {
                let minLevel = getBaseMinLevel(weapon);
                if (weapon.abilities) minLevel *= 2;
                let maxLevel = minLevel * 12;

                if (process.env.ENABLE_PRESTIGE) {
                    minLevel = getPrestigeAdd(weapon);
                    minLevel += getPrestigeAdd(stand);
                    maxLevel = minLevel * 2;
                }
                formattedStandUsers[id] = stableLevel(id, Math.round(minLevel * 1.5), maxLevel);
            }

            fightableNPCRegistry[id] = {
                ...npcRegistry[id],
                level: formattedStandUsers[id],
                skillPoints: {
                    defense: 0,
                    strength: 0,
                    speed: 0,
                    perception: 0,
                    stamina: 0,
                },
                stand: stand.id,
                equippedItems: {
                    [weapon.id]: 6,
                },
                standsEvolved: {
                    [stand.id]: evolution,
                },
                private: stand.adminOnly ? true : false,
                rewards: {
                    items: rewards.items,
                },
            };
        }
    }
};
