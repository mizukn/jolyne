import { describe, expect, it } from "vitest";
import { acquireTradeLocks, validateOfferAgainstInventory } from "./TradeService";

describe("TradeService.validateOfferAgainstInventory", () => {
    it("accepts offers covered by inventory", () => {
        expect(validateOfferAgainstInventory({ arrow: 2 }, { arrow: 2 })).toEqual([]);
    });

    it("rejects missing or invalid item amounts", () => {
        expect(
            validateOfferAgainstInventory(
                { arrow: 1 },
                {
                    arrow: 2,
                    stone: 0,
                },
            ),
        ).toEqual(["arrow: offered 2, available 1", "stone: invalid amount 0"]);
    });
});

describe("TradeService.acquireTradeLocks", () => {
    const redis = () => {
        const locks = new Set<string>();
        return {
            locks,
            async set(key: string): Promise<string | null> {
                if (locks.has(key)) return null;
                locks.add(key);
                return "OK";
            },
            async del(key: string): Promise<number> {
                return locks.delete(key) ? 1 : 0;
            },
        };
    };

    it("acquires locks in stable user order and releases them", async () => {
        const store = redis();
        const lock = await acquireTradeLocks(store, ["b", "a"], "trade");

        expect(lock).not.toBeNull();
        expect([...store.locks]).toEqual(["tempCache_tradeLock_a", "tempCache_tradeLock_b"]);

        await lock?.release();
        expect([...store.locks]).toEqual([]);
    });

    it("releases partially acquired locks when another lock is already held", async () => {
        const store = redis();
        store.locks.add("tempCache_tradeLock_b");

        const lock = await acquireTradeLocks(store, ["a", "b"], "trade");

        expect(lock).toBeNull();
        expect([...store.locks]).toEqual(["tempCache_tradeLock_b"]);
    });
});
