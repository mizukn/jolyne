import {
    NPC,
    FightNPCQuest,
    FightableNPC,
    Quest,
    MustReadEmailQuest,
    Email,
    ActionQuest,
    Action,
    ClaimXQuest,
    ClaimItemQuest,
    UseXCommandQuest,
    Quests,
    Item,
    Garment,
    RPGUserQuest,
    RPGUserDataJSON,
    SkillPoints,
    Stand,
    RequiemStand,
    EvolutionStand,
} from "../@types";
import * as Stands from "../rpg/Stands/Stands";
import { FightableNPCS, NPCs } from "../rpg/NPCs";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import { Fighter } from "../structures/FightHandler";
export const generateRandomId = (): string => {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const randomArray = (array: any[]): any => {
    return array[Math.floor(Math.random() * array.length)];
};

export const isGarment = (item: Item): item is Garment => {
    return (item as Garment).skill_points !== undefined;
};

export const isBaseQuest = (quest: Quests): quest is Quest => {
    return (quest as Quest).i18n_key !== undefined;
};

export const isFightNPCQuest = (quest: Quests): quest is FightNPCQuest => {
    return (quest as FightNPCQuest).npc !== undefined;
};

export const isMustReadEmailQuest = (quest: Quests): quest is MustReadEmailQuest => {
    return (quest as MustReadEmailQuest).email !== undefined;
};

export const isActionQuest = (quest: Quests): quest is ActionQuest => {
    return (quest as ActionQuest).action !== undefined;
};

export const pushQuest = (quest: Quests): RPGUserQuest => {
    const questData: Quests = {
        ...quest,
    };
    if (isBaseQuest(questData)) {
        delete questData.i18n_key;
    }
    if (
        !isActionQuest(questData) ||
        !isFightNPCQuest(questData) ||
        !isMustReadEmailQuest(questData)
    ) {
        delete (questData as Quest).completed;
    }

    return questData as RPGUserQuest;
};

export const generateFightQuest = (
    npc: NPC,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): FightNPCQuest => {
    const quest: FightNPCQuest = {
        id: generateRandomId(),
        completed: false,
        npc: npc.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateMustReadEmailQuest = (
    email: Email,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): MustReadEmailQuest => {
    const quest: MustReadEmailQuest = {
        id: generateRandomId(),
        completed: false,
        email: email.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateActionQuest = (
    action: Action,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ActionQuest => {
    const quest: ActionQuest = {
        id: generateRandomId(),
        completed: false,
        action: action.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateClaimXQuest = (
    x: ClaimXQuest["x"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ClaimXQuest => {
    const quest: ClaimXQuest = {
        id: generateRandomId(),
        amount: 0,
        x,
        goal,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateClaimItemQuest = (
    item: ClaimItemQuest["item"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ClaimItemQuest => {
    const quest: ClaimItemQuest = {
        id: generateRandomId(),
        amount: 0,
        item,
        goal,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateUseXCommandQuest = (
    command: UseXCommandQuest["command"],
    goal: ClaimXQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): UseXCommandQuest => {
    const quest: UseXCommandQuest = {
        id: generateRandomId(),
        amount: 0,
        command,
        goal,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const findStand = (stand: string): Stand => {
    if (!stand) return null;

    const stands = Object.values(Stands);
    const foundStand = stands.find(
        (standClass) =>
            standClass.id === stand ||
            standClass.name === stand ||
            standClass.name.toLocaleLowerCase() === stand.toLocaleLowerCase()
    );

    return foundStand;
};

export const findNPC = (npc: string): NPC => {
    if (!npc) return null;

    const npcs = Object.values(NPCs);
    const foundNPC = npcs.find(
        (npcClass) =>
            npcClass.id === npc ||
            npcClass.name === npc ||
            npcClass.name.toLocaleLowerCase() === npc.toLocaleLowerCase()
    );

    return foundNPC;
};

export const getSkillPointsBonus = (
    rpgData: RPGUserDataJSON | FightableNPC | Fighter
): SkillPoints => {
    const skillPoints = { ...rpgData.skillPoints };
    const stand = isFighter(rpgData) ? rpgData.stand : findStand(rpgData.stand);
    if (stand) {
        for (const id of Object.keys(stand.skillPoints)) {
            skillPoints[id as keyof typeof skillPoints] +=
                stand.skillPoints[id as keyof typeof stand.skillPoints];
        }
    }
    return skillPoints;
};

export const getBaseHealth = (rpgData: RPGUserDataJSON | FightableNPC): number => {
    return 100 + Math.trunc(rpgData.level / 2);
};

export const getBaseStamina = 60;

export const getMaxHealth = (rpgData: RPGUserDataJSON | FightableNPC): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseHealth = getBaseHealth(rpgData);

    return (
        baseHealth +
        Math.round(
            (skillPoints.defense / 4 + skillPoints.defense) * 10 +
                (((skillPoints.defense / 4 + skillPoints.defense) * 6) / 100) * 100
        )
    );
};

export const getMaxStamina = (rpgData: RPGUserDataJSON | FightableNPC): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseStamina = getBaseStamina;

    return Math.round(baseStamina + skillPoints.stamina * 1.25 + rpgData.level / 3);
};

export const getDodgeScore = (rpgData: RPGUserDataJSON | FightableNPC): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(Math.round(rpgData.level / 4 + skillPoints.perception / 1.1));
};

export const generateDiscordTimestamp = (
    date: Date | number,
    type: "FROM_NOW" | "DATE" | "FULL_DATE"
): string => {
    const fixedDate = typeof date === "number" ? new Date(date) : date;
    return `<t:${(fixedDate.getTime() / 1000).toFixed(0)}:${type
        .replace("FROM_NOW", "R")
        .replace("DATE", "D")
        .replace("FULL_D", "F")}>`;
};

export const localeNumber = (num: number): string => {
    return num.toLocaleString("en-US");
};

export const RNG = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const percent = (percent: number): boolean => {
    return RNG(1, 100) <= percent;
};

export const generateDailyQuests = (level: RPGUserDataJSON["level"]): RPGUserQuest[] => {
    const quests: RPGUserQuest[] = [pushQuest(generateClaimXQuest("daily", 1))];
    if (level > 200) level = 200;
    if (level < 5) level = 5;

    const NPCs = Object.values(FightableNPCS).filter((npc) => npc.level <= level);

    // fight npcs
    for (let i = 0; i < level; i++) {
        if (percent(80) || i < 5) {
            const NPC = randomArray(NPCs);
            quests.push(pushQuest(generateFightQuest(NPC)));
        }
    }

    // use loot
    if (percent(50)) {
        quests.push(pushQuest(generateUseXCommandQuest("loot", RNG(1, 5))));
    }
    // use assault
    if (percent(50)) {
        quests.push(pushQuest(generateUseXCommandQuest("assault", RNG(1, 5))));
    }

    return quests;
};

export const isRPGUserDataJSON = (
    data: RPGUserDataJSON | FightableNPC
): data is RPGUserDataJSON => {
    return (data as RPGUserDataJSON).adventureStartedAt !== undefined;
};

export const actionRow = (
    components: (ButtonBuilder | StringSelectMenuBuilder)[]
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> =>
    new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>().addComponents(...components);

export const isFighter = (data: Fighter | RPGUserDataJSON | FightableNPC): data is Fighter => {
    return (data as Fighter).isDefending !== undefined;
};

export const getAttackDamages = (user: Fighter | RPGUserDataJSON | FightableNPC): number => {
    const skillPoints = getSkillPointsBonus(user);
    const baseDamage = 5;

    return Math.round(
        baseDamage +
            Math.round(
                skillPoints.strength * 0.675 + (user.level * 1.5 + (baseDamage / 100) * 15) / 2
            )
    );
};

export const getDiffPercent = (a: number, b: number): number => {
    return Math.abs((a - b) / ((a + b) / 2)) * 100;
};
