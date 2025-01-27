import type { Email } from "../@types";
import * as NPCs from "./NPCs/NPCs";
import * as fNPCs from "./NPCs/FightableNPCs";
import * as ActionQuests from "./Quests/ActionQuests";
import { Quest, FightNPCQuest, NPC } from "../@types";
import Items from "./Items";
import { halloween2024EventMessage } from "./Events/2024HalloweenEvent";
import { Chritmas2024eventMessage } from "./Events/2024ChristmasEvent";

/**
 * CIRCULAR DEPENDENCIES FIX
 */
const generateRandomId = (): string => {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
};

const generateFightQuest = (
    npc: NPC,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
    pushItemWhenCompleted?: Quest["pushItemWhenCompleted"]
): FightNPCQuest => {
    const quest: FightNPCQuest = {
        type: "fight",
        id: generateRandomId(),
        completed: false,
        npc: npc.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
        pushItemWhenCompleted,
    };

    return quest;
};

export const P1C1_GP: Email = {
    id: "p1c2:gp",
    author: NPCs.Joshua_Joengo,
    subject: "My grandson...",
    content: (ctx) =>
        "I hope you are doing well! We haven't seen each other for 2 years now. I hope that since you entered high school you have not had any problems and that you are doing well. If you have any problems, don't hesitate to see me! (especially for problems in fighting, don't forget how strong I am). Oh and, look at your balance, I made you a surprise! Good luck with your studies!\n\nTake care!",
    rewards: {
        coins: 1500,
    },
};

export const P1C2_HAIR: Email = {
    id: "p1c2:speedwagon_diohair",
    author: NPCs.SPEEDWAGON_FOUNDATION,
    subject: "Analysis completed.",
    content: (
        ctx
    ) => `Hello **{{userName}}**,\n\nThank you for bringing us this hair. This hair is from a criminal named "Dio". You can see what this Dio looks like just below the email (attachments). If you ever see this Dio again (even if it is impossible), please contact us immediately.
    (Picture of DIO)`,
    image: "https://cdn.discordapp.com/attachments/930147452579889152/942118200043245619/Photo_de_Dio.png",
    footer: "Sincery, the SPEEDWAGON FOUNDATION.",
};

export const P1C2_KAKYOINBACK: Email = {
    id: "p1c2:kakyoin_back",
    author: NPCs.Kakyoin,
    subject: "Yoooooo!",
    content: (
        ctx
    ) => `Yooooooo **{{userName}}** !\n\nWe haven't seen each other for a long time... I'm sorry for what happened, I know you'll find it hard to believe but I was manipulated...\nI wonder how you got your stand... Well, to make it up to you, I'll buy you 10 pizzas and uhhh a weird arrow that I found somewhere.
        
BTW today some **bandits** attacked my sister, but I can't do anything since i'm in the hospital. Please beat their asses for me !1!1!!1`,
    footer: "DONT LOOOOOSE!l1kjghf2c::!!!!!!",
    chapterQuests: [
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
        generateFightQuest(fNPCs.Bandit),
    ],
    rewards: {
        coins: 1000,
        items: [
            {
                item: "pizza",
                amount: 10,
            },
            {
                item: "stand_arrow",
                amount: 1,
            },
        ],
    },
};

export const C2P1_GRANDFADIOALERTSTAND: Email = {
    id: "c2p1:grandfadioalertstand",
    author: NPCs.Harry_Lester,
    subject: "Dio...",
    content: (ctx) =>
        "Damn so Dio isn't dead... Also the abilities you mentioned are called stands. I'll explain it to you later. Come to the airport, I'm already there with Kakyoin.",
    footer: "please hurry up",
    chapterQuests: [ActionQuests.GoToAirport],
};

export const HALLOWEEN_2023: Email = {
    id: "halloween_2023",
    author: NPCs.SPEEDWAGON_FOUNDATION,
    subject: "Halloween 2023 [Event]",
    content: (ctx) =>
        "We have recently been dealing with some strange occurrences. Being the reliable individual we all know you to be, we decided to contact you, {{userName}}\nReports have flooded in, consisting of skeletal creatures wandering the streets at night, and hooded figures armed with a fiery arsenal.\n\nWe wanted to investigate, but these creatures are far too hostile for us to handle. Their purpose here is unknown, and we'd very much like to know.\n\nIf possible, could you investigate for us and unveil this mystery ?",
    footer: "Good luck!",
    emoji: "🎃",
};

export const V3HALLOWEEN_2023: Email = {
    id: "migration-v3_update",
    author: NPCs.JolyneTeam,
    subject: "V3 Update",
    rewards: {
        items: [
            {
                item: "skill_points_reset_potion",
                amount: 5,
            },
            {
                item: "stand_arrow",
                amount: 10,
            },
            {
                item: "spooky_soul",
                amount: 5,
            },
        ],
    },
    content: (ctx) => `
Happy Halloween!

The Halloween event and the long-awaited V3 update are out!

As a reminder, V3 isn't just an update, but a rewrite of the bot from scratch, which is why it took so long. Note also that only one person is working on Jolyne (**@mizukn**)

Anyway, all your chapter progressions have been reset because the developer had to rework some chapters. There's no disadvantage to this, because by completing chapters again, you gain more xp. 

Almost all the stands have been reworked, the mechanics of the game have changed; in fact, everything has changed so much that noting all the changes would take pages and pages.

Also note that these items/stand have been removed from the RPG:
- Spice Girl
- Spice Girl::Stand Disc
- Scary Monsters
- Scary Monsters::Stand Disc

If by chance you owned these items before the update, don't worry, each lost item has been rewarded with **x5 Rare Stand Arrow**.

Regarding the Halloween event, use the ${ctx.client.getSlashCommandMention(
        "event info"
    )} command to get information on the current event.


Should you have any questions or suggestions, please contact us on the [support server](https://discord.gg/jolyne-support-923608916540145694) or contact the developer directly: **@mizukn** (mizu@jolyne.moe)

We hope you all enjoy this update. Once again, happy Halloween!`,
};

// TopGG rewards buff email:
// before, it was some coins and xps (a lot) based on their level + 2 stand arrows every 2 votes
// now, they still get the same coins and xps, but they get 2 stand arrows everytime they vote and 2 rare stand arrows every 2 votes
export const TOPGG_REWARDS_BUFF: Email = {
    id: "topgg_rewards_buff",
    author: NPCs.JolyneTeam,
    subject: "TopGG rewards buff",
    rewards: {
        items: [
            {
                item: "stand_arrow",
                amount: 2,
            },
            {
                item: "rare_stand_arrow",
                amount: 2,
            },
        ],
    },
    content: (ctx) => `
Hello!

We've decided to buff the TopGG rewards. Before, you would get some coins and xps (a lot) based on your level + 2 Stand Arrows every 2 votes.
Now, you still get the same coins and xps, but you get 2 Stand Arrows everytime you vote and 2 Rare Stand Arrows every 2 votes.
You can use the ${ctx.client.getSlashCommandMention("vote")} command for more information.
`,
    footer: "Thank you for voting!",
};
const generateDiscordTimestamp = (
    date: Date | number,
    type: "FROM_NOW" | "DATE" | "FULL_DATE"
): string => {
    const fixedDate = new Date(date);
    return `<t:${(fixedDate.getTime() / 1000).toFixed(0)}:${type
        .replace("FROM_NOW", "R")
        .replace("DATE", "D")
        .replace("FULL_D", "F")}>`;
};

export const ChristmasEvent2023: Email = {
    id: "christmas_2023",
    author: NPCs.JolyneTeam,
    subject: "Christmas 2023 [Event]",
    content: (ctx) =>
        `This christmas event is out!\n\n- Don't forget to claim your daily EVERYDAY (${ctx.client.getSlashCommandMention(
            "daily claim"
        )})\n- Everyone has a **+25%** XP boost!\n- You can get **Consumable Candy Canes** and **Corrupted Souls** by completing the christmas side quest: ${ctx.client.getSlashCommandMention(
            "side quest view"
        )}\n- You can feed santa's reindeers (**${
            Items.CandyCane.emoji + " " + Items.CandyCane.name
        }**) by using the ${ctx.client.getSlashCommandMention(
            "event feed"
        )} command.\n- You can craft **Santa's Candy Cane** by using the ${ctx.client.getSlashCommandMention(
            "craft"
        )} command.\n- Once you and your friends have enough **${
            Items.CorruptedSoul.emoji + " " + Items.CorruptedSoul.name
        }**, you can use the ${ctx.client.getSlashCommandMention(
            "event raid"
        )} command to wake the corrupted reindeer and fight him with your friend(s) and Santa + Santa's Elf (you can get a limited stand; **The Chained**)\n\n ${
            ctx.client.localEmojis.timerIcon
        } The event ends ${generateDiscordTimestamp(
            1704582000000,
            "FROM_NOW"
        )} (${generateDiscordTimestamp(
            1704582000000,
            "DATE"
        )})\nFor the corrupted reindeer, you may need some people to help you, so don't hesitate to ask for help on the [support server](https://discord.gg/jolyne-support-923608916540145694)!`,
    footer: "Merry Christmas and have fun!",
    emoji: "🎄",
};

export const SecondAnniversary: Email = {
    id: "second_anniversary",
    author: NPCs.JolyneTeam,
    subject: "2nd Anniversary",
    content: (ctx) =>
        `It's been 2 years since the bot was created.\nInitially, the bot was created to be a fun private bot for a small group of friends, but it has grown to be a bot with over 15k registered players.\nJolyne wouldn't be where it is today without the support of the community, and our patreons.\n\nWe would like to thank everyone who has supported us, and we hope to continue to provide a fun and enjoyable experience for everyone.`,
    footer: "Thank you for being part of the Jolyne community!",
    emoji: "🎉",
    rewards: {
        coins: 100000,
        xp: 500000,
        items: [
            {
                item: "stand_arrow",
                amount: 10,
            },
            {
                item: "rare_stand_arrow",
                amount: 5,
            },
            {
                item: "second_anniversary_bag",
                amount: 1,
            },
        ],
    },
};

/**
 * TopGG rewards buff 2
 * You can now earn up to 1 dungeon key every 2 votes
 */
export const TOPGG_REWARDS_BUFF_2: Email = {
    id: "2topgg_rewards_buff_2",
    author: NPCs.JolyneTeam,

    subject: "TopGG rewards buff (2)",
    rewards: {
        items: [
            {
                item: "stand_arrow",
                amount: 2,
            },
            {
                item: "rare_stand_arrow",
                amount: 2,
            },
            {
                item: "dungeon_key",
                amount: 1,
            },
        ],
    },
    content: (ctx) => `
Hello!

We've decided to buff the TopGG rewards.
You can now earn 1 dungeon key every 2 votes (${ctx.client.getSlashCommandMention("dungeon")}).

You can also use the ${ctx.client.getSlashCommandMention("vote")} command for more information.
`,
    footer: "Thank you!",
};

export const Halloween2024: Email = {
    id: "halloween_2024",
    author: NPCs.JolyneTeam,
    subject: "Halloween 2024 [Event]",
    content: (ctx) => `${halloween2024EventMessage(ctx)}`,
    footer: "Have fun!",
    emoji: "🎃",
    rewards: {
        items: [
            {
                item: "stand_arrow",
                amount: 5,
            },
            {
                item: "xp_box",
                amount: 5,
            },
            {
                item: "pumpkin",
                amount: 5,
            },
        ],
    },
};

export const Christmas2024: Email = {
    id: "christmas_2024",
    author: NPCs.JolyneTeam,
    subject: "Christmas 2024 [Event]",
    content: (ctx) => Chritmas2024eventMessage(ctx),
    footer: `Have fun!`,
    emoji: "🎄",
    rewards: {
        items: [
            {
                item: "ornament",
                amount: 15,
            },
            {
                item: "xp_box",
                amount: 2,
            },
            {
                item: "christmas_gift",
                amount: 1,
            },
        ],
    },
};
