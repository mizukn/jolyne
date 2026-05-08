import { describe, expect, it } from "vitest";
import { getMaxXp, getRewards, TopGGVoteRewards } from "./rewards";

describe("reward utils", () => {
    it("calculates max XP for a level", () => {
        expect(getMaxXp(10)).toBe(26000);
    });

    it("caps daily coin rewards", () => {
        expect(getRewards(3)).toEqual({ coins: 2250, xp: 1080 });
        expect(getRewards(100).coins).toBe(6000);
    });

    it("calculates TopGG vote rewards", () => {
        expect(TopGGVoteRewards({ level: 10 } as never)).toEqual({ coins: 15000, xp: 2600 });
    });
});
