import type { EventFile } from "./@types";
import { GatewayIntentBits, Partials } from "discord.js";
import { getInfo, ClusterClient } from "discord-hybrid-sharding";
import JolyneClient from "./structures/JolyneClient";
import i18n from "./structures/i18n";
import fs from "fs";
import path from "path";

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const partials = [];

if (process.env.DEV_MODE === "true") {
	intents.push(GatewayIntentBits.MessageContent);
	intents.push(GatewayIntentBits.GuildMessages);
	partials.push(Partials.Message);
}
const client = new JolyneClient({
	shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
	shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
	intents,
	partials,
});

// @ts-expect-error because the typings are wrong
client.cluster = new ClusterClient(client);

async function init() {
	client.translations = await i18n();
	const eventsFile = fs
		.readdirSync(path.resolve(__dirname, "events"))
		.filter((file) => file.endsWith(".js"));

	for (const eventFile of eventsFile) {
		const event: EventFile = await import(
			path.resolve(__dirname, "events", eventFile)
		).then((m) => m.default);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		client.log(`Loaded event ${event.name}`, "event");
	}
}

init();

client.login(process.env.CLIENT_TOKEN);
