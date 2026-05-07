import { Interaction } from "discord.js";
import JolyneClient from "../structures/JolyneClient";

const deprecatedCommandRedirects: Record<string, string> = {
    action: "quests action",
    "adventure language": "settings language",
    "adventure start": "start",
    "campfire leave": "rest leave",
    "campfire rest": "rest start",
    chapter: "story",
    "daily claim": "daily",
    "daily quests": "quests daily",
    "emails archived": "mail archived",
    "emails view": "mail inbox",
    "fight npc": "fight quest",
    infos: "about",
    "inventory claim": "item recover",
    "inventory equip": "equip",
    "inventory info": "item info",
    "inventory sell": "item sell",
    "inventory throw": "item discard",
    "inventory unequip": "unequip",
    "inventory use": "item use",
    "leaderboard daily": "leaderboard streaks",
    "npc-info": "npc info",
    patreon: "premium",
    "settings auto-heal exclude-items": "settings auto-heal exclusions",
    "settings auto-heal sort-by-strongest": "settings auto-heal sort",
    "side quest info": "quests side info",
    "side quest requirements": "quests side info",
    "side quest view": "quests side view",
    "skill points invest": "skills invest",
    "skill points view": "skills view",
    "slots chart": "slots payouts",
    "slots spin": "slots play",
    "stand delete": "stand erase",
    "stand display": "stand view",
    "stand set-evolution": "stand evolve",
    "trade start": "trade request",
    "trade view": "trade status",
};

const getCommandPath = (interaction: Interaction & { client: JolyneClient }): string => {
    if (!interaction.isChatInputCommand()) return "";

    const parts = [interaction.commandName];
    const group = interaction.options.getSubcommandGroup(false);
    if (group) parts.push(group);

    const subcommand = interaction.options.getSubcommand(false);
    if (subcommand) parts.push(subcommand);

    return parts.join(" ");
};

export const getDeprecatedCommandRedirect = (
    interaction: Interaction & { client: JolyneClient },
): string | undefined => deprecatedCommandRedirects[getCommandPath(interaction)];
