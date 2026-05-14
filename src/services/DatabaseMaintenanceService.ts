import type { RPGUserDataJSON } from "../@types";
import type DatabaseHandler from "../structures/DatabaseHandler";
import type JolyneClient from "../structures/JolyneClient";
import * as Functions from "../utils/Functions";
import { transactionLogsWebhook } from "../utils/Webhooks";

const withMaintenance = async (
    client: JolyneClient,
    reason: string,
    callback: () => Promise<void>,
): Promise<void> => {
    client.maintenanceReason = reason;
    try {
        await callback();
    } finally {
        client.maintenanceReason = null;
    }
};

export const fixSettingsToEveryone = async (
    database: DatabaseHandler,
    client: JolyneClient,
): Promise<void> =>
    withMaintenance(client, "Fixing settings", async () => {
        const keys = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        for (const key of keys) {
            const data = await database.getJSONData(key);
            if (data) {
                const userData = data as RPGUserDataJSON;
                Functions.fixUserSettings(userData);
                await database.setJSONData(key, userData);
            }
        }
    });

export const removeGreenBabies = async (
    database: DatabaseHandler,
    client: JolyneClient,
): Promise<void> =>
    withMaintenance(client, "Removing Green Babies", async () => {
        const greenBaby = Functions.findItem("green_baby");
        const keys = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        for (const key of keys) {
            const data = await database.getJSONData(key);
            if (data) {
                const userData = data as RPGUserDataJSON;
                const amount =
                    (userData.inventory[greenBaby.id] ?? 0) +
                    (userData.inventory["dio_bone"] ?? 0);
                delete userData.inventory[greenBaby.id];
                delete userData.inventory["dio_bone"];
                if (amount) {
                    userData.inventory["stone_free_glasses"] = amount;
                    console.log(`Removed ${amount} from ${userData.tag}`);
                    database.saveUserData(userData);
                } else {
                    console.log(`No green babies found in ${userData.tag}`);
                }
            }
        }
    });

export const removeGreenBabiesIfStandEvolved = async (
    database: DatabaseHandler,
    client: JolyneClient,
): Promise<void> =>
    withMaintenance(client, "Removing Green Babies", async () => {
        const greenBaby = Functions.findItem("green_baby");
        const keys = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        for (const key of keys) {
            const data = await database.getJSONData(key);
            if (data) {
                const userData = data as RPGUserDataJSON;
                if (userData.stand) {
                    const amount = userData.inventory[greenBaby.id] ?? 0;
                    if (amount && userData.standsEvolved.whitesnake === 1) {
                        delete userData.inventory[greenBaby.id];
                        console.log(`Removed ${amount} from ${userData.tag}`);
                        database.saveUserData(userData);
                    }
                }
            }
        }
    });

export const resetEveryoneCoins = async (
    database: DatabaseHandler,
    client: JolyneClient,
    simulate?: boolean,
): Promise<void> =>
    withMaintenance(client, "Resetting everyone's coins", async () => {
        const keys = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        let totalRemoved = 0;
        let affectedUsers = 0;
        for (const key of keys) {
            const data = await database.getJSONData(key);
            if (data) {
                const userData = data as RPGUserDataJSON;
                const toRemove = Math.min(userData.coins * 0.2, 200000);
                if (toRemove <= 0) continue;
                userData.coins -= toRemove;
                totalRemoved += toRemove;
                affectedUsers++;
                console.log(`Removed ${toRemove} coins from ${userData.tag}`);
                if (!simulate) {
                    await database.saveUserData(userData);
                }
            }
        }
        try {
            await transactionLogsWebhook.send({
                content: `**resetEveryoneCoins${simulate ? " (simulate)" : ""}** removed **${totalRemoved.toLocaleString()}** coins across **${affectedUsers}** users.`,
            });
        } catch (_) {
            console.log("Failed to send resetEveryoneCoins audit log.");
        }
    });

export const removeConsumables = async (
    database: DatabaseHandler,
    client: JolyneClient,
    simulate?: boolean,
): Promise<void> =>
    withMaintenance(client, "Removing consumables", async () => {
        const keys = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        let totalRemoved = 0;
        let affectedUsers = 0;
        for (const key of keys) {
            const data = await database.getJSONData(key);
            if (data) {
                const userData = data as RPGUserDataJSON;
                let userRemoved = 0;
                for (const itemId in userData.inventory) {
                    const item = Functions.findItem(itemId);
                    if (item && Functions.isConsumable(item) && item.rarity !== "T") {
                        userRemoved += userData.inventory[itemId];
                        delete userData.inventory[itemId];
                        console.log(`Removed ${itemId} from ${userData.tag}`);
                    }
                }
                if (userRemoved > 0) {
                    totalRemoved += userRemoved;
                    affectedUsers++;
                    if (!simulate) {
                        await database.saveUserData(userData);
                    }
                }
            }
        }
        try {
            await transactionLogsWebhook.send({
                content: `**removeConsumables${simulate ? " (simulate)" : ""}** removed **${totalRemoved.toLocaleString()}** non-T-tier consumables across **${affectedUsers}** users.`,
            });
        } catch (_) {
            console.log("Failed to send removeConsumables audit log.");
        }
    });
