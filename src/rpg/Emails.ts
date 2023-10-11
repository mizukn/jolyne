import type { Email } from "../@types";
import * as NPCs from "./NPCs/NPCs";
import * as fNPCs from "./NPCs/FightableNPCs";
import * as ActionQuests from "./Quests/ActionQuests";
import { Quest, FightNPCQuest, NPC } from "../@types";

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
    content: (ctx) => `Hello **{{userName}}**,\n\nThank you for bringing us this hair. This hair is from a criminal named "Dio". You can see what this Dio looks like just below the email (attachments). If you ever see this Dio again (even if it is impossible), please contact us immediately.
    (Picture of DIO)`,
    image: "https://cdn.discordapp.com/attachments/930147452579889152/942118200043245619/Photo_de_Dio.png",
    footer: "Sincery, the SPEEDWAGON FOUNDATION.",
};

export const P1C2_KAKYOINBACK: Email = {
    id: "p1c2:kakyoin_back",
    author: NPCs.Kakyoin,
    subject: "Yoooooo!",
    content: (ctx) => `Yooooooo **{{userName}}** !\n\nWe haven't seen each other for a long time... I'm sorry for what happened, I know you'll find it hard to believe but I was manipulated...\nI wonder how you got your stand... Well, to make it up to you, I'll buy you 10 pizzas and uhhh a weird arrow that I found somewhere.
        
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
    author: NPCs.JolyneTeam,
    subject: "Halloween 2023",
    // the content is saying that the halloween event has started, there are new bosses to raid and npcs. They can give souls & bones and there is an npc that can trade your souls and bones
    content: (ctx) => "The Halloween event has started!\n\n",
    footer: "Good luck!",
};