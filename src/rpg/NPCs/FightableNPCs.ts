// Note: it doesn't matter if the NPC doesn't have balanced skill points because it'll be balanced when the bot starts.
// DO NOT IMPORT FUNCTIONS BECAUSE CIRCULAR DEPENDENCY
import { equipableItemTypes, type FightableNPC } from "../../@types";
import * as NPCs from "./NPCs";
import * as EquipableItems from "../Items/EquipableItems";

const baseSP = {
    defense: 1,
    strength: 1,
    speed: 1,
    perception: 1,
    stamina: 0,
};

const baseRewards = {
    coins: 100,
    xp: 350,
};

export const Kakyoin: FightableNPC = {
    ...NPCs.Kakyoin,
    level: 0,
    skillPoints: {
        defense: 0,
        strength: 0,
        speed: 0,
        perception: 0,
        stamina: 0,
    },
    rewards: {
        items: [
            {
                item: "kakyoins_snazzy_shades",
                chance: 25,
                amount: 1,
            },
            {
                item: "broken_arrow",
                chance: 100,
                amount: 6,
            },
            {
                item: "broken_arrow",
                chance: 80,
                amount: 3,
            },
            {
                item: "broken_arrow",
                chance: 50,
                amount: 3,
            },
            {
                item: "broken_arrow",
                chance: 1,
                amount: 50,
            },
        ],
    },
    stand: "hierophant_green",
    equippedItems: {
        kakyoins_snazzy_shades: 9,
    },
    standsEvolved: {},
};

export const Harry_Lester: FightableNPC = {
    ...NPCs.Harry_Lester,
    level: 1,
    skillPoints: {
        defense: 1,
        strength: 1,
        speed: 1,
        perception: 1,
        stamina: 0,
    },
    stand: "hermit_purple",
    equippedItems: {},
    standsEvolved: {},
};

export const Jotaro: FightableNPC = {
    ...NPCs.Jotaro,
    level: 300,
    skillPoints: {
        defense: 100,
        strength: 100,
        speed: 100,
        perception: 100,
        stamina: 100,
    },
    equippedItems: {
        jotaros_hat: equipableItemTypes.HEAD,
    },
    stand: "star_platinum",
    standsEvolved: {},
};

export const Dio: FightableNPC = {
    ...NPCs.Dio,
    level: 300,
    skillPoints: Jotaro.skillPoints,
    equippedItems: {
        dios_knives: 6,
    },
    standsEvolved: {},
    stand: "the_world",
    rewards: {
        items: [
            {
                item: "the_world.$disc$",
                amount: 1,
                chance: 2,
            },
            {
                item: "dios_knives",
                amount: 1,
                chance: 1,
            },
        ],
    },
};

export const Heaven_Ascended_Dio: FightableNPC = {
    ...NPCs.Heaven_Ascended_Dio,
    level: Dio.level * 5,
    skillPoints: {
        defense: Dio.skillPoints.defense * 5,
        strength: Dio.skillPoints.strength * 5,
        speed: Dio.skillPoints.speed * 5,
        perception: Dio.skillPoints.perception * 5,
        stamina: Dio.skillPoints.stamina * 5,
    },
    equippedItems: {
        dios_knives: 6,
    },
    standsEvolved: {
        the_world: 1,
    },
    stand: "the_world",
    avatarURL:
        "https://static.wikia.nocookie.net/jjba/images/5/52/AIH_DIO.png/revision/latest?cb=20210114175706&path-prefix=fr",
};

export const BanditLeader: FightableNPC = {
    ...NPCs.BanditLeader,
    level: 20, // is raid boss
    skillPoints: baseSP,
    stand: "hierophant_green",
    equippedItems: {},
    standsEvolved: {},
};

export const Bandit: FightableNPC = {
    ...NPCs.Bandit,
    level: 0,
    skillPoints: baseSP,
    equippedItems: {},
    standsEvolved: {},
};

export const SecurityGuard: FightableNPC = {
    ...NPCs.SecurityGuard,
    level: 5,
    skillPoints: baseSP,
    equippedItems: {},
    standsEvolved: {},
};

export const Polnareff: FightableNPC = {
    ...NPCs.Polnareff,
    level: 15,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "silver_chariot",
    standsEvolved: {},
};

export const RequiemPolnareff: FightableNPC = {
    ...NPCs.RequiemPolnareff,
    level: 500,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "silver_chariot",
    standsEvolved: {
        silver_chariot: 1,
    },
};

export const Golem: FightableNPC = {
    ...NPCs.Golem,
    level: 100,
    skillPoints: {
        defense: 100 * 3 - 100 / 5,
        strength: 0,
        speed: 100 / 5 / 2,
        perception: 100 / 5 / 2,
        stamina: 0,
    },
    equippedItems: {},
    standsEvolved: {},
};

export const GrayFly: FightableNPC = {
    ...NPCs.GrayFly,
    level: 10,
    skillPoints: baseSP,
    equippedItems: {},
    standsEvolved: {},
    stand: "tower_of_gray",
};

export const CaptainTennilleImpostor: FightableNPC = {
    ...NPCs.CaptainTennilleImpostor,
    level: 20,
    skillPoints: baseSP,
    equippedItems: {},
    standsEvolved: {},
    stand: "dark_blue_moon",
};

export const Forever: FightableNPC = {
    ...NPCs.Forever,
    level: 25,
    skillPoints: baseSP,
    equippedItems: {},
    standsEvolved: {},
    stand: "strength",
};

export const Megumin: FightableNPC = {
    ...NPCs.Megumin,
    level: 400,
    skillPoints: baseSP,
    equippedItems: {
        megumins_hat: 1,
        megumins_wand: 6,
    },
    stand: "killer_queen",
    standsEvolved: {
        killer_queen: 1,
    },
};

export const GiornoGiovanna: FightableNPC = {
    ...NPCs.GiornoGiovanna,
    level: Dio.level,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "gold_experience",
    standsEvolved: {},
};

export const GiornoGiovannaRequiem: FightableNPC = {
    ...NPCs.GiornoGiovannaRequiem,
    level: 500,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "gold_experience",
    standsEvolved: {
        gold_experience: 1,
    },
};

export const Devo: FightableNPC = {
    ...NPCs.Devo,
    level: 30,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "ebony_devil",
    standsEvolved: {},
};

export const Toru: FightableNPC = {
    ...NPCs.Toru,
    level: 550,
    skillPoints: {
        defense: 250 * 3 - 290,
        strength: 250 * 3 - 250,
        speed: 250 / 5 / 2,
        perception: 250 / 5 / 2,
        stamina: 350,
    },
    equippedItems: {
        megumins_hat: 1,
    },
    stand: "wonder_of_u",
    standsEvolved: {},
};

export const Jolyne: FightableNPC = {
    ...NPCs.Jolyne,
    level: 150,
    skillPoints: {
        defense: 115,
        strength: 250,
        speed: 70,
        perception: 45,
        stamina: 120,
    },
    equippedItems: {
        jotaros_hat: 1,
    },
    stand: "stone_free",
    standsEvolved: {},
};

export const RubberSoul: FightableNPC = {
    ...NPCs.RubberSoul,
    level: 40,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "yellow_temperance",
    standsEvolved: {},
};

export const YoshikageKira: FightableNPC = {
    ...NPCs.YoshikageKira,
    level: Jotaro.level,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "killer_queen",
    standsEvolved: {
        killer_queen: 1,
    },
};

export const CorruptedReindeer: FightableNPC = {
    ...NPCs.CorruptedReindeer,
    level: 800,
    skillPoints: baseSP,
    equippedItems: {
        santas_candy_cane: 6,
    },
    stand: "the_chained",
    standsEvolved: {},
};

export const Santa: FightableNPC = {
    ...NPCs.Santa,
    level: 600,
    skillPoints: baseSP,
    equippedItems: {
        santas_candy_cane: 6,
    },
    stand: "the_chained",
    standsEvolved: {},
};

export const SantasElf: FightableNPC = {
    ...NPCs.SantasElf,
    level: 275,
    skillPoints: baseSP,
    equippedItems: {
        santas_candy_cane: 6,
    },
    stand: "the_chained",
    standsEvolved: {},
};

export const JGeil: FightableNPC = {
    ...NPCs.JGeil,
    level: 50,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "hanged_man",
    standsEvolved: {},
};

export const HolHorse: FightableNPC = {
    ...NPCs.HolHorse,
    level: 60,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "emperor",
    standsEvolved: {},
};

export const MohammedAvdol: FightableNPC = {
    ...NPCs.MohammedAvdol,
    level: 50,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "magicians_red",
    standsEvolved: {},
};

export const ConfettiGolem: FightableNPC = {
    ...NPCs.ConfettiGolem,
    level: 150, // max sp = level * 4 = 600
    // lets make a full hp build
    skillPoints: {
        defense: 500,
        strength: 50,
        speed: 25,
        perception: 25,
        stamina: 0,
    },
    equippedItems: { confetti_bazooka: 6 },
    standsEvolved: {},
};

export const ZZ: FightableNPC = {
    ...NPCs.ZZ,
    level: 65,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "wheel_of_fortune",
    standsEvolved: {},
};

export const Diavolo: FightableNPC = {
    ...NPCs.Diavolo,
    level: 500,
    skillPoints: {
        defense: 450 + 125,
        strength: 600 + 125,
        speed: 225 + 125,
        perception: 75 + 50,
        stamina: 150 + 75,
    },
    equippedItems: {
        diavolos_pants: equipableItemTypes.LEGS,
        diavolos_suit: equipableItemTypes.CHEST,
    },
    stand: "king_crimson",
    standsEvolved: {},
};

export const Miku: FightableNPC = {
    ...NPCs.Miku,
    level: 1000,
    skillPoints: {
        defense: 900 + 300,
        strength: 1200 + 300,
        speed: 450 + 150,
        perception: 150 + 150,
        stamina: 300 + 100,
    }, // total=
    equippedItems: {
        mikus_headset: equipableItemTypes.HEAD,
        mikus_pants: equipableItemTypes.LEGS,
        mikus_vest: equipableItemTypes.CHEST,
        mikus_microphone: equipableItemTypes.WEAPON,
    },
    standsEvolved: {},
};

// 2024 halloween boss lvl 500

export const PaleDarkElite: FightableNPC = {
    ...NPCs.PaleDarkElite,
    level: 500,
    skillPoints: {
        // total = 500 * 4 = 2000
        defense: 500 - 75 + 100,
        strength: 500 + 75 + 100,
        speed: 500 - 20 - 100,
        perception: 500 - 60 - 100,
        stamina: 0 + 60 + 20,
    },
    stand: "nix",
    equippedItems: {
        excalibur: equipableItemTypes.WEAPON,
    },
    standsEvolved: {},
};

export const PaleDark: FightableNPC = {
    ...NPCs.PaleDark,
    level: 110,
    skillPoints: {
        defense: 125 - 75 / 2 + 100 / 2,
        strength: 125 + 75 / 2 + 100 / 2,
        speed: 125 - 20 / 2 - 100 / 2,
        perception: 125 - 60 / 2 - 100 / 2,
        stamina: 0 + 60 / 2 + 20 / 2,
    },
    stand: "nix",
    equippedItems: {
        excalibur: equipableItemTypes.WEAPON,
    },
    standsEvolved: {},
};

export const Enya: FightableNPC = {
    ...NPCs.Enya,
    level: 80,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "justice",
    standsEvolved: {},
};

export const Krampus: FightableNPC = {
    ...NPCs.Krampus,
    level: 400,
    skillPoints: baseSP,
    equippedItems: {
        //krampus_sack: equipableItemTypes.CHEST,
        krampus_staff: equipableItemTypes.WEAPON,
    },
    standsEvolved: {},
};

export const IceGolem: FightableNPC = {
    ...NPCs.IceGolem,
    level: 800,
    skillPoints: {
        defense: 1000,
        strength: 1000,
        speed: 1000,
        perception: 1000,
        stamina: 1000,
    },
    equippedItems: {
        frostblade: equipableItemTypes.WEAPON,
    },
    standsEvolved: {},
};
