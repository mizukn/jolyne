import { describe, expect, it } from "vitest";
import {
    EVENT_IDS,
    getActive,
    getEvent,
    isActive,
    isEndingSoon,
    registerCommandEntryHook,
    runCommandEntryHooks,
} from "./EventService";

describe("EventService", () => {
    it("finds registered event windows", () => {
        const event = getEvent(EVENT_IDS.CHINESE_NEW_YEAR_2025);
        expect(event?.startsAt.getTime()).toBe(1738080000000);
    });

    it("preserves legacy exclusive Christmas boundaries", () => {
        const event = getEvent(EVENT_IDS.CHRISTMAS_2024);
        expect(event).toBeDefined();
        if (!event) return;

        expect(isActive(event.id, event.startsAt)).toBe(false);
        expect(isActive(event.id, new Date(event.startsAt.getTime() + 1))).toBe(true);
        expect(isActive(event.id, event.endsAt)).toBe(false);
    });

    it("returns active events for a date", () => {
        const active = getActive(new Date("2025-02-01T00:00:00.000Z")).map((event) => event.id);
        expect(active).toContain(EVENT_IDS.CHINESE_NEW_YEAR_2025);
        expect(active).not.toContain(EVENT_IDS.WINTER_2025);
    });

    it("reports ending-soon only while an event is active", () => {
        const nearEnd = new Date("2025-03-20T00:00:00.000Z");
        const afterEnd = new Date("2025-03-22T00:00:00.000Z");

        expect(isEndingSoon(EVENT_IDS.THIRD_ANNIVERSARY, 2 * 24 * 60 * 60 * 1000, nearEnd)).toBe(
            true,
        );
        expect(isEndingSoon(EVENT_IDS.THIRD_ANNIVERSARY, 2 * 24 * 60 * 60 * 1000, afterEnd)).toBe(
            false,
        );
    });

    it("runs command-entry hooks only for active events", () => {
        let calls = 0;
        registerCommandEntryHook(EVENT_IDS.HALLOWEEN_2025, () => {
            calls++;
        });

        runCommandEntryHooks({}, new Date("2025-10-30T00:00:00.000Z"));
        expect(calls).toBe(0);

        runCommandEntryHooks({}, new Date("2025-11-01T00:00:00.000Z"));
        expect(calls).toBe(1);
    });
});
