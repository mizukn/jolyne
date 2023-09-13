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

export const ClothStore: Shop = {
    name: "Cloth Store",
    emoji: "🏪",
    items: [
        { item: Items.default.String.id },
        {
            item: Items.default.GreenCloth.id,
        }, // brown green blue red yellow black white purple
        {
            item: Items.default.BlueCloth.id,
        },
        {
            item: Items.default.RedCloth.id,
        },
        {
            item: Items.default.YellowCloth.id,
        },
        {
            item: Items.default.PurpleCloth.id,
        },
        {
            item: Items.default.BlackCloth.id,
        },
        {
            item: Items.default.WhiteCloth.id,
        },
        {
            item: Items.default.BrownCloth.id,
        },
    ],
};
