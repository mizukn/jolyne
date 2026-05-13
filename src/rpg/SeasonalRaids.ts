// Seasonal / event raid bosses. Held separately from the main raid registry
// (`./Raids.ts`) so `RaidSubcommands.ts` stays focused on the command flow.
// `getFixedBosses()` returns the union of permanent + currently-active
// seasonal raids based on `EventService.isActive(...)`.

import type { RaidBoss } from "../@types";
import { cloneDeep } from "lodash";
import * as FightableNPCs from "./NPCs/FightableNPCs";
import * as Bosses from "./Raids";
import * as Functions from "../utils/Functions";
import { EVENT_IDS, isActive } from "../services/EventService";

export const eventRaid: RaidBoss = {
    boss: FightableNPCs.ConfettiGolem,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 50000,
        xp: Functions.getMaxXp(FightableNPCs.ConfettiGolem.level),
        items: [
            { item: Functions.findItem("Confetti").id, amount: 1, chance: 50 },
            { item: Functions.findItem("second").id, amount: 1, chance: 15 },
        ],
    },
    allies: [FightableNPCs.Jolyne],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000,
};

export const Halloween2024EventRaid: RaidBoss = {
    boss: FightableNPCs.PaleDark,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 10000,
        xp: Functions.getMaxXp(FightableNPCs.PaleDark.level),
        items: [
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("nix").id, amount: 1, chance: 1 },
        ],
    },
    allies: [FightableNPCs.Jolyne],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000 * 5,
};

export const Halloween2024EventRaidElite: RaidBoss = {
    boss: FightableNPCs.PaleDarkElite,
    minions: [],
    level: 200,
    baseRewards: {
        coins: 50000,
        xp: Functions.getMaxXp(FightableNPCs.PaleDarkElite.level),
        items: [
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("Pumpkin").id, amount: 1, chance: 50 },
            { item: Functions.findItem("nix").id, amount: 1, chance: 2 },
        ],
    },
    allies: [],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000 * 10,
};

export const Halloween2025EventRaid: RaidBoss = {
    boss: FightableNPCs.RottenKing,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 20000,
        xp: Functions.getMaxXp(FightableNPCs.RottenKing.level) * 2,
        items: [
            { item: Functions.findItem("rotten_crown").id, amount: 1, chance: 5 },
            { item: Functions.findItem("rotten_hat").id, amount: 1, chance: 10 },
            { item: Functions.findItem("dead_revival").id, amount: 1, chance: 2 },
        ],
    },
    allies: [],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000 * 10,
};

export const Halloween2025EventRaidElite: RaidBoss = {
    boss: FightableNPCs.RottenKingElite,
    minions: [],
    level: 300,
    baseRewards: {
        coins: 50000,
        xp: Functions.getMaxXp(FightableNPCs.RottenKingElite.level) * 2,
        items: [
            { item: Functions.findItem("rotten_crown").id, amount: 1, chance: 10 },
            { item: Functions.findItem("rotten_hat").id, amount: 1, chance: 20 },
            { item: Functions.findItem("dead_revival").id, amount: 1, chance: 5 },
        ],
    },
    allies: [],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000 * 15,
};

export const Christmas2024EventRaid: RaidBoss = {
    boss: FightableNPCs.Krampus,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 10000,
        xp: Functions.getMaxXp(FightableNPCs.Krampus.level) * 2,
        items: [
            { item: Functions.findItem("Ornament").id, amount: 15, chance: 1000 },
            { item: Functions.findItem("Ornament").id, amount: 7, chance: 55 },
            { item: Functions.findItem("krampus_horns").id, amount: 1, chance: 8 },
            { item: Functions.findItem("krampus_staff").id, amount: 1, chance: 1 },
        ],
    },
    allies: [FightableNPCs.Jolyne],
    maxLevel: Infinity,
    maxPlayers: 10,
    cooldown: 60000 * 5,
};

export const Winter2025EventRaid: RaidBoss = {
    boss: FightableNPCs.IceGolem,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 10000,
        xp: Functions.getMaxXp(FightableNPCs.IceGolem.level),
        items: [
            { item: Functions.findItem("Ice Shard").id, amount: 15, chance: 100 },
            { item: Functions.findItem("Ice Shard").id, amount: 15, chance: 50 },
            { item: Functions.findItem("Ice Shard").id, amount: 50, chance: 5 },
            { item: Functions.findItem("Frostblade").id, amount: 1, chance: 5 },
        ],
    },
    maxLevel: Infinity,
    maxPlayers: 5,
    cooldown: 60000 * 5,
};

export const ChineseNewYearEvent2025Raid: RaidBoss = {
    boss: FightableNPCs.BeastNian,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 10000,
        xp: Functions.getMaxXp(FightableNPCs.BeastNian.level),
        items: [
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: "beast_nians_horn", amount: 1, chance: 15 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 100 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
            { item: Functions.findItem("hangbao").id, amount: 1, chance: 50 },
        ],
    },
    maxLevel: Infinity,
    maxPlayers: 5,
    cooldown: 60000 * 5,
};

export const PinataTitan: RaidBoss = {
    boss: FightableNPCs.PinataTitan,
    minions: [],
    level: 0,
    baseRewards: {
        coins: 50000,
        xp: Functions.getMaxXp(900),
        items: [
            { item: "pinata_hat", amount: 1, chance: 15 },
            { item: "pinata_hammer", amount: 1, chance: 5 },
        ],
    },
    allies: [FightableNPCs.Jolyne],
    maxLevel: Infinity,
    maxPlayers: Infinity,
    cooldown: 60000 * 9,
};

export const getFixedBosses = (): RaidBoss[] => {
    const fixedBosses = cloneDeep(Object.values(Bosses));
    if (isActive(EVENT_IDS.HALLOWEEN_2024)) {
        fixedBosses.push(Halloween2024EventRaid);
        fixedBosses.push(Halloween2024EventRaidElite);
    }
    if (isActive(EVENT_IDS.CHRISTMAS_2024)) {
        fixedBosses.push(Christmas2024EventRaid);
    }
    if (isActive(EVENT_IDS.WINTER_2025)) {
        fixedBosses.push(Winter2025EventRaid);
    }
    if (isActive(EVENT_IDS.CHINESE_NEW_YEAR_2025)) {
        fixedBosses.push(ChineseNewYearEvent2025Raid);
    }
    if (isActive(EVENT_IDS.THIRD_ANNIVERSARY)) {
        fixedBosses.push(PinataTitan);
    }
    if (isActive(EVENT_IDS.HALLOWEEN_2025)) {
        fixedBosses.push(Halloween2025EventRaidElite);
        fixedBosses.push(Halloween2025EventRaid);
    }
    return fixedBosses;
};
