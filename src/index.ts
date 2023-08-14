import type {
    EventFile,
    SlashCommandFile,
    SlashCommand,
    Special,
    FightableNPC,
    Item,
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
import * as StandUsersNPCS from "./rpg/standUsersNPCS.json";

import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
});

/*
Sentry.Handlers.requestHandler();
Sentry.Handlers.tracingHandler();
Sentry.Handlers.errorHandler();*/

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
        }
    };
    // @ts-expect-error because it's a dynamic property
    Items.default[standDisc.id] = standDisc;

    // @ts-expect-error because it's a dynamic property
    NPCs[`${stand.name.replace(" ", "")}User`] = {
        id: `${stand.name.replace(" ", "")}_user`,
        name: stand.name + " User",
        emoji: stand.emoji,
    };
    // @ts-expect-error because it's a dynamic property
    FightableNPCs[`${stand.name.replace(" ", "")}User`] = {
        // @ts-expect-error it exists
        ...NPCs[`${stand.name.replace(" ", "")}User`],
        level: Functions.randomNumber(1, 50),
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
    };
}

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
                        content: item.emoji + " | You have already learned this recipe!",
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
                        "!",
                });
            },
        };
        // @ts-expect-error because it's a dynamic property
        Items.default[itemScroll.id] = itemScroll;
    }
}

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
    client.log(`Checking ${NPC.name} NPC...`);
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
        NPC.rewards.xp += Functions.getMaxXp(NPC.level) / 500;
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

        console.log(NPC.rewards);
    }
}

// when process interrupted or exited, close redis connection
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
}

init();

client.login(process.env.CLIENT_TOKEN);
