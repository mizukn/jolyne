import type { EventFile, SlashCommandFile } from "./@types";
import { GatewayIntentBits, Partials } from "discord.js";
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

	for (const category of categories) {
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
