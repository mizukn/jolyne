import { describe, expect, it } from "vitest";
import { chance, pickOne, randomInt, seededInt, shuffle } from "./random";

describe("randomInt", () => {
    it("returns an integer in [min, max]", () => {
        for (let i = 0; i < 1000; i++) {
            const value = randomInt(1, 5);
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThanOrEqual(5);
            expect(Number.isInteger(value)).toBe(true);
        }
    });

    it("supports a single-value range", () => {
        expect(randomInt(7, 7)).toBe(7);
    });
});

describe("pickOne", () => {
    it("returns one of the array's elements", () => {
        const arr = ["a", "b", "c"];
        for (let i = 0; i < 100; i++) {
            expect(arr).toContain(pickOne(arr));
        }
    });
});

describe("shuffle", () => {
    it("preserves length and contents", () => {
        const arr = [1, 2, 3, 4, 5, 6, 7];
        const shuffled = shuffle(arr);
        expect(shuffled).toHaveLength(arr.length);
        expect(shuffled.slice().sort()).toEqual(arr.slice().sort());
    });

    it("does not mutate the input", () => {
        const arr = [1, 2, 3, 4, 5];
        const snapshot = [...arr];
        shuffle(arr);
        expect(arr).toEqual(snapshot);
    });
});

describe("chance", () => {
    it("returns false for 0%", () => {
        for (let i = 0; i < 100; i++) {
            expect(chance(0)).toBe(false);
        }
    });

    it("returns true for 100%", () => {
        for (let i = 0; i < 100; i++) {
            expect(chance(100)).toBe(true);
        }
    });
});

describe("seededInt", () => {
    it("returns the same value for the same seed", () => {
        const a = seededInt("KingCrimsonUser", 1, 1000);
        const b = seededInt("KingCrimsonUser", 1, 1000);
        expect(a).toBe(b);
    });

    it("differs across seeds for the same range", () => {
        const samples = new Set<number>();
        for (let i = 0; i < 50; i++) {
            samples.add(seededInt(`seed_${i}`, 1, 1000));
        }
        // Practically impossible for 50 distinct seeds to collide this much.
        expect(samples.size).toBeGreaterThan(40);
    });

    it("stays in [min, max]", () => {
        for (let i = 0; i < 200; i++) {
            const value = seededInt(`seed_${i}`, 5, 10);
            expect(value).toBeGreaterThanOrEqual(5);
            expect(value).toBeLessThanOrEqual(10);
        }
    });
});
