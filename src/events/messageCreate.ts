import type { EventFile, DJSMessage } from "../@types";
import { inspect } from "util";
import { Events } from "discord.js";

export default {
	name: Events.MessageCreate,
	async execute(message: DJSMessage) {
		const ownerIDs = process.env.OWNER_IDS?.split(",");
		const adminIDs = process.env.ADMIN_IDS?.split(",");
		const prefix = "j!";
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift()?.toLowerCase();
		// prettier-ignore
		if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

		if (ownerIDs.includes(message.author.id)) {
			if (commandName === "eval") {
				const content = args.join(" ");
				const { client } = message;
				const result = new Promise((resolve) => resolve(eval(content)));

				return result
					.then((output: any) => {
						if (typeof output !== `string`) {
							output = inspect(output, {
								depth: 0,
							});
						}
						if (output.includes(client.token)) {
							output = output.replace(new RegExp(client.token, "gi"), `T0K3N`);
						}
						try {
							// eslint-disable-next-line no-useless-escape
							message.channel.send(`\`\`\`\js\n${output}\n\`\`\``);
						} catch (e) {
							console.error(e);
						}
					})
					.catch((err) => {
						console.error(err);
						err = err.toString();
						if (err.includes(client.token)) {
							err = err.replace(new RegExp(client.token, "gi"), `T0K3N`);
						}
						try {
							// eslint-disable-next-line no-useless-escape
							message.channel.send(`\`\`\`\js\n${err}\n\`\`\``);
						} catch (e) {
							console.error(e);
						}
					});
			}
		}
	},
} as EventFile;
