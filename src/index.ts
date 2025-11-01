import type {
    EventFile,
    SlashCommandFile,
    SlashCommand,
    Special,
    Weapon,
    NPC,
    FightableNPC,
    EvolutionStand,
    Stand,
} from "./@types";
import { GatewayIntentBits, Partials, Options, Embed, Utils } from "discord.js";
import { getInfo, ClusterClient, messageType } from "discord-hybrid-sharding";
import JolyneClient from "./structures/JolyneClient";
import * as FightableNPCs from "./rpg/NPCs/FightableNPCs";
import * as Functions from "./utils/Functions";
import i18n from "./structures/i18n";
import fs from "fs";
import path from "path";
import * as Items from "./rpg/Items";
import * as Stands from "./rpg/Stands";
import * as Emojis from "./emojis.json";
import * as NPCs from "./rpg/NPCs/NPCs";
import * as JSONNPC from "../src/NPCs.json";
import * as PRESTIGEJSON from "../src/prestigeNPCs.json";
import * as EquipableItems from "./rpg/Items/EquipableItems";
import * as Sentry from "@sentry/node";
import { exec } from "child_process";
import { count } from "console";
import { FightHandler } from "./structures/FightHandler";
import { cloneDeep } from "lodash";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import {
    endOf2024ChristmasEvent,
    is2024ChristmasEventActive,
} from "./rpg/Events/2024ChristmasEvent";
import {
    endOf2025WinterEvent,
    is2025WinterEvent,
    startOf2025WinterEvent,
} from "./rpg/Events/2025WinterEvent";
import { endOf2025ChineseNewYear } from "./rpg/Events/2025ChineseNewYear";
import { endOf2024HalloweenEvent } from "./rpg/Events/2024HalloweenEvent";
import {
    endOf2025HalloweenEvent,
    is2025HalloweenEventActive,
    startOf2025HalloweenEvent,
} from "./rpg/Events/2025HalloweenEvent";

const StandUsersNPCS = process.env.ENABLE_PRESTIGE ? PRESTIGEJSON : JSONNPC;
const getPrestigeAdd = (x: Stand | Weapon) => {
    return x.rarity === "C"
        ? 5
        : x.rarity === "B"
        ? 10
        : x.rarity === "A"
        ? 25
        : x.rarity === "S"
        ? 75
        : x.rarity === "SS"
        ? 300
        : 30;
};
const weapons = Object.values(EquipableItems).filter(
    (x) => (x as Weapon).abilities !== undefined
) as Weapon[];

const formattedStandUsers = /*balanceLevels(JSON.parse(JSON.stringify(StandUsersNPCS)) as {
    [key: string]: number;
}, 1, 200);*/ JSON.parse(JSON.stringify(StandUsersNPCS)) as { [key: string]: number };

function balanceLevels(
    args: { [key: string]: number },
    lowest: number,
    biggest: number
): { [key: string]: number } {
    const levels = Object.values(args);
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    const balancedLevels: { [key: string]: number } = {};

    for (const key in args) {
        const originalLevel = args[key];
        const balancedLevel =
            ((originalLevel - minLevel) / (maxLevel - minLevel)) * (biggest - lowest) + lowest;
        balancedLevels[key] = Math.round(balancedLevel);
    }

    return balancedLevels;
}

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    profilesSampleRate: 1.0,
    integrations: [nodeProfilingIntegration()],
});

if (Date.now() < endOf2025ChineseNewYear.getTime()) {
    for (let i = 1; i < 300; i += 3) {
        const krampusGoonNPC: NPC = {
            name: `Celestial Snake [LVL ${i}]`,
            id: `celestialSnake_${i}`,
            emoji: "<:snake_jian:1334492555680808962>",
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

        // @ts-expect-error because it's a dynamic property
        FightableNPCs[krampusGoonFightableNPC.id] = krampusGoonFightableNPC;
    }
}

if (Date.now() < endOf2024ChristmasEvent) {
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

        // @ts-expect-error because it's a dynamic property
        FightableNPCs[krampusGoonFightableNPC.id] = krampusGoonFightableNPC;
    }
}

function generateZombies(): void {
    // drops: spooky_zombie_brain
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

        // @ts-expect-error because it's a dynamic property
        FightableNPCs[spookyZombieFightableNPC.id] = spookyZombieFightableNPC;
    }
}

function generateIceBandits(): void {
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

        // @ts-expect-error because it's a dynamic property
        FightableNPCs[iceBanditFightableNPC.id] = iceBanditFightableNPC;
    }
}

if (is2025WinterEvent()) {
    generateIceBandits();
    console.log("Generated Ice Bandits");
} else if (Date.now() < endOf2025WinterEvent.getTime()) {
    // then it means that it didnt end yet
    setTimeout(() => {
        generateIceBandits();
    }, startOf2025WinterEvent.getTime() - Date.now());
    console.log(`Generating Ice Bandits in ${startOf2025WinterEvent.getTime() - Date.now()}ms`);
}

if (is2025HalloweenEventActive()) {
    generateZombies();
} else if (Date.now() < endOf2025HalloweenEvent.getTime()) {
    // then it means that it didnt end yet
    setTimeout(() => {
        generateZombies();
    }, startOf2025HalloweenEvent.getTime() - Date.now());
}

/*
for (let i = 1; i < 500; i += 3) {
    const SpookySkeletonNPC: NPC = {
        ...SpookySkeleton,
        name: `Spooky Skeleton [LVL ${i}]`,
        id: `SpookySkeleton_${i}`
    };
    const SpookyZombieNPC: NPC = {
        ...SpookyZombie,
        id: `SpookyZombie_${i}`,
        name: `Spooky Zombie [LVL ${i}]`
    };

    const base = {
        level: i,
        skillPoints: {
            speed: 1,
            strength: 1,
            defense: 1,
            perception: 1,
            stamina: 0
        },
        rewards: {
            items: [
                {
                    item: Functions.findItem("spooky_soul").id,
                    amount: 1,
                    chance: 100
                },
                {
                    item: Functions.findItem("spooky_soul").id,
                    amount: 5,
                    chance: 50
                }, {
                    item: Functions.findItem("spooky_soul").id,
                    amount: 10,
                    chance: 15
                }, {
                    item: Functions.findItem("stand_arrow").id,
                    amount: 1,
                    chance: 5
                }
            ]
        },
        equippedItems: {},
        standsEvolved: {},
        stand: Functions.findStand("skeletal_spectre").id,
        private: true
    };

    const SpookySkeletonFightableNPC: FightableNPC = {
        ...SpookySkeletonNPC,
        ...base,
        avatarURL: `https://media.jolyne.moe/0qqxwk/direct`
    };
    const SpookyZombieFightableNPC: FightableNPC = {
        ...SpookyZombieNPC,
        ...base,
        avatarURL: `https://media.jolyne.moe/zyrvvw/direct`
    };

    // @ts-expect-error because it's a dynamic property
    FightableNPCs[SpookySkeletonFightableNPC.id] = SpookySkeletonFightableNPC;
    // @ts-expect-error because it's a dynamic property
    FightableNPCs[SpookyZombieFightableNPC.id] = SpookyZombieFightableNPC;
    // @ts-expect-error because it's a dynamic property
    NPCs[SpookySkeletonNPC.id] = SpookySkeletonNPC;
    // @ts-expect-error because it's a dynamic property
    NPCs[SpookyZombieNPC.id] = SpookyZombieNPC;

    blablabla

    si le mec na pas assez dargent:
        return "pas dargent"
    
    blablabla
}
*/

/**
 * Temp code starts from here
 */
const standPrices = {
    SS: 200000,
    S: 50000,
    A: 25000,
    B: 10000,
    C: 5000,
    T: 69,
};

const Multiplier = {
    SS: 1.65,
    S: 1.45,
    A: 1.2,
    B: 1.1,
    C: 1.05,
    T: 1.35,
};

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((x) => x[0])
        .join("");
};

const comasAnd = (arr: string[]): string => {
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(", ") + " and " + arr.slice(-1);
};

for (const stand of [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => {
        return {
            ...x.evolutions[0],
            id: x.id,
        };
    }),
]) {
    if (!stand.available) continue;
    //console.log(`Adding ${stand.name} Stand Disc`);
    const evolutions = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id);
    const standDisc: Special = {
        id: stand.id + ".$disc$",
        name:
            stand.name +
            " Stand Disc" +
            (evolutions
                ? ` [${evolutions.evolutions.map((x) => getInitials(x.name)).join(", ")}]`
                : ""),

        description:
            "A disc that contains the power of " +
            (evolutions ? comasAnd(evolutions.evolutions.map((x) => x.name)) : stand.name),
        rarity: stand.rarity,
        price: standPrices[stand.rarity],
        tradable: true,
        storable: true,
        emoji: stand.emoji + Emojis.disk,
        use: async (ctx) => {
            if (Functions.findStand(ctx.userData.stand)) {
                ctx.makeMessage({
                    content: `Dawg you already have a stand. If you'd like to change your stand, please either erase your current one (${ctx.client.getSlashCommandMention(
                        "stand delete"
                    )}) or store it (${ctx.client.getSlashCommandMention("stand store")})`,
                });
                return 0;
            }
            ctx.userData.stand = stand.id;
            const newStand = Functions.findStand(
                ctx.userData.stand,
                ctx.userData.standsEvolved[ctx.userData.stand]
            );
            ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Pucci,
                    "You have successfully equipped **" +
                        newStand.name +
                        "** " +
                        newStand.emoji +
                        " !"
                ),
            });
            return 1;
        },
    };
    // @ts-expect-error because it's a dynamic property
    Items.default[standDisc.id] = standDisc;
}

/*
for (const item of Object.values(Items.default)) {
    if (item.craft) {
        const itemScroll: Special = {
            id: item.id + ".$scroll$",
            name: item.name + " Scroll",
            description:
                "A scroll that contains the recipe for " +
                item.name +
                ". Using it will use up the scroll.",
            rarity: item.rarity,
            price: item.price * 10,
            tradable: true,
            storable: true,
            emoji: "📜",
            use: async (ctx) => {
                if (ctx.userData.learnedItems.includes(item.id)) {
                    ctx.makeMessage({
                        content: item.emoji + " | You have already learned this recipe!"
                    });
                    return false;
                }
                ctx.userData.learnedItems.push(item.id);
                Functions.removeItem(ctx.userData, itemScroll.id, 1);
                ctx.makeMessage({
                    content:
                        item.emoji +
                        " | You have successfully learned the recipe for " +
                        item.name +
                        "!"
                });
            }
        };
        // @ts-expect-error because it's a dynamic property
        Items.default[itemScroll.id] = itemScroll;
    }
}
*/
/**
 * Temp code ends here
 */

for (const stand of [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands)
        .map((x) => {
            return x.evolutions.map((y) => {
                return {
                    ...y,
                    id: x.id,
                };
            });
        })
        .map((x) => x)
        .flat(),
]) {
    // check if today is 1st april
    if (new Date().getMonth() === 3 && new Date().getDate() === 1) {
        stand.emoji = "🤡";
        stand.image = `https://i.pinimg.com/originals/32/f2/ed/32f2eddb36d15d979a29c9728ac89472.jpg`;
    }
    if (!stand.available || stand.name.toLocaleLowerCase() === "mommy queen") continue;

    // @ts-expect-error because it's a dynamic property
    NPCs[`${stand.name.replace(" ", "")}User`] = {
        id: `${stand.name.replace(" ", "")}_user`,
        name: stand.name + " User",
        emoji: stand.emoji,
    };

    if (!formattedStandUsers[`${stand.name.replace(" ", "")}User`]) {
        if (!formattedStandUsers[`${stand.name.replace(" ", "")}User`]) {
            let minLevel =
                stand.rarity === "C"
                    ? 1
                    : stand.rarity === "B"
                    ? 10
                    : stand.rarity === "A"
                    ? 20
                    : stand.rarity === "S"
                    ? 100
                    : stand.rarity === "SS"
                    ? 200
                    : 30;
            let maxLevel = minLevel * 12;
            if (process.env.ENABLE_PRESTIGE) {
                minLevel = getPrestigeAdd(stand);
                maxLevel = minLevel * 2;
            }
            formattedStandUsers[`${stand.name.replace(" ", "")}User`] = Functions.randomNumber(
                Math.round(minLevel * 1.5),
                maxLevel
            );
        }
    }

    const rewards: FightableNPC["rewards"] = { items: [] };

    for (let i = 0; i < formattedStandUsers[`${stand.name.replace(" ", "")}User`]; i += 10) {
        rewards.items.push({
            item: "stand_arrow",
            amount: 1,
            chance: 5,
        });
    }

    if (rewards.items.length === 0) rewards.items = undefined;
    // check if stand is an evolution
    const evolution = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id)
        ? Object.values(Stands.EvolutionStands)
              .find((x) => x.id === stand.id)
              .evolutions.findIndex((x) => x.name === stand.name)
        : 0;

    const npcData = {
        // @ts-expect-error it exists
        ...NPCs[`${stand.name.replace(" ", "")}User`],
        level: formattedStandUsers[`${stand.name.replace(" ", "")}User`], // Functions.randomNumber(1, 50),
        skillPoints: {
            defense: 0,
            strength: 0,
            speed: 0,
            perception: 0,
            stamina: 0,
        },
        stand: stand.id,
        equippedItems: {},
        private: stand.adminOnly ? true : false,
        standsEvolved: {
            [stand.id]: evolution,
        },
        rewards: {
            items: rewards.items,
        },
    };
    //Functions.generateSkillPoints(npcData);
    // @ts-expect-error because it's a dynamic property
    FightableNPCs[`${stand.name.replace(" ", "")}User`] = npcData;

    for (const weapon of weapons.filter((x) => !x.private)) {
        // creating NPCs with stand and with a custom weapon
        const ID = `${stand.name.replace(" ", "")}User${weapon.id}`;
        // @ts-expect-error because it's a dynamic property
        NPCs[ID] = {
            id: ID,
            name: stand.name + " [" + weapon.name + "] User",
            emoji: stand.emoji,
        };

        // min level works like that:
        // 1. if the stand is C tier, then the min level is 1
        // 2. if the stand has a weapon, we give him *2 min level
        // 3. if the stand is B tier, then the min level is 10
        // 4. if the stand is A tier, then the min level is 20
        // 5. if the stand is S tier, then the min level is 30
        // 6. if the stand is SS tier, then the min level is 40
        // 7. if the stand is T tier, then the min level is 30

        // max level is the min level * 12

        if (!formattedStandUsers[ID]) {
            let minLevel =
                weapon.rarity === "C"
                    ? 1
                    : weapon.rarity === "B"
                    ? 10
                    : weapon.rarity === "A"
                    ? 20
                    : weapon.rarity === "S"
                    ? 100
                    : weapon.rarity === "SS"
                    ? 200
                    : 30;
            if (weapon.abilities) minLevel *= 2;
            let maxLevel = minLevel * 12;

            if (process.env.ENABLE_PRESTIGE) {
                minLevel = getPrestigeAdd(weapon);
                minLevel += getPrestigeAdd(stand);
                maxLevel = minLevel * 2;
            }
            formattedStandUsers[ID] = Functions.randomNumber(Math.round(minLevel * 1.5), maxLevel);
        }
        const npcData: FightableNPC = {
            // @ts-expect-error it exists
            ...NPCs[ID],
            level: formattedStandUsers[ID], // Functions.randomNumber(1, 50),
            skillPoints: {
                defense: 0,
                strength: 0,
                speed: 0,
                perception: 0,
                stamina: 0,
            },
            stand: stand.id,
            equippedItems: {
                [weapon.id]: 6,
            },
            standsEvolved: {
                [stand.id]: evolution,
            },
            private: stand.adminOnly ? true : false,
            rewards: {
                items: rewards.items,
            },
        };
        //Functions.generateSkillPoints(npcData);
        // @ts-expect-error because it's a dynamic property
        FightableNPCs[ID] = npcData;
    }
}

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const partials = [];

if (process.env.INTENTS) {
    intents.push(GatewayIntentBits.MessageContent);
    intents.push(GatewayIntentBits.GuildMessages);
    partials.push(Partials.Message);
}

const client = new JolyneClient({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
    intents,
    partials,
    makeCache: Options.cacheWithLimits({
        GuildBanManager: 0,
        GuildEmojiManager: 0,
        PresenceManager: 0,
        VoiceStateManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        BaseGuildEmojiManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildInviteManager: 0,
        MessageManager: 0,
    }),
});

for (const NPC of [...Object.values(NPCs), ...Object.values(FightableNPCs)]) {
    if (!NPC.avatarURL)
        NPC.avatarURL = `https://cdn.discordapp.com/emojis/${Functions.getEmojiId(NPC.emoji)}.png`;
}
for (const NPC of Object.values(FightableNPCs)) {
    if (process.env.ENABLE_PRESTIGE) {
        if (NPC.level > 800) NPC.level = 800;
    }
    /*if (!Functions.skillPointsIsOK(NPC)) {
        // check if it is not 0 skill point on everything
        if (!Object.values(NPC.skillPoints).every((x) => x === 0)) {
            Functions.generateSkillPoints(NPC);
        } else {
            Functions.generateSkillPoints(NPC);
        }
    }*/
    if (!NPC.rewards) NPC.rewards = {};
    Functions.fixNpcRewards(NPC);
}

process.on("SIGINT", () => {
    client.database.postgresql?.end();
    client.database.redis.quit();
    process.exit(0);
});

process.on("SIGTERM", () => {
    client.database.postgresql?.end();
    client.database.redis.quit();
    process.exit(0);
});

process.on("exit", () => {
    console.log("Exiting...");
    client.database.postgresql?.end();
    client.database.redis.quit();
});

process.on("unhandledRejection", (error: Error) => {
    console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
});

client.cluster = new ClusterClient(client);
client.cluster.on("fightStart", (fight: FightHandler) => {
    client.fightHandlers.set(fight.id, fight);
});
client.cluster.on("fightEnd", (fight: FightHandler) => {
    client.fightHandlers.delete(fight.id);
});

/*
// @ts-expect-error because it's a dynamic property
client.cluster.on(
    "message",
    (message: {
        content: string;
        _type: messageType;
        fightHandlers: boolean;
        fights: Map<string, FightHandler>;
        reply: (message: { content: string; client: Map<string, FightHandler> }) => void;
    }) => {
        if (message.content === "fightTotal") {
            console.log(message.fights);
        }
        if (message._type !== messageType.CUSTOM_REQUEST) return; // Check if the message needs a reply
        if (message.fightHandlers) {
            console.log("replying to client");
            message.reply({ content: "alright", client: client.fightHandlers });
        }
    }
);*/

async function init() {
    client.translations = await i18n();
    const eventsFile = fs
        .readdirSync(path.resolve(__dirname, "events"))
        .filter((file) => file.endsWith(".js"));
    const categories = fs
        .readdirSync(path.resolve(__dirname, "commands"))
        .filter((file) => !file.includes("."));

    for (const eventFile of eventsFile) {
        const event: EventFile = await import(path.resolve(__dirname, "events", eventFile)).then(
            (m) => m.default
        );
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        client.log(`Loaded event ${event.name}`, "event");
    }

    for (const category of categories as SlashCommand["category"][]) {
        client.log(`Loading category ${category}`, "category");
        const commands = fs
            .readdirSync(path.resolve(__dirname, "commands", category))
            .filter((file) => file.endsWith(".js"));
        for (const commandFile of commands) {
            const command: SlashCommandFile = await import(
                path.resolve(__dirname, "commands", category, commandFile)
            ).then((m) => m.default);
            client.commands.set(command.data.name, {
                ...command,
                category,
                path: `./commands/${category}/${commandFile}`,
            });
            client.log(`Loaded command ${command.data.name}`, "command");
        }
    }
    // save standUsersNPCS.json
    delete formattedStandUsers["default"];
    fs.writeFileSync(
        path.resolve(
            __dirname,
            "..",
            "src",
            process.env.ENABLE_PRESTIGE ? "prestigeNPCs.json" : "NPCs.json"
        ),
        JSON.stringify(formattedStandUsers, null, 4)
    );
    client.log("Saved standUsersNPCS.json", "file");
}

init();

client.login(process.env.CLIENT_TOKEN);
