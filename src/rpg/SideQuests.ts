import { SideQuest, QuestArray, Quests, RequirementStatus } from "../@types";
import * as Functions from "../utils/Functions";
import { NPCs } from "./NPCs";
import * as FightableNPCs from "./NPCs/FightableNPCs";
import * as Raids from "./Raids";
import Emojis from "../emojis.json";
import { endOf2024HalloweenEvent, is2024HalloweenEvent } from "./Events/2024HalloweenEvent";
import { endOf2024ChristmasEvent, startOf2024ChristmasEvent } from "./Events/2024ChristmasEvent";
import {
    endOf2025WinterEvent,
    Winter2025EventMessage,
    startOf2025WinterEvent,
} from "./Events/2025WinterEvent";
import { endOf2025ChineseNewYear, startOf2025ChineseNewYear } from "./Events/2025ChineseNewYear";
import { endOf3rdAnnivesaryEvent } from "./Events/3rdYearAnniversaryEvent";

const RequiemArrowEvolveQuests: QuestArray = [
    Functions.generateUseXCommandQuest("assault", 50),
    Functions.generateUseXCommandQuest("loot", 50),
    Functions.generateUseXCommandQuest("raid", 10),
    Functions.generateClaimXQuest("daily", 3),
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
    /*requirements: (ctx) => {
        if (
            ctx.userData.stand === Functions.findStand("gold_experience").id ||
            ctx.userData.stand === Functions.findStand("silver_chariot").id
        ) {
            if (ctx.userData.level >= 50 && ctx.userData.skillPoints.perception >= 25) {
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
    requirementsMessage: (ctx) =>
        "- You need to have **Gold Experience** or **Silver Chariot** to do this quest\n- If you have more than 2 **Requiem Arrows** in your inventory and you're not a [patreon member](https://patreon.com/mizuki54), you won't be able to redo this quest\n- You need to be level **50**\n- You need to have spent **25 perception** skill points (SKILL POINTS BONUS FROM STANDS AND ITEMS DON'T COUNT)\n- Do not use a **skill points reset potion**! This quest will cancel automatically if you don't meet the requirements anymore, so be careful.",*/
    requirements: (ctx) => {
        const statuses: RequirementStatus[] = [];
        statuses.push({
            requirement:
                "You need to have **Gold Experience** or **Silver Chariot** to do this quest",
            status:
                ctx.userData.stand === Functions.findStand("gold_experience").id ||
                ctx.userData.stand === Functions.findStand("silver_chariot").id,
        });

        statuses.push({
            requirement: "You need to be level **50** or over presige 0",
            status: ctx.userData.level >= 50 || !!ctx.userData.prestige,
        });

        statuses.push({
            requirement: "You need to have spent **25 perception** skill points",
            status: ctx.userData.skillPoints.perception >= 25,
        });

        statuses.push({
            requirement:
                "If you have more than 2 **Requiem Arrows** in your inventory and you're not a [patreon member](https://patreon.com/mizuki54), you won't be able to redo this quest",
            status: !(
                Object.keys(ctx.userData.inventory).find(
                    (x) => x === "requiem_arrow" && ctx.userData.inventory[x] >= 2
                ) && !ctx.client.patreons.find((x) => x.id === ctx.userData.id)
            ),
        });

        return statuses;
    },
    canRedoSideQuest: true,
    // brown
    color: 0x8b4513,
};

export const Beginner: SideQuest = {
    id: "Beginner",
    title: "Beginner",
    description:
        "Welcome to the game! This is a beginner quest, to help you get started. Remember, if you have any questions, you can always ask them in the support server.\n```\n--> https://discord.gg/jolyne-support-923608916540145694\n```By completing this side quest, you will get x1 Stand Arrow and x1 Money Box. Good luck!",
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
    /*requirements: (ctx) => {
        if (ctx.userData.level < 10) return true;
        return false;
    },
    requirementsMessage: (ctx) => "- You must be not over level 10",*/
    requirements: (ctx) => {
        return [
            {
                requirement: "You must be not over level **10**",
                status: ctx.userData.level <= 10,
            },
            {
                requirement: "You must be prestige **0**",
                status: !ctx.userData.prestige,
            },
        ];
    },
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
    /*requirements: (ctx) => {
        if (Date.now() > 1700348400000) return false; // Fri Dec 01 2023 22:59:59 GMT+0000
        return true;
    },*/
    cancelQuestIfRequirementsNotMetAnymore: true,
    /*requirementsMessage: (ctx) =>
        `- This event will end ${Functions.generateDiscordTimestamp(
            1700348400000,
            "FROM_NOW"
        )} (${Functions.generateDiscordTimestamp(1700348400000, "FULL_DATE")})`,*/
    requirements: (ctx) => {
        return [
            {
                requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                    1700348400000,
                    "FULL_DATE"
                )}`,
                status: Date.now() < 1700348400000,
            },
        ];
    },
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
    emoji: Emojis.yoshikageKira,
    rewards: async (ctx) => {
        ctx.userData.standsEvolved.killer_queen = 1;
        ctx.followUp({
            content: "https://media.tenor.com/SN4FuZh3F4gAAAAd/killer-queen-bites-the-dust.gif",
        });
        return true;
    },
    /*requirementsMessage: (ctx) =>
        "- You need to have **Killer Queen** to do this quest and be level **75**",*/
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 100),
            Functions.generateClaimXQuest("daily", 4),
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
    /*requirements: (ctx) => {
        if (ctx.userData.stand === Functions.findStand("killer_queen").id) {
            if (ctx.userData.level >= 75) {
                return true;
            }
        } else return false;
    },*/
    requirements: (ctx) => {
        const statuses: RequirementStatus[] = [];
        statuses.push({
            requirement: "You need to have **Killer Queen** to do this quest",
            status: ctx.userData.stand === Functions.findStand("killer_queen").id,
        });

        statuses.push({
            requirement: "You need to be level **75** or over presige 0",
            status: ctx.userData.level >= 75 || !!ctx.userData.prestige,
        });

        return statuses;
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
                if (!NPC) continue;
                quests.push(Functions.generateFightQuest(NPC));
            }
        }

        return quests;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    /*
        requirements: (ctx) => {
        if (Date.now() > 1704582000000) return false;
        return true;
    },

    requirementsMessage: (ctx) =>
        `- This event will end ${Functions.generateDiscordTimestamp(
            1704582000000,
            "FROM_NOW"
        )} (${Functions.generateDiscordTimestamp(1704582000000, "FULL_DATE")})`,*/
    requirements: (ctx) => {
        return [
            {
                requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                    1704582000000,
                    "FULL_DATE"
                )}`,
                status: Date.now() < 1704582000000,
            },
        ];
    },
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
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 20),
            Functions.generateClaimXQuest("daily", 2),
            Functions.generataRaidQuest(Raids.BanditBoss.boss),
        ];

        return baseQuests;
    } /*
    requirementsMessage: (ctx) =>
        "- You need to have **Echoes** to do this quest and be level **10**",
    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["echoes"] !== undefined) return false;

        if (ctx.userData.stand === Functions.findStand("echoes").id) {
            if (ctx.userData.level >= 10) {
                if (ctx.userData.standsEvolved["echoes"] === undefined) {
                    return true;
                }
            }
        }
    },*/,
    requirements: (ctx) => {
        const statuses: RequirementStatus[] = [];
        statuses.push({
            requirement: "You need to have **Echoes** to do this quest",
            status: ctx.userData.stand === Functions.findStand("echoes").id,
        });

        statuses.push({
            requirement: "You need to be level **10** or over presige 0",
            status: ctx.userData.level >= 10 || !!ctx.userData.prestige,
        });

        statuses.push({
            requirement: "You need to have not evolved Echoes yet",
            status: ctx.userData.standsEvolved["echoes"] === undefined,
        });

        return statuses;
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
    /*requirementsMessage: (ctx) =>
        "- You need to have **Echoes Act 2** to do this quest and be level **15**",
    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["echoes"] !== 1) return false;

        if (ctx.userData.stand === Functions.findStand("echoes").id) {
            if (ctx.userData.level >= 15) {
                if (ctx.userData.standsEvolved["echoes"] === 1) {
                    return true;
                }
            }
        }
    },*/
    requirements: (ctx) => {
        const statuses: RequirementStatus[] = [];
        statuses.push({
            requirement: "You need to have **Echoes** to do this quest",
            status: ctx.userData.stand === Functions.findStand("echoes").id,
        });

        statuses.push({
            requirement: "You need to be level **15** or over presige 0",
            status: ctx.userData.level >= 15 || !!ctx.userData.prestige,
        });

        statuses.push({
            requirement: "You need to have evolved Echoes Act 2",
            status: ctx.userData.standsEvolved["echoes"] === 1,
        });

        return statuses;
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
    /*
    requirements: (ctx) => {
        if (
            ctx.userData.inventory[Functions.findItem("second_anniversary_bag").id] > 14 &&
            ctx.userData.inventory[Functions.findItem("confetti_bazooka").id] > 14
        )
            return false;
        return Date.now() < 1707606000000;
    },
    requirementsMessage: (ctx) =>
        `- The Confetti Golem will spawn ${Functions.generateDiscordTimestamp(
            Functions.roundToNext15Minutes(new Date()),
            "FROM_NOW"
        )} at **this exact time** (/raid).\n- This event will end ${Functions.generateDiscordTimestamp(
            1707606000000,
            "FROM_NOW"
        )} (${Functions.generateDiscordTimestamp(1707606000000, "FULL_DATE")})`,*/
    requirements: (ctx) => {
        return [
            {
                requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                    1707606000000,
                    "FULL_DATE"
                )}`,
                status: Date.now() < 1707606000000,
            },
            {
                requirement:
                    "You must not have more than 14 second anniversary bags and confetti bazookas",
                status:
                    ctx.userData.inventory[Functions.findItem("second_anniversary_bag").id] < 15 &&
                    ctx.userData.inventory[Functions.findItem("confetti_bazooka").id] < 15,
            },
        ];
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canReloadQuests: false,
    canRedoSideQuest: true,
    // red
    color: 0xff0000,
};

export const CMoon: SideQuest = {
    id: "CMoon",
    title: "C-Moon",
    description: "You're now worthy of evolving your stand, Whitesnake.",
    emoji: Emojis.cmoon,
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("green_baby"), 1);
        ctx.followUp({
            content: `You've been given a green baby, ${ctx.client.getSlashCommandMention(
                "inventory use"
            )} the item to awaken your stand. However, it's not over ; perhaps there is more potential? (${
                ctx.client.localEmojis.mih
            })`,
        });
        return true;
    },
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateUseXCommandQuest("assault", 36),
            Functions.generataRaidQuest(Raids.Jotaro.boss),
            Functions.generataRaidQuest(Raids.Dio.boss),
            Functions.generataRaidQuest(Raids.Jolyne.boss),
            Functions.generateStartDungeonQuest(5, 10, ["the_elite"]),
        ];
        // get enemies that are +10% of the user's level
        let NPCs = Object.values(FightableNPCs)
            .filter(
                (npc) =>
                    npc.level > ctx.userData.level * 1.05 &&
                    npc.level < ctx.userData.level * 1.2 &&
                    Object.values(npc.equippedItems).find((x) => x == 6) &&
                    (Functions.findStand(npc.stand, npc.standsEvolved[npc.stand])?.rarity === "S" ||
                        Functions.findStand(npc.stand, npc.standsEvolved[npc.stand])?.rarity ===
                            "SS") &&
                    !npc.private
            )
            .sort((a, b) => a.level - b.level);

        if (NPCs.length < 6) {
            NPCs = Object.values(FightableNPCs)
                .filter((npc) => !npc.private && npc.level <= ctx.userData.level)
                .sort((a, b) => b.level - a.level);
        }

        for (let i = 0; i < 6; i++)
            for (let j = 0; j < 6; j++) baseQuests.push(Functions.generateFightQuest(NPCs[i]));

        return baseQuests;
    } /*
    requirementsMessage: (ctx) =>
        "- You need to have **Whitesnake** to do this quest and be level **100**",

    requirements: (ctx) => {
        if (ctx.userData.standsEvolved["whitesnake"]) return false;

        if (ctx.userData.stand === "whitesnake") {
            if (ctx.userData.level >= 100) {
                return true;
            }
        }
    },*/,
    requirements: (ctx) => {
        const statuses: RequirementStatus[] = [];
        statuses.push({
            requirement: "You need to have **Whitesnake** to do this quest",
            status: ctx.userData.stand === "whitesnake",
        });

        statuses.push({
            requirement: "You need to be level **100** or over presige 0",
            status: ctx.userData.level >= 100 || !!ctx.userData.prestige,
        });

        return statuses;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canRedoSideQuest: false,
    // purple
    color: 0x800080,
};

/*
side quest story:
yeah i was thinking since we are anyways next to the whole haunted city arc
we can go for something like that
all of the enemies you have defeated until now coming back on halloween
wanting revenge
and you have to defeat them again
we can blame justice for all of it if we want it to be cannon (jjba reference)
*/
export const Halloween2024EventSideQuest: SideQuest = {
    description:
        "The enemies you have defeated until now are coming back on Halloween, wanting revenge. Blame Justice (Enya Geil) for all of it!\n\nAll of the enemies have 15% chance to drop a 🎃 Pumpkin.\nFinishing this side quest will give you 10x 🎃 Pumpkins.",
    title: "Halloween 2024 Event (Haunted City Arc)",
    id: "HalloweenEvent2024",
    emoji: "🎃",
    canRedoSideQuest: true,
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("pumpkin"), 10);
        ctx.followUp({
            content: `You have been given 10 pumpkins. You can trade them by using the ${ctx.client.getSlashCommandMention(
                "event trade"
            )} command.`,
        });
        return true;
    },
    quests: (ctx) => {
        const quests: QuestArray = [Functions.generateClaimItemQuest("pumpkin", 5)];
        const MAX_NPCS = 15;
        if (ctx.userData.level < 700) {
            for (let i = 0; i < ctx.userData.level / 400; i++)
                quests.push(
                    Functions.generataRaidQuest(FightableNPCs.PaleDark, null, null, [
                        {
                            item: Functions.findItem("pumpkin").id,
                            chance: 50,
                            amount: 1,
                        },
                    ])
                );
        } else {
            for (let i = 0; i < 1; i++)
                quests.push(
                    Functions.generataRaidQuest(FightableNPCs.PaleDarkElite, null, null, [
                        {
                            item: Functions.findItem("pumpkin").id,
                            chance: 50,
                            amount: 2,
                        },
                    ])
                );
        }

        const EventNPCs = Object.values(FightableNPCs).filter((w) => {
            return w.level <= (ctx.userData.level > 12 ? ctx.userData.level : 12) && !w.private;
        });

        if (EventNPCs.length !== 0) {
            let loop = 0;
            while (quests.length < MAX_NPCS) {
                if (loop > 100) break;
                for (
                    let i = 0;
                    i < (ctx.userData.level < MAX_NPCS ? ctx.userData.level : MAX_NPCS);
                    i++
                ) {
                    quests.push(
                        Functions.generateFightQuest(Functions.randomArray(EventNPCs), null, null, [
                            {
                                item: Functions.findItem("pumpkin").id,
                                chance: 15,
                                amount: 1,
                            },
                        ])
                    );
                }
                loop++;
            }
        }

        return quests;
    },
    requirements: (ctx) => [
        {
            requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                endOf2024HalloweenEvent,
                "FULL_DATE"
            )}`,
            status: is2024HalloweenEvent(),
        },
    ],
    //requirements: is2024HalloweenEvent,
    cancelQuestIfRequirementsNotMetAnymore: true,
    // orange
    color: 0xffa500,
    canReloadQuests: true,
    /*requirementsMessage: () => {
        return `- This event will end ${Functions.generateDiscordTimestamp(
            endOf2024HalloweenEvent,
            "FROM_NOW"
        )} (${Functions.generateDiscordTimestamp(endOf2024HalloweenEvent, "FULL_DATE")})`;
    },*/
};

export const ChristmasEvent2024: SideQuest = {
    id: "ChristmasEvent2024",
    title: "Christmas Event 2024",
    description:
        "Krampus has been abducting children, leaving chaos in his wake! Defeat him to free the children and earn rewards.",
    emoji: FightableNPCs.Krampus.emoji,
    color: 0xd8304a,
    canReloadQuests: true,
    canRedoSideQuest: true,
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("christmas_gift"), 1);
        ctx.followUp({
            content: Functions.makeNPCString(
                NPCs.SantasElf,
                `Thank you! You have been given a Christmas Present. You can open it by using the ${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} command.\n\n-# Re-use the ${ctx.client.getSlashCommandMention(
                    "side quest view"
                )} command to reload the quests & beat Krampus and his goons again to earn more ornaments.`
            ),
        });
        return true;
    },
    quests: (ctx) => {
        const quests: QuestArray = [
            Functions.generateUseXCommandQuest("loot", 5),
            Functions.generateUseXCommandQuest("assault", 5),
        ];
        const NPCs = Functions.shuffle(
            Object.values(FightableNPCs).filter(
                (x) =>
                    x.id !== "Krampus" &&
                    x.id.includes("Goon") &&
                    x.private &&
                    x.level <= Math.max(15, ctx.userData.level)
            )
        )
            .sort((a, b) => b.level - a.level)
            .slice(0, 15);
        // fight npcs
        let tflv = ctx.userData.level / 5;
        if (tflv > 15) tflv = 15;
        if (ctx.userData.level <= 200) tflv *= 2;
        const NPCsQuests = [];

        //for (let i = 0; i < tflv; i++) {
        let noFoundCount = 0;
        while (NPCsQuests.length < tflv) {
            if (noFoundCount > 100) break;
            //if (Functions.percent(80) || i < 5) {
            const NPC = Functions.randomArray(NPCs);
            if (!NPC) {
                noFoundCount++;
                continue;
            }
            NPCsQuests.push(Functions.generateFightQuest(NPC));
            //}
        }
        quests.push(...NPCsQuests);
        if (ctx.userData.level > 200)
            quests.push(Functions.generataRaidQuest(FightableNPCs.Krampus));

        return quests;
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    requirements: (ctx) => [
        {
            /*requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                endOf2024ChristmasEvent,
                "FULL_DATE"
            )}`,
            status: Date.now() < endOf2024ChristmasEvent,*/
            requirement: `Time must be between ${Functions.generateDiscordTimestamp(
                startOf2024ChristmasEvent,
                "FULL_DATE"
            )} and ${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FULL_DATE")}`,
            status:
                Date.now() >= startOf2024ChristmasEvent && Date.now() <= endOf2024ChristmasEvent,
        },
    ],
};

export const WinterEvent2025: SideQuest = {
    id: "WinterEvent2025",
    title: "2025 Winter Event",
    description: `Krampus wasn't done yet. After leaving this world, he spawned some Ice Bandits that took over the city and are causing chaos.\nDefeat them to earn some Ice Shards and summon the Ice Golem using the /raid command.`,
    emoji: "❄️",
    color: 0x00bfff,
    canReloadQuests: true,
    canRedoSideQuest: true,
    rewards: async (ctx) => {
        Functions.addItem(ctx.userData, Functions.findItem("ice_shard"), 50);
        ctx.followUp({
            content: `You have been given 50 Ice Shards. Summon the Ice Golem using the ${ctx.client.getSlashCommandMention(
                "raid"
            )} command.`,
        });
        return true;
    },
    requirements: (ctx) => [
        {
            requirement: `Time must be between ${Functions.generateDiscordTimestamp(
                startOf2025WinterEvent.getTime(),
                "FULL_DATE"
            )} and ${Functions.generateDiscordTimestamp(
                endOf2025WinterEvent.getTime(),
                "FULL_DATE"
            )}`,
            status:
                Date.now() >= startOf2025WinterEvent.getTime() &&
                Date.now() <= endOf2025WinterEvent.getTime(),
        },
    ],
    quests: (ctx) => {
        const quests: QuestArray = [
            Functions.generateUseXCommandQuest("loot", 2),
            Functions.generateUseXCommandQuest("assault", 2),
        ];
        const NPCs = Functions.shuffle(
            Object.values(FightableNPCs).filter(
                (x) =>
                    x.id.toLocaleLowerCase().includes("ice") &&
                    !x.id.toLocaleLowerCase().includes("golem") &&
                    x.private &&
                    x.level <= Math.max(15, ctx.userData.level)
            )
        )
            .sort((a, b) => b.level - a.level)
            .slice(0, 15);
        // fight npcs
        let tflv = ctx.userData.level / 5;
        if (tflv > 15) tflv = 15;
        if (ctx.userData.level <= 200) tflv *= 2;
        const NPCsQuests = [];

        //for (let i = 0; i < tflv; i++) {
        let noFoundCount = 0;
        while (NPCsQuests.length < tflv) {
            if (noFoundCount > 100) break;
            //if (Functions.percent(80) || i < 5) {
            const NPC = Functions.randomArray(NPCs);
            if (!NPC) {
                noFoundCount++;
                continue;
            }
            NPCsQuests.push(Functions.generateFightQuest(NPC));
            //}
        }
        quests.push(...NPCsQuests);
        if (ctx.userData.level > 200)
            quests.push(Functions.generataRaidQuest(FightableNPCs.IceGolem));

        return quests;
    },
};

export const ChineseNewYearEvent2025: SideQuest = {
    id: "ChineseNewYearEvent2025",
    title: "2025 Chinese New Year Event",
    description: `The Chinese New Year is here! The beast Nian has come to the city and is causing chaos.\nDefeat it to earn some Social Credits. `,
    emoji: "🧧",
    color: 0xff0000,
    canRedoSideQuest: true,
    cancelQuestIfRequirementsNotMetAnymore: true,
    rewards: async (ctx) => {
        if (!ctx.userData.social_credits_2025 && ctx.userData.social_credits_2025 !== 0)
            ctx.userData.social_credits_2025 = 1000;

        Functions.addSocialCredits(ctx.userData, 500);
        ctx.followUp({
            content: `${ctx.client.localEmojis.social_credit} | You have been given 500 Social Credits!`,
        });

        return true;
    },
    canReloadQuests: true,
    quests: (ctx) => {
        const baseQuests: QuestArray = [
            Functions.generateAnswerChineseNewYearQuizQuest(5),
            Functions.generateClaimXQuest("social_credit", 500),
            Functions.generateClaimItemQuest("hangbao", 50),
        ];

        const NPCs = Functions.shuffle(
            Object.values(FightableNPCs).filter(
                (x) =>
                    x.id.includes("celestialSnake") &&
                    x.private &&
                    x.level <= Math.max(15, ctx.userData.level)
            )
        )
            .sort((a, b) => b.level - a.level)
            .slice(0, 15);
        // fight npcs
        let tflv = ctx.userData.level / 5;
        if (tflv > 15) tflv = 15;
        if (ctx.userData.level <= 200) tflv *= 2;
        const NPCsQuests = [];

        //for (let i = 0; i < tflv; i++) {
        let noFoundCount = 0;
        while (NPCsQuests.length < tflv) {
            if (noFoundCount > 100) break;
            //if (Functions.percent(80) || i < 5) {
            const NPC = Functions.randomArray(NPCs);
            if (!NPC) {
                noFoundCount++;
                continue;
            }
            NPCsQuests.push(Functions.generateFightQuest(NPC));
            //}
        }
        baseQuests.push(...NPCsQuests);
        if (ctx.userData.level > 200)
            baseQuests.push(Functions.generataRaidQuest(FightableNPCs.BeastNian));

        return baseQuests;
    },
    requirements: (ctx) => [
        {
            requirement: `Time must be between ${Functions.generateDiscordTimestamp(
                startOf2025ChineseNewYear.getTime(),
                "FULL_DATE"
            )} and ${Functions.generateDiscordTimestamp(
                endOf2025ChineseNewYear.getTime(),
                "FULL_DATE"
            )}`,
            status:
                Date.now() >= startOf2025ChineseNewYear.getTime() &&
                Date.now() <= endOf2025ChineseNewYear.getTime(),
        },
    ],
};

export const ThirdYearAnniversaryEvent: SideQuest = {
    id: "ThirdYearAnniversaryEvent",
    title: "Third Year Anniversary Event",
    description:
        "Happy 3rd anniversary! This past year has been amazing and challenging, as the developer has been busy and working solo in real life. Despite that, there have been many updates and new features. Completing this quest will level you up (+2), and you can also obtain the Piñata Hammer & Piñata Hat from the event boss. Good luck, and thank you so much for playing!!!!! ❤️",
    emoji: "🎉",
    rewards: async (ctx) => {
        ctx.userData.level += 2;
        ctx.followUp({
            content: Functions.makeNPCString(
                NPCs.Jolyne,
                `Thank you for playing the game! You're now level **${ctx.userData.level}**. Please reload the quests by using the same command again!`
            ),
        });
        return true;
    },
    quests: (ctx) => [
        Functions.generateStartDungeonQuest(1, 5),
        Functions.generateUseXCommandQuest("loot", 4),
        Functions.generateUseXCommandQuest("assault", 4),
        Functions.generataRaidQuest(FightableNPCs.PinataTitan),
        Functions.generataRaidQuest(FightableNPCs.PinataTitan),
    ],
    requirements: (ctx) => {
        return [
            {
                requirement: `Time must be before ${Functions.generateDiscordTimestamp(
                    endOf3rdAnnivesaryEvent.getTime(),
                    "FULL_DATE"
                )}`,
                status: Date.now() < endOf3rdAnnivesaryEvent.getTime(),
            },
            {
                requirement: "hee hee >:3",
                status: Date.now() < endOf3rdAnnivesaryEvent.getTime(),
            },
        ];
    },
    cancelQuestIfRequirementsNotMetAnymore: true,
    canReloadQuests: false,
    canRedoSideQuest: true,
    // pink
    color: 0xffc0cb,
};
