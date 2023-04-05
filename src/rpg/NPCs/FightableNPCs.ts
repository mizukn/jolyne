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
        defense: 1,
        strength: 1,
        speed: 1,
        perception: 100,
        stamina: 0,
    },
    rewards: {
        coins: 100,
        xp: 350,
    },
    //stand: "Hierophant Green",
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
    stand: "Hierophant Green",
};

export const Jotaro: FightableNPC = {
    ...NPCs.Jotaro,
    level: 100,
    skillPoints: {
        defense: 100,
        strength: 100,
        speed: 100,
        perception: 100,
        stamina: 100,
    },
    //stand: "Star Platinum",
};

export const Dio: FightableNPC = {
    ...NPCs.Dio,
    level: Jotaro.level,
    skillPoints: Jotaro.skillPoints,
    //stand: "The World",
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
    //stand: "The World: Over Heaven",
};

export const BanditLeader: FightableNPC = {
    ...NPCs.BanditLeader,
    level: 20, // is raid boss
    skillPoints: baseSP,
    stand: "Hierophant Green",
};

export const Bandit: FightableNPC = {
    ...NPCs.Bandit,
    level: 5,
    skillPoints: baseSP,
};
