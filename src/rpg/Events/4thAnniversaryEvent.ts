import { SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

export const startOf4thAnnivesaryEvent = new Date("2026-03-06");
export const endOf4thAnnivesaryEvent = new Date("2026-03-30");
export const is4thAnnivesaryEvent = (): boolean =>
    new Date() >= startOf4thAnnivesaryEvent && new Date() <= endOf4thAnnivesaryEvent;

export const FourthYearAnniversaryEventSlashCommandData: SlashCommand["data"] = {
    name: "event",
    description: "Check the current forbidden anniversary event.",
    type: 1,
    options: [
        {
            name: "info",
            description: "Get information about the current event.",
            type: 1,
            options: [],
        },
        {
            name: "trade",
            description: "Trade your Lucky Clovers for items.",
            type: 1,
            options: [],
        },
    ],
};
// How about Mista is trying to celebrate the anniversary, but he ends up having 4 tasks he needs to do to prepare for it. Since the number 4 is bad luck he decides to offload the work to the player and promises to compensate them for it.
// 1 they have to clear the town because there are some bandits causing trouble (defeat monsters in the town area)
// 2 they have to buy food supplies for the celebration (use the shop command to buy food items) and give them to Mista (/action command quest)
// 3 they have to send invitations (/action command quest again)
// 4 complete 3+1 quiz questions about the game (/event quiz)
export const FourthYearAnniversaryEventMessage = (ctx: CommandInteractionContext): string => {
    // Mista écrit ce message, il censure le chiffre "4" ou l'évite.
    return `\`\`\`
OI! LISTEN UP! This is Guido Mista!
We are celebrating the... uh... "3rd + 1" Anniversary of the game!
DO NOT SAY THE NUMBER THAT COMES AFTER 3! IT'S BAD LUCK!

I need your help to prepare for the event! There are 3 + 1 tasks that need to be done:
1. Clear the town of bandits causing trouble. Go defeat monsters in the town area!
2. Buy food supplies for the celebration using the shop command, and give them to me using the /action command!
3. Send out invitations using the /action command again!
+1. Complete a quiz about the game using the /event quiz command!

Complete these tasks to earn **Lucky Clovers** 🍀, which you can trade me for rewards!

- - You can drop **Lucky Revolver** 🔫 (Critical Rate +${4}%)
- - Use the ${ctx.client.getSlashCommandMention("event trade")} command to exchange your Clovers.
\n
-# - You can only have **x${3 + 1}** copies of the Lucky Revolver 🔫
-# - The event ends ${Functions.generateDiscordTimestamp(
        endOf4thAnnivesaryEvent,
        "FROM_NOW",
    )} (If we survive...)`;
};
