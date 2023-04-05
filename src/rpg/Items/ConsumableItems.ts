import type { Consumable } from "../../@types";
import * as Emojis from "../../emojis.json";

export const Pizza: Consumable = {
    id: "pizza",
    name: "Pizza",
    description: "A delicious pizza.",
    emoji: Emojis.complete_pizza,
    price: 750,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 75,
        stamina: 5,
    },
};

export const Spaghetti_Bowl: Consumable = {
    id: "spaghetti_bowl",
    name: "Spaghetti",
    description: "A bowl of spaghetti",
    emoji: "🥗",
    price: 2000,
    rarity: "C",
    tradable: false,
    storable: false,
    effects: {
        health: 200,
        stamina: 15,
    },
};

export const Slice_Of_Pizza: Consumable = {
    id: "slice_of_pizza",
    name: "Slice of Pizza",
    description: "A slice of pizza",
    emoji: "🍕",
    price: 150,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 200,
        stamina: 15,
    },
};

export const Cola: Consumable = {
    id: "cola",
    name: "Cola",
    description: "A fresh can of cola",
    emoji: Emojis.cola,
    price: 355,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        stamina: 15,
    },
};

export const ToniosSpecialRecipe: Consumable = {
    id: "tonios_special_recipe",
    name: "Tonio's Special Recipe",
    description: "A special recipe made by Tonio Trussardi himself",
    emoji: "🥣",
    price: 13500,
    rarity: "A",
    tradable: true,
    storable: false,
    effects: {
        health: 700,
        stamina: 250,
    },
};

export const Ramen_Bowl: Consumable = {
    id: "ramen_bowl",
    name: "ramen_bowl",
    description: "A bowl of ramen",
    emoji: "🍜",
    price: 1500,
    rarity: "C",
    tradable: false,
    storable: false,
    effects: {
        health: 170,
        stamina: 25,
    },
};

// Zero's work
export const Meat: Consumable = {
    id: "meat",
    name: "Meat",
    description: "A medium rare piece of meat",
    emoji: "🍖",
    price: 500,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 150,
        stamina: 10,
    },
};

export const Energy_Drink: Consumable = {
    id: "energy_drink",
    name: "Energy Drink",
    description: "A drink that give you a boost of energy",
    emoji: Emojis.cola,
    price: 700,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        stamina: "25%",
    },
};

export const Squid_Ink_Spaghetti: Consumable = {
    id: "squid_ink_spaghetti",
    name: "Squid Ink Spaghetti",
    description: "A delicious plate of pasta that turns your mouth black for a while",
    emoji: Emojis.cola,
    price: 1000,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 100,
        stamina: 10,
    },
};

export const Garlic_Bread: Consumable = {
    id: "garlic_bread",
    name: "Garlic Bread",
    description: "A unfathomably great food sent from the heavens themselves",
    emoji: Emojis.cola,
    price: 500,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: "5%",
        stamina: "5%",
    },
};

export const Shrimp_Fried_Rice: Consumable = {
    id: "shrimp_fried_rice",
    name: "Shrimp Fried Rice",
    description: "For the last time, Yes a shrimp did is in fact frying rice ",
    emoji: Emojis.cola,
    price: 1500,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: "50%",
        stamina: "25%",
    },
};

export const Bento_Box: Consumable = {
    id: "Bento_Box",
    name: "Bento Box",
    description: "A delicious box lunch ",
    emoji: Emojis.cola,
    price: 950,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 100,
        stamina: "10%",
    },
};
// end of zero's work

export const Salad_Bowl: Consumable = {
    id: "salad_bowl",
    name: "Salad Bowl",
    description: "A bowl of salad",
    emoji: "🥗",
    price: 500,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 50,
        stamina: 25,
    },
};
