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
        level: 1,
    },
    /*
    craft: {
        green_cloth: 25,
        yellow_cloth: 25,
        purple_cloth: 25,
        "star_platinum.$disc$": 5,
        string: 50
    }*/
};

export const MeguminsHat: EquipableItem = {
    id: "megumins_hat",
    name: "Megumin's Hat",
    emoji: Emojis.meguminHat,
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
    emoji: Emojis.BlueHoodieJacket,
    description: "A blue hoodie jacket.",
    type: equipableItemTypes.CHEST,
    effects: {
        xpBoost: 1,
    },
    rarity: "B",
    tradable: true,
    storable: true,
    craft: {
        blue_cloth: 10,
        string: 10,
    },
};

export const GreenHoodieJacket: EquipableItem = {
    id: "green_hoodie_jacket",
    name: "Green Hoodie Jacket",
    emoji: Emojis.GreenHoodieJacket,
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
    craft: {
        green_cloth: 10,
        string: 10,
    },
};

export const SBRBoots: EquipableItem = {
    id: "sbr_boots",
    name: "SBR Boots",
    emoji: Emojis.SBRboots,
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
    craft: {
        brown_cloth: 25,
        steel_ball: 5,
        string: 25,
    },
};

export const BlueJeans: EquipableItem = {
    id: "blue_jeans",
    name: "Blue Jeans",
    emoji: Emojis.BlueJeans,
    description: "A pair of blue jeans.",
    type: equipableItemTypes.LEGS,
    effects: {
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
    craft: {
        blue_cloth: 10,
        string: 10,
    },
};

export const BloodyKnife: Weapon = {
    id: "bloody_knife",
    name: "Bloody Knife",
    emoji: Emojis.BloodyKnife,
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

export const Katana: Weapon = {
    id: "Basic Katana",
    name: "Katana",
    emoji: Emojis.katana,
    description: "A basic and elegant katana.",
    type: equipableItemTypes.WEAPON,
    attackName: "slash",
    useMessageAttack: "slashes",
    staminaCost: 3,
    color: 0xffcc00,
    effects: {
        skillPoints: {
            strength: 4,
            perception: 0,
            defense: 0,
            speed: 4,
            stamina: 0,
        },
    },
    rarity: "B",
    tradable: true,
    storable: true,
    requirements: {
        level: 3,
        skillPoints: {
            strength: 5,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    abilities: [Abilities.SwiftStrike],
    craft: {
        iron_ingot: 10,
        wood: 10,
    },
};

export const GauntletsOfTheBerserker: Weapon = {
    id: "gauntlets_of_the_berserker",
    name: "Gauntlets of the Berserker",
    emoji: Emojis.gauntlet,
    description:
        "Ancient gauntlets infused with the primal rage of berserkers. Tap into your inner fury for immense power.",
    type: equipableItemTypes.WEAPON,
    attackName: "Crush",
    useMessageAttack: "crushes",
    staminaCost: 4,
    color: 0x83311f,
    effects: {
        skillPoints: {
            strength: 25,
            defense: 25,
            speed: 5,
            stamina: -10,
            perception: -10,
        },
    },
    rarity: "A",
    tradable: false,
    storable: true,
    requirements: {
        level: 30,
        skillPoints: {
            strength: 50,
            defense: 20,
            speed: 25,
            stamina: 20,
            perception: 15,
        },
    },
    abilities: [Abilities.BerserkersFury, Abilities.BerserkersRampage],
};

export const DiosKnives: Weapon = {
    id: "dios_knives",
    name: "Dio's Knives",
    emoji: Emojis.DioKnives,
    description:
        "A pair of knives that belonged to Dio Brando. [PASSIVE: During time stop, it throws knives to every enemies.]",
    type: equipableItemTypes.WEAPON,
    // it throws knives
    attackName: "throw",
    useMessageAttack: "throws a knife at",
    staminaCost: 2,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 15,
            perception: 0,
            speed: 20,
            stamina: 0,
            defense: 0,
        },
    },
    rarity: "S",
    abilities: [Abilities.KnivesThrow],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const KakyoinsSnazzyShades: EquipableItem = {
    id: "kakyoins_snazzy_shades",
    name: "Kakyoin's Snazzy Shades",
    emoji: Emojis.KakyoinShades,
    description: "Kakyoin's snazzy shades.",
    type: equipableItemTypes.FACE,

    effects: {
        skillPoints: {
            strength: 4,
            perception: 4,
            speed: 4,
            stamina: 4,
            defense: 4,
        },
    },
    rarity: "B",

    tradable: true,
    storable: true,
};

export const AthleticShoes: EquipableItem = {
    id: "athletic_shoes",
    name: "Athletic Shoes",
    emoji: "👟",
    description: "A pair of athletic shoes.",
    type: equipableItemTypes.FEET,
    effects: {
        skillPoints: {
            stamina: 5,
            speed: 5,
            defense: 0,
            strength: 0,
            perception: 0,
        },
    },
    rarity: "B",
    tradable: true,
    storable: true,
};

export const MeguminsWand: Weapon = {
    id: "megumins_wand",
    name: "Megumin's Wand",
    emoji: Emojis.meguminWand,
    description: "LOSION, LOSION, EXPLOSION!",
    type: equipableItemTypes.WEAPON,
    attackName: "cast",
    useMessageAttack: "casts an explosion at",
    staminaCost: 5,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 20,
            perception: 0,
            speed: 15,
            stamina: 0,
            defense: 0,
        },
        xpBoost: 1,
    },
    rarity: "S",
    abilities: [Abilities.Explosion],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const SantasCandyCane: Weapon = {
    id: "santas_candy_cane",
    name: "Santa's Candy Cane",
    emoji: Emojis.SantaCane,
    description: "A candy cane that belonged to Santa Claus.",
    type: equipableItemTypes.WEAPON,
    attackName: "hit",
    useMessageAttack: "hits",
    staminaCost: 2,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 15,
            perception: 0,
            speed: 2,
            stamina: 2,
            defense: 1,
        },
        xpBoost: 0.7,
    },
    rarity: "T",
    abilities: [Abilities.Freeze, Abilities.CandyCaneBarrage, Abilities.CandyCanePull],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
    craft: {
        candy_cane: 300,
        corrupted_soul: 300,
    },
};
