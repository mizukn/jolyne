import { RaidBoss } from "../@types";
import * as FightableNPCs from "./NPCs/FightableNPCs";
import * as Functions from "../utils/Functions";

export const Dio: RaidBoss = {
    boss: FightableNPCs.Dio,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.Dio.rewards.xp,
        coins: FightableNPCs.Dio.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("dios_knives").id,
                amount: 1,
                chance: 5,
            },
        ],
    },
    level: 25,
    maxLevel: Infinity,
    maxPlayers: 10,
    // 5 minutes
    cooldown: 7 * 60 * 1000,
};

export const Jotaro: RaidBoss = {
    boss: FightableNPCs.Jotaro,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.Jotaro.rewards.xp,
        coins: FightableNPCs.Jotaro.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 100,
            },
            {
                item: Functions.findItem("jotaro").id,
                amount: 1,
                chance: 3,
            },
            {
                item: Functions.findItem("star_platinum").id,
                amount: 1,
                chance: 25,
            },
        ],
    },
    level: 0,
    maxLevel: Infinity,
    maxPlayers: 10,
    // 5 minutes
    cooldown: 7 * 60 * 1000,
};

export const BanditBoss: RaidBoss = {
    boss: FightableNPCs.BanditLeader,
    minions: [FightableNPCs.Bandit],
    baseRewards: {
        xp: FightableNPCs.BanditLeader.rewards.xp,
        coins: FightableNPCs.BanditLeader.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100,
            },
        ],
    },
    level: 5,
    maxLevel: 50,
    maxPlayers: 5,
    // 2 minutes
    cooldown: 2 * 60 * 1000,
};

export const Kakyoin: RaidBoss = {
    boss: FightableNPCs.Kakyoin,
    minions: [],
    baseRewards: {
        xp: 5000,
        coins: FightableNPCs.Kakyoin.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 100,
            },
            {
                item: "kakyoins_snazzy_shades",
                chance: 25,
                amount: 1,
            },
        ],
    },
    level: 0,
    maxLevel: 25,
    maxPlayers: 5,
    cooldown: 0.5 * 60 * 1000,
};

export const JeanPierrePolnareffRequiem: RaidBoss = {
    boss: FightableNPCs.RequiemPolnareff,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.RequiemPolnareff.rewards.xp,
        coins: FightableNPCs.RequiemPolnareff.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("Requiem Arrow").id,
                amount: 1,
                chance: 5,
            },
        ],
    },
    level: 50,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 15 minutes
    cooldown: 15 * 60 * 1000,
};

export const Golem: RaidBoss = {
    boss: FightableNPCs.Golem,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.Golem.rewards.xp,
        coins: FightableNPCs.Golem.rewards.coins,
        items: [
            // x5 arrow 300%, x5 arrow 300%, x1 arrow 200%, x2 arrow 200%
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 5,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 5,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2,
                chance: 200,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2,
                chance: 200,
            },
        ],
    },
    level: 15,
    maxLevel: Infinity,
    maxPlayers: Math.round(100 / 15),
    cooldown: 1 * 60 * 1000,
};

export const Megumin: RaidBoss = {
    boss: FightableNPCs.Megumin,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.Megumin.rewards.xp,
        coins: FightableNPCs.Megumin.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300,
            },
            {
                item: Functions.findItem("megumins_hat").id,
                amount: 1,
                chance: 4,
            },
            {
                item: Functions.findItem("megumins_wand").id,
                amount: 1,
                chance: 4,
            },
        ],
    },
    level: 25,
    maxLevel: Infinity,
    maxPlayers: 10,
    // 5 minutes
    cooldown: 5 * 60 * 1000,
};

export const GiornoGiovannaRequiem: RaidBoss = {
    boss: FightableNPCs.GiornoGiovannaRequiem,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.GiornoGiovannaRequiem.rewards.xp,
        coins: FightableNPCs.GiornoGiovannaRequiem.rewards.coins,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("Requiem Arrow").id,
                amount: 1,
                chance: 5,
            },
        ],
    },
    level: 50,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 15 minutes
    cooldown: 15 * 60 * 1000,
};

export const Jolyne: RaidBoss = {
    boss: FightableNPCs.Jolyne,
    minions: [],
    baseRewards: {
        xp: 80000,
        coins: 100727,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("Green Baby").id,
                amount: 1,
                chance: 0.1,
            },
        ],
    },
    level: 25,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 7 minutes
    cooldown: 7 * 60 * 1000,
};

export const Toru: RaidBoss = {
    boss: FightableNPCs.Toru,
    minions: [],
    baseRewards: {
        xp: 180000,
        coins: 172700,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("wonder_of_u").id,
                amount: 1,
                chance: 1,
            },
        ],
    },
    level: 50,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 15 minutes
    cooldown: 15 * 60 * 1000,
};

export const YoshikageKira: RaidBoss = {
    boss: FightableNPCs.YoshikageKira,
    minions: [],
    baseRewards: {
        xp: 80000,
        coins: 100727,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("Killer Queen").id,
                amount: 1,
                chance: 1,
            },
        ],
    },
    level: 25,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 7 minutes
    cooldown: 7 * 60 * 1000,
    allies: [FightableNPCs.Jolyne],
};

export const HolHorse: RaidBoss = {
    boss: FightableNPCs.HolHorse,
    minions: [],
    baseRewards: {
        xp: FightableNPCs.HolHorse.rewards.xp ?? Functions.getMaxXp(35),
        coins: FightableNPCs.HolHorse.rewards.coins ?? 5000,
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 10,
                chance: 1000,
            },
            {
                item: Functions.findItem("emperor").id,
                amount: 1,
                chance: 1,
            },
            {
                item: Functions.findItem("Rare Stand Arrow").id,
                amount: 2,
                chance: 50,
            },
        ],
    },
    level: 35,
    maxLevel: Infinity,
    maxPlayers: 3,
    cooldown: 3 * 60 * 1000,
    allies: [FightableNPCs.MohammedAvdol],
};
