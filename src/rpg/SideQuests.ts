import { SideQuest, QuestArray } from "../@types";
import * as Functions from "../utils/Functions";
import * as FightableNPCs from "./NPCs/FightableNPCs";
import * as Raids from "./Raids";

const RequiemArrowEvolveQuests: QuestArray = [
    Functions.generateUseXCommandQuest("assault", 100),
    Functions.generateUseXCommandQuest("loot", 100),
    Functions.generateUseXCommandQuest("raid", 10),
    Functions.generateUseXCommandQuest("blackjack", 25),
    Functions.generateClaimXQuest("daily", 7),
    Functions.generataRaidQuest(Raids.JeanPierrePolnareffRequiem.boss),
    Functions.generataRaidQuest(Raids.GiornoGiovannaRequiem.boss),
];

for (let i = 0; i < 50; i++) {
    RequiemArrowEvolveQuests.push(Functions.generateFightQuest(Functions.findNPC("bandit_leader")));
}

export const RequiemArrowEvolve: SideQuest = {
    id: "RequiemArrowEvolve",
    title: "Requiem Arrow Quest",
    description:
        "You're now worthy of evolving your stand. Help Polnareff and then he'll give you his Requiem Arrow.",
    emoji: "🏹",
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("requiem_arrow").id, 1);
        ctx.followUp({
            content: Functions.makeNPCString(
                Functions.findNPC("polnareff"),
                `Alright, thank you for your help. Here's your Requiem Arrow as promised. You may use it by using the ${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} command.`
            ),
        });
        return true;
    },
    quests: (ctx) => RequiemArrowEvolveQuests,
    requirements: (ctx) => {
        if (
            ctx.userData.stand === Functions.findStand("gold_experience").id ||
            ctx.userData.stand === Functions.findStand("silver_chariot").id
        ) {
            if (ctx.userData.level > 50 && ctx.userData.skillPoints.perception >= 25) {
                if (
                    Object.keys(ctx.userData.inventory).find(
                        (x) => x === "requiem_arrow" && ctx.userData.inventory[x] >= 2
                    )
                ) {
                    if (ctx.client.patreons.find((x) => x.id === ctx.userData.id)) {
                        return true;
                    } else return false;
                } else return true;
            }
        } else return false;
    },
    requirementsMessage:
        "- You need to have **Gold Experience** or **Silver Chariot** to do this quest\n-If you have more than 2 **Requiem Arrows** in your inventory and you're not a [patreon member](https://patreon.com/mizuki54), you won't be able to redo this quest\n- You need to be level **50**\n- You need to have spent **25 perception** skill points (SKILL POINTS BONUS FROM STANDS AND ITEMS DON'T COUNT)\n- Do not use a **skill points reset potion**! This quest will cancel automatically if you don't meet the requirements anymore, so be careful.",
    canRedoSideQuest: true,
    // brown
    color: 0x8b4513,
};

export const Beginner: SideQuest = {
    id: "Beginner",
    title: "Beginner",
    description:
        "Welcome to the game! This is a beginner quest, to help you get started. Remember, if you have any questions, you can always ask them in the support server.\n```\n--> https://discord.gg/jolyne\n```By completing this side quest, you will get x1 Stand Arrow and x1 Money Box. Good luck!",
    emoji: "⚔️",
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("stand_arrow"));
        Functions.addItem(ctx.userData, Functions.findItem("money_box"));
        ctx.followUp({
            content: `GG! You've completed the beginner quest. You've been given a **Stand Arrow** and a **Money Box**. You can use the **Stand Arrow** by using the ${ctx.client.getSlashCommandMention(
                "inventory use"
            )} command. However if you're still at Chapter 1 Part 1, you won't be able to use that arrow. Note that you can redo this quest anytime, just re-use the ${ctx.client.getSlashCommandMention(
                "side quest view"
            )} command.`,
        });
        return true;
    },
    quests: (ctx) => [
        Functions.generateFightQuest(Functions.findNPC("bandit")),
        Functions.generateFightQuest(Functions.findNPC("bandit")),
        Functions.generateFightQuest(Functions.findNPC("bandit")),
        Functions.generateFightQuest(Functions.findNPC("bandit")),
        Functions.generateFightQuest(Functions.findNPC("bandit")),
        //Functions.generateFightQuest(Functions.findNPC("kakyoin")),
        Functions.generateUseXCommandQuest("loot", 1),
    ],
    requirements: (ctx) => {
        if (ctx.userData.level < 10) return true;
        return false;
    },
    requirementsMessage: "- You must be not over level 10",
    cancelQuestIfRequirementsNotMetAnymore: true,
    // blue
    color: 0x0000ff,
};

export const HalloweenEvent2023: SideQuest = {
    id: "HalloweenEvent2023",
    title: "Halloween Event 2023",
    description:
        "Happy Halloween! Skeletons, zombies and lots more scary creatures have invaded Morioh City. Kill them all for souls!",
    emoji: "🎃",
    canRedoSideQuest: true,
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("soul"), 15);
        ctx.followUp({
            content: `You have been given 15 souls. You can trade them by using the ${ctx.client.getSlashCommandMention(
                "event trade"
            )} command.`,
        });
        return true;
    },
    quests: (ctx) => {
        const quests: QuestArray = [Functions.generateClaimItemQuest("spooky_soul", 5)];

        const EventNPCs = Object.values(FightableNPCs).filter((w) => {
            return (
                w.stand === "skeletal_spectre" &&
                w.private &&
                w.level <= (ctx.userData.level > 12 ? ctx.userData.level : 12)
            );
        });

        if (EventNPCs.length !== 0)
            for (let i = 0; i < (ctx.userData.level < 25 ? ctx.userData.level : 25); i++) {
                quests.push(Functions.generateFightQuest(Functions.randomArray(EventNPCs)));
            }

        return quests;
    },
    requirements: (ctx) => {
        if (Date.now() > 1701385140000) return false; // Fri Dec 01 2023 22:59:59 GMT+0000
        return true;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    requirementsMessage: `- This event will end ${Functions.generateDiscordTimestamp(
        1701385140000,
        "FROM_NOW"
    )} (${Functions.generateDiscordTimestamp(1701385140000, "DATE")})`,
    canReloadQuests: true,
    // orange
    color: 0xffa500,
};
