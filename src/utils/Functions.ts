import {
    NPC,
    FightNPCQuest,
    FightableNPC,
    Quest,
    MustReadEmailQuest,
    Email,
    ActionQuest,
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
    return (item as Garment).skillPoints !== undefined;
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
        !isMustReadEmailQuest(questData)
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
    newNPC.rewards.xp = 50;
    newNPC.rewards.coins = 50;
    newNPC.rewards.xp += getMaxXp(newNPC.level) / 700;
    newNPC.rewards.coins += getMaxXp(newNPC.level) / 5000;

    newNPC.rewards.xp += newNPC.level * 225;
    newNPC.rewards.coins += newNPC.level * 0.65;

    newNPC.rewards.xp = Math.round(newNPC.rewards.xp) * 3;
    newNPC.rewards.coins = Math.round(newNPC.rewards.coins) * 15;

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

    return (
        baseHealth +
        Math.round(
            (skillPoints.defense / 4 + skillPoints.defense / 2) * 10 +
                (((skillPoints.defense / 4 + skillPoints.defense / 2) * 6) / 100) * 90
        )
    );
};

export const getMaxStaminaNoItem = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    const baseStamina = getBaseStamina;

    return Math.round(baseStamina + skillPoints.stamina * 1.98 + rpgData.level / 300);
};

export const getMaxStamina = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return Math.round(getMaxStaminaNoItem(rpgData) + calcEquipableItemsBonus(rpgData).stamina);
};

export const getDodgeScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(Math.round(rpgData.level / 5 + skillPoints.perception / 1.1));
};

export const getSpeedScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    if (rpgData.level === 0) return 0;
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(Math.round(rpgData.level / 5 + skillPoints.speed / 1.1));
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
    return num?.toLocaleString("en-US");
};

export const RNG = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const percent = (percent: number): boolean => {
    const cal = RNG(0, 10000000) / 100000;
    return cal <= percent;
};

const test = [];
for (let i = 0; i < 100; i++) test.push(percent(100));
console.log(test.filter((x) => x).length);

export const generateDailyQuests = (level: RPGUserDataJSON["level"]): RPGUserQuest[] => {
    const quests: RPGUserQuest[] = [];
    if (level > 200) level = 200;
    if (level < 9) level = 9;

    const NPCs = shuffle(
        Object.values(FightableNPCS).filter((npc) => npc.level <= level && !npc.private)
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
        } else if (percent >= 100) {
            staminaScaling = 1.1;
        } else {
            // Use some piecewise function or formula to map percent to staminaScaling
            // For example, you can use a quadratic function:
            // staminaScaling = 0.5 + (percent / 100) ** 2 * 0.6;
            // This quadratic function will smoothly scale between 0.5 and 1.1 as percent goes from 1 to 100.
            staminaScaling = 0.5 + (percent / 100) ** 2 * 0.6;
        }
    }

    const damages = Math.round(
        baseDamage +
            Math.round(
                (skillPoints.strength * 0.675 + (user.level / 10 + (baseDamage / 100) * 12.5) / 2) *
                    staminaScaling
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
    cooldowns?: FightInfos["cooldowns"]
): APIEmbed => {
    const stand = isFighter(user) ? user.stand : findStand(user.stand);
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
        let content = `\`Damages:\` ${
            getAbilityDamage(user, ability) ??
            (ability.trueDamage
                ? Math.round(getAttackDamages(user) * (1 + ability.trueDamage / 100))
                : "???")
        }\n\`Stamina cost:\` ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        const dodgeScore = ability.dodgeScore ?? ability.trueDodgeScore;
        content += `\n\`Cooldown:\` ${cooldown} turns\n\n${ability.description.replace(
            /{standName}/gi,
            stand.name
        )}\nDodge score: ${!dodgeScore ? "not dodgeable" : dodgeScore}\n\n`;

        if (ability.special) content += "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
        else content += "▬▬▬▬▬▬▬▬▬";

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline: ability.special ? false : true,
        });
    }

    return embed;
};

export const getEmojiId = (emoji: string): string => {
    const match = emoji.match(/(?<=:)\d+(?=>)/);
    if (!match) return emoji;
    return match[0];
};

export const weaponAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"]
): APIEmbed => {
    const weapon = isFighter(user)
        ? user.weapon
        : findItem<Weapon>(
              Object.keys(user.equippedItems).find(
                  (r) => user.equippedItems[r] === equipableItemTypes.WEAPON
              )
          );
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
                .join("\n")}`,
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
        let content = `\`Damages:\` ${getAbilityDamage(user, ability)}\n\`Stamina cost:\` ${
            ability.stamina
        }`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        content += `\n\`Cooldown:\` ${cooldown} turns\n\n${ability.description.replace(
            /{weaponName}/gi,
            weapon.name
        )}\n`;

        if (ability.special) content += "��";
        else content += "▬▬▬▬▬▬▬▬▬";

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline: ability.special ? false : true,
        });
    }

    return embed;
};

export const getSkillPointsLeft = (user: RPGUserDataJSON | FightableNPC): number => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return user.level * 3 - totalSkillPoints;
};

export const skillPointsIsOK = (user: RPGUserDataJSON | FightableNPC): boolean => {
    const totalSkillPoints = Object.values(user.skillPoints).reduce((a, b) => a + b, 0);
    return totalSkillPoints === user.level * 3;
};

export const generateSkillPoints = (user: RPGUserDataJSON | FightableNPC): void => {
    user.skillPoints = {
        strength: 0,
        stamina: 0,
        speed: 0,
        defense: 0,
        perception: 0,
    };
    const skillPointsLeft = getSkillPointsLeft(user);

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

export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const randomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

export const findItem = <T extends Item | EquipableItem | Special | Weapon>(name: string): T => {
    if (!name) return null;
    return (Object.values(Items.default).find(
        (item) => item.id.toLocaleLowerCase() === name.toLocaleLowerCase()
    ) ||
        Object.values(Items.default).find((item) =>
            item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
            item.id.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
            item.id.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
            item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase().replace(/ /g, ""))
        ) ||
        Object.values(Items.default).find(
            (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()
        ) ||
        Object.values(Items.default).find((item) =>
            item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
            item.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
            item.name.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())
        ) ||
        Object.values(Items.default).find((item) =>
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
    if (stand.name.toLocaleLowerCase() === "mommy queen") {
        ctx.font = "22px Arial";
        const content = stand.name;
        ctx.fillText(content, 35, 40);
    } else if (stand.name.length === 10) {
        ctx.font = "22px Arial";
        const content = stand.name.substring(0, 10);
        ctx.fillText(content, 50, 40);
    } else if (stand.name.length <= 7) {
        ctx.font = "30px Arial";
        ctx.fillText(stand.name, 74, 40);
    } else if (stand.name.length <= 11) {
        ctx.font = "25px Arial";
        ctx.fillText(`${stand.name}`, 55, 45 - (12 - stand.name.length));
    } else if (stand.name.length <= 14) {
        ctx.font = "22px Arial";
        ctx.fillText(`${stand.name}`, 40, 43 - (15 - stand.name.length));
    } else {
        ctx.font = "20px Arial";
        let content;
        if (stand.name.length >= 15) {
            content =
                stand.name.substring(
                    0,
                    13 -
                        (stand.name.split("").filter((v) => v === ".").length +
                            stand.name.split("").filter((v) => v === " ").length)
                ) + "...";
        } else {
            content = stand.name;
        }
        ctx.fillText(content, 40, 40 - (20 - stand.name.length));
    }
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

export const addItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number,
    ignoreQuests?: boolean
): void => {
    if (typeof item === "string") {
        item = findItem(item);
    }
    if (!item) return;
    if (!item.storable) return;
    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] += amount;
    } else {
        userData.inventory[item.id]++;
    }

    if (ignoreQuests) return;
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
};

export const removeItem = (
    userData: RPGUserDataJSON,
    item: Item | string,
    amount?: number
): void => {
    if (typeof item === "string") {
        item = findItem(item);
    }
    if (!item) return;
    if (!userData.inventory[item.id]) userData.inventory[item.id] = 0;
    if (amount) {
        userData.inventory[item.id] -= amount;
    } else {
        userData.inventory[item.id]--;
    }

    if (userData.inventory[item.id] === 0) delete userData.inventory[item.id];
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

export const addXp = function addXp(userData: RPGUserDataJSON, amount: number): number {
    if (calcEquipableItemsBonus(userData).xpBoost > 0) {
        amount += Math.round((amount * calcEquipableItemsBonus(userData).xpBoost) / 100);
    }
    if (Date.now() < 1707606000000) amount = Math.round(amount * 1.25);

    amount = Math.round(amount);
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
    return (
        (item as Consumable)["effects"] !== undefined &&
        (item as EquipableItem)["requirements"] === undefined
    );
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

export const calculeSkillPointsLeft = function calculeSkillPointsLeft(
    userData: RPGUserDataJSON
): number {
    return (
        userData.level * 4 -
        (userData.skillPoints.perception +
            userData.skillPoints.strength +
            userData.skillPoints.stamina +
            userData.skillPoints.defense +
            userData.skillPoints.speed)
    );
};

export const userIsCommunityBanned = function userIsCommunityBanned(
    userData: RPGUserDataJSON
): string {
    const activeCommunityBans = userData.communityBans.filter((v) => v.until > Date.now());
    if (activeCommunityBans.length === 0) return;
    return activeCommunityBans[0].reason;
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
            field.value = field.value.substring(field.value.length - 1024, field.value.length);
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
    let limit = Object.values(Stands.Stands).filter((x) => x.rarity === "S").length;
    // every 50 levels, the limit increases by 1
    const realUserData = userData ?? ctx.userData;
    limit += Math.floor(realUserData.level / 50);
    limit += Math.floor(realUserData.level / 100);

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
                limit += 99999999999;
                break;
            case 4:
                limit += 99999999999;
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

    let currentEmbed: APIEmbed = {};
    let currentLength = EMBED_HEADER_SIZE;

    function pushCurrentEmbed() {
        if (embeds.length === 0) embeds.push(currentEmbed);
        else
            for (const embed of splitEmbedIfExceedsLimit(currentEmbed)) {
                embeds.push(embed);
            }
        currentEmbed = {} as APIEmbed;
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

    if (xp > 20000) xp = 20000;

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
                Date.now() < 1707606000000 ? "(+25% due to the 2-yr event)" : ""
            }`
        );
    if (data1.coins !== data2.coins)
        rewards.push(
            `**${plusOrMinus(data1.coins, data2.coins)}${Math.abs(
                data1.coins - data2.coins
            ).toLocaleString("en-US")}** ${Emojis.jocoins}`
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
                    ).toLocaleString("en-US")}** ${findItem(item).emoji} ${findItem(item).name}`
                );
        }
    } else console.log(JSON.stringify(data1.inventory), JSON.stringify(data2.inventory));

    if (data1.health !== data2.health)
        rewards.push(
            `**${plusOrMinus(data1.health, data2.health)}${Math.abs(
                data1.health - data2.health
            ).toLocaleString("en-US")}** health :heart: (${data2.health.toLocaleString(
                "en-US"
            )}/${getMaxHealth(data2).toLocaleString("en-US")})`
        );
    if (data1.stamina !== data2.stamina)
        rewards.push(
            `**${plusOrMinus(data1.stamina, data2.stamina)}${Math.abs(
                data1.stamina - data2.stamina
            ).toLocaleString("en-US")}** :zap: (${data2.stamina.toLocaleString(
                "en-US"
            )}/${getMaxStamina(data2).toLocaleString("en-US")})`
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
    };
};

export function getCurrentDate(): `${number}-${number}-${number}` {
    const currentDate = new Date();
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
