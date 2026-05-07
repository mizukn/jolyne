import { describe, expect, it } from "vitest";
import { fixFields, splitEmbedIfExceedsLimit } from "./embed";

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
});
