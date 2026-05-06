import { formattedEquipableItemTypes, SlashCommandFile } from "../../@types";
import * as Functions from "../../utils/Functions";
import { unequipInventoryItem } from "./Inventory";

const slashCommand: SlashCommandFile = {
    data: {
        name: "unequip",
        description: "Unequip an item.",
        options: [
            {
                name: "item",
                description: "The item you want to unequip.",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    execute: unequipInventoryItem,
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const userItems = Object.keys(userData.equippedItems).map((v) => {
            const item = Functions.findItem(v);
            if (!item) return;
            if (!Functions.isEquipableItem(item)) return;

            return {
                name: item.name + ` [${formattedEquipableItemTypes[item.type]}]`,
                id: v,
            };
        });
        const realItems = userItems
            .filter((r) => r)
            .map((i) => {
                return {
                    value: i.id,
                    name: i.name,
                    description: i,
                };
            })
            .filter(
                (item) =>
                    item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                    item.value.toLowerCase().includes(currentInput.toLowerCase())
            );
        if (realItems.length > 25) realItems.length = 25;

        interaction.respond(realItems);
    },
};

export default slashCommand;
