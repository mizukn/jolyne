import { describe, expect, it, vi } from "vitest";
import {
    capitalize,
    generateMessageLink,
    getBlackMarketString,
    getEmojiId,
    getTodayString,
    makeNPCString,
    removeZalgo,
    s,
} from "./format";

describe("format utils", () => {
    it("formats small string helpers", () => {
        expect(s(1)).toBe("");
        expect(s(2)).toBe("s");
        expect(capitalize("stand")).toBe("Stand");
        expect(getEmojiId("<:jolyne:123456789>")).toBe("123456789");
        expect(getEmojiId("🧵")).toBe("🧵");
        expect(makeNPCString({ emoji: "⭐", name: "Jolyne" }, "Ora")).toBe("⭐ **Jolyne**: Ora");
        expect(removeZalgo("T̷I̴M̵E̶ STOP")).toBe("TIME STOP");
    });

    it("formats message links", () => {
        expect(
            generateMessageLink({
                guild: { id: "guild" },
                channel: { id: "channel" },
                id: "message",
            } as never),
        ).toBe("https://discord.com/channels/guild/channel/message");
    });

    it("formats current day keys", () => {
        vi.setSystemTime(new Date("2026-05-08T12:00:00Z"));

        expect(getTodayString()).toBe("08/05/2026");
        expect(getBlackMarketString("user")).toBe("black_market:user_(08/05/2026)");

        vi.useRealTimers();
    });
});
