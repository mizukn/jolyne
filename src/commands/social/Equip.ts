import { formattedEquipableItemTypes, SlashCommandFile } from "../../@types";
import * as Functions from "../../utils/Functions";
import { equipInventoryItem } from "./Inventory";

const slashCommand: SlashCommandFile = {
    data: {
        name: "equip",
        description: "Equip an item.",
        options: [
            {
                name: "item",
                description: "The item you want to equip.",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    execute: equipInventoryItem,
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const userItems = Object.keys(userData.inventory).map((v) => {
            const item = Functions.findItem(v);
            if (!item) return;
            if (!Functions.isEquipableItem(item)) return;
            if (userData.inventory[v] === 0) return;

            return {
                name: item.name + ` [${formattedEquipableItemTypes[item.type]}]`,
                amount: userData.inventory[v],
                id: v,
            };
        });

        const finalItems = userItems
            .filter((r) => r)
            .map((i) => {
                return {
                    value: i.id,
                    name: `${i.name} (x${i.amount} left)`,
                    description: i,
                };
            })
            .filter(
                (item) =>
                    item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                    item.value.toLowerCase().includes(currentInput.toLowerCase())
            );
        if (finalItems.length > 25) finalItems.length = 25;

        interaction.respond(finalItems);
    },
};

export default slashCommand;
