import {
    NPC,
    FightNPCQuest,
    FightableNPC,
    Quest,
    MustReadEmailQuest,
    Email,
    ActionQuest,
    ClaimXQuest,
    StartDungeonQuest,
    ClaimItemQuest,
    UseXCommandQuest,
    AnswerChineseNewYearQuizQuest,
    Quests,
    Item,
    Garment,
    RPGUserQuest,
    RPGUserDataJSON,
    SkillPoints,
    Stand,
    EvolutionStand,
    Ability,
    RPGUserEmail,
    WaitQuest,
    Consumable,
    Special,
    EquipableItem,
    Weapon,
    equipableItemTypes,
    RaidNPCQuest,
    numOrPerc,
    Rarity,
    LBData,
    defaultUserSettings,
    SideQuest,
    RequirementStatus,
} from "../@types";
import * as Stands from "../rpg/Stands";
import { FightableNPCS, NPCs } from "../rpg/NPCs";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    APIEmbed,
    Utils,
    Message,
    MessageActionRowComponent,
    ChatInputCommandInteraction,
    ActionRow,
} from "discord.js";
import { Fighter, FightInfos } from "../structures/FightHandler";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Items from "../rpg/Items";
import Canvas from "canvas";
import * as BaseQuests from "../rpg/Quests/Quests";
import * as Emails from "../rpg/Emails";
import * as EquipableItems from "../rpg/Items/EquipableItems";
import { Command } from "ioredis";
import * as Emojis from "../emojis.json";
import { get, random } from "lodash";
import Jolyne from "../structures/JolyneClient";
import color from "get-image-colors";
import { is2024HalloweenEvent } from "../rpg/Events/2024HalloweenEvent";
import { level } from "winston";
import e from "express";
import seedrandom from "seedrandom";
import {
    endOf2024ChristmasEvent,
    is2024ChristmasEventActive,
} from "../rpg/Events/2024ChristmasEvent";
import { is2025WinterEvent } from "../rpg/Events/2025WinterEvent";
import { is2025ChineseNewYear } from "../rpg/Events/2025ChineseNewYear";
import { is3rdAnnivesaryEvent } from "../rpg/Events/3rdYearAnniversaryEvent";

export const PrestigeShardReward = 50;

const totalStands = [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => {
        return {
            ...x.evolutions[0],
            id: x.id,
        };
    }),
];

export const generateRandomId = (): string => {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const randomArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

export const isGarment = (item: Item): item is Garment => {
    return (item as Garment).skillPoints !== undefined;
};

export const isAnswerChineseNewYearQuizQuest = (
    quest: RPGUserQuest | Quests
): quest is AnswerChineseNewYearQuizQuest => {
    return quest.type === "answerChineseNewYearQuiz";
};

export const isSpecial = (item: Item): item is Special => {
    return (item as Special)["use"] !== undefined;
};

export const isBaseQuest = (quest: Quests | RPGUserQuest): quest is Quest => {
    return (quest as Quest).type === "baseQuest";
};
//damx
export const isFightNPCQuest = (quest: Quests | RPGUserQuest): quest is FightNPCQuest => {
    return (quest as FightNPCQuest).type === "fight";
};

export const isStartDungeonQuest = (quest: Quests | RPGUserQuest): quest is StartDungeonQuest => {
    return quest.type === "startDungeon";
};

export const isRaidNPCQuest = (quest: Quests | RPGUserQuest): quest is RaidNPCQuest => {
    return (quest as RaidNPCQuest).type === "raid";
};

export const isMustReadEmailQuest = (quest: Quests | RPGUserQuest): quest is MustReadEmailQuest => {
    return (quest as MustReadEmailQuest).type === "mustRead";
};

export const isActionQuest = (quest: Quests | RPGUserQuest): quest is ActionQuest => {
    return (quest as ActionQuest).type === "action";
};

export const isUseXCommandQuest = (quest: Quests | RPGUserQuest): quest is UseXCommandQuest => {
    return (quest as UseXCommandQuest).type === "UseXCommandQuest";
};

export const pushItemWhenCompleted = (
    quest: Quests,
    arr: Quests["pushItemWhenCompleted"]
): Quests => {
    quest.pushItemWhenCompleted = arr;
    return quest;
};

export const pushEmailWhenCompleted = (
    quest: Quests,
    obj: Quests["pushEmailWhenCompleted"]
): Quests => {
    quest.pushEmailWhenCompleted = obj;
    return quest;
};

export const pushQuestWhenCompleted = (
    quest: Quests,
    id: Quests["pushQuestWhenCompleted"]
): Quests => {
    quest.pushQuestWhenCompleted = id;
    return quest;
};

export const findQuest = (query: string): Quest => {
    const quest = Object.values(BaseQuests).find(
        (quest) => quest.id === query || quest.id.toLocaleLowerCase() === query.toLocaleLowerCase()
    );
    if (!quest) return;

    return quest;
};

export const pushQuest = (quest: Quests): RPGUserQuest => {
    const questData: Quests = {
        ...quest,
    };
    if (isBaseQuest(questData)) {
        delete questData.i18n_key;
        delete questData.hintCommand;
    }
    if (
        !isActionQuest(questData) &&
        !isFightNPCQuest(questData) &&
        !isMustReadEmailQuest(questData) &&
        !isStartDungeonQuest(questData)
    ) {
        delete (questData as Quest).completed;
        delete (questData as Quest).emoji;
    }

    if (isActionQuest(questData)) {
        delete questData.use;
        delete questData.emoji;
        questData.completed = false;
    }

    return questData as RPGUserQuest;
};

export const pushEmail = (email: Email): RPGUserEmail => {
    const emailData: RPGUserEmail = {
        id: email.id,
        read: false,
        archived: false,
        date: Date.now(),
    };
    if (email.expiresAt) {
        emailData.expiresAt = email.expiresAt + Date.now();
    }

    return emailData;
};

export const findEmail = (query: string): Email => {
    if (!query) return;
    if (Object.values(Emails).find((email) => email.id === query)) {
        return Object.values(Emails).find((email) => email.id === query);
    }

    const email = Object.values(Emails).find(
        (email) =>
            (email.id || email.subject) === query ||
            (email.id || email.subject) === query ||
            (email.id || email.subject).toLocaleLowerCase() === query.toLocaleLowerCase() ||
            (email.id || email.subject).toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
            query.toLocaleLowerCase().includes((email.id || email.subject).toLocaleLowerCase())
    );

    return email;
};

export const editNPCLevel = (npc: NPC, level: number): NPC | FightableNPC => {
    const newNPC = JSON.parse(JSON.stringify({ ...npc })) as FightableNPC;
    newNPC.level = level;
    generateSkillPoints(newNPC);
    /*newNPC.rewards.xp = 50;
    newNPC.rewards.coins = 50;
    newNPC.rewards.xp += getMaxXp(newNPC .level) / 700;
    newNPC.rewards.coins += getMaxXp(newNPC.level) / 5000;

    newNPC.rewards.xp += newNPC.level * 225;
    newNPC.rewards.coins += newNPC.level * 0.65;

    newNPC.rewards.xp = Math.round(newNPC.rewards.xp) * 3;
    newNPC.rewards.coins = Math.round(newNPC.rewards.coins) * 15;*/

    return newNPC;
};
export const generateFightQuest = (
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

export const generataRaidQuest = (
    boss: NPC,
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"],
    pushItemWhenCompleted?: Quest["pushItemWhenCompleted"]
): RaidNPCQuest => {
    const quest: RaidNPCQuest = {
        type: "raid",
        id: generateRandomId(),
        completed: false,
        boss: boss.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
        pushItemWhenCompleted,
    };

    return quest;
};

export const generateStartDungeonQuest = (
    total: number,
    stage?: number,
    modifiers?: StartDungeonQuest["modifiers"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): StartDungeonQuest => {
    const quest: StartDungeonQuest = {
        type: "startDungeon",
        id: generateRandomId(),
        completed: 0,
        total,
        stage: stage,
        modifiers: modifiers,
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
        type: "mustRead",
        id: generateRandomId(),
        completed: false,
        email: email.id,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateActionQuest = (
    id: ActionQuest["id"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ActionQuest => {
    const quest: ActionQuest = {
        type: "action",
        ...Object.values(ActionQuests).find((actionQuest) => actionQuest.id === id),
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
        type: "claimX",
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
        type: "ClaimXQuest",
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
        type: "UseXCommandQuest",
        id: generateRandomId(),
        amount: 0,
        command,
        goal,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const generateAnswerChineseNewYearQuizQuest = (
    goal: AnswerChineseNewYearQuizQuest["goal"],
    pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
    pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): AnswerChineseNewYearQuizQuest => {
    const quest: AnswerChineseNewYearQuizQuest = {
        type: "answerChineseNewYearQuiz",
        id: generateRandomId(),
        goal,
        amount: 0,
        pushEmailWhenCompleted,
        pushQuestWhenCompleted,
    };

    return quest;
};

export const findStand = (stand: string, evolution?: number): Stand => {
    if (!stand) return null;

    const stands = Object.values({ ...Stands.Stands, ...Stands.EvolutionStands });
    let foundStand = stands.find(
        (standClass) =>
            standClass.id === stand ||
            ((standClass as Stand).name !== undefined && (standClass as Stand).name === stand) ||
            ((standClass as Stand).name !== undefined &&
                (standClass as Stand).name.toLocaleLowerCase() === stand.toLocaleLowerCase())
    );
    if (!foundStand) return null;

    if ((foundStand as EvolutionStand).evolutions) {
        if (!evolution) evolution = 0;
        foundStand = {
            id: foundStand.id,
            name: (foundStand as EvolutionStand).evolutions[evolution].name,
            description: (foundStand as EvolutionStand).evolutions[evolution].description,
            image: (foundStand as EvolutionStand).evolutions[evolution].image,
            color: (foundStand as EvolutionStand).evolutions[evolution].color,
            rarity: (foundStand as EvolutionStand).evolutions[evolution].rarity,
            abilities: (foundStand as EvolutionStand).evolutions[evolution].abilities,
            skillPoints: (foundStand as EvolutionStand).evolutions[evolution].skillPoints,
            customAttack: (foundStand as EvolutionStand).evolutions[evolution].customAttack,
            available: (foundStand as EvolutionStand).evolutions[evolution].available,
            emoji: (foundStand as EvolutionStand).evolutions[evolution].emoji,
        } as Stand;
    }

    return foundStand as Stand;
};

export const findNPC = <T extends NPC | FightableNPC>(npc: string, fightable?: boolean): T => {
    if (!npc) return null;

    const npcs = fightable ? Object.values(FightableNPCS) : Object.values(NPCs);

    if (npcs.find((r) => r.id.toLowerCase() === npc.toLowerCase()))
        return npcs.find((r) => r.id.toLowerCase() === npc.toLowerCase()) as T;

    const foundNPC = npcs.find(
        (npcClass) =>
            npcClass.id === npc ||
            npcClass.name === npc ||
            npcClass.name.toLocaleLowerCase() === npc.toLocaleLowerCase() ||
            npcClass.name.toLocaleLowerCase().includes(npc.toLocaleLowerCase()) ||
            npc.toLocaleLowerCase().includes(npcClass.name.toLocaleLowerCase())
    );

    return foundNPC as T;
};

export const getSkillPointsBonus = (
    rpgData: RPGUserDataJSON | FightableNPC | Fighter
): SkillPoints => {
    const skillPoints = { ...rpgData.skillPoints };
    const stand = isFighter(rpgData)
        ? rpgData.stand
        : isRPGUserDataJSON(rpgData)
        ? getCurrentStand(rpgData)
        : findStand(rpgData.stand, rpgData.standsEvolved[rpgData.stand]);

    if (stand) {
        for (const id of Object.keys(stand.skillPoints)) {
            skillPoints[id as keyof typeof skillPoints] +=
                stand.skillPoints[id as keyof typeof stand.skillPoints];
        }
    }
    for (const itemId of Object.keys(rpgData.equippedItems)) {
        const itemData = findItem<EquipableItem>(itemId);
        if (!itemData) continue;
        if (itemData.effects.skillPoints) {
            for (const skill of Object.keys(itemData.effects.skillPoints)) {
                skillPoints[skill as keyof SkillPoints] +=
                    itemData.effects.skillPoints[skill as keyof SkillPoints];
            }
        }
    }
    return skillPoints;
};

export const getSkillPointsFromPrestige = (prestige: number): number => {
    /*
    from prestige 1 to 4: you get +10 skill points, which means at prestige 4 you will have 40 points to assign

from prestige 4 to 10: +5 

and from 10 to 20: +2

from 20 to infinity: +1*/

    let total = 0;

    while (prestige > 0) {
        if (prestige >= 20) {
            total += 1;
            prestige -= 1;
        } else if (prestige >= 10) {
            total += 2;
            prestige -= 1;
        } else if (prestige >= 4) {
            total += 5;
            prestige -= 1;
        } else if (prestige >= 1) {
            total += 10;
            prestige -= 1;
        }
    }

    /**
     *  better version
     *     if (prestige < 5) return prestige * 10;
    if (prestige < 11) return 40 + (prestige - 4) * 5;
    if (prestige < 21) return 70 + (prestige - 10) * 2;
    return 110 + (prestige - 20);

     */

    return total;
};

export const getBaseHealth = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return 100 + Math.trunc(rpgData.level / 2);
};

export const getBaseStamina = 100;

export const getMaxHealth = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 100;
    if (rpgData.level <= 4 && findNPC(rpgData.id)) return 100;
    return Math.round((getMaxHealthNoItem(rpgData) + calcEquipableItemsBonus(rpgData).health) * 3);
};

export const getMaxHealthNoItem = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseHealth = getBaseHealth(rpgData);

    return baseHealth + Math.round(skillPoints.defense * 11.55);
};

export const getMaxStaminaNoItem = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseStamina = getBaseStamina;

    return Math.round(baseStamina + skillPoints.stamina * 1.98); // + rpgData.level / 300);
};

export const getMaxStamina = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return Math.round(getMaxStaminaNoItem(rpgData) + calcEquipableItemsBonus(rpgData).stamina);
};

export const getDodgeScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    // return Math.round(Math.round(rpgData.level / 5 + skillPoints.perception / 1.1)); OLD
    return Math.round(skillPoints.perception / 1.1);
};

export const getSpeedScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    // return Math.round(Math.round(rpgData.level / 5 + skillPoints.speed / 1.1));
    return Math.round(Math.round(skillPoints.speed / 1.1));
};

export const generateDiscordTimestamp = (
    date: Date | number,
    type: "FROM_NOW" | "DATE" | "FULL_DATE"
): string => {
    const fixedDate = new Date(date);
    return `<t:${(fixedDate.getTime() / 1000).toFixed(0)}:${type
        .replace("FROM_NOW", "R")
        .replace("DATE", "D")
        .replace("FULL_D", "F")}>`;
};

export const localeNumber = (num: number): string => {
    return num?.toLocaleString();
};

export const RNG = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const percent = (percent: number): boolean => {
    const cal = RNG(0, 10000000) / 100000;
    return cal <= percent;
};

export const generateDailyQuests = (level: RPGUserDataJSON["level"]): RPGUserQuest[] => {
    const quests: RPGUserQuest[] = [];
    if (level > 200) level = 200;
    if (level < 9) level = 9;

    const NPCs = shuffle(
        Object.values(FightableNPCS).filter(
            (npc) =>
                getTrueLevel(npc) <= level &&
                !npc.private && // dont show npcs with admin stands
                (npc.stand
                    ? findStand(npc.stand, npc.standsEvolved[npc.stand])
                        ? !findStand(npc.stand, npc.standsEvolved[npc.stand]).adminOnly
                        : true
                    : true)
        )
    )
        .slice(0, 15)
        .sort((a, b) => b.level - a.level);

    // fight npcs
    let tflv = level / 4;
    if (tflv > 20) tflv = 20;
    if (tflv < 5) tflv = 5;

    for (let i = 0; i < tflv; i++) {
        if (percent(80) || i < 5) {
            const NPC = randomArray(NPCs);
            quests.push(pushQuest(generateFightQuest(NPC)));
        }
    }

    // use loot
    if (level > 10)
        if (percent(50)) {
            quests.push(pushQuest(generateUseXCommandQuest("loot", RNG(1, 5))));
        }
    // use assault
    if (level > 10)
        if (percent(50)) {
            quests.push(pushQuest(generateUseXCommandQuest("assault", RNG(1, 5))));
        }

    if (level > 10)
        quests.push(
            pushQuest(generateClaimXQuest("coin", Math.round(getRewards(level).coins * 2.5)))
        );
    /* if (level > 25)
        quests.push(pushQuest(generateClaimXQuest("xp", Math.round(getRewards(level).xp * 2.5)))); */

    return quests;
};

export const isRPGUserDataJSON = (
    data: RPGUserDataJSON | FightableNPC | Fighter
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

    let staminaScaling = 1;

    if (isFighter(user)) {
        const percent = ((user.stamina ?? 1) / user.maxStamina) * 100;

        if (percent <= 1) {
            staminaScaling = 0.5;
        } else if (percent >= 95) {
            staminaScaling = 1.1;
        } else {
            // Use some piecewise function or formula to map percent to staminaScaling
            // For example, you can use a quadratic function:
            // staminaScaling = 0.5 + (percent / 100) ** 2 * 0.6;
            // This quadratic function will smoothly scale between 0.5 and 1.1 as percent goes from 1 to 100.
            staminaScaling = 0.5 + (percent / 100) ** 2 * 0.6;
        }

        console.log(`Stamina scaling: ${staminaScaling} since stamina is ${user.stamina}`);
    }

    /*const damages = Math.round(
        baseDamage +
            Math.round(
                (skillPoints.strength * 0.675 + (user.level / 10 + (baseDamage / 100) * 12.5) / 2) *
                    staminaScaling
            )
    );*/
    const damages = Math.round(
        baseDamage +
            Math.round(
                (skillPoints.strength * 0.675 + ((baseDamage / 100) * 12.5) / 2) * staminaScaling
            )
    );

    return damages;
};

export const getDiffPercent = (a: number, b: number): number => {
    return Math.abs((a - b) / ((a + b) / 2)) * 100;
};

export const getAbilityDamage = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    ability: Ability
): number => {
    if (ability.damage === 0) return 0;

    let dmg = getAttackDamages(user);
    dmg *= 1 + ability.damage / 10;

    return Math.round(dmg);
};

export const standAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenStand?: Stand
): APIEmbed => {
    const stand = chosenStand ? chosenStand : isFighter(user) ? user.stand : findStand(user.stand);
    if (!stand) return { title: "No stand found", description: "No stand found", color: 0xff0000 };
    const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

    const embed: APIEmbed = {
        title: stand.name,
        description:
            stand.description +
            `\n\n**BONUSES:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                stand.skillPoints
            )
                .map(([key, value]) => `• +${value} ${key}`)
                .join("\n")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
        color: stand.color,
        footer: {
            text: `Rarity: ${stand.rarity}`,
        },
        thumbnail: {
            url: stand.image,
        },
        fields: [],
    };

    for (const ability of stand.abilities) {
        const index = stand.abilities.findIndex((w) => w.name === ability.name);
        const isLast = index === stand.abilities.length - 1;

        let content = `\`Damages:\` ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                ? Math.round(
                      getAttackDamages(user) * (1 + ability.trueDamage / 100)
                  ).toLocaleString()
                : "???"
        }\n\`Stamina cost:\` ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        const dodgeScore = ability.dodgeScore ?? ability.trueDodgeScore;
        content += `\n\`Cooldown:\` ${cooldown} turns\n\`Dodge score:\` ${
            dodgeScore ? dodgeScore : dodgeScore
        }\n\n*${ability.description.replace(/{standName}/gi, stand.name)}*\n`;

        if (ability.special || isLast) content += "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
        else content += "▬▬▬▬▬▬▬▬▬";

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline: ability.special || isLast ? false : true,
        });
    }

    const passives = stand.passives ?? [];
    if (passives.length) {
        embed.fields.push({
            name: "Passives",
            value:
                passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n") +
                "\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            inline: false,
        });
    }

    return embed;
};

export const getEmojiId = (emoji: string): string => {
    const match = emoji.match(/(?<=:)\d+(?=>)/);
    if (!match) return emoji;
    return match[0];
};

export const isWeapon = (item: EquipableItem | Item | Weapon): item is Weapon => {
    return (item as Weapon).abilities !== undefined;
};

const totalWeapons = Object.values(EquipableItems).filter((x) => isWeapon(x));

export const weaponAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenWeapon?: string
): APIEmbed => {
    const weapon = chosenWeapon
        ? findItem<Weapon>(chosenWeapon, true)
        : isFighter(user)
        ? user.weapon
        : findItem<Weapon>(
              Object.keys(user.equippedItems).find(
                  (r) => user.equippedItems[r] === equipableItemTypes.WEAPON
              )
          );
    if (!weapon)
        return {
            title: "No weapon found",
            description: "No weapon found",
            color: 0xff0000,
        };

    const totalWeaponSkillPoints = Object.values(weapon.effects.skillPoints).reduce(
        (a, b) => a + b,
        0
    );

    const embed: APIEmbed = {
        title: weapon.name,
        description:
            weapon.description +
            `\n\n**BONUSES:** +${totalWeaponSkillPoints} skill-points:\n${Object.entries(
                weapon.effects.skillPoints
            )
                .map(([key, value]) => `• +${value} ${key}`)
                .join("\n")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
        color: weapon.color,
        footer: {
            text: `Rarity: ${weapon.rarity}`,
        },
        thumbnail: {
            url: `https://cdn.discordapp.com/emojis/${getEmojiId(weapon.emoji)}.png`,
        },
        fields: [],
    };

    for (const ability of weapon.abilities) {
        const index = weapon.abilities.findIndex((w) => w.name === ability.name);
        const isLast = index === weapon.abilities.length - 1;
        let content = `\`Damages:\` ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                ? Math.round(
                      getAttackDamages(user) * (1 + ability.trueDamage / 100)
                  ).toLocaleString()
                : "???"
        }\n\`Stamina cost:\` ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        content += `\n\`Cooldown:\` ${cooldown} turns\n\`Dodge score:\` ${
            ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable"
        }\n\n*${ability.description.replace(/{weaponName}/gi, weapon.name)}*\n`;

        if (ability.special || isLast) content += "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
        else content += "▬▬▬▬▬▬▬▬▬";

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline:
                ability.special || isLast
                    ? false // check if latest
                    : true,
        });
    }

    const passives = weapon.passives ?? [];
    if (passives.length) {
        embed.fields.push({
            name: "Passives",
            value:
                passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n") +
                "\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            inline: false,
        });
    }

    return embed;
};

export const getRawSkillPointsLeft = (user: RPGUserDataJSON | FightableNPC): number => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return (
        getTotalSkillPoints(user) -
        totalSkillPoints +
        (!isRPGUserDataJSON(user) ? 0 : getSkillPointsFromPrestige(user.prestige))
    );
};

export const skillPointsIsOK = (user: RPGUserDataJSON | FightableNPC): boolean => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return totalSkillPoints === getTotalSkillPoints(user);
};

export const generateSkillPoints = (
    user: RPGUserDataJSON | FightableNPC,
    dontReset?: boolean
): void => {
    if (!dontReset)
        user.skillPoints = {
            strength: 0,
            stamina: 0,
            speed: 0,
            defense: 0,
            perception: 0,
        };
    const skillPointsLeft = getRawSkillPointsLeft(user);

    for (let i = 0; i < skillPointsLeft; i++) {
        const skill = randomArray(
            (Object.keys(user.skillPoints) as (keyof SkillPoints)[]).filter((x) =>
                user.skillPoints.stamina >= 100 ? x !== "stamina" : true
            )
        ) as keyof SkillPoints;

        if (skill === "stamina" && user.skillPoints.stamina >= 100) {
            continue; // Skip increasing stamina if it's already 100
        }

        user.skillPoints[skill]++;
    }
};

export const generateSkillPointsByBuild = (
    user: RPGUserDataJSON | FightableNPC,
    sp: {
        strength: number;
        stamina: number;
        speed: number;
        defense: number;
        perception: number;
    }
): void => {
    // sp.properties ARE BY PERCENTAGE!!!
    const sum = Math.trunc(Object.values(sp).reduce((a, b) => a + b, 0));
    if (sum > 100) {
        console.log("Sum of skill points is greater than 100%", sum);
        return generateSkillPoints(user, true);
    }

    const spLeft = Object.keys(sp);
    user.skillPoints = {
        strength: 0,
        stamina: 0,
        speed: 0,
        defense: 0,
        perception: 0,
    };
    const toSpend = getRawSkillPointsLeft(user);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const spx = spLeft.pop();
        if (!spx) break;

        user.skillPoints[spx as keyof SkillPoints] = Math.min(
            Math.round((sp[spx as keyof SkillPoints] / 100) * toSpend),
            getRawSkillPointsLeft(user)
        );
    }

    while (getRawSkillPointsLeft(user) > 0) {
        const skill = randomArray(
            (Object.keys(user.skillPoints) as (keyof SkillPoints)[]).filter((x) =>
                user.skillPoints.stamina >= 100 ? x !== "stamina" : true
            )
        ) as keyof SkillPoints;

        if (skill === "stamina" && user.skillPoints.stamina >= 100) {
            continue; // Skip increasing stamina if it's already 100
        }

        user.skillPoints[skill]++;
    }
};

export const getTotalSkillPoints = (data: number | RPGUserDataJSON | FightableNPC): number => {
    if (typeof data === "number") return data * 4;
    else return data.level * 4;
};

export const getSkillPointsBuild = (data: RPGUserDataJSON | FightableNPC): SkillPoints => {
    const totalSkillPoints = getTotalSkillPoints(data);
    const sp = { ...data.skillPoints };

    for (const key of Object.keys(sp)) {
        sp[key as keyof SkillPoints] = (sp[key as keyof SkillPoints] / totalSkillPoints) * 100;
    }

    return sp;
};

export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const rng = seedrandom(); // or use a custom seed for consistency across runs

export const randomNumber = (min: number, max: number): number => {
    return Math.floor(rng() * (max - min + 1)) + min;
};

export const isClaimItemQuest = (quest: RPGUserQuest): quest is ClaimItemQuest => {
    return (quest as ClaimItemQuest).type === "ClaimXQuest";
};

export const isClaimXQuest = (quest: RPGUserQuest): quest is ClaimXQuest => {
    return (quest as ClaimXQuest).type === "claimX";
};

export const isEquipableItem = (item: Item): item is EquipableItem => {
    const equipables = Object.values(EquipableItems);
    return equipables.some((i) => i.id === item.id);
};

export const findItem = <T extends Item | EquipableItem | Special | Weapon>(
    name: string,
    includePrivate?: boolean
): T => {
    if (!name) return null;
    const totalitems = Object.values(Items.default).filter((x) =>
        includePrivate ? true : !x.private
    );

    // first, check if Items.id.towLowercase() === name.toLowerCase()

    if (totalitems.find((item) => item.id.toLowerCase() === name.toLowerCase()))
        return (
            (totalitems.find((item) => item.id.toLowerCase() === name.toLowerCase()) as T) || null
        );
    return (totalitems.find((item) => item.id.toLocaleLowerCase() === name.toLocaleLowerCase()) ||
        totalitems.find((item) => item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase())) ||
        totalitems.find((item) =>
            item.id.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())
        ) ||
        totalitems.find((item) => item.id.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())) ||
        totalitems.find((item) =>
            item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase().replace(/ /g, ""))
        ) ||
        totalitems.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase().replace(/ /g, ""))
        )) as T;
};

export const romanize = (num: number): string => {
    if (isNaN(num)) return "NaN";
    const digits = String(+num).split("");
    const key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
    ];
    let roman = "";
    let i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
};

export const getMaxXp = function getMaxXP(level: RPGUserDataJSON["level"]): number {
    return (level / 5) * 1000 * 13;
};

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const bufferCache: { [key: string]: Buffer } = {};

export const generateStandCart = async function standCart(stand: Stand): Promise<Buffer> {
    if (bufferCache[stand.name as keyof typeof String])
        return bufferCache[stand.name as keyof typeof bufferCache];

    const canvas = Canvas.createCanvas(230, 345);
    const ctx = canvas.getContext("2d");
    const image = await Canvas.loadImage(stand.image);
    let card_link;
    let color: string;
    switch (stand.rarity) {
        case "S":
            color = "#2b82ab";
            card_link = "https://media.jolyne.moe/tpf4FN/direct";
            break;
        case "A":
            color = "#3b8c4b";
            card_link = "https://media.jolyne.moe/R95qjY/direct";
            break;
        case "B":
            color = "#786d23";
            card_link = "https://media.jolyne.moe/Od4M64/direct";
            break;
        case "C":
            color = "#181818";
            card_link = "https://media.jolyne.moe/ukfhrG/direct";
            break;
        case "T":
            color = "#3131ac";
            card_link = "https://media.jolyne.moe/J0FEBN/direct";
            break;
        default:
            color = "#ff0000";
            card_link = "https://media.jolyne.moe/h2bJqC/direct";
    }

    const card_image = await Canvas.loadImage(card_link);
    const RM = 90;
    ctx.drawImage(image, 40, 50, 230 - RM + 15, 345 - RM + 20);
    ctx.drawImage(card_image, 0, 0, 230, 345);
    ctx.fillStyle = "white";
    const maxWidth = 180; // Set a max width for the text
    const minFontSize = 16; // Set a minimum font size
    const maxFontSize = 30; // Set a maximum font size
    let fontSize = maxFontSize;
    ctx.font = `${fontSize}px Arial`;

    const content = stand.name;
    let textWidth = ctx.measureText(content).width;

    // Decrease font size until text fits the maxWidth
    while (textWidth > maxWidth && fontSize > minFontSize) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
        textWidth = ctx.measureText(content).width;
    }

    // Calculate dynamic positioning
    const xPos = 115 - textWidth / 2; // Center the text horizontally
    const yPos = 42;

    // Render the text
    ctx.fillText(content, xPos, yPos);

    bufferCache[stand.name as keyof typeof bufferCache] = canvas.toBuffer();

    return canvas.toBuffer();
};

export const getRewards = (
    level: number
): {
    coins: number;
    xp: number;
} => {
    const rewards = {
        coins: level * 1000 - (level * 1000 * 25) / 100,
        xp: level * 400 - (level * 400 * 10) / 100,
    };
    if (rewards.coins > 6000) rewards.coins = 6000;

    return rewards;
};

const Christmas2024LimitedItems = ["elf_hat", "santa_hat", "krampus_staff"];
export const addItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number,
    ignoreQuests?: boolean,
    ctx?: CommandInteractionContext
): boolean => {
    if (typeof item === "string") {
        item = findItem(item);
    }
    if (!item) return false;
    if (!item.storable || item.private) return false;
    if (is2024HalloweenEvent() && item.id === "nix.$disc$") {
        const nixDisc = (userData.inventory["nix.$disc$"] || 0) + (amount || 1);
        if (nixDisc > 3) return false;
    }

    if (is3rdAnnivesaryEvent()) {
        if (item.id === "pinata_hat" || item.id === "pinata_hammer") {
            let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
            for (const xitem of Object.keys(userData.equippedItems)) {
                if (xitem === item.id) itemLeft++;
            }
            const max = item.id === "pinata_hat" ? 7 : 3;
            if (itemLeft > max) return false;
        }
    }

    if (is2025WinterEvent() && item.id === "frostblade") {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        if (itemLeft > 3) return false;
    }
    if (Date.now() < endOf2024ChristmasEvent && Christmas2024LimitedItems.includes(item.id)) {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        const max = item.id === "krampus_staff" ? 3 : 5;
        if (itemLeft > max) return false;
    }

    if (is2025ChineseNewYear() && item.id === "snake_jian") {
        let itemLeft = (userData.inventory[item.id] || 0) + (amount || 1);
        for (const xitem of Object.keys(userData.equippedItems)) {
            if (xitem === item.id) itemLeft++;
        }
        if (itemLeft > 3) return false;
    }
    if (item.id.includes("$disc$") && ctx) {
        const totalItems = Object.keys(userData.inventory)
            .map((x) => {
                return {
                    id: x,
                    amount: userData.inventory[x],
                };
            })
            .filter((x) => x.id.includes("$disc$"));
        const totalDiscs = totalItems.reduce((a, b) => a + b.amount, 0) + (amount || 1);
        if (totalDiscs > calcStandDiscLimit(ctx, userData)) return false;
    }
    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] += amount;
    } else {
        userData.inventory[item.id]++;
    }

    if (ignoreQuests) return true;
    for (const quests of [
        userData.daily.quests,
        userData.chapter.quests,
        ...userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter(
            (x) => isClaimItemQuest(x) && x.item === (item as Item).id
        )) {
            (quest as ClaimItemQuest).amount += amount || 1;
        }
    }

    return true;
};

export const removeItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number
): boolean => {
    if (typeof item === "string") {
        item = findItem(item);
    }
    if (!item) return false;
    const amountLeft = userData.inventory[item.id] || 0;
    if (amountLeft < (amount || 1)) return false;

    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] -= amount;
    } else {
        userData.inventory[item.id]--;
    }

    if (userData.inventory[item.id] === 0) delete userData.inventory[item.id];

    return true;
};

export const addCoins = function addCoins(userData: RPGUserDataJSON, amount: number): number {
    userData.coins += Math.round(amount);
    if (amount < 0) return;

    amount = Math.round(amount);
    for (const quests of [
        userData.daily.quests,
        userData.chapter.quests,
        ...userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter((x) => isClaimXQuest(x) && x.x === "coin")) {
            (quest as ClaimXQuest).amount += amount;
        }
    }
    return amount;
};

export const addSocialCredits = function addSocialCredits(
    userData: RPGUserDataJSON,
    amount: number
): number {
    if (!userData.social_credits_2025) {
        if (
            userData.social_credits_2025 !== 0 ||
            typeof userData.social_credits_2025 !== "number"
        ) {
            userData.social_credits_2025 = 1000;
        }
    }
    userData.social_credits_2025 += Math.round(amount);
    if (amount < 0) return;

    amount = Math.round(amount);
    for (const quests of [
        userData.daily.quests,
        userData.chapter.quests,
        ...userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter((x) => isClaimXQuest(x) && x.x === "social_credit")) {
            (quest as ClaimXQuest).amount += amount;
        }
    }
    return amount;
};

export const addXp = function addXp(
    userData: RPGUserDataJSON,
    amount: number,
    client: Jolyne,
    dontAdd?: boolean
): number {
    if (calcEquipableItemsBonus(userData).xpBoost > 0) {
        amount += Math.round((amount * calcEquipableItemsBonus(userData).xpBoost) / 100);
    }
    if (is2024ChristmasEventActive() && isWeekend()) amount = Math.round(amount * 1.25);
    if (is3rdAnnivesaryEvent()) amount = Math.round(amount * 1.15);
    let multiplier = 1;

    const patreonTier = client.patreons.find((v) => v.id === userData.id)?.level;

    if (patreonTier)
        switch (patreonTier) {
            case 4:
                multiplier += 0.1;
                break;
            case 3:
                multiplier += 0.07;
                break;
            case 2:
                multiplier += 0.05;
                break;
            case 1:
                multiplier += 0.04;
                break;
        }

    if (client.boosters.find((x) => x === userData.id)) multiplier += 0.03;

    amount = Math.round(amount);
    if (userIsCommunityBanned(userData)) amount = Math.round(amount / 2);
    if (process.env.ENABLE_PRESTIGE && userData.level >= getMaxPrestigeLevel(userData.prestige)) {
        console.log("Prestige level reached");
        amount = 0;
    }

    if (!dontAdd) {
        userData.xp += amount;
        for (const quests of [
            userData.daily.quests,
            userData.chapter.quests,
            ...userData.sideQuests.map((v) => v.quests),
        ]) {
            for (const quest of quests.filter((x) => isClaimXQuest(x) && x.x === "xp")) {
                (quest as ClaimXQuest).amount += amount;
            }
        }
    }
    return amount;
};

export const addEmail = function addEmail(userData: RPGUserDataJSON, email: string): void {
    const emailData = findEmail(email);
    if (!emailData) return;

    if (userData.emails.find((v) => v.id === emailData.id)) {
        console.log(
            `Attempted to add email ${emailData.id} to user ${userData.id} but it already exists`
        );
        return;
    }
    userData.emails.push(pushEmail(emailData));
};

export const addStandDisc = (
    userData: RPGUserDataJSON,
    stand: Stand | "string",
    amount?: number
): void => {
    if (typeof stand === "string") {
        stand = findStand(stand);
    }
    if (!stand) return;

    const standId = stand.id + ".disc";
    if (!userData.inventory[standId]) userData.inventory[standId] = 0;
    if (amount) {
        userData.inventory[standId] += amount;
    } else {
        userData.inventory[standId]++;
    }
};

export const s = (num: number): string => {
    return num === 1 ? "" : "s";
};

export const isWaitQuest = (quest: Quests | RPGUserQuest): quest is WaitQuest => {
    return (quest as WaitQuest).type === "wait";
};

export const generateWaitQuest = (
    time: number,
    email?: WaitQuest["email"],
    quest?: WaitQuest["quest"],
    i18n_key?: WaitQuest["i18n_key"],
    mustRead?: WaitQuest["mustRead"]
): WaitQuest => {
    const questData: WaitQuest = {
        type: "wait",
        end: Date.now() + time,
        id: generateRandomId(),
        email,
        quest,
        i18n_key,
        mustRead,
    };

    if (!email) delete questData.email;
    if (!quest) delete questData.quest;
    if (!i18n_key) delete questData.i18n_key;

    return questData;
};

export const isConsumable = (item: Item | "string"): item is Consumable => {
    if (typeof item === "string") {
        item = findItem(item);
    }
    if (!item) return false;
    return (item as Consumable)["effects"] !== undefined && !isEquipableItem(item);
};

export const addHealth = function addHealth(userData: RPGUserDataJSON, amount: number): void {
    if (userData.health < 0) userData.health = 0;
    userData.health += amount;
    if (userData.health > getMaxHealth(userData)) userData.health = getMaxHealth(userData);
};

export const addStamina = function addStamina(userData: RPGUserDataJSON, amount: number): void {
    if (userData.stamina < 0) userData.stamina = 0;
    userData.stamina += amount;
    if (userData.stamina > getMaxStamina(userData)) userData.stamina = getMaxStamina(userData);
};

export const calculateArrayValues = (array: number[]): number => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
};

export const standPrices = {
    SS: 200000,
    S: 50000,
    A: 25000,
    B: 10000,
    C: 5000,
    T: 69696,
};

export const makeNPCString = function makeNPCString(
    npc: NPC,
    message?: string,
    emoji?: string
): string {
    return `${emoji ?? npc.emoji} **${npc.name}**: ${message}`;
};

export const userIsCommunityBanned = function userIsCommunityBanned(
    userData: RPGUserDataJSON | LBData
): RPGUserDataJSON["communityBans"][0] {
    if (userData.communityBans?.length === 0 || !userData.communityBans) return;
    const activeCommunityBans = userData.communityBans.filter((v) => v.until > Date.now());
    if (activeCommunityBans.length === 0) return;
    return activeCommunityBans[0];
};

export const calcEquipableItemsBonus = function calcEquipableItemsBonus(
    userData: RPGUserDataJSON | FightableNPC | Fighter
): {
    stamina: number;
    health: number;
    skillPoints: SkillPoints;
    xpBoost: number;
    standDisc: number;
} {
    let stamina = 0;
    let health = 0;
    let xpBoost = 0;
    let standDisc = 0;
    const skillPoints: SkillPoints = {
        strength: 0,
        perception: 0,
        stamina: 0,
        speed: 0,
        defense: 0,
    };

    for (const itemId of Object.keys(userData.equippedItems)) {
        const itemData = findItem<EquipableItem>(itemId);
        if (!itemData) continue;
        if (itemData.effects.standDiscIncrease) standDisc += itemData.effects.standDiscIncrease;
        if (itemData.effects.stamina)
            stamina +=
                typeof itemData.effects.stamina === "number"
                    ? itemData.effects.stamina
                    : getMaxHealthNoItem(userData) * (parseInt(itemData.effects.stamina) / 100);
        if (itemData.effects.health)
            health +=
                typeof itemData.effects.health === "number"
                    ? itemData.effects.health
                    : getMaxHealthNoItem(userData) * (parseInt(itemData.effects.health) / 100);
        if (itemData.effects.skillPoints) {
            for (const skill of Object.keys(itemData.effects.skillPoints)) {
                skillPoints[skill as keyof SkillPoints] +=
                    itemData.effects.skillPoints[skill as keyof SkillPoints];
            }
        }
        if (itemData.effects.xpBoost) {
            xpBoost += itemData.effects.xpBoost;
        }
    }

    return {
        stamina,
        health,
        skillPoints,
        xpBoost,
        standDisc,
    };
};

export const capitalize = function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const fixFields = function fixFields(
    fields: { name: string; value: string; inline?: boolean }[]
): { name: string; value: string; inline?: boolean }[] {
    for (const field of fields) {
        if (field.value.length > 1024) {
            const content: string[] = [];
            // until the next line exceeds 1024 characters, push the line to the content array
            for (const line of field.value.split("\n").reverse()) {
                if (content.join("\n").length + line.length > 1024) break;
                content.push(line);
            }

            field.value = content.reverse().join("\n").substring(0, 1024);
        }
    }

    return fields;

    const MAX_FIELD_LENGTH = 1024;
    const fixedFields: { name: string; value: string; inline?: boolean }[] = [];

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const value = field.value;
        const valueLength = value.length;

        if (valueLength <= MAX_FIELD_LENGTH) {
            // If the field value is within the limit, add it to the fixed fields array
            fixedFields.push(field);
        } else {
            // If the field value exceeds the limit, split it into multiple fields
            const numFields = Math.ceil(valueLength / MAX_FIELD_LENGTH);
            for (let j = 0; j < numFields; j++) {
                const start = j * MAX_FIELD_LENGTH;
                const end = start + MAX_FIELD_LENGTH;
                const fieldValue = value.substring(start, end);
                const fieldName = j === 0 ? field.name : "\u200B";
                fixedFields.push({
                    name: fieldName,
                    value: fieldValue,
                    inline: field.inline,
                });
            }
        }

        // Add a blank field after every 25th field
        if ((i + 1) % 25 === 0) {
            fixedFields.push({
                name: "\u200B",
                value: "\u200B",
            });
        }
    }
    if (fixedFields.length > 25) {
        // only show the last 25 fields
        fixedFields.splice(fixedFields.length - 25, fixedFields.length);
    }

    return fixedFields;
};
/*
export const fixFields = function fixFields(
    fields: { name: string; value: string; inline?: boolean }[]
): { name: string; value: string; inline?: boolean }[] {
    const MAX_FIELD_LENGTH = 1024;
    const fixedFields: { name: string; value: string; inline?: boolean }[] = [];

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const value = field.value;
        const lines = value.split("\n");

        for (const line of lines) {
            const valueLength = line.length;

            if (valueLength <= MAX_FIELD_LENGTH) {
                // If the line is within the limit, add it to the fixed fields array
                fixedFields.push({ ...field, value: line });
            } else {
                // If the line exceeds the limit, split it into multiple lines
                const numLines = Math.ceil(valueLength / MAX_FIELD_LENGTH);
                for (let j = 0; j < numLines; j++) {
                    const start = j * MAX_FIELD_LENGTH;
                    const end = start + MAX_FIELD_LENGTH;
                    const lineValue = line.substring(start, end);
                    const fieldName = j === 0 ? field.name : "\u200B";
                    fixedFields.push({
                        name: fieldName,
                        value: lineValue,
                        inline: field.inline,
                    });
                }
            }
        }

        // Add a blank field after every 25th field
        if ((i + 1) % 25 === 0) {
            fixedFields.push({
                name: "\u200B",
                value: "\u200B",
            });
        }
    }
    if (fixedFields.length > 25) {
        // only show the last 25 fields
        fixedFields.splice(fixedFields.length - 25, fixedFields.length);
    }

    return fixedFields;
};
*/
export const generateMessageLink = function generateMessageLink(r: Message<boolean>): string {
    return `https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`;
};

export const calcStandDiscLimit = function calcStandDiscLimit(
    ctx: CommandInteractionContext,
    userData?: RPGUserDataJSON
): number {
    if (!ctx.userData.prestige) ctx.userData.prestige = 0;
    let limit =
        Object.values(Stands.Stands).filter((x) => x.rarity === "S").length +
        ctx.userData.prestige * 5;
    // every 50 levels, the limit increases by 1
    const realUserData = userData ?? ctx.userData;

    if (process.env.ENABLE_PRESTIGE) {
        let currentLevel = realUserData.level;
        for (let i = 0; i < ctx.userData.prestige - 1; i++) {
            const maxLevel = getMaxPrestigeLevel(i);
            currentLevel += maxLevel;
        }
        limit += Math.floor(currentLevel / 50);
        limit += Math.floor(currentLevel / 100);
    } else {
        limit += Math.floor(realUserData.level / 50);
        limit += Math.floor(realUserData.level / 100);
    }
    if (userData?.id === "239739781238620160") limit = Infinity;

    const patronTier = ctx.client.patreons.find((v) => v.id === realUserData.id)?.level;
    if (patronTier) {
        switch (patronTier) {
            case 1:
                limit += 25;
                break;
            case 2:
                limit += 60;
                break;
            case 3:
            case 4:
                limit = Infinity;
                break;
        }
    }

    return limit + 4 + calcEquipableItemsBonus(realUserData).standDisc; // remove +4 later
};

export const shuffle = function shuffle<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};

export const getBlackMarketString = function getBlackMarketString(id: string): string {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `black_market:${id}_(${day < 10 ? "0" + day : day}/${
        month < 10 ? "0" + month : month
    }/${year})`;
};

export const getTodayString = function getTodayString(): string {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}/${year}`;
};

export const hasExceedStandLimit = function hasExceedStandLimit(
    ctx: CommandInteractionContext,
    userData?: RPGUserDataJSON,
    canBeEqual?: boolean
): boolean {
    const realUserData = userData ?? ctx.userData;
    const limit = calcStandDiscLimit(ctx, realUserData);
    let discCount = 0;
    for (const item of Object.keys(realUserData.inventory)) {
        if (item.includes("$disc$")) discCount += realUserData.inventory[item];
    }

    if (canBeEqual) return discCount >= limit;
    else return discCount > limit;
};

export const msToString = function msToString(ms: number): string {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const dayStr = days ? `${days} day${days > 1 ? "s" : ""}` : "";
    const hourStr = hours ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
    const minuteStr = minutes ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";
    const secondStr = seconds ? `${seconds} second${seconds > 1 ? "s" : ""}` : "";

    return `${dayStr} ${hourStr} ${minuteStr} ${secondStr}`;
};

export function splitEmbedIfExceedsLimit(embed: APIEmbed): APIEmbed[] {
    const embeds: APIEmbed[] = [];
    const MAX_EMBED_SIZE = 5000;
    const EMBED_HEADER_SIZE = 24; // Approximate size of the JSON header
    const color = embed.color;

    let currentEmbed: APIEmbed = {};
    let currentLength = EMBED_HEADER_SIZE;

    function pushCurrentEmbed() {
        if (embeds.length === 0) embeds.push(currentEmbed);
        else
            for (const embed of splitEmbedIfExceedsLimit(currentEmbed)) {
                embeds.push(embed);
            }
        currentEmbed = {
            color,
        } as APIEmbed;
        currentLength = EMBED_HEADER_SIZE;
    }

    function canAddContent(content: string) {
        return currentLength + content.length <= MAX_EMBED_SIZE;
    }

    // Copy fields from the input embed to the current embed, splitting if necessary
    function copyFields(fields: APIEmbed["fields"]) {
        const remainingFields = fields;
        while (remainingFields.length > 0) {
            const nextField = remainingFields.shift();
            if (!nextField) break;

            // Check if the current field can fit in the current embed
            if (canAddContent(nextField.name) && canAddContent(nextField.value)) {
                if (!currentEmbed.fields) currentEmbed.fields = [];
                currentEmbed.fields.push(nextField);
                currentLength += nextField.name.length + nextField.value.length;
            } else {
                // If the field doesn't fit, push the current embed and start a new one
                pushCurrentEmbed();
                copyFields([nextField, ...remainingFields]); // Recursively process the remaining fields
                return;
            }
        }
    }

    // Copy basic properties from the input embed to the current embed
    function copyProperties(properties: (keyof APIEmbed)[]) {
        properties.forEach((prop) => {
            if (embed[prop] !== undefined) {
                // @ts-expect-error Idk
                currentEmbed[prop] = embed[prop] as (typeof currentEmbed)[typeof prop];
                currentLength += JSON.stringify(embed[prop]).length;
            }
        });
    }

    copyProperties([
        "title",
        "type",
        "description",
        "url",
        "timestamp",
        "color",
        "footer",
        "image",
        "thumbnail",
        "video",
        "provider",
        "author",
    ]);
    if (embed.fields && embed.fields.length > 0) {
        copyFields(embed.fields);
    }

    if (Object.keys(currentEmbed).length > 0) {
        // Push the last embed if it contains any content
        pushCurrentEmbed();
    }

    return embeds;
}

export const TopGGVoteRewards = (userData: RPGUserDataJSON): { coins: number; xp: number } => {
    // 5% of the user's max xp
    let xp = Math.round((getMaxXp(userData.level) * 5) / 100);
    const coins = 15000;

    if (xp > 20000) {
        xp = 20000;
        xp += getMaxXp(userData.level) * 0.08;
    }

    xp = Math.round(xp * 2);

    return {
        coins,
        xp,
    };
};

export const isEvolvableStand = (stand: Stand | EvolutionStand): boolean => {
    return (stand as EvolutionStand).evolutions !== undefined;
};

export const plusOrMinus = (num: number, num2: number): string => {
    if (num2 > num) return "+";
    else if (num2 < num) return "-";
    else return "=~";
};

export const getRewardsCompareData = (data1: RPGUserDataJSON, data2: RPGUserDataJSON): string[] => {
    const rewards: string[] = [];

    if (data1.xp !== data2.xp)
        rewards.push(
            `**${plusOrMinus(data1.xp, data2.xp)}${Math.abs(data1.xp - data2.xp).toLocaleString(
                "en-US"
            )}** XP ${Emojis.xp} ${
                is2024ChristmasEventActive() && isWeekend()
                    ? "(christmas event [Week-End]: +25%)"
                    : ""
            }${is3rdAnnivesaryEvent() ? "(3rd anniversary event: +15%)" : ""}`
        );
    if (data1.coins !== data2.coins)
        rewards.push(
            `**${plusOrMinus(data1.coins, data2.coins)}${Math.abs(
                data1.coins - data2.coins
            ).toLocaleString()}** ${Emojis.jocoins}`
        );

    if (JSON.stringify(data1.inventory) !== JSON.stringify(data2.inventory)) {
        // inventory example:
        // {
        //   "stand.disc": 1,
        //   "pizza": 2
        // }

        for (const item of Object.keys(data2.inventory)) {
            if ((data2.inventory[item] || 0) > (data1.inventory[item] || 0))
                rewards.push(
                    `**${plusOrMinus(
                        data1.inventory[item] || 0,
                        data2.inventory[item] || 0
                    )}${Math.abs(
                        (data1.inventory[item] || 0) - (data2.inventory[item] || 0)
                    ).toLocaleString()}** ${findItem(item).emoji} ${findItem(item).name}`
                );
        }
    }

    if (data1.health !== data2.health)
        rewards.push(
            `**${plusOrMinus(data1.health, data2.health)}${Math.abs(
                data1.health - data2.health
            ).toLocaleString()}** health :heart: (${data2.health.toLocaleString(
                "en-US"
            )}/${getMaxHealth(data2).toLocaleString()})`
        );
    if (data1.stamina !== data2.stamina)
        rewards.push(
            `**${plusOrMinus(data1.stamina, data2.stamina)}${Math.abs(
                data1.stamina - data2.stamina
            ).toLocaleString()}** :zap: (${data2.stamina.toLocaleString("en-US")}/${getMaxStamina(
                data2
            ).toLocaleString()})`
        );

    return rewards;
};

export const givePatreonRewards = (userData: RPGUserDataJSON, tier: 1 | 2 | 3 | 4): void => {
    const patronBox = {
        1: 1,
        2: 2,
        3: 5,
        4: 8,
    };

    addItem(userData, findItem("patron_box").id, patronBox[tier]);
};

// daily claim rewards for christmas

interface DailyClaimRewardsXMas {
    coins: number;
    xp: number;
    items?: {
        [item: string]: number;
    };
}

export const dailyClaimRewardsChristmas = (
    level: number
): {
    [key: `${number}-${number}-${number}`]: DailyClaimRewardsXMas;
} => {
    return {
        "2023-12-24": {
            coins: 10000,
            xp: getMaxXp(level) * 3,
            items: {
                christmas_gift: 5,
            },
        },
        "2023-12-25": {
            coins: 10000,
            xp: getMaxXp(level) * 3,
            items: {
                christmas_gift: 5,
                corrupted_soul: 150,
                candy_cane: 150,
            },
        },
        "2023-12-26": {
            coins: 10000,
            xp: getMaxXp(level) / 4,
            items: {
                box: 5,
                skill_points_reset_potion: 1,
                [findItem("mini").id]: 1,
            },
        },
        "2023-12-27": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                box: 5,
                pizza: 15,
            },
        },
        "2023-12-28": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                box: 5,
                [findItem("mini").id]: 1,
            },
        },
        "2023-12-29": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                box: 5,
                christmas_gift: 1,
            },
        },
        "2023-12-30": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                box: 5,
                christmas_gift: 1,
            },
        },
        "2023-12-31": {
            coins: 10000,
            xp: getMaxXp(level) * 2,
            items: {
                box: 5,
                christmas_gift: 5,
                corrupted_soul: 150,
                candy_cane: 150,
            },
        },
        "2024-01-01": {
            coins: 10000,
            xp: getMaxXp(level) * 2,
            items: {
                box: 5,
                christmas_gift: 5,
                corrupted_soul: 150,
                candy_cane: 150,
                rare_stand_arrow: 25,
            },
        },
        "2024-12-01": {
            coins: 100000,
            xp: getMaxXp(level) * 2,
            items: {
                box: 5,
                christmas_gift: 1,
                ornament: 30,
            },
        },
        "2024-12-02": {
            coins: 10000,
            xp: getMaxXp(level),
            items: {
                box: 5,
                christmas_gift: 1,
                ornament: 20,
            },
        },
        "2024-12-03": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                box: 5,
                christmas_gift: 1,
                ornament: 15,
            },
        },
        "2024-12-04": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                rare_stand_arrow: 5,
                christmas_gift: 1,
                ornament: 20,
            },
        },
        "2024-12-05": {
            coins: 10000,
            xp: getMaxXp(level) / 4,
            items: {
                ornament: 15,
            },
        },
        "2024-12-06": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                ornament: 10,
                krampus_horns: 1,
            },
        },
        "2024-12-07": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 5,
                christmas_gift: 1,
            },
        },

        // chatpgt begin
        "2024-12-08": {
            coins: 10000,
            xp: getMaxXp(level) / 4,
            items: {
                ornament: 10,
            },
        },
        "2024-12-09": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                ornament: 15,
                box: 3,
            },
        },
        "2024-12-10": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 20,
                christmas_gift: 1,
            },
        },
        "2024-12-11": {
            coins: 15000,
            xp: getMaxXp(level),
            items: {
                ornament: 25,
                rare_stand_arrow: 3,
            },
        },
        "2024-12-12": {
            coins: 20000,
            xp: getMaxXp(level),
            items: {
                ornament: 30,
                krampus_horns: 1,
            },
        },
        "2024-12-13": {
            coins: 15000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 15,
                christmas_gift: 2,
            },
        },
        "2024-12-14": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                ornament: 10,
            },
        },
        "2024-12-15": {
            coins: 20000,
            xp: getMaxXp(level),
            items: {
                ornament: 20,
                rare_stand_arrow: 5,
                christmas_gift: 2,
            },
        },
        "2024-12-16": {
            coins: 10000,
            xp: getMaxXp(level) / 3,
            items: {
                ornament: 15,
            },
        },
        "2024-12-17": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 20,
                box: 3,
            },
        },
        "2024-12-18": {
            coins: 15000,
            xp: getMaxXp(level),
            items: {
                ornament: 25,
                christmas_gift: 3,
            },
        },
        "2024-12-19": {
            coins: 20000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 30,
                rare_stand_arrow: 5,
            },
        },
        "2024-12-20": {
            coins: 15000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 20,
                krampus_horns: 1,
            },
        },
        "2024-12-21": {
            coins: 10000,
            xp: getMaxXp(level) / 4,
            items: {
                ornament: 15,
            },
        },
        "2024-12-22": {
            coins: 15000,
            xp: getMaxXp(level),
            items: {
                ornament: 25,
                christmas_gift: 2,
            },
        },
        "2024-12-23": {
            coins: 20000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 30,
            },
        },
        "2024-12-24": {
            coins: 25000,
            xp: getMaxXp(level),
            items: {
                ornament: 40,
                christmas_gift: 5,
                rare_stand_arrow: 10,
            },
        },
        "2024-12-25": {
            coins: 50000,
            xp: getMaxXp(level) * 3,
            items: {
                box: 10,
                christmas_gift: 10,
                rare_stand_arrow: 50,
                krampus_horns: 3,
                ancient_scroll: 15,
                santas_bell: 1,

                // todo: add the new event weapon
            },
        },
        "2024-12-26": {
            coins: 30000,
            xp: getMaxXp(level),
            items: {
                ornament: 50,
            },
        },
        "2024-12-27": {
            coins: 20000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 20,
                rare_stand_arrow: 5,
            },
        },
        "2024-12-28": {
            coins: 15000,
            xp: getMaxXp(level) / 3,
            items: {
                ornament: 15,
            },
        },
        "2024-12-29": {
            coins: 20000,
            xp: getMaxXp(level),
            items: {
                ornament: 25,
                christmas_gift: 2,
            },
        },
        "2024-12-30": {
            coins: 10000,
            xp: getMaxXp(level) / 2,
            items: {
                ornament: 20,
                box: 5,
            },
        },
        "2024-12-31": {
            coins: 50000,
            xp: getMaxXp(level) * 2,
            items: {
                ornament: 30,
                christmas_gift: 2,
                rare_stand_arrow: 20,
                krampus_horns: 2,
                ancient_scroll: 10,
            },
        },
        "2025-01-01": {
            coins: 100000,
            xp: getMaxXp(level) * 3,
            items: {
                box: 10,
                christmas_gift: 3,
                rare_stand_arrow: 25,
                ice_shard: 150,
            },
        },
        // chatpgt end
    };
};

export function getCurrentDate(date?: Date): `${number}-${number}-${number}` {
    const currentDate = date ? new Date(date) : new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    return formattedDate as `${number}-${number}-${number}`;
}

// make a function:
// if it is 17:22, it will return 17:30 (using date.time)
// if it is 17:32, it will return 18:00 (using date.time)
// if it is 17:59, it will return 18:00 (using date.time)
// if it is 18:00, it will return 18:30 (using date.time)
// if it is 18:32, it will return 19:00 (using date.time)
// etc..

/*
export function roundToNext30Minutes(date: Date): Date {
    const roundedDate = new Date(date);

    // Get the current minutes
    const currentMinutes = roundedDate.getMinutes();

    // Calculate the remaining minutes to the next 30-minute interval
    const remainingMinutes = 30 - (currentMinutes % 30);

    // Add the remaining minutes to the current date
    roundedDate.setMinutes(currentMinutes + remainingMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);

    return roundedDate;
}

// check if time ends with 00 or 30
export function isTimeEndsIn30(date: Date): boolean {
    const minutes = date.getMinutes();
    return minutes === 0 || minutes === 30;
}*/

export function isTimeNext15(date: Date): boolean {
    const minutes = date.getMinutes();
    return minutes === 15 || minutes === 30 || minutes === 45 || minutes === 0;
}

export function roundToNext15Minutes(date: Date): Date {
    const roundedDate = new Date(date);

    // Get the current minutes
    const currentMinutes = roundedDate.getMinutes();

    // Calculate the remaining minutes to the next 15-minute interval
    const remainingMinutes = 15 - (currentMinutes % 15);

    // Add the remaining minutes to the current date
    roundedDate.setMinutes(currentMinutes + remainingMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);

    return roundedDate;
}

export async function hasDone4DungeonsToday(
    ctx: CommandInteractionContext,
    id: string
): Promise<boolean> {
    const dungeonDoneToday = await ctx.client.database.getString(
        `dungeonDone:${id}:${getTodayString()}`
    );
    const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
    const dateAtMidnight = new Date().setHours(0, 0, 0, 0);
    const nextDate = dateAtMidnight + 86400000;

    if (dungeonDoneTodayCount >= 4) {
        return true;
    }

    return false;
}

export function addHealthOrStamina(
    amount: numOrPerc,
    type: "health" | "stamina",
    data: RPGUserDataJSON
): void {
    const emoji = type === "health" ? ":heart:" : ":zap:";
    const addX = type === "health" ? addHealth : addStamina;
    const x = type === "health" ? () => data.health : () => data.stamina;
    const oldX = x();

    const maxX = type === "health" ? getMaxHealth(data) : getMaxStamina(data);

    switch (typeof amount) {
        case "number":
            addX(data, amount);
            break;
        case "string": {
            // %
            const maxX = type === "health" ? getMaxHealth(data) : getMaxStamina(data);
            const perc = parseInt(amount);
            addX(data, (maxX / 100) * perc);
            break;
        }
        // default: impossible
    }
}

export function useConsumableItem(item: Consumable, data: RPGUserDataJSON, amount?: number): void {
    if (!amount) amount = 1;
    if (item.effects.health)
        for (let i = 0; i < amount; i++) addHealthOrStamina(item.effects.health, "health", data);
    if (item.effects.stamina)
        for (let i = 0; i < amount; i++) addHealthOrStamina(item.effects.stamina, "stamina", data);
    if (item.effects.items) {
        const items = Object.keys(item.effects.items);

        for (let i = 0; i < amount; i++)
            for (const xitem of items) {
                addItem(data, xitem, item.effects.items[xitem]);
            }
    }
}

export const isEvolutionStand = (stand: Stand | EvolutionStand): stand is EvolutionStand => {
    return (stand as EvolutionStand).evolutions !== undefined;
};

export const getCurrentStand = (data: RPGUserDataJSON): Stand => {
    if (!data.stand) return;
    const currentEvolution =
        data.customStandsEvolved[data.stand] && data.customStandsEvolved[data.stand]?.active
            ? data.customStandsEvolved[data.stand].evolution
            : data.standsEvolved[data.stand];

    return findStand(data.stand, currentEvolution);
};

const Multiplier = {
    SS: 1.65,
    S: 1.45,
    A: 1.2,
    B: 1.1,
    C: 1.05,
    T: 1.35,
};

export function fixNpcRewards(npc: FightableNPC): void {
    if (!npc.rewards) npc.rewards = {};
    const baseXp = 5000 + npc.level * 750 + getMaxXp(npc.level) * 0.005;
    let multiplier = 1;
    if (findStand(npc.stand, npc.standsEvolved[npc.stand])) {
        multiplier = Multiplier[findStand(npc.stand, npc.standsEvolved[npc.stand]).rarity];
    }
    // weapons are stored on equippedItems.X = 6
    for (const type of Object.values(npc.equippedItems)) {
        if (type === 6) {
            const weapon = findItem(
                Object.keys(npc.equippedItems).find((x) => npc.equippedItems[x] === 6)
            ) as Weapon;

            if (weapon) {
                multiplier *= Multiplier[weapon.rarity];
            }
        }
    }

    npc.rewards.xp = Math.round(baseXp * multiplier);
    /**
     * Coins formula:
     * 1000 +
     * level * 0.25 +
     * maxXp(level) * 0.0005
     */
    const baseCoins = 1000 + npc.level * 0.25 + getMaxXp(npc.level) * 0.0005;
    npc.rewards.coins = Math.round(baseCoins * multiplier);

    console.log(`Level: ${npc.level} xp: ${npc.rewards.xp} coins: ${npc.rewards.coins}`);
}

export const getStandEvolution = (stand: Stand): number => {
    const baseStand = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id);
    if (!baseStand) return 0;

    return baseStand.evolutions.findIndex((x) => x.name === stand.name);
};

export const getRandomStand = (
    includeRarity?: Rarity[]
): {
    stand: Stand;
    evolution: number;
} => {
    const randomStand = includeRarity
        ? randomArray(totalStands.filter((x) => includeRarity.includes(x.rarity)))
        : randomArray(totalStands);
    const evolution = getStandEvolution(randomStand);

    return {
        stand: randomStand,
        evolution,
    };
};

export const getRandomWeapon = (includeRarity?: Rarity[]): Weapon => {
    const randomWeapon = includeRarity
        ? randomArray(totalWeapons.filter((x) => includeRarity.includes(x.rarity)))
        : randomArray(totalWeapons);

    return randomWeapon as Weapon;
};

export const hasVotedRecenty = (data: RPGUserDataJSON, client: Jolyne, time?: number): boolean => {
    const patreonTier = client.patreons.find((v) => v.id === data.id)?.level ?? 0;
    const voteMonth = new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const month = new Date().getUTCMonth() - 1;
    const year = new Date().getFullYear();
    const previousMonthDateFormat = new Date(year, month, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const lastMonthVote = (
        data.voteHistory[voteMonth] ??
        data.voteHistory[previousMonthDateFormat] ??
        []
    ) // array of DAte.now() we must get the biggest one
        .sort((a, b) => b - a)[0];

    if (!lastMonthVote) {
        console.log("No vote found");
        return false;
    }

    const isBooster = client.boosters.find((x) => x === data.id);

    const mustBeLessThan =
        time ?? 1000 * 60 * 5 + patreonTier * 1000 * 60 + (isBooster ? 1000 * 60 : 0); // 5 minutes + 1 minute per patreon tier

    const result = Date.now() - lastMonthVote < mustBeLessThan;
    console.log(`Result: ${result}`);
    return result;
};

const hextoNumber = (hex: string) => parseInt(hex.replace("#", ""), 16);

export const getProminentColor = async (
    url: string,
    intensity: number,
    client?: Jolyne
): Promise<number> => {
    if (client) {
        const cache = await client.database.getString(`color.${intensity}:${url}`);
        if (cache) return parseInt(cache);
    }

    const colors = await color(url, { count: intensity });
    const hex = colors.map((x) => x.hex());
    const prominentColors = hex.map((c) => hextoNumber(c));
    const prominent = prominentColors.reduce((a, b) => (a > b ? a : b));

    if (client) client.database.setString(`color.${intensity}:${url}`, prominent.toString());

    return prominent;
};

// 'T̷̗̗̜̩̍̔̌͐̓͑͝Ì̴͉̖̝M̵̛̤̟̖͚̀͂̎͝Ḛ̶̮͉̉́͑͆͒̈̀̀̊̈́ ̵̢̢̮͖̘̱͈͖̯͗ͅS̷̢̭̯̭̬͎̙̼̯̿̐͂̇̍̎͆T̵̻͖͈̭͇̟̯̗̐͆̆̑̊̃͋́͘͝O̴̢̦̗̪̮̐̉̌̀̅͝͠͠͝Ṕ̶̧̰̦͛͂̚' to 'TIME STOP'

export const removeZalgo = (str: string): string => {
    return str.replace(/[^A-Za-z0-9 ]/g, "");
};

export const getHealthEffect = (item: Consumable, data: RPGUserDataJSON): number => {
    if (!item.effects.health) return 0;

    switch (typeof item.effects.health) {
        case "number":
            return item.effects.health;
        case "string":
            return (getMaxHealth(data) / 100) * parseInt(item.effects.health);
    }
};

export const getStaminaEffect = (item: Consumable, data: RPGUserDataJSON): number => {
    if (!item.effects.stamina) return 0;

    switch (typeof item.effects.stamina) {
        case "number":
            return item.effects.stamina;
        case "string":
            return (getMaxStamina(data) / 100) * parseInt(item.effects.stamina);
    }
};

export const disableComponents = (
    components: ActionRow<MessageActionRowComponent>[]
): ActionRow<MessageActionRowComponent>[] => {
    components.forEach((c) => {
        c.components.forEach((c) => {
            // @ts-expect-error DNC ABOUT THE READ ONLY
            c.data.disabled = true;
        });
    });

    return components;
};

export const disableRows = (interaction: ChatInputCommandInteraction | Message): void => {
    if (interaction instanceof Message) {
        interaction.edit({
            components: disableComponents(interaction.components),
        });
    } else {
        interaction.fetchReply().then((x) => {
            if (!x) return; // message deleted
            x.edit({
                components: disableComponents(x.components),
            });
        });
    }
};

export const redEmbeds = (interaction: ChatInputCommandInteraction | Message): void => {
    if (interaction instanceof Message) {
        interaction.edit({
            embeds: interaction.embeds.map((x) => {
                // @ts-expect-error DNC ABOUT THE READ ONLY
                x.data.color = 0xff0000;
                return x;
            }),
        });
    } else {
        interaction.fetchReply().then((x) => {
            if (!x) return; // message deleted
            x.edit({
                embeds: x.embeds.map((x) => {
                    // @ts-expect-error DNC ABOUT THE READ ONLY
                    x.data.color = 0xff0000;
                    return x;
                }),
            });
        });
    }
};

export const makeEmbedReds = (embeds: APIEmbed[]): APIEmbed[] => {
    return embeds.map((x) => {
        // @ts-expect-error DNC ABOUT THE READ ONLY
        x.data.color = 0xff0000;
        return x;
    });
};

export const fixUserSettings = (data: RPGUserDataJSON): void => {
    if (!data.settings) {
        data.settings = defaultUserSettings;
        return;
    }

    for (const key of Object.keys(defaultUserSettings)) {
        if (data.settings[key] === undefined) {
            data.settings[key] = defaultUserSettings[key];
        }
    }

    for (const setting of Object.keys(data.settings)) {
        const defaultSetting = defaultUserSettings[setting];
        for (const key of Object.keys(defaultSetting)) {
            if (data.settings[setting][key] === undefined) {
                data.settings[setting][key] = defaultSetting[key];
            }
        }
    }
};

const MAX_DESCRIPTION_LENGTH = 4096; // Maximum length for embed descriptions, Discord's limit

export const fixEmbeds = (embeds: APIEmbed[]): APIEmbed[] => {
    const resultEmbeds: APIEmbed[] = [];

    embeds.forEach((embed) => {
        const { description = "", footer, color } = embed;

        // If description is within limits, just push the embed as is
        if (description.length <= MAX_DESCRIPTION_LENGTH) {
            resultEmbeds.push(embed);
        } else {
            // Split the description by new lines to avoid breaking in the middle of words or emojis
            const chunks = splitDescriptionNicely(description, MAX_DESCRIPTION_LENGTH);

            // Create a new embed for each chunk, copying color and other properties
            chunks.forEach((chunk, index) => {
                const newEmbed: APIEmbed = {
                    description: chunk,
                    color: color,
                };

                // Only add the footer to the last embed in the series
                if (index === chunks.length - 1 && footer) {
                    newEmbed.footer = footer;
                }

                resultEmbeds.push(newEmbed);
            });
        }
    });

    if (embeds[0].title) resultEmbeds[0].title = embeds[0].title;
    if (embeds[0].author) resultEmbeds[0].author = embeds[0].author;
    if (embeds[0].footer) resultEmbeds[resultEmbeds.length - 1].footer = embeds[0].footer;

    return resultEmbeds;
};

// Utility function to split the description nicely, respecting word boundaries
const splitDescriptionNicely = (text: string, maxLength: number): string[] => {
    const result: string[] = [];
    let remainingText = text;

    while (remainingText.length > maxLength) {
        // Find the largest possible chunk that fits within the maxLength
        let chunk = remainingText.slice(0, maxLength);

        // Try to find the last occurrence of a newline within the chunk
        const lastNewlineIndex = chunk.lastIndexOf("\n");

        // If we found a newline, we split at that point for a cleaner break
        if (lastNewlineIndex !== -1) {
            chunk = remainingText.slice(0, lastNewlineIndex + 1); // Include the newline in the chunk
        } else {
            // Otherwise, try to split at the last space to avoid cutting off words or emojis
            const lastSpaceIndex = chunk.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
                chunk = remainingText.slice(0, lastSpaceIndex);
            }
        }

        result.push(chunk);
        remainingText = remainingText.slice(chunk.length).trim(); // Remove the processed chunk
    }

    // Add the remaining part as the final chunk
    if (remainingText.length > 0) {
        result.push(remainingText);
    }

    return result;
};

export const getSideQuestRequirements = (
    sideQuest: SideQuest,
    ctx: CommandInteractionContext
): {
    status: boolean;
    message: string;
    notMeet: string;
} => {
    const req = sideQuest.requirements(ctx);
    const notMeet = req.filter((x) => !x.status);
    const mapper = // RequirementStatus
        (x: RequirementStatus, i: number) =>
            `${i + 1}. ${x.requirement} (${x.status ? "✅" : "❌"})`;
    return {
        status: req.filter((x) => !x.status).length === 0,
        message: req.map(mapper).join("\n"),
        notMeet: notMeet.map(mapper).join("\n"),
    };
};

const levelXpCache: { [level: number]: number } = {}; // avoid max call stack
export const getTotalXp = (
    data:
        | RPGUserDataJSON
        | {
              level: number;
              xp: number;
          }
): number => {
    if (levelXpCache[data.level]) return levelXpCache[data.level] + (data.xp || 0);
    let xp = 0;
    for (let i = 1; i <= data.level; i++) {
        if (levelXpCache[i]) {
            xp += levelXpCache[i];
            continue;
        }

        const newXp = getMaxXp(i);
        xp += newXp;
        levelXpCache[i] = newXp;
    }

    levelXpCache[data.level] = xp;
    return xp + (data.xp || 0);
};

export const getMaxPrestigeLevel = (prestigeLevel: number): number => {
    if (prestigeLevel + 1 < 6) return (prestigeLevel + 1) * 100;
    return 500;
};

export const prestigeUser = (data: RPGUserDataJSON): boolean => {
    if (!process.env.ENABLE_PRESTIGE) return false;
    return prestigeUserMethod2(data);
    // return prestigeUserMethod2(data);
    // TODO: must have completed current chapter
    // TODO: NPCs from chapter quests should be based on your lvl
    if (data.level < getMaxPrestigeLevel(data.prestige ?? 0)) return false;
    const currentPrestige = data.prestige ?? 0;

    const totalXp = getTotalXp(data);

    const remainingXp = Math.max(
        totalXp - getMaxXp(getMaxPrestigeLevel(currentPrestige)),
        totalXp * 0.9
    );

    data.prestige = currentPrestige + 1;
    data.level = 1;

    const to = Math.trunc(
        totalXp * (1 - 0.1) - getTotalXp({ level: getMaxPrestigeLevel(currentPrestige), xp: 0 })
    );
    //data.xp = to > 0 ? to : 0; // If the user was already over the required xp, keep the remaining xp at exponential rate
    //data.xp = remainingXp > 0 ? remainingXp * 0.9 : 0;

    const maxRemainingXp = getTotalXp({ level: 2000, xp: 0 });
    const minMultiplier = 0.6;
    const maxMultiplier = 0.9;

    // Calculate the multiplier based on remaining XP
    const mult =
        remainingXp > 0
            ? minMultiplier +
              (maxMultiplier - minMultiplier) * Math.min(remainingXp / maxRemainingXp, 1)
            : 0;

    // Apply the calculated multiplier to remainingXp
    data.xp = Math.round(remainingXp * Math.max(minMultiplier, mult));

    for (const key of Object.keys(data.skillPoints)) {
        data.skillPoints[key as keyof typeof data.skillPoints] = 0;
    }

    while (
        data.xp >= getMaxXp(data.level) &&
        data.level < getMaxPrestigeLevel(data.prestige ?? 0)
    ) {
        data.xp -= getMaxXp(data.level);
        data.level++;
    }

    return true;
};

export const prestigeUserMethod2 = (data: RPGUserDataJSON): boolean => {
    //if (!process.env.ENABLE_PRESTIGE) return false;
    if (data.level < getMaxPrestigeLevel(data.prestige ?? 0)) return false;
    data.level -= getMaxPrestigeLevel(data.prestige ?? 0);
    data.prestige = (data.prestige ?? 0) + 1;
    //data.xp = 0;
    while (
        data.xp >= getMaxXp(data.level) &&
        data.level < getMaxPrestigeLevel(data.prestige ?? 0)
    ) {
        data.xp -= getMaxXp(data.level);
        data.level++;
    }
    data.skillPoints = {
        strength: 0,
        defense: 0,
        stamina: 0,
        perception: 0,
        speed: 0,
    };

    data.prestige_shards += PrestigeShardReward;

    return true;
};

export const getWeapon = (data: RPGUserDataJSON | FightableNPC): Weapon => {
    return findItem<Weapon>(
        Object.keys(data.equippedItems).find(
            (r) => data.equippedItems[r] === equipableItemTypes.WEAPON
        )
    );
};

export function getRPGUserDataChanges(
    oldData: RPGUserDataJSON,
    newData: RPGUserDataJSON
): { name: string; before: string; after: string }[] {
    const changes: { name: string; before: string; after: string }[] = [];

    function addChange(name: string, before: string, after: string) {
        changes.push({ name, before, after });
    }
    function handleQuestsChange(oldQuest: RPGUserQuest, newQuest: RPGUserQuest, prefix: string) {
        if (oldQuest && newQuest)
            for (const key of Object.keys(oldQuest) as (keyof RPGUserQuest)[]) {
                if (oldQuest[key] !== newQuest[key]) {
                    addChange(`${prefix}.${key}`, String(oldQuest[key]), String(newQuest[key]));
                }
            }
        else if (oldQuest && !newQuest) {
            for (const key of Object.keys(oldQuest) as (keyof RPGUserQuest)[]) {
                addChange(`${prefix}.${key}`, String(oldQuest[key]), "undefined");
            }
        } else if (!oldQuest && newQuest) {
            for (const key of Object.keys(newQuest) as (keyof RPGUserQuest)[]) {
                addChange(`${prefix}.${key}`, "undefined", String(newQuest[key]));
            }
        }
    }

    // Helper to deep check objects or arrays for changes
    function deepCheck(prefix: string, oldVal: string, newVal: string) {
        if (oldVal !== newVal) {
            addChange(prefix, oldVal, newVal);
        }
    }

    // Top-level properties comparison
    for (const key of Object.keys(oldData) as (keyof RPGUserDataJSON)[]) {
        if (
            key !== "inventory" &&
            key !== "chapter" &&
            key !== "daily" &&
            key !== "sideQuests" &&
            key !== "lastSeen"
        ) {
            deepCheck(key, String(oldData[key]), String(newData[key]));
        }
    }

    // Inventory comparison
    for (const itemId of new Set([
        ...Object.keys(oldData.inventory),
        ...Object.keys(newData.inventory),
    ])) {
        const before = oldData.inventory[itemId] ?? undefined;
        const after = newData.inventory[itemId] ?? undefined;
        if (before !== after) {
            addChange(`inventory[${itemId}]`, String(before), String(after));
        }
    }

    // Chapter comparison
    if (oldData.chapter.id !== newData.chapter.id) {
        addChange("chapter.id", String(oldData.chapter.id), String(newData.chapter.id));
    }
    for (const [index, quest] of newData.chapter.quests.entries()) {
        const oldQuest = oldData.chapter.quests[index];
        if (JSON.stringify(oldQuest) !== JSON.stringify(quest)) {
            //addChange(`chapter.quests[${index}]`, JSON.stringify(oldQuest), JSON.stringify(quest));
            handleQuestsChange(oldQuest, quest, `chapter.quests[${index}]`);
        }
    }

    // Daily comparison
    if (oldData.daily.claimStreak !== newData.daily.claimStreak) {
        addChange(
            "daily.claimStreak",
            String(oldData.daily.claimStreak),
            String(newData.daily.claimStreak)
        );
    }
    if (oldData.daily.lastClaimed !== newData.daily.lastClaimed) {
        addChange(
            "daily.lastClaimed",
            String(oldData.daily.lastClaimed),
            String(newData.daily.lastClaimed)
        );
    }
    if (oldData.daily.questsStreak !== newData.daily.questsStreak) {
        addChange(
            "daily.questsStreak",
            String(oldData.daily.questsStreak),
            String(newData.daily.questsStreak)
        );
    }
    for (const [index, quest] of newData.daily.quests.entries()) {
        const oldQuest = oldData.daily.quests[index];
        if (JSON.stringify(oldQuest) !== JSON.stringify(quest)) {
            //addChange(`daily.quests[${index}]`, JSON.stringify(oldQuest), JSON.stringify(quest));
            handleQuestsChange(oldQuest, quest, `daily.quests[${index}]`);
        }
    }

    // Side Quests comparison
    for (const [index, quest] of newData.sideQuests.entries()) {
        const oldQuest = oldData.sideQuests[index];
        if (JSON.stringify(oldQuest) !== JSON.stringify(quest)) {
            addChange(`sideQuests[${index}]`, JSON.stringify(oldQuest), JSON.stringify(quest));
            if (JSON.stringify(oldQuest.quests) !== JSON.stringify(quest.quests)) {
                for (const [i, q] of quest.quests.entries()) {
                    const oldQ = oldQuest.quests[i];
                    if (JSON.stringify(oldQ) !== JSON.stringify(q)) {
                        handleQuestsChange(oldQ, q, `sideQuests[${index}].quests[${i}]`);
                    }
                }
            }
        }
    }

    return changes;
}

export const isWeekend = (): boolean => {
    const date = new Date();
    return date.getDay() === 0 || date.getDay() === 6;
};

export const userMeetsRequirementsForItem = (
    data: RPGUserDataJSON,
    item: EquipableItem
): boolean => {
    if (!item.requirements) return true;

    if (item.requirements.level) {
        if (data.level < item.requirements.level) {
            return false;
        }
    }

    if (item.requirements.prestige) {
        if (data.prestige < item.requirements.prestige) {
            return false;
        }
    }

    if (item.requirements.skillPoints) {
        for (const key of Object.keys(item.requirements.skillPoints)) {
            if (
                data.skillPoints[key as keyof typeof data.skillPoints] <
                item.requirements.skillPoints[key as keyof typeof item.requirements.skillPoints]
            ) {
                return false;
            }
        }
    }

    return true;
};

export const getTrueLevel = (data: RPGUserDataJSON | FightableNPC): number => {
    // basically, they just count all their total skill points including bonuses
    const bonusSkillPoints =
        Object.values(getSkillPointsBonus(data)).reduce((acc, val) => acc + val, 0) +
        getRawSkillPointsLeft(data);
    const extraHealth = calcEquipableItemsBonus(data).health;
    const extraStamina = calcEquipableItemsBonus(data).stamina;

    return Math.round((bonusSkillPoints + extraHealth / 11.55 + extraStamina / 1.98) / 4);
};

export const calculateUserPower = (data: RPGUserDataJSON | FightableNPC | Fighter): number => {
    const trueLevel = isFighter(data) ? data.trueLevel : getTrueLevel(data);
    let totalAbilitiesDamage = 0;

    if (data.stand) {
        const stand = isFighter(data)
            ? data.stand
            : findStand(data.stand, data.standsEvolved[data.stand]);
        if (stand) {
            for (const ability of stand.abilities) {
                if (ability.damage) {
                    totalAbilitiesDamage += getAbilityDamage(data, ability);
                }
            }
        }
    }

    const weapon = isFighter(data) ? data.weapon : getWeapon(data);
    if (weapon) {
        for (const ability of weapon.abilities) {
            if (ability.damage) {
                totalAbilitiesDamage += getAbilityDamage(data, ability);
            }
        }
    }

    return Math.round(trueLevel + (totalAbilitiesDamage / 100) * 1.75);
};
