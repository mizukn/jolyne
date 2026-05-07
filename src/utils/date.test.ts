import { describe, expect, it } from "vitest";
import { getCurrentDate, isTimeNext15, roundToNext15Minutes } from "./date";

describe("date utils", () => {
    it("formats dates as yyyy-mm-dd", () => {
        expect(getCurrentDate(new Date("2026-05-08T12:34:56Z"))).toBe("2026-05-08");
    });

    it("detects quarter-hour timestamps", () => {
        expect(isTimeNext15(new Date("2026-05-08T12:15:00Z"))).toBe(true);
        expect(isTimeNext15(new Date("2026-05-08T12:22:00Z"))).toBe(false);
    });

    it("rounds to the next quarter hour", () => {
        expect(roundToNext15Minutes(new Date("2026-05-08T12:22:30Z")).toISOString()).toBe(
            "2026-05-08T12:30:00.000Z",
        );
        expect(roundToNext15Minutes(new Date("2026-05-08T12:45:00Z")).toISOString()).toBe(
            "2026-05-08T13:00:00.000Z",
        );
    });
});
