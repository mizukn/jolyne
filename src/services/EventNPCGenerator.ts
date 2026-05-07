import type { FightableNPC, NPC } from "../@types";
import { endOf2024ChristmasEvent } from "../rpg/Events/2024ChristmasEvent";
import { endOf2025ChineseNewYear } from "../rpg/Events/2025ChineseNewYear";
import {
    endOf2025HalloweenEvent,
    startOf2025HalloweenEvent,
} from "../rpg/Events/2025HalloweenEvent";
import {
    endOf2025WinterEvent,
    startOf2025WinterEvent,
} from "../rpg/Events/2025WinterEvent";
import * as FightableNPCs from "../rpg/NPCs/FightableNPCs";
import { EVENT_IDS, isActive } from "./EventService";
import * as Functions from "../utils/Functions";
import log from "../utils/Logger";

const fightableNPCRegistry = FightableNPCs as unknown as Record<string, FightableNPC>;

const generateCelestialSnakes = (): void => {
    for (let i = 1; i < 300; i += 3) {
        const celestialSnakeNPC: NPC = {
            name: `Celestial Snake [LVL ${i}]`,
            id: `celestialSnake_${i}`,
            emoji: "<:snake_jian:1334492555680808962>",
        };
        const celestialSnakeFightableNPC: FightableNPC = {
            ...celestialSnakeNPC,
            level: i,
            skillPoints: {
                speed: 1,
                strength: 1,
                defense: 1,
                perception: 1,
                stamina: 0,
            },
            equippedItems:
                i < 150
                    ? {}
                    : {
                          snake_jian: 6,
                      },
            rewards: {
                items: [
                    {
                        item: Functions.findItem("snake_skin").id,
                        amount: 1,
                        chance: 100,
                    },
                    {
                        item: Functions.findItem("snake_skin").id,
                        amount: 1,
                        chance: 35,
                    },
                    {
                        item: Functions.findItem("hangbao").id,
                        amount: 3,
                        chance: 100,
                    },
                    {
                        item: Functions.findItem("hangbao").id,
                        amount: 2,
                        chance: 25,
                    },
                    {
                        item: Functions.findItem("hangbao").id,
                        amount: 3,
                        chance: 15,
                    },
                    {
                        item: Functions.findItem("hangbao").id,
                        amount: 4,
                        chance: 5,
                    },
                ],
            },
            private: true,
            standsEvolved: {},
        };

        fightableNPCRegistry[celestialSnakeFightableNPC.id] = celestialSnakeFightableNPC;
    }
};

const generateKrampusGoons = (): void => {
    for (let i = 1; i < 300; i += 3) {
        const krampusGoonNPC: NPC = {
            name: `Krampus' Goon [LVL ${i}]`,
            id: `KrampusGoon_${i}`,
            emoji: "<:krampus_goon:1311458615173054604>",
        };
        const krampusGoonFightableNPC: FightableNPC = {
            ...krampusGoonNPC,
            level: i,
            skillPoints: {
                speed: 1,
                strength: 1,
                defense: 1,
                perception: 1,
                stamina: 0,
            },
            equippedItems: i < 150 ? {} : FightableNPCs.Krampus.equippedItems,
            rewards: {
                items: [
                    {
                        item: Functions.findItem("ornament").id,
                        amount: 1,
                        chance: 100,
                    },
                    {
                        item: Functions.findItem("ornament").id,
                        amount: 2,
                        chance: 25,
                    },
                    {
                        item: Functions.findItem("ornament").id,
                        amount: 3,
                        chance: 15,
                    },
                    {
                        item: Functions.findItem("ornament").id,
                        amount: 4,
                        chance: 5,
                    },
                ],
            },
            private: true,
            standsEvolved: {},
        };

        fightableNPCRegistry[krampusGoonFightableNPC.id] = krampusGoonFightableNPC;
    }
};

const generateZombies = (): void => {
    for (let i = 1; i < 300; i += 3) {
        const spookyZombieNPC: NPC = {
            name: `Spooky Zombie [LVL ${i}]`,
            id: `SpookyZombie_${i}`,
            emoji: "🧟",
        };
        const spookyZombieFightableNPC: FightableNPC = {
            ...spookyZombieNPC,
            level: i,
            skillPoints: {
                speed: 1,
                strength: 1,
                defense: 1,
                perception: 1,
                stamina: 0,
            },
            equippedItems: i < 150 ? {} : FightableNPCs.Krampus.equippedItems,
            rewards: {
                items: [
                    {
                        item: Functions.findItem("spooky_zombie_brain").id,
                        amount: 1,
                        chance: 100,
                    },
                    {
                        item: Functions.findItem("spooky_zombie_brain").id,
                        amount: 5,
                        chance: 50,
                    },
                ],
            },
            private: true,
            standsEvolved: {},
        };

        fightableNPCRegistry[spookyZombieFightableNPC.id] = spookyZombieFightableNPC;
    }
};

const generateIceBandits = (): void => {
    for (let i = 1; i < 300; i += 3) {
        const iceBanditNPC: NPC = {
            name: `Ice Bandit [LVL ${i}]`,
            id: `IceBandit_${i}`,
            emoji: "<:ice_bandit:1323367718673453127>",
        };
        const iceBanditFightableNPC: FightableNPC = {
            ...iceBanditNPC,
            level: i,
            skillPoints: {
                speed: 1,
                strength: 1,
                defense: 1,
                perception: 1,
                stamina: 0,
            },
            equippedItems: i < 150 ? {} : FightableNPCs.Krampus.equippedItems,
            rewards: {
                items: [
                    {
                        item: "ice_shard",
                        amount: 2,
                        chance: 100,
                    },
                    {
                        item: "ice_shard",
                        amount: 3,
                        chance: 25,
                    },
                    {
                        item: "ice_shard",
                        amount: 4,
                        chance: 15,
                    },
                    {
                        item: "ice_shard",
                        amount: 5,
                        chance: 5,
                    },
                ],
            },
            private: true,
            standsEvolved: {},
        };

        fightableNPCRegistry[iceBanditFightableNPC.id] = iceBanditFightableNPC;
    }
};

export const registerSeasonalEventNPCs = (): void => {
    if (Date.now() < endOf2025ChineseNewYear.getTime()) {
        generateCelestialSnakes();
    }

    if (Date.now() < endOf2024ChristmasEvent) {
        generateKrampusGoons();
    }

    if (isActive(EVENT_IDS.WINTER_2025)) {
        generateIceBandits();
        log("Generated Ice Bandits", "event");
    } else if (Date.now() < endOf2025WinterEvent.getTime()) {
        const delay = startOf2025WinterEvent.getTime() - Date.now();
        setTimeout(generateIceBandits, delay);
        log(`Generating Ice Bandits in ${delay}ms`, "event");
    }

    if (isActive(EVENT_IDS.HALLOWEEN_2025)) {
        generateZombies();
    } else if (Date.now() < endOf2025HalloweenEvent.getTime()) {
        setTimeout(generateZombies, startOf2025HalloweenEvent.getTime() - Date.now());
    }
};
