import { EquipableItem, equipableItemTypes, Weapon } from "../../@types";
import * as Abilities from "../Abilities";
import * as Passives from "../Passives";
import * as Emojis from "../../emojis.json";
import { endOf2024HalloweenEvent, is2024HalloweenEvent } from "../../utils/2024HalloweenEvent";

export const JotarosHat: EquipableItem = {
    id: "jotaros_hat",
    name: "Jotaro's Hat",
    emoji: Emojis.jotaroHat,
    description: "A hat that belonged to Jotaro Kujo.",
    type: equipableItemTypes.HEAD,
    effects: {
        health: "15%",
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
        health: "15%",
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
    description: "A pair of knives that belonged to Dio Brando.",
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
    passives: [Passives.KnivesThrow],
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

export const ConfettiBazooka: Weapon = {
    id: "confetti_bazooka",
    name: "Confetti Bazooka",
    emoji: Emojis.ConfettiBazooka,
    description: "A bazooka that shoots confetti.",
    type: equipableItemTypes.WEAPON,
    attackName: "shoot",
    useMessageAttack: "shoots",
    staminaCost: 5,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 25,
            perception: 0,
            speed: 10,
            stamina: 0,
            defense: 0,
        },
        xpBoost: 1,
    },
    rarity: "T",
    abilities: [Abilities.ConfettiBlast],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const SecondAnniversaryBag: EquipableItem = {
    id: "second_anniversary_bag",
    name: "Second Anniversary Bag",
    emoji: Emojis["2ndAnniversaryBackpack"],
    description: "A bag that celebrates the second anniversary of the bot.",
    type: equipableItemTypes.BACK,
    effects: {
        xpBoost: 2,
        standDiscIncrease: 5,
    },
    rarity: "T",
    tradable: true,
    storable: true,
};

export const DiavolosSuit: EquipableItem = {
    id: "diavolos_suit",
    name: "Diavolo's Suit",
    emoji: "<:diavolos_suit:1275099602894196738>",
    description: "A suit that belonged to Diavolo.",
    type: equipableItemTypes.CHEST,
    effects: {
        skillPoints: {
            defense: 15,
            perception: 0,
            strength: 5,
            speed: 20,
            stamina: 10,
        },
        xpBoost: 0.25,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const DiavolosPants: EquipableItem = {
    id: "diavolos_pants",
    name: "Diavolo's Pants",
    emoji: "<:diavolos_pant:1275099620489433159>",
    description: "Pants that belonged to Diavolo.",
    type: equipableItemTypes.LEGS,
    effects: {
        skillPoints: {
            defense: 20,
            perception: 0,
            strength: 20,
            speed: 0,
            stamina: 20,
        },
        health: "5%",
        xpBoost: 0.25,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const MikusMicrophone: Weapon = {
    id: "mikus_microphone",
    name: "Miku's Microphone",
    emoji: "<:mikus_microphone:1275437637380997162>",
    description:
        "Miku, Miku, you can call me Miku.\nBlue hair, blue tie, hiding in your WiFi.\nOpen secrets anyone can find me.\nHear your music running THROUGH MY MIND!!!",
    type: equipableItemTypes.WEAPON,
    attackName: "echo",
    useMessageAttack: "echoes at",
    staminaCost: 3,
    color: 0x0eeadf,
    effects: {
        skillPoints: {
            strength: 20,
            perception: 0,
            speed: 20,
            stamina: 0,
            defense: 0,
        },
        xpBoost: 0.5,
    },
    rarity: "S",
    abilities: [Abilities.MikuBeam, Abilities.MikuStun],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const MikusVest: EquipableItem = {
    id: "mikus_vest",
    name: "Miku's Vest",
    emoji: "<:mikus_vest:1275434192225833041>",
    description: "A vest that belonged to Miku.",
    type: equipableItemTypes.CHEST,
    effects: {
        skillPoints: {
            defense: 20,
            perception: 0,
            strength: 0,
            speed: 20,
            stamina: 20,
        },
        health: "5%",
        xpBoost: 0.5,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const MikusPants: EquipableItem = {
    id: "mikus_pants",
    name: "Miku's Pants",
    emoji: "<:miku_pants:1275436318175924254>",
    description: "Pants that belonged to Miku.",
    type: equipableItemTypes.LEGS,
    effects: {
        skillPoints: {
            defense: 20,
            perception: 0,
            strength: 20,
            speed: 0,
            stamina: 20,
        },
        health: "5%",
        xpBoost: 0.5,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const MikusHedset: EquipableItem = {
    id: "mikus_headset",
    name: "Miku's Headset",
    emoji: "<:mikus_headset:1275434154321772604>",
    description: "A headset that belonged to Miku.",
    type: equipableItemTypes.HEAD,
    effects: {
        skillPoints: {
            defense: 20,
            perception: 20,
            strength: 0,
            speed: 20,
            stamina: 0,
        },
        health: "5%",
        xpBoost: 0.5,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};

export const StoneFreeGlasses: EquipableItem = {
    id: "stone_free_glasses",
    name: "Stone Free Glasses",
    emoji: Emojis.stone_free_glasses,
    description: "Glasses that belonged to Jolyne Cujoh's stand.",
    type: equipableItemTypes.FACE,
    effects: {
        skillPoints: {
            defense: 15,
            perception: 15,
            strength: 0,
            speed: 0,
            stamina: 0,
        },
        health: "3%",
        xpBoost: 0.1,
    },
    rarity: "S",
    tradable: true,
    storable: true,
    requirements: {
        level: 25,
    },
};

export const Excalibur: Weapon = {
    id: "excalibur",
    name: "Excalibur",
    emoji: "<:excalibur:1295831271368425548>",
    description: "The legendary sword of King Arthur.",
    type: equipableItemTypes.WEAPON,
    attackName: "slash",
    useMessageAttack: "slashes",
    staminaCost: 4,
    // yellow
    color: 0xffcc00,
    effects: {
        skillPoints: {
            strength: 30,
            perception: 0,
            defense: 10,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "SS",
    abilities: [Abilities.SwordOfPromisedVictory],
    passives: [Passives.Regeneration, Passives.Alter],
    tradable: !is2024HalloweenEvent(),
    storable: true,
    requirements: {
        level: 150,
    },
    price: 5000000,
};

// timeout for when it is no longer 2024 halloween event
const timeout = endOf2024HalloweenEvent - Date.now();
if (is2024HalloweenEvent()) {
    setTimeout(() => {
        // @ts-expect-error because it's a private property
        Excalibur.tradable = true;
    }, timeout);
    console.log(`Excalibur will be tradable in ${timeout}ms.`);
}

export const ExcaliburAlter: Weapon = {
    id: "excalibur_alter",
    name: "Excalibur Alter",
    emoji: "<:excalibur_alter:1295831475278839871>",
    description:
        "The corrupted version of the legendary sword of King Arthur.\nUpon transformation, the user's stats are increased by 30% (so please, ignore the stats below).",
    type: equipableItemTypes.WEAPON,
    attackName: "slash",
    useMessageAttack: "slashes",
    staminaCost: 5,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 0,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "SS",
    abilities: [Abilities.SwordOfPromisedVictory],
    passives: [Passives.RegenerationAlter, Passives.Rage],
    tradable: false,
    storable: false,
    requirements: {
        level: 150,
        skillPoints: {
            strength: 0,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 50,
        },
    },
    private: true,
};

export const KrampusHorns: EquipableItem = {
    id: "krampus_horns",
    name: "Krampus Horns",
    emoji: "<:krampus_horns:1311443755139727511>",
    description: "Horns that belonged to Krampus.",
    type: equipableItemTypes.HEAD,
    effects: {
        skillPoints: {
            strength: 15,
            perception: 15,
            defense: 15,
            speed: 15,
            stamina: 15,
        },
    },
    rarity: "T",
    tradable: true,
    storable: true,
    requirements: {
        level: 100,
    },
};

export const KrampusStaff: Weapon = {
    id: "krampus_staff",
    name: "Krampus' Staff",
    emoji: "<:krampus_staff:1311446274540830720>",
    description: "A staff that belonged to Krampus.",
    type: equipableItemTypes.WEAPON,
    attackName: "hit",
    useMessageAttack: "hits",
    staminaCost: 5,
    color: 0x964b00,
    effects: {
        skillPoints: {
            strength: 25,
            perception: 0,
            defense: 0,
            speed: 10,
            stamina: 10,
        },
    },
    rarity: "T",
    abilities: [Abilities.KrampusCurse, Abilities.SinHarvest],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
    craft: {
        ancient_scroll: 25,
        krampus_horns: 8,
    },
};

export const SantaHat: EquipableItem = {
    id: "santa_hat",
    name: "Santa's Hat",
    emoji: "<:santa_hat:1312181146062422186>",
    description: "A hat that belonged to Santa Claus.",
    type: equipableItemTypes.HEAD,
    effects: {
        skillPoints: {
            strength: 8,
            perception: 8,
            defense: 8,
            speed: 8,
            stamina: 8,
        },
    },
    rarity: "T",
    tradable: true,
    storable: true,
};

export const ElfHat: EquipableItem = {
    id: "elf_hat",
    name: "Elf Hat",
    emoji: "<:elf_hat:1312181075174363197>",
    description: "A hat that belonged to an elf.",
    type: equipableItemTypes.HEAD,
    effects: {
        skillPoints: {
            strength: 5,
            perception: 5,
            defense: 5,
            speed: 5,
            stamina: 5,
        },
    },
    rarity: "T",
    tradable: true,
    storable: true,
};

export const JohansNewYorkYankeesHat: EquipableItem = {
    id: "johans_new_york_yankees_hat", // all item IDs must follow this format
    name: "Jôhan's New York Yankees Hat",
    emoji: "<:johanhat:1287836078442807406>",
    description: "A hat that belonged to Jôhan Everdeen.",
    type: equipableItemTypes.HEAD,
    effects: MeguminsHat.effects,
    rarity: "T",
    tradable: true,
    storable: true,
};

export const SantasBell: Weapon = {
    id: "santas_bell",
    name: "Santa's Bell",
    emoji: "<:santas_bell:1321226637978898523>",
    description: "A bell that belonged to Santa Claus. ",
    type: equipableItemTypes.WEAPON,
    attackName: "ring",
    useMessageAttack: "rings",
    staminaCost: 2,
    color: 0xff0000,
    effects: {
        skillPoints: {
            strength: 0,
            perception: 0,
            defense: 0,
            speed: 0,
            stamina: 0,
        },
    },
    rarity: "T",
    abilities: [Abilities.JingleBellRock, Abilities.JingleStun, Abilities.HealingJingle],
    tradable: true,
    storable: true,
    requirements: {
        level: 99999999999999,
    },
};

export const Frostblade: Weapon = {
    id: "frostblade",
    name: "Frostblade",
    emoji: "<:frostblade:1321224860411629662>",
    description: "An unknown blade that is said to be made of ice.",
    type: equipableItemTypes.WEAPON,
    attackName: "slash",
    useMessageAttack: "slashes",
    staminaCost: 2,
    color: 0x00ccff,
    effects: SantasBell.effects,
    rarity: "T",
    abilities: [Abilities.Frostbite, Abilities.FrostSlash, Abilities.Lunge],
    tradable: true,
    storable: true,
    requirements: {
        level: 50,
    },
};
