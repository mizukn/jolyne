import { Frostblade } from "../rpg/Items/EquipableItems";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "./Functions";

export const startOf2025WinterEvent = new Date("2024-12-31");
export const endOf2025WinterEvent = new Date("2025-01-07");
export const is2025WinterEvent = (): boolean =>
    new Date() >= startOf2025WinterEvent && new Date() <= endOf2025WinterEvent;
export const is2025WinterEventEndingSoon = (): boolean => {
    if (!is2025WinterEvent()) return false;

    return endOf2025WinterEvent.getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;
};

export const Winter2025EventMessage = (ctx: CommandInteractionContext): string => {
    return `\`\`\`
Krampus wasn't done yet. After leaving this world, he spawned some Ice Bandits that took over the city and are causing chaos.
\`\`\`
    
- Defeat them to earn some <:ice_shard:1323363296719536158> **Ice Shards** and summon the **Ice Golem** using the ${ctx.client.getSlashCommandMention(
        "raid"
    )} command (${ctx.client.getSlashCommandMention(
        "side quest view"
    )} \`side_quest: WinterEvent2025\`).
- - The Ice Golem can drop many **Ice Shards** or ${Frostblade.emoji} **Frostblade** (5%).
- - If you can't drop the **Frostblade**, you can ${ctx.client.getSlashCommandMention(
        "craft"
    )} it using **Ice Shards**
- The event ends ${Functions.generateDiscordTimestamp(
        endOf2025WinterEvent,
        "FROM_NOW"
    )} (${Functions.generateDiscordTimestamp(endOf2025WinterEvent, "FULL_DATE")}).


-# Happy New Year!!! 🎉`;
};
