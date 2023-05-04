import { EquipableItem, equipableItemTypes } from "../../@types";
import * as Emojis from "../../emojis.json";

export const JotarosHat: EquipableItem = {
    id: "jotaros_hat",
    name: "Jotaro's Hat",
    emoji: Emojis.jotaroHat,
    description: "A hat that belonged to Jotaro Kujo.",
    type: equipableItemTypes.HEAD,
    effects: {
        health: "25%",
        stamina: 50,
        skillPoints: {
            defense: 20,
            perception: 0,
            strength: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "S",
    tradable: true,
    storable: true,
};

export const MeguminsHat: EquipableItem = {
    id: "megumins_hat",
    name: "Megumin's Hat",
    emoji: "<:meguminHat:1103322757372055552>",
    description: "A hat that belonged to Megumin.",
    type: equipableItemTypes.HEAD,
    effects: {
        health: "25%",
        stamina: 50,
        skillPoints: {
            defense: 0,
            perception: 0,
            strength: 20,
            speed: 0,
            stamina: 20,
        },
        xpBoost: 0.5,
    },
    rarity: "S",
    tradable: true,
    storable: true,
};
