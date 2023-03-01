import type { EventFile, SlashCommandFile, SlashCommand, Special } from "./@types";
import { GatewayIntentBits, Partials, Options, Embed, Utils } from "discord.js";
import { getInfo, ClusterClient } from "discord-hybrid-sharding";
import JolyneClient from "./structures/JolyneClient";
import * as NPCs from "./rpg/NPCs/FightableNPCs";
import * as Functions from "./utils/Functions";
import i18n from "./structures/i18n";
import fs from "fs";
import path from "path";
import * as Items from "./rpg/Items";
import * as Stands from "./rpg/Stands";
import * as Emojis from "./emojis.json";

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

for (const stand of Object.values(Stands.Stands)) {
    const standDisc: Special = {
        id: stand.id + ".disc",
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
                    content: "no",
                });
                return false;
            }
            ctx.userData.stand = stand.id;
            ctx.makeMessage({
                content: "You have successfully equipped " + stand.name + " " + stand.emoji + " !",
            });
            return true;
        },
    };
    // @ts-expect-error because it's a dynamic property
    Items.default[standDisc.id] = standDisc;
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

for (const NPC of Object.values(NPCs)) {
    if (!Functions.skillPointsIsOK(NPC)) {
        Functions.generateSkillPoints(NPC);
        client.log(`NPC ${NPC.name} has unbalanced skill points. New skill points:`, "warn");
        console.log(NPC.skillPoints);
    }
    if (!NPC.rewards) NPC.rewards = {};
    if (NPC.rewards.xp === undefined) {
        // shouldn't do if ! at the beginning because it's an number and if it's 0, it will be false
        NPC.rewards.xp = 50;
        NPC.rewards.coins = 50;
        NPC.rewards.xp += Functions.getMaxXp(NPC.level) / 700;
        NPC.rewards.coins += Functions.getMaxXp(NPC.level) / 5000;

        NPC.rewards.xp += NPC.level * 1.25;
        NPC.rewards.coins += NPC.level * 0.65;

        if (Functions.findStand(NPC.stand)) {
            NPC.rewards.xp += standPrices[Functions.findStand(NPC.stand).rarity] / 115;
            NPC.rewards.coins += standPrices[Functions.findStand(NPC.stand).rarity] / 1000;
        }

        NPC.rewards.xp = Math.round(NPC.rewards.xp);
        NPC.rewards.coins = Math.round(NPC.rewards.coins);

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

process.on("unhandledRejection", (error) => {
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
