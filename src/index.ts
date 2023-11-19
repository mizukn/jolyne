import type {
    EventFile,
    SlashCommandFile,
    SlashCommand,
    Special,
    Weapon,
    NPC,
    FightableNPC,
} from "./@types";
import { GatewayIntentBits, Partials, Options, Embed, Utils } from "discord.js";
import { getInfo, ClusterClient } from "discord-hybrid-sharding";
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
import * as StandUsersNPCS from "../src/NPCs.json";
import * as EquipableItems from "./rpg/Items/EquipableItems";
import * as Sentry from "@sentry/node";

const weapons = Object.values(EquipableItems).filter(
    (x) => (x as Weapon).abilities !== undefined
) as Weapon[];

const formattedStandUsers = /*balanceLevels(JSON.parse(JSON.stringify(StandUsersNPCS)) as {
    [key: string]: number;
}, 1, 200);*/ JSON.parse(JSON.stringify(StandUsersNPCS)) as { [key: string]: number };

const SpookySkeleton = NPCs.SpookySkeleton;
const SpookyZombie = NPCs.SpookyZombie;

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
});

/*
Sentry.Handlers.requestHandler();
Sentry.Handlers.tracingHandler();
Sentry.Handlers.errorHandler();*/
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
    console.log(`Adding ${stand.name} Stand Disc`);
    const standDisc: Special = {
        id: stand.id + ".$disc$",
        name: stand.name + " Stand Disc",
        description: "A disc that contains the power of " + stand.name,
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
                return false;
            }
            ctx.userData.stand = stand.id;
            ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Pucci,
                    "You have successfully equipped " + stand.name + " " + stand.emoji + " !"
                ),
            });
            return true;
        },
    };
    // @ts-expect-error because it's a dynamic property
    Items.default[standDisc.id] = standDisc;

    // @ts-expect-error because it's a dynamic property
    NPCs[`${stand.name.replace(" ", "")}User`] = {
        id: `${stand.name.replace(" ", "")}_user`,
        name: stand.name + " User",
        emoji: stand.emoji,
    };

    if (!formattedStandUsers[`${stand.name.replace(" ", "")}User`]) {
        if (!formattedStandUsers[`${stand.name.replace(" ", "")}User`]) {
            const minLevel =
                stand.rarity === "C"
                    ? 1
                    : stand.rarity === "B"
                    ? 10
                    : stand.rarity === "A"
                    ? 20
                    : stand.rarity === "S"
                    ? 30
                    : stand.rarity === "SS"
                    ? 40
                    : 30;
            const maxLevel = minLevel * 12;
            formattedStandUsers[`${stand.name.replace(" ", "")}User`] = Functions.randomNumber(
                minLevel,
                maxLevel
            );
        }
    }

    let rewards: FightableNPC["rewards"] = { items: [] };

    for (let i = 0; i < formattedStandUsers[`${stand.name.replace(" ", "")}User`]; i += 10) {
        rewards.items.push({
            item: "stand_arrow",
            amount: 1,
            chance: 5,
        });
    }

    if (stand.rarity === "T") {
        rewards.items.push({
            item: "spooky_soul",
            amount: 1,
            chance: 50,
        });
    }

    if (rewards.items.length === 0) rewards = undefined;
    // @ts-expect-error because it's a dynamic property
    FightableNPCs[`${stand.name.replace(" ", "")}User`] = {
        // @ts-expect-error it exists
        ...NPCs[`${stand.name.replace(" ", "")}User`],
        level: formattedStandUsers[`${stand.name.replace(" ", "")}User`], // Functions.randomNumber(1, 50),
        skillPoints: {
            defense: 1,
            strength: 1,
            speed: 1,
            perception: 1,
            stamina: 0,
        },
        stand: stand.id,
        equippedItems: {},
        standsEvolved: {},
        rewards,
    };

    for (const weapon of weapons) {
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
                stand.rarity === "C"
                    ? 1
                    : stand.rarity === "B"
                    ? 10
                    : stand.rarity === "A"
                    ? 20
                    : stand.rarity === "S"
                    ? 30
                    : stand.rarity === "SS"
                    ? 40
                    : 30;
            if (weapon.abilities) minLevel *= 2;
            const maxLevel = minLevel * 12;
            formattedStandUsers[ID] = Functions.randomNumber(minLevel, maxLevel);
        }
        // @ts-expect-error because it's a dynamic property
        FightableNPCs[ID] = {
            // @ts-expect-error it exists
            ...NPCs[ID],
            level: formattedStandUsers[ID], // Functions.randomNumber(1, 50),
            skillPoints: {
                defense: 1,
                strength: 1,
                speed: 1,
                perception: 1,
                stamina: 0,
            },
            stand: stand.id,
            equippedItems: {
                [weapon.id]: 6,
            },
            standsEvolved: {},
            rewards,
        };
    }
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

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const partials = [];

if (process.env.DEV_MODE) {
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
    client.log(`Checking ${NPC.name} NPC...`, "npc");
    if (!Functions.skillPointsIsOK(NPC)) {
        Functions.generateSkillPoints(NPC);
        client.log(`NPC ${NPC.name} has unbalanced skill points. New skill points:`, "warn");
        console.log(NPC.skillPoints);
    }
    if (!NPC.rewards) NPC.rewards = {};
    if (NPC.rewards.xp === undefined || NPC.rewards.coins === undefined) {
        // shouldn't do if ! at the beginning because it's a number and if it's 0, it will be false
        NPC.rewards.xp = 50;
        NPC.rewards.coins = 50;
        NPC.rewards.xp += Functions.getMaxXp(NPC.level) / 5000;
        NPC.rewards.coins += Functions.getMaxXp(NPC.level) / 5000;

        NPC.rewards.xp += NPC.level * 255;
        NPC.rewards.coins += NPC.level * 0.65;

        if (Functions.findStand(NPC.stand)) {
            NPC.rewards.xp += standPrices[Functions.findStand(NPC.stand).rarity] / 115;
            NPC.rewards.coins += standPrices[Functions.findStand(NPC.stand).rarity] / 1000;
        }

        NPC.rewards.xp = Math.round(NPC.rewards.xp) * 3;
        NPC.rewards.coins = Math.round(NPC.rewards.coins) * 15;
        if (NPC.level < 4) NPC.rewards.xp = 2500;

        if (NPC.level > 5) {
            NPC.rewards.xp = Math.round(NPC.rewards.xp / 2);
        }

        console.log(NPC.rewards);
    }
}

/*
process.on("SIGINT", () => {
    client.database.postgresql.end();
    client.database.redis.quit();
    process.exit(0);
});

process.on("SIGTERM", () => {
    client.database.postgresql.end();
    client.database.redis.quit();
    process.exit(0);
});

process.on("exit", () => {
    console.log("Exiting...");
    client.database.postgresql.end();
    client.database.redis.quit();
});

process.on("unhandledRejection", (error: Error) => {
    console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
});
 */

// @ts-expect-error because the typings are wrong
client.cluster = new ClusterClient(client);

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
        path.resolve(__dirname, "..", "src", "NPCs.json"),
        JSON.stringify(formattedStandUsers, null, 4)
    );
    client.log("Saved standUsersNPCS.json", "file");
}

init();

client.login(process.env.CLIENT_TOKEN);
