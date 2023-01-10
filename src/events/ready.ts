import type { EventFile } from "../@types";
import * as Functions from "../utils/Functions";
import { Events, ActivityType, ActivityOptions } from "discord.js";
import * as Stands from "../rpg/Stands/Stands";
import Jolyne from "../structures/JolyneClient";

const Event: EventFile = {
	name: Events.ClientReady,
	once: true,
	execute: async (client: Jolyne): Promise<void> => {
		client.user.setActivity({
			type: ActivityType.Watching,
			name: "bugs...",
		});

		// prettier-ignore
		if (parseInt(process.env.CLUSTER + 1) === parseInt(process.env.CLUSTER_COUNT)) {
			const lastCommands = await client.database.getString(
				`jolyne_${client.user.id}:commands`
			);
			const lastPrivateCommands = await client.database.getString(
				`jolyne_${client.user.id}:private_commands`
			);
			const commandsData = client.commands
				.filter((v) => !(v.ownerOnly || v.adminOnly))
				.map((v) => v.data);
			const privateCommandsData = client.commands
				.filter((v) => v.ownerOnly || v.adminOnly)
				.map((v) => v.data);
			if (JSON.stringify(commandsData) !== lastCommands) {
				await client.postSlashCommands(commandsData);
				await client.database.setString(
					`jolyne_${client.user.id}:commands`,
					JSON.stringify(commandsData)
				);
				client.log("Updated slash commands");
			} else client.log("Slash commands are up to date");

			if (JSON.stringify(privateCommandsData) !== lastPrivateCommands) {
				await client.postSlashCommands(
					privateCommandsData,
					process.env.PRIVATE_GUILD_ID
				);
				await client.database.setString(
					`jolyne_${client.user.id}:private_commands`,
					JSON.stringify(privateCommandsData)
				);
				client.log("Updated private slash commands");
			}
		}

		// end
		client.user.setActivity({
			type: ActivityType.Watching,
			name: "the beginning...",
		});
		setInterval(() => {
			const activies: ActivityOptions[] = [
				{
					type: ActivityType.Watching,
					name: "The World",
				},
				{
					type: ActivityType.Watching,
					name: "The Way To Heaven",
				},
				{
					type: ActivityType.Playing,
					name: Functions.randomArray(Object.values(Stands).map((v) => v.name)),
				},
				{
					type: ActivityType.Watching,
					name: "JoJo's Bizarre Adventure",
				},
			];
			client.user.setActivity(Functions.randomArray(activies));
		}, 1000 * 60 * 5);

		client.log(`Logged in as ${client.user?.tag}`, "ready");
	},
};
export default Event;
