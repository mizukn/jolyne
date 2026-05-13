// Static configuration for `/dungeon`: modifier table (used by both quest
// gating and reward math), the multiplier helpers, and the drop table.

export interface DungeonModifier {
    id: string;
    description: string;
    xpIncrease: number;
    dropIncrease: number;
    emoji: string;
}

export const possibleModifiers: DungeonModifier[] = [
    {
        id: "speedrun",
        description: "NPC levels increase twice as fast.",
        xpIncrease: 1.5,
        dropIncrease: 1.5,
        emoji: "🏃",
    },
    {
        id: "no_breaks",
        description: "Your health and stamina are not reset after each enemy.",
        xpIncrease: 1.8,
        dropIncrease: 2,
        emoji: "❌",
    },
    {
        id: "the_elite",
        description: "All enemies will use S or SS tier stands and will always use a weapon.",
        xpIncrease: 1.3,
        dropIncrease: 2,
        emoji: "🔥",
    },
    {
        id: "clone",
        description: "All enemies will have an exact clone of themselves.",
        xpIncrease: 1.9,
        dropIncrease: 2,
        emoji: "👥",
    },
];

const sumIncrease = (
    selected: string[],
    pick: (m: DungeonModifier) => number,
): number => {
    const total =
        selected.reduce((acc, id) => {
            const modifier = possibleModifiers.find((m) => m.id === id);
            return modifier ? acc + pick(modifier) : acc;
        }, 1) - selected.length;
    return Math.round(total * 100) / 100;
};

export const getTotalXpIncrease = (selected: string[]): number =>
    sumIncrease(selected, (m) => m.xpIncrease);

export const getTotalDropIncrease = (selected: string[]): number =>
    sumIncrease(selected, (m) => m.dropIncrease);

export interface DungeonDrop {
    id: string;
    percent: number;
}

export const dungeonRewards: DungeonDrop[] = [
    { id: "stand_arrow", percent: 15 },
    { id: "energy_drink", percent: 9 },
    { id: "health_potion", percent: 5 },
    { id: "rare_stand_arrow", percent: 5 },
    { id: "broken_arrow", percent: 30 },
    { id: "bloody_knife", percent: 0.5 },
    { id: "gauntlets_of_the_berserker", percent: 0.3 },
    { id: "dios_knives", percent: 0.2 },
    { id: "megumins_wand", percent: 0.2 },
];
