import { describe, expect, it } from "vitest";
import { calculateArrayValues, getDiffPercent, plusOrMinus } from "./math";

describe("math utils", () => {
    it("sums arrays", () => {
        expect(calculateArrayValues([1, 2, 3, 4])).toBe(10);
    });

    it("calculates symmetric percentage difference", () => {
        expect(getDiffPercent(80, 100)).toBeCloseTo(22.222, 3);
    });

    it("formats relative signs", () => {
        expect(plusOrMinus(1, 2)).toBe("+");
        expect(plusOrMinus(2, 1)).toBe("-");
        expect(plusOrMinus(2, 2)).toBe("=~");
    });
});
