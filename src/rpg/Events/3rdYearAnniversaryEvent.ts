import { SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

export const startOf3rdAnnivesaryEvent = new Date("2025-03-01");
export const endOf3rdAnnivesaryEvent = new Date("2025-03-10");
export const is3rdAnnivesaryEvent = (): boolean =>
    new Date() >= startOf3rdAnnivesaryEvent && new Date() <= endOf3rdAnnivesaryEvent;
export const is3rdAnnivesaryEventEndingSoon = (): boolean => {
    if (!is3rdAnnivesaryEvent()) return false;

    return endOf3rdAnnivesaryEvent.getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;
};

export const thirdYearAnniversaryEventMessage = (ctx: CommandInteractionContext): string => {
    return `\`\`\`
Happy 3rd anniversary! This past year has been amazing and challenging, as the developer has been busy and working solo in real life. Despite that, there have been many updates and new features. Completing this quest will level you up, and you can also obtain the Piñata Hammer & Piñata Hat from the event boss. Good luck, and thank you so much for playing!!!!! ❤️
\`\`\`

- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`ThirdYearAnniversaryEvent\`] command to check your progression
- Everyone has a **+50% XP Boost**
- The Pinata Titan spawns every :00 :15 :30 :45 ; Pinata Titan will spawn ${Functions.generateDiscordTimestamp(
        Functions.roundToNext15Minutes(new Date()),
        "FROM_NOW"
    )} at **this exact time**
- - You can drop **Pinata Hat** <:pinata_hat:1345192118267936859> (15%)
- - You can drop **Pinata Hammer** <:pinata_hammer:1345192028790849667> (5%)
- - Use the ${ctx.client.getSlashCommandMention(
        "raid"
    )} [\`pinata_titan\`] command to raid the Pinata Titan (Base LVL: 125)`;
};

export const thirdYearAnniversaryEventSlashCommandData: SlashCommand["data"] = {
    name: "event",
    description: "Check the current event.",
    type: 1,
    options: [
        {
            name: "info",
            description: "Get information about the current event.",
            type: 1,
            options: [],
        },
    ],
};

export const thirdYearAnniversaryEventCommand: SlashCommand["execute"] = async (ctx) => {
    if (!is3rdAnnivesaryEvent()) {
        return ctx.makeMessage({
            content: "There is no event currently running.",
        });
    }

    return ctx.makeMessage({
        embeds: [
            {
                title: "🎉 3rd Year Anniversary Event",
                description: thirdYearAnniversaryEventMessage(ctx),
                // pink
                color: 0xffc0cb,
            },
        ],
    });
};
