import type { EventFile } from "../@types";
import { Events } from "discord.js";
import Jolyne from "../structures/JolyneClient";

export default {
	name: Events.ClientReady,
	once: true,
	execute(client: Jolyne) {
		client.log(`Logged in as ${client.user?.tag}`, "ready");
	},
} as EventFile;
