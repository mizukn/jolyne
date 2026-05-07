import type { RPGUserDataJSON } from "../@types";

export type TradeOffer = RPGUserDataJSON["inventory"];

interface TradeLockRedis {
    set(key: string, value: string, options: { NX: true; EX: number }): Promise<string | null>;
    del(key: string): Promise<number>;
}

export interface TradeLock {
    release(): Promise<void>;
}

const tradeLockKey = (userId: string): string => `tempCache_tradeLock_${userId}`;

export const validateOfferAgainstInventory = (
    inventory: RPGUserDataJSON["inventory"],
    offer: TradeOffer,
): string[] => {
    const errors: string[] = [];
    for (const [itemId, amount] of Object.entries(offer)) {
        if (!Number.isInteger(amount) || amount <= 0) {
            errors.push(`${itemId}: invalid amount ${amount}`);
            continue;
        }
        if ((inventory[itemId] ?? 0) < amount) {
            errors.push(`${itemId}: offered ${amount}, available ${inventory[itemId] ?? 0}`);
        }
    }
    return errors;
};

export const acquireTradeLocks = async (
    redis: TradeLockRedis,
    userIds: string[],
    tradeId: string,
    ttlSeconds = 30,
): Promise<TradeLock | null> => {
    const uniqueUserIds = [...new Set(userIds)].sort();
    const acquiredKeys: string[] = [];

    for (const userId of uniqueUserIds) {
        const key = tradeLockKey(userId);
        const result = await redis.set(key, tradeId, {
            NX: true,
            EX: ttlSeconds,
        });
        if (result === null) {
            await Promise.all(acquiredKeys.map((acquiredKey) => redis.del(acquiredKey)));
            return null;
        }
        acquiredKeys.push(key);
    }

    return {
        release: async () => {
            await Promise.all(acquiredKeys.map((key) => redis.del(key)));
        },
    };
};
