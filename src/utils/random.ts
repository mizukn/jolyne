import seedrandom from "seedrandom";

// One RNG module backing all random helpers in the codebase. Functions.ts
// re-exports these under the legacy names (randomArray, RNG, randomNumber,
// percent, shuffleArray) so existing callers keep working; new code should
// import from here directly.

export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const pickOne = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

export const shuffle = <T>(array: T[]): T[] => {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

export const shuffleInPlace = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const chance = (percent: number): boolean => {
    return randomInt(0, 10000000) / 100000 <= percent;
};

// Stable per-seed integer in [min, max]. Use for deterministic generators
// (e.g. NPC level lookups in src/index.ts) where the same input must always
// produce the same number across boots and clusters.
export const seededInt = (seed: string, min: number, max: number): number => {
    return Math.floor(seedrandom(seed)() * (max - min + 1)) + min;
};

export const generateRandomId = (): string =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
