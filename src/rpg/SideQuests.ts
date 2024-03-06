import { SideQuest, QuestArray, Quests } from "../@types";
import * as Functions from "../utils/Functions";
import { NPCs } from "./NPCs";
import * as FightableNPCs from "./NPCs/FightableNPCs";
import * as Raids from "./Raids";
import Emojis from "../emojis.json";

const RequiemArrowEvolveQuests: QuestArray = [
    Functions.generateUseXCommandQuest("assault", 100),
    Functions.generateUseXCommandQuest("loot", 100),
    Functions.generateUseXCommandQuest("raid", 10),
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
        "- You need to have **Gold Experience** or **Silver Chariot** to do this quest\n- If you have more than 2 **Requiem Arrows** in your inventory and you're not a [patreon member](https://patreon.com/mizuki54), you won't be able to redo this quest\n- You need to be level **50**\n- You need to have spent **25 perception** skill points (SKILL POINTS BONUS FROM STANDS AND ITEMS DON'T COUNT)\n- Do not use a **skill points reset potion**! This quest will cancel automatically if you don't meet the requirements anymore, so be careful.",
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
        if (Date.now() > 1700348400000) return false; // Fri Dec 01 2023 22:59:59 GMT+0000
        return true;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    requirementsMessage: `- This event will end ${Functions.generateDiscordTimestamp(
        1700348400000,
        "FROM_NOW"
    )} (${Functions.generateDiscordTimestamp(1700348400000, "DATE")})`,
    canReloadQuests: true,
    // orange
    color: 0xffa500,
};

// Kiler Queen : Dites the dust side quest
// must be level 75 and have killer queen
// if they complete the side quest: ctx.userData.standsEvolved.killer_queen = 1

export const KillerQueenDitesTheDust: SideQuest = {
    id: "KillerQueenDitesTheDust",
    title: "Killer Queen: Bites The Dust",
    description: "You're now worthy of evolving your stand, Killer Queen.",
    emoji: "<:yoshikageKira:1178425312942502039>",
    rewards: async (ctx) => {
        ctx.userData.standsEvolved.killer_queen = 1;
        ctx.followUp({
            content: "https://media.tenor.com/SN4FuZh3F4gAAAAd/killer-queen-bites-the-dust.gif",
        });
        return true;
    },
    requirementsMessage: "- You need to have **Killer Queen** to do this quest and be level **75**",
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 100),
            Functions.generateClaimXQuest("daily", 7),
            Functions.generataRaidQuest(Raids.YoshikageKira.boss),
            Functions.generataRaidQuest(Raids.YoshikageKira.boss),
        ];

        const kqnpcs = Object.values(FightableNPCs).filter((w) => {
            return (
                w.stand === "killer_queen" &&
                w.level <= (ctx.userData.level > 12 ? ctx.userData.level : 12)
            );
        });

        // pick the 5 strongest npcs: they have to fight the 5 strongest x5 times
        const fiveStrongest = kqnpcs.sort((a, b) => b.level - a.level).slice(0, 5);
        for (let i = 0; i < fiveStrongest.length; i++) {
            for (let j = 0; j < 5; j++) {
                baseQuests.push(Functions.generateFightQuest(fiveStrongest[i]));
            }
        }

        return baseQuests;
    },
    requirements: (ctx) => {
        if (ctx.userData.stand === Functions.findStand("killer_queen").id) {
            if (ctx.userData.level > 75) {
                return true;
            }
        } else return false;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canRedoSideQuest: false,
    // purple
    color: 0x800080,
};

// santa's side quest:
// christmas event 2023

export const ChristmasEvent2023: SideQuest = {
    id: "ChristmasEvent2023",
    title: "Christmas Event 2023",
    description:
        "Completing this quest will give you enough XP to level up, a Christmas Present, 5 corrupted souls and 2 consumable candy canes.\nAlso note that you have currently a 25% XP boost before the end of the event.\n\nMerry Christmas!",
    emoji: "🎁",
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("christmas_gift"), 1);
        Functions.addItem(ctx.userData, Functions.findItem("corrupted_soul"), 5);
        Functions.addItem(ctx.userData, Functions.findItem("candy_cane"), 2);
        ctx.followUp({
            content: Functions.makeNPCString(
                NPCs.SantasElf,
                `You have been given a Christmas Present. You can open it by using the ${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} command.\n\nDon't forget to feed my reindeers! I'll pay you a lot (${ctx.client.getSlashCommandMention(
                    "event feed"
                )})`
            ),
        });
        return true;
    },
    quests: (ctx) => {
        const quests: QuestArray = [
            Functions.generateUseXCommandQuest("loot", 15),
            Functions.generateUseXCommandQuest("assault", 15),
        ];
        const NPCs = Functions.shuffle(
            Object.values(FightableNPCs).filter(
                (npc) => npc.level <= ctx.userData.level && !npc.private
            )
        )
            .slice(0, 15)
            .sort((a, b) => b.level - a.level);

        // fight npcs
        let tflv = ctx.userData.level / 5;
        if (tflv > 15) tflv = 15;

        for (let i = 0; i < tflv; i++) {
            if (Functions.percent(80) || i < 5) {
                const NPC = Functions.randomArray(NPCs);
                quests.push(Functions.generateFightQuest(NPC));
            }
        }

        return quests;
    },
    requirements: (ctx) => {
        if (Date.now() > 1704582000000) return false;
        return true;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    requirementsMessage: `- This event will end ${Functions.generateDiscordTimestamp(
        1704582000000,
        "FROM_NOW"
    )} (${Functions.generateDiscordTimestamp(1704582000000, "DATE")})`,
    canReloadQuests: true,
    canRedoSideQuest: true,
    // red
    color: 0xff0000,
};

// Echoes
export const Echoes2: SideQuest = {
    id: "Echoes_Act2",
    title: "Echoes Act 2",
    description: "You're now worthy of evolving your stand, Echoes",
    emoji: Emojis.echoes_1,
    rewards: async (ctx) => {
        ctx.userData.standsEvolved.echoes = 1;
        ctx.followUp({
            content: "Your stand has been awakened, but perhaps there is more potential?",
        });
        return true;
    },
    requirementsMessage: "- You need to have **Echoes** to do this quest and be level **10**",
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 20),
            Functions.generateClaimXQuest("daily", 2),
            Functions.generataRaidQuest(Raids.BanditBoss.boss),
        ];

        return baseQuests;
    },
    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["echoes"] !== undefined) return false;

        if (ctx.userData.stand === Functions.findStand("echoes").id) {
            if (ctx.userData.level > 10) {
                if (ctx.userData.standsEvolved["echoes"] === undefined) {
                    return true;
                }
            }
        }
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canRedoSideQuest: false,
    // purple
    color: 0x189447,
};

export const Echoes3: SideQuest = {
    id: "Echoes_Act3",
    title: "Echoes Act 3",
    description: "You're now worthy of evolving your stand, Echoes Act 2",
    emoji: Emojis.echoes_2,
    rewards: async (ctx) => {
        ctx.userData.standsEvolved.echoes = 2;
        ctx.followUp({
            content: "Your stand has been awakened, This seems to be your limit.",
        });
        return true;
    },
    requirementsMessage: "- You need to have **Echoes Act 2** to do this quest and be level **15**",
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 30),
            Functions.generateClaimXQuest("daily", 1),
            Functions.generataRaidQuest(Raids.BanditBoss.boss),
            Functions.generataRaidQuest(Raids.BanditBoss.boss),
        ];

        const EchoNpcs = Object.values(FightableNPCs).filter((w) => {
            return (
                w.stand === "echoes" &&
                w.level <= (ctx.userData.level > 10 ? ctx.userData.level : 10)
            );
        });

        // pick the 5 strongest npcs: they have to fight the 5 strongest x5 times
        const fiveStrongest = EchoNpcs.sort((a, b) => b.level - a.level).slice(0, 5);
        for (let i = 0; i < fiveStrongest.length; i++) {
            for (let j = 0; j < 5; j++) {
                baseQuests.push(Functions.generateFightQuest(fiveStrongest[i]));
            }
        }

        return baseQuests;
    },
    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["echoes"] !== 1) return false;

        if (ctx.userData.stand === Functions.findStand("echoes").id) {
            if (ctx.userData.level > 15) {
                if (ctx.userData.standsEvolved["echoes"] === 1) {
                    return true;
                }
            }
        }
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canRedoSideQuest: false,
    // purple
    color: 0x189447,
};

export const TwoYearAnniversaryEvent: SideQuest = {
    id: "TwoYearAnniversaryEvent",
    title: "Two Year Anniversary Event",
    description:
        "Happy 2nd anniversary! Thank you for being there during Jolyne's 2nd year. By completing this quest, you will get a 2nd anniversary bag and level up + 3 levels. Good luck!",
    emoji: "🎉",
    rewards: async (ctx) => {
        ctx.userData.level += 3;
        Functions.addItem(ctx.userData, Functions.findItem("second_anniversary_bag"), 1);
        ctx.followUp({
            content: Functions.makeNPCString(
                NPCs.Jolyne,
                `Thank you for playing the game! We've made you level up + 3 levels and gave you a 2nd anniversary bag. You can equip it by using the ${ctx.client.getSlashCommandMention(
                    "inventory equip"
                )} command.`
            ),
        });
        return true;
    },
    quests: (ctx) => [
        Functions.generataRaidQuest(FightableNPCs.ConfettiGolem),
        Functions.generataRaidQuest(FightableNPCs.ConfettiGolem),
        Functions.generataRaidQuest(FightableNPCs.ConfettiGolem),
        Functions.generataRaidQuest(FightableNPCs.ConfettiGolem),
        Functions.generateClaimItemQuest(Functions.findItem("confetti_bazooka").id, 1),
    ],
    requirements: (ctx) => {
        if (
            ctx.userData.inventory[Functions.findItem("second_anniversary_bag").id] > 14 &&
            ctx.userData.inventory[Functions.findItem("confetti_bazooka").id] > 14
        )
            return false;
        return Date.now() < 1707606000000;
    },
    requirementsMessage: `- The Confetti Golem will spawn ${Functions.generateDiscordTimestamp(
        Functions.roundToNext15Minutes(new Date()),
        "FROM_NOW"
    )} at **this exact time** (/raid).\n- This event will end ${Functions.generateDiscordTimestamp(
        1707606000000,
        "FROM_NOW"
    )} (${Functions.generateDiscordTimestamp(1707606000000, "DATE")})`,
    cancelQuestIfRequirementsNotMetAnymore: true,
    canReloadQuests: false,
    canRedoSideQuest: true,
    // red
    color: 0xff0000,
};

export const CMoon: SideQuest = {
    id: "Cmoon",
    title: "Merge with Green Baby",
    description:
        "Distract Jolyne to transend into achiving power.",
    emoji: Emojis.greenbaby,
    rewards: async (ctx) => {
        ctx.userData.level += 2;
        ctx.userData.standsEvolved.whitesnake = 1;
        // take away green baby
        Functions.addItem(ctx.userData, Functions.findItem("green_baby"), -1);
        ctx.followUp({
            content: Functions.makeNPCString(
                NPCs.Pucci,
                `*Spiral Staircase. Rhinoceros Beetle. Ghost Town. Fig Tart. Rhinoceros Beetle. Via Dolorosa. Rhinoceros Beetle. Singularity Point. Giotto. Angel. Hydrangea. Rhinoceros Beetle. Singularity Point. **Secret Emperor**[!](https://media.tenor.com/L_gf6awyrjEAAAAC/pucci-green-baby.gif)*`
            ),
        });
        return true;
    },
    quests: (ctx) => [
        Functions.generateFightQuest(FightableNPCs.Jolyne),
        Functions.generateFightQuest(FightableNPCs.Jolyne),
        Functions.generateFightQuest(FightableNPCs.Jolyne),
        Functions.generateFightQuest(FightableNPCs.Jolyne),
        Functions.generateFightQuest(FightableNPCs.Jolyne),
        Functions.generateFightQuest(
            FightableNPCs.Jolyne,
            Functions.pushQuest(ActionQuests.GrabGreenBaby),
            null,
            null
        ),
        
    ],
    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["whitesnake"] !== undefined) return false;
        if (ctx.userData.stand === Functions.findStand("whitesnake").id) {
          if (ctx.userData.standsEvolved["whitesnake"] === undefined) {
            if (ctx.userData.inventory[Functions.findItem("green_baby").id] >= 1) {
              return true;
            }
          }
        }
    },
    requirementsMessage:"- You need to have ${ctx.client.localEmojis.whitesnake} Whitesnake as your stand.\n- You need to have atleast 1 ${ctx.client.localEmojis.greenbaby} Green Baby in your inventory.\n(Hint: Raid Jolyne for Green Baby)",
    cancelQuestIfRequirementsNotMetAnymore: true,
    canReloadQuests: false,
    canRedoSideQuest: false,
    color: 0x61a954,
};
