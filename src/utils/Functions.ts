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
    Ability,
    Chapter,
    ChapterPart,
    RPGUserEmail,
    WaitQuest,
    Consumable,
    Special,
    EquipableItem,
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
} from "discord.js";
import { Fighter, FightInfos } from "../structures/FightHandler";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Items from "../rpg/Items";
import Canvas from "canvas";
import * as BaseQuests from "../rpg/Quests/Quests";
import * as Emails from "../rpg/Emails";
import * as EquipableItems from "../rpg/Items/EquipableItems";

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

    return emailData;
};

export const findEmail = (query: string): Email => {
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

export const findStand = (stand: string): Stand => {
    if (!stand) return null;

    const stands = Object.values({ ...Stands.Stands });
    const foundStand = stands.find(
        (standClass) =>
            standClass.id === stand ||
            standClass.name === stand ||
            standClass.name.toLocaleLowerCase() === stand.toLocaleLowerCase()
    );

    return foundStand;
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
    const stand = isFighter(rpgData) ? rpgData.stand : findStand(rpgData.stand);
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

export const getBaseStamina = 60;

export const getMaxHealth = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return Math.round(getMaxHealthNoItem(rpgData) + calcEquipableItemsBonus(rpgData).health);
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

    return Math.round(baseStamina + skillPoints.stamina * 1.35 + rpgData.level / 3);
};

export const getMaxStamina = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    return Math.round(getMaxStaminaNoItem(rpgData) + calcEquipableItemsBonus(rpgData).stamina);
};

export const getDodgeScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
    const skillPoints = getSkillPointsBonus(rpgData);
    return Math.round(Math.round(rpgData.level / 5 + skillPoints.perception / 1.1));
};

export const getSpeedScore = (rpgData: RPGUserDataJSON | FightableNPC | Fighter): number => {
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
    return num.toLocaleString("en-US");
};

export const RNG = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const percent = (percent: number): boolean => {
    return RNG(1, 100) <= percent;
};

export const generateDailyQuests = (level: RPGUserDataJSON["level"]): RPGUserQuest[] => {
    const quests: RPGUserQuest[] = [];
    if (level > 200) level = 200;
    if (level < 9) level = 9;

    const NPCs = Object.values(FightableNPCS).filter((npc) => npc.level <= level);

    // fight npcs
    let tflv = level;
    if (tflv > 50) tflv = 50;

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
    if (level > 25)
        quests.push(pushQuest(generateClaimXQuest("xp", Math.round(getRewards(level).xp * 2.5))));

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

    return Math.round(
        baseDamage +
            Math.round(
                skillPoints.strength * 0.475 + (user.level * 1.58 + (baseDamage / 100) * 12.5) / 2
            )
    );
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
        let content = `\`Damages:\` ${getAbilityDamage(user, ability)}\n\`Stamina cost:\` ${
            ability.stamina
        }`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        content += `\n\`Cooldown:\` ${cooldown} turns\n\n${ability.description.replace(
            /{standName}/gi,
            stand.name
        )}\n`;

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
            Object.keys(user.skillPoints) as (keyof SkillPoints)[]
        ) as keyof SkillPoints;
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

export const findItem = <T extends Item | EquipableItem | Special>(name: string): T => {
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
            card_link =
                "https://cdn.discordapp.com/attachments/898236400195993622/959480216277905418/S_CARD.png";
            break;
        case "A":
            color = "#3b8c4b";
            card_link =
                "https://cdn.discordapp.com/attachments/898236400195993622/959459394205126726/A_CARD.png";
            break;
        case "B":
            color = "#786d23";
            card_link =
                "https://cdn.discordapp.com/attachments/898236400195993622/959480058651766874/B_CARD.png";
            break;
        case "C":
            color = "#181818";
            card_link =
                "https://cdn.discordapp.com/attachments/898236400195993622/959480090331316334/C_CARD.png";
            break;
        case "T":
            color = "#3131ac";
            card_link =
                "https://cdn.discordapp.com/attachments/1028000883092508803/1035107806174511195/T_Card.png";
            break;
        default:
            color = "#ff0000";
            card_link =
                "https://cdn.discordapp.com/attachments/898236400195993622/959480253175201862/SS_CARD.png";
    }

    const card_image = await Canvas.loadImage(card_link);
    const RM = 90;
    ctx.drawImage(image, 40, 50, 230 - RM + 15, 345 - RM + 20);
    ctx.drawImage(card_image, 0, 0, 230, 345);
    ctx.fillStyle = "white";
    if (stand.name.length === 10) {
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

export const addItem = (userData: RPGUserDataJSON, item: Item | string, amount?: number): void => {
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
    userData.coins += amount;
    if (amount < 0) return;

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
    return (item as Consumable)["effects"] !== undefined;
};

export const addHealth = function addHealth(userData: RPGUserDataJSON, amount: number): void {
    userData.health += amount;
    if (userData.health > getMaxHealth(userData)) userData.health = getMaxHealth(userData);
};

export const addStamina = function addStamina(userData: RPGUserDataJSON, amount: number): void {
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
            userData.skillPoints.perception +
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
} {
    let stamina = 0;
    let health = 0;
    let xpBoost = 0;
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
    };
};

export const capitalize = function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const fixFields = function fixFields(
    fields: { name: string; value: string; inline?: boolean }[]
): { name: string; value: string; inline?: boolean }[] {
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

    return fixedFields;
};

export const generateMessageLink = function generateMessageLink(r: Message<boolean>): string {
    return `https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`;
};
