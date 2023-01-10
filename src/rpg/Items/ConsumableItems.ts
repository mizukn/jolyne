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
