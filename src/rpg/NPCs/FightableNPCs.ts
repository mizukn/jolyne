import type { FightableNPC } from "../../@types";
import * as NPCs from "./NPCs";

export const Kakyoin: FightableNPC = {
    ...NPCs.Kakyoin,
    level: 1,
    skillPoints: {
        defense: 1,
        strength: 1,
        speed: 1,
        perception: 1,
        stamina: 0,
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
    //stand: "Hierophant Green",
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
