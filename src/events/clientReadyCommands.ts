import type { SlashCommand, SlashCommandFile } from "../@types";
import type Jolyne from "../structures/JolyneClient";

interface ReadyCommand {
    cooldown: number;
    category: SlashCommand["category"];
    options: SlashCommandFile["data"]["options"];
    name: string;
    description: string;
    hidden?: boolean;
    hiddenCommandNames?: string[];
}

const removeEmoji = (string: string): string =>
    string
        .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
            "",
        )
        .replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "")
        .replace(
            /[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g,
            "",
        )
        .replace(/🪙/gi, "")
        .replace(/🔎/gi, "")
        .replace(/📧/gi, "")
        .replace(/⭐/gi, "")
        .trim();

const flattenTopLevelCommands = (client: Jolyne): (ReadyCommand | ReadyCommand[])[] =>
    client.commands
        .filter((command) => command.category !== "admin")
        .map((command) => {
            if (
                command.data?.options?.length !== 0 &&
                command.data.options instanceof Array &&
                command.data.options
                    .filter((option) => !option.choices)
                    .filter((option) => option.type !== 3)
                    .filter((option) => option.type !== 6)
                    .filter((option) => option.type !== 5)
                    .filter((option) => option.type !== 4).length !== 0
            ) {
                return command.data.options.map((child) => {
                    const name = `${command.data.name} ${child.name}`;
                    return {
                        cooldown: command.cooldown,
                        category: command.category,
                        options: command.data?.options?.filter(
                            (option) => option.name === child.name,
                        )[0]?.options,
                        name,
                        description: removeEmoji(child.description),
                        hidden: command.hidden || command.hiddenCommandNames?.includes(name),
                        hiddenCommandNames: command.hiddenCommandNames,
                    };
                });
            }
            return {
                cooldown: command.cooldown,
                category: command.category,
                options: command.data?.options?.filter(
                    (option) =>
                        option.type === 3 ||
                        option.type === 6 ||
                        option.type === 4 ||
                        option.type === 5,
                ),
                name: command.data.name,
                description: removeEmoji(command.data.description),
                hidden: command.hidden || command.hiddenCommandNames?.includes(command.data.name),
                hiddenCommandNames: command.hiddenCommandNames,
            };
        })
        .map((command) => {
            if (command instanceof Array) {
                return command.map((current) => ({
                    cooldown: current.cooldown,
                    category: current.category,
                    options: current.options,
                    name: current.name,
                    description: current.description,
                    hidden: current.hidden,
                    hiddenCommandNames: current.hiddenCommandNames,
                }));
            }
            return {
                cooldown: command.cooldown,
                category: command.category,
                options: command.options,
                name: command.name,
                description: command.description,
                hidden: command.hidden,
                hiddenCommandNames: command.hiddenCommandNames,
            };
        });

export const buildReadyCommands = (client: Jolyne): ReadyCommand[] => {
    const commandsV2: ReadyCommand[] = [];
    for (const command of flattenTopLevelCommands(client)) {
        if (command instanceof Array) {
            commandsV2.push(...command);
        } else commandsV2.push(command);
    }

    const commandsV3: ReadyCommand[] = [];
    for (const command of commandsV2) {
        if (command.options?.find((option) => option.type === 1)) {
            for (const child of command.options) {
                const name = `${command.name} ${child.name}`;
                commandsV3.push({
                    cooldown: command.cooldown,
                    category: command.category,
                    options: child.options,
                    name,
                    description: command.description,
                    hidden: command.hidden || command.hiddenCommandNames?.includes(name),
                });
            }
        } else commandsV3.push(command);
    }

    return commandsV3;
};
