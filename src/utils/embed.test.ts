import { describe, expect, it } from "vitest";
import { fixEmbeds, fixFields, splitEmbedIfExceedsLimit } from "./embed";

describe("embed utils", () => {
    it("trims oversized field values from the end of the field", () => {
        const fields = fixFields([
            {
                name: "long",
                value: `${"a".repeat(1020)}\nkeep\n${"b".repeat(1020)}`,
            },
        ]);

        expect(fields[0].value.length).toBeLessThanOrEqual(1024);
        expect(fields[0].value).toContain("keep");
    });

    it("splits oversized embeds into multiple embeds", () => {
        const embeds = splitEmbedIfExceedsLimit({
            color: 0xff0000,
            fields: [
                { name: "A", value: "x".repeat(4900) },
                { name: "B", value: "y".repeat(4900) },
            ],
        });

        expect(embeds.length).toBeGreaterThan(1);
        expect(embeds.every((embed) => embed.color === 0xff0000)).toBe(true);
    });

    it("splits long descriptions while preserving outer metadata", () => {
        const embeds = fixEmbeds([
            {
                title: "Long",
                description: `${"alpha ".repeat(700)}\n${"beta ".repeat(700)}`,
                footer: { text: "footer" },
                color: 0x00ff00,
            },
        ]);

        expect(embeds.length).toBeGreaterThan(1);
        expect(embeds[0].title).toBe("Long");
        expect(embeds[embeds.length - 1].footer?.text).toBe("footer");
        expect(embeds.every((embed) => embed.description.length <= 4096)).toBe(true);
    });
});
