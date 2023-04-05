import { Shop } from "../@types";
import * as NPCs from "./NPCs/NPCs";
import * as Items from "./Items";
import * as Emojis from "../emojis.json";

export const TonioTrussardisRestaurant: Shop = {
    owner: NPCs["Tonio_Trussardi"],
    name: "Restaurant",
    items: [
        {
            item: Items.default.Pizza.id,
        },
        {
            item: Items.default.ToniosSpecialRecipe.id,
        },
        {
            item: Items.default.Ramen_Bowl.id,
        },
        {
            item: Items.default.Spaghetti_Bowl.id,
        },
        {
            item: Items.default.Salad_Bowl.id,
        },
    ],
};

export const GroceryStore: Shop = {
    name: "Grocery Store",
    emoji: "🏪",
    items: [
        {
            item: Items.default.Cola.id,
        },
        {
            item: Items.default["Energy_Drink"].id,
        }, // to be continued
    ],
};
