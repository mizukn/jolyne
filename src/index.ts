import type {
    EventFile,
    SlashCommandFile,
    SlashCommand,
} from "./@types";
import { GatewayIntentBits, Partials, Options } from "discord.js";
import { getInfo, ClusterClient } from "discord-hybrid-sharding";
import JolyneClient from "./structures/JolyneClient";
import * as FightableNPCs from "./rpg/NPCs/FightableNPCs";
import * as Functions from "./utils/Functions";
import i18n from "./structures/i18n";
import fs from "fs";
import path from "path";
import * as NPCs from "./rpg/NPCs/NPCs";
import * as Sentry from "@sentry/node";
import { FightHandler } from "./structures/FightHandler";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { runRegistryValidation } from "./bootstrap/validate";
import { registerSeasonalEventNPCs } from "./services/EventNPCGenerator";
import { registerStandDiscs } from "./rpg/Items/StandDiscFactory";
import { registerStandUserNPCs } from "./rpg/NPCs/StandUserNPCFactory";
import log from "./utils/Logger";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    profilesSampleRate: 1.0,
    integrations: [nodeProfilingIntegration()],
});

registerSeasonalEventNPCs();
registerStandDiscs();
registerStandUserNPCs();

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
    log("Exiting...", "event");
    client.database.postgresql?.end();
    client.database.redis.quit();
});

process.on("unhandledRejection", (error: Error) => {
    log(`Unhandled promise rejection: ${error.stack ?? error.message}`, "error");
});

process.on("uncaughtException", (error) => {
    log(
        `Uncaught exception: ${error instanceof Error ? error.stack ?? error.message : String(error)}`,
        "error",
    );
});

client.cluster = new ClusterClient(client);
client.cluster.on("fightStart", (fight: FightHandler) => {
    client.fightHandlers.set(fight.id, fight);
});
client.cluster.on("fightEnd", (fight: FightHandler) => {
    client.fightHandlers.delete(fight.id);
});

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

    const loadCommands = async (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.resolve(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                await loadCommands(fullPath);
            } else if (file.endsWith(".js")) {
                const command: SlashCommandFile = await import(fullPath).then((m) => m.default);
                const category = path.basename(dir) as SlashCommand["category"];
                
                client.commands.set(command.data.name, {
                    ...command,
                    category,
                    path: `./commands/${path.relative(path.resolve(__dirname, "commands"), fullPath)}`,
                });
                client.log(`Loaded command ${command.data.name}`, "command");
            }
        }
    };

    await loadCommands(path.resolve(__dirname, "commands"));
}

runRegistryValidation();
init();

client.login(process.env.CLIENT_TOKEN);
