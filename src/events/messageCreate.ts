import type { EventFile } from "../@types";
import { inspect } from "util";
import { Events, Message } from "discord.js";
import JolyneClient from "../structures/JolyneClient";

const Event: EventFile = {
    name: Events.MessageCreate,
    async execute(message: Message<true> & { client: JolyneClient }) {
        const ownerIDs = process.env.OWNER_IDS?.split(",") || [];
        const adminIDs = process.env.ADMIN_IDS?.split(",") || [];
        const prefix = "j!";
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        // prettier-ignore
        if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

        if (ownerIDs.includes(message.author.id)) {
            if (commandName === "eval") {
                const content = args.join(" ");
                const client = message.client as JolyneClient;
                const result = new Promise((resolve) => resolve(eval(content)));

                return result
                    .then((output: unknown | string) => {
                        if (typeof output !== `string`) {
                            output = inspect(output, {
                                depth: 0,
                            });
                        }
                        if ((output as string).includes(client.token)) {
                            output = (output as string).replace(
                                new RegExp(client.token, "gi"),
                                `T0K3N`
                            );
                        }
                        try {
                            message.channel.send(`\`\`\`\njs\n${output}\n\`\`\``);
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
                            if (!message.channel.isTextBased()) return;

                            message.channel.send(`\`\`\`\njs\n${err}\n\`\`\``);
                        } catch (e) {
                            console.error(e);
                        }
                    });
            }
        }
    },
};

export default Event;
