import type { EventFile, SlashCommandFile, SlashCommand } from "./@types";
import { GatewayIntentBits, Partials, Options } from "discord.js";
import { getInfo, ClusterClient } from "discord-hybrid-sharding";
import JolyneClient from "./structures/JolyneClient";
import i18n from "./structures/i18n";
import fs from "fs";
import path from "path";

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
