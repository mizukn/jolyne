import { addItem } from "../services/InventoryService";
import { findItem, isEquipableItem, userMeetsRequirementsForItem } from "../utils/Functions";

import type { Middleware, MiddlewareDecision } from "./types";

// Re-validates each equipped item against the user's current state — level
// can drop on prestige, skill points can be reset by a potion, etc. Items
// the user no longer qualifies for get unequipped and put back in the
// inventory, with one notification per item.
export const equippedItemsMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx } = input;
    if (!ctx?.userData) return { stop: false };

    const notifications = (input.notifications ??= []);

    for (const key of Object.keys(ctx.userData.equippedItems)) {
        const itemData = findItem(key);
        if (!isEquipableItem(itemData)) continue;
        if (userMeetsRequirementsForItem(ctx.userData, itemData)) continue;

        delete ctx.userData.equippedItems[key];
        addItem(ctx.userData, key, 1, true);
        notifications.push(
            `:x: | **${ctx.user.username}**, you no longer meet the requirements for the ${itemData.emoji} \`${itemData.name}\` item, so it has been unequipped and put back in your inventory.`,
        );
    }

    return { stop: false };
};
