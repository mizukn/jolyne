// Note: it doesn't matter if the NPC doesn't have balanced skill points because it'll be balanced when the bot starts.
import type { FightableNPC } from "../../@types";
import * as NPCs from "./NPCs";

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
    level: 200,
    skillPoints: {
        defense: 100,
        strength: 100,
        speed: 100,
        perception: 100,
        stamina: 100,
    },
    equippedItems: {},
    stand: "star_platinum",
    standsEvolved: {},
};

export const Dio: FightableNPC = {
    ...NPCs.Dio,
    level: 150,
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
    equippedItems: {},
    standsEvolved: {},
    stand: "The World",
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
    level: 200,
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
    level: Dio.level * 5,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "gold_experience_requiem",
    standsEvolved: {},
};

export const Devo: FightableNPC = {
    ...NPCs.Devo,
    level: 30,
    skillPoints: baseSP,
    equippedItems: {},
    stand: "ebony_devil",
    standsEvolved: {},
};