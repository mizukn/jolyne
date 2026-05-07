import type { EventFile, SlashCommand, SlashCommandFile } from "../@types";
import fs from "fs";
import path from "path";
import JolyneClient from "../structures/JolyneClient";
import i18n from "../structures/i18n";

const EVENTS_DIR = path.resolve(__dirname, "../events");
const COMMANDS_DIR = path.resolve(__dirname, "../commands");

const loadEvents = async (client: JolyneClient): Promise<void> => {
    const eventsFile = fs.readdirSync(EVENTS_DIR).filter((file) => file.endsWith(".js"));

    for (const eventFile of eventsFile) {
        const event: EventFile = await import(path.resolve(EVENTS_DIR, eventFile)).then(
            (m) => m.default,
        );
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        client.log(`Loaded event ${event.name}`, "event");
    }
};

const loadCommands = async (client: JolyneClient, dir: string): Promise<void> => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.resolve(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await loadCommands(client, fullPath);
        } else if (file.endsWith(".js")) {
            const command: SlashCommandFile = await import(fullPath).then((m) => m.default);
            const category = path.basename(dir) as SlashCommand["category"];

            client.commands.set(command.data.name, {
                ...command,
                category,
                path: `./commands/${path.relative(COMMANDS_DIR, fullPath)}`,
            });
            client.log(`Loaded command ${command.data.name}`, "command");
        }
    }
};

export const loadApplication = async (client: JolyneClient): Promise<void> => {
    client.translations = await i18n();
    await loadEvents(client);
    await loadCommands(client, COMMANDS_DIR);
};
