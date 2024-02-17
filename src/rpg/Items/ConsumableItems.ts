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
    emoji: "🍝",
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
        health: Math.round((Pizza.effects.health as number) / 8),
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
    description: "A special recipe made by Tonio Trussardi himself.",
    emoji: "🥣",
    price: 75000,
    rarity: "A",
    tradable: true,
    storable: false,
    effects: {
        health: 7000000000,
        stamina: 250000000,
    },
};

export const Ramen_Bowl: Consumable = {
    id: "ramen_bowl",
    name: "Ramen Bowl",
    description: "A bowl of ramen.",
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
    description: "A medium rare piece of meat.",
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
    emoji: Emojis.energydrink,
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
    description: "A delicious plate of pasta that turns your mouth black for a while.",
    emoji: "🍝",
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
    description: "A unfathomably great food sent from the heavens themselves.",
    emoji: "🍞",
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
    description: "For the last time, Yes a shrimp did in fact fry this rice.",
    emoji: "🍚",
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
    description: "A delicious boxed lunch.",
    emoji: "🍱",
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
    description: "A bowl of salad.",
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

export const DeadRat: Consumable = {
    id: "dead_rat",
    name: "Dead Rat",
    description: "A dead rat. Eat it for a full health & stamina restore.",
    emoji: "🐀",
    price: 69,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: -99999999,
        stamina: -99999999,
    },
};

export const Candy: Consumable = {
    id: "candy",
    name: "Candy",
    description: "A piece of candy",
    emoji: "🍬",
    price: 100,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 10,
        stamina: 10,
    },
};

export const Sandwich: Consumable = {
    id: "sandwich",
    name: "Sandwich",
    description: "A sandwich",
    emoji: "🥪",
    price: 250,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 20,
        stamina: 15,
    },
};

export const Coconut: Consumable = {
    id: "coconut",
    name: "Coconut",
    description: "A coconut",
    emoji: "🥥",
    price: 100,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 10,
        stamina: 10,
    },
};

export const Burger: Consumable = {
    id: "burger",
    name: "Burger",
    description: "A burger. Not very healthy, but tasty!",
    emoji: "🍔",
    price: 225,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 10,
        stamina: 15,
    },
};

// haydar was here! incroyable ça
// c sex :3 l'item overpowered jme susoi tormpé jvoulais faire ca a la cany cane
// mdrr
export const ChocolateBar: Consumable = {
    id: "chocolate_bar",
    name: "Chocolate Bar",
    description: "A chocolate bar",
    emoji: "🍫",
    price: 100,
    rarity: "C",
    tradable: true,
    storable: true,
    effects: {
        health: 0,
        stamina: 20,
    },
};

export const CandyCane: Consumable = {
    id: "candy_cane",
    name: "Mini Consumable Candy Cane",
    description: "A delicious candy cane... was obtainable during the Christmas 2022 & 2023 event.",
    emoji: "<:candy_cane:1055876219251466330>",
    price: 10000,
    rarity: "T",
    tradable: true,
    storable: true,
    effects: {
        health: 1000000,
        stamina: 1000000,
    },
};

export const SpookyCandy: Consumable = {
    id: "spooky_candy",
    name: "Spooky Candy",
    description: "A spooky candy... was obtainable during the Halloween 2022 & 2023 event.",
    emoji: Emojis.SpookyCandy,
    price: 50000,
    rarity: "T",
    tradable: true,
    storable: true,
    effects: {
        health: 1000000,
        stamina: 1000000,
    },
};
