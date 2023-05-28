import { EquipableItem, equipableItemTypes, Weapon } from "../../@types";
import * as Abilities from "../Abilities";
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
    requirements: {
        level: 10000,
    },
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

export const BlueHoodieJacket: EquipableItem = {
    id: "blue_hoodie_jacket",
    name: "Blue Hoodie Jacket",
    emoji: "<:coatv1:962774070758359070>",
    description: "A blue hoodie jacket.",
    type: equipableItemTypes.CHEST,
    effects: {
        xpBoost: 1,
    },
    rarity: "B",
    tradable: true,
    storable: true,
};

export const GreenHoodieJacket: EquipableItem = {
    id: "green_hoodie_jacket",
    name: "Green Hoodie Jacket",
    emoji: "<:coatv2:962774071035170836>",
    description: "A green hoodie jacket.",
    type: equipableItemTypes.CHEST,
    effects: {
        xpBoost: 0.5,
        skillPoints: {
            strength: 3,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "B",
    tradable: true,
    storable: true,
};

export const SBRBoots: EquipableItem = {
    id: "sbr_boots",
    name: "SBR Boots",
    emoji: "<:boot_2:962774068736708660>",
    description: "A pair of boots.",
    type: equipableItemTypes.FEET,
    effects: {
        xpBoost: 1.2,
        health: 30,
        skillPoints: {
            strength: 5,
            perception: 2,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "A",
    tradable: true,
    storable: true,
};

export const BlueJeans: EquipableItem = {
    id: "blue_jeans",
    name: "Blue Jeans",
    emoji: "<:pannt:962774073115574362>",
    description: "A pair of blue jeans.",
    type: equipableItemTypes.LEGS,
    effects: {
        xpBoost: 0.2,
        health: 3,
        stamina: 5,
        skillPoints: {
            strength: 3,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "B",
    tradable: true,
    storable: true,
};

export const BloodyKnife: Weapon = {
    id: "bloody_knife",
    name: "Bloody Knife",
    emoji: "<:bknife:1112323141587435521>",
    description: "A bloody knife.",
    type: equipableItemTypes.WEAPON,
    attackName: "stab",
    useMessageAttack: "stabs",
    staminaCost: 2,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 16,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "A",
    tradable: true,
    storable: true,
    requirements: {
        level: 15,
        skillPoints: {
            strength: 20,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    abilities: [Abilities.DeterminationFlurry],
};
