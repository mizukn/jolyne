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
                chance: 300
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 1,
                chance: 300
            },
            {
                item: Functions.findItem("dios_knives").id,
                amount: 1,
                chance: 5
            }
        ]
    },
    level: 25,
    maxLevel: Infinity,
    maxPlayers: 10,
    // 5 minutes
    cooldown: 5 * 60 * 1000
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
                chance: 100
            },
            {
                item: Functions.findItem("jotaro").id,
                amount: 1,
                chance: 3
            },
            {
                item: Functions.findItem("star_platinum").id,
                amount: 1,
                chance: 25
            }
        ]
    },
    level: 0,
    maxLevel: Infinity,
    maxPlayers: 10,
    // 5 minutes
    cooldown: 5 * 60 * 1000
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
                chance: 100
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100
            },
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
                chance: 100
            }
        ]
    },
    level: 5,
    maxLevel: 50,
    maxPlayers: 5,
    // 2 minutes
    cooldown: 2 * 60 * 1000
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
                chance: 100
            },
            {
                item: "kakyoins_snazzy_shades",
                chance: 25,
                amount: 1
            }
        ]
    },
    level: 0,
    maxLevel: 25,
    maxPlayers: 5,
    // 2 minutes
    cooldown: 2 * 60 * 1000
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
                chance: 1000
            },
            {
                item: Functions.findItem("Requiem Arrow").id,
                amount: 1,
                chance: 5
            }
        ]
    },
    level: 50,
    maxLevel: Infinity,
    maxPlayers: 6,
    // 15 minutes
    cooldown: 15 * 60 * 1000
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
                chance: 300
            }, {
                item: Functions.findItem("Stand Arrow").id,
                amount: 5,
                chance: 300
            }, {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2,
                chance: 200
            }, {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2,
                chance: 200
            }
        ]
    },
    level: 15,
    maxLevel: Infinity,
    maxPlayers: Math.round(100 / 15),
    // 3 minutes
    cooldown: 3 * 60 * 1000
};