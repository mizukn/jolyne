import { describe, expect, it } from "vitest";
import type { RPGUserQuest } from "../@types";
import type { SideQuest } from "../@types";
import type CommandInteractionContext from "../structures/CommandInteractionContext";
import {
    buildQuestListRows,
    fieldSections,
    formatQuestListLine,
    getQuestDisplayEmoji,
    getQuestProgressText,
    getSideQuestRequirements,
    makeNPCLine,
} from "./quest_ui";

const ctx = {
    client: {
        localEmojis: {
            timerIcon: "⏳",
            jocoins: "🪙",
            xp: "xp",
            social_credit: "credit",
        },
        patreons: [],
        boosters: [],
    },
    userData: {
        id: "user",
    },
} as unknown as CommandInteractionContext;

describe("quest UI utils", () => {
    it("cleans legacy quest lines and progress markers", () => {
        const line = "<:reply:123> ⚔️ Defeat **2** enemies ||(**1/2**)||";

        expect(formatQuestListLine(line)).toContain("Defeat **2** enemies");
        expect(formatQuestListLine(line)).toContain("> Progression: 1/2");
        expect(getQuestProgressText(line)).toBe("1/2");
        expect(getQuestProgressText("Defeat one enemy")).toBe("In progress");
    });

    it("maps quest types to readable emojis", () => {
        expect(getQuestDisplayEmoji({ type: "fight" } as RPGUserQuest, ctx)).toBe("⚔️");
        expect(getQuestDisplayEmoji({ type: "raid" } as RPGUserQuest, ctx)).toBe("💣");
        expect(getQuestDisplayEmoji({ type: "wait" } as RPGUserQuest, ctx)).toBe("⏳");
        expect(
            getQuestDisplayEmoji(
                { type: "UseXCommandQuest", command: "blackjack" } as unknown as RPGUserQuest,
                ctx,
            ),
        ).toBe("🃏");
    });

    it("builds quest sections without losing rewards or progress", () => {
        const rows = buildQuestListRows(
            ctx,
            [{ type: "fight" } as RPGUserQuest],
            "Defeat someone ||(:white_check_mark:)||",
            undefined,
            () => "100 coins",
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].text).toContain("Defeat someone");
        expect(rows[0].text).toContain("100 coins");
        expect(rows[0].text).toContain("✅");
    });

    it("formats small line helpers", () => {
        expect(makeNPCLine({ emoji: "⭐", name: "Jolyne" }, "Ora")).toBe("⭐ **Jolyne:** Ora");
        expect(fieldSections([{ name: "A", value: "B" }])).toEqual([{ text: "**A**\nB" }]);
    });

    it("summarizes side quest requirements", () => {
        const sideQuest = {
            requirements: () => [
                { requirement: "Level 10", status: true },
                { requirement: "Read email", status: false },
            ],
        } as unknown as SideQuest;

        const result = getSideQuestRequirements(sideQuest, ctx);

        expect(result.status).toBe(false);
        expect(result.message).toContain("Level 10");
        expect(result.notMeet).toContain("Read email");
    });
});
