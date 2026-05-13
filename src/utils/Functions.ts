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
    UseXCommandQuest,
    AnswerChineseNewYearQuizQuest,
    Quests,
    RPGUserQuest,
    RPGUserDataJSON,
    Stand,
    EvolutionStand,
    RPGUserEmail,
    WaitQuest,
    EquipableItem,
    Weapon,
    equipableItemTypes,
    RaidNPCQuest,
    Rarity,
    LBData,
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
    MessageActionRowComponent,
    ActionRow,
} from "discord.js";
import { Fighter, FightInfos } from "../structures/FightHandler";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Items from "../rpg/Items";
import * as BaseQuests from "../rpg/Quests/Quests";
import * as Emails from "../rpg/Emails";
import { Command } from "ioredis";
import * as Emojis from "../emojis.json";
import { get, random } from "lodash";
import Jolyne from "../structures/JolyneClient";
import { level } from "winston";
import e from "express";
import {
    chance,
    pickOne,
    randomInt,
    shuffle as randomShuffle,
    shuffleInPlace,
} from "./random";
import * as UserService from "../services/UserService";
import * as InventoryService from "../services/InventoryService";
import { EVENT_IDS, isActive } from "../services/EventService";
import { findEmail, findItem, findNPC, findQuest, findStand } from "./lookup";
import {
    generateClaimXQuest,
    generateFightQuest,
    generateUseXCommandQuest,
    pushEmail,
    pushEmailWhenCompleted,
    pushItemWhenCompleted,
    pushQuest,
    pushQuestWhenCompleted,
} from "./quest_factories";
export {
    pushEmail,
    pushEmailWhenCompleted,
    pushItemWhenCompleted,
    pushQuest,
    pushQuestWhenCompleted,
} from "./quest_factories";
export {
    buildQuestListRows,
    fieldSections,
    formatQuestListLine,
    getQuestDisplayEmoji,
    getQuestProgressText,
    getSideQuestRequirements,
    makeNPCLine,
    QUEST_LIST_ACCENT_COLOR,
    QUEST_LIST_ITEMS_PER_PAGE,
} from "./quest_ui";
import {
    isActionQuest,
    isAnswerChineseNewYearQuizQuest,
    isBaseQuest,
    isClaimItemQuest,
    isFightNPCQuest,
    isMustReadEmailQuest,
    isRaidNPCQuest,
    isStartDungeonQuest,
    isUseXCommandQuest,
    isWaitQuest,
} from "./quest_guards";
import { isEquipableItem, isWeapon } from "./item_guards";
import { plusOrMinus } from "./math";
import { getEmojiId } from "./format";
import { getMaxXp, getRewards } from "./rewards";
export {
    isActionQuest,
    isAnswerChineseNewYearQuizQuest,
    isBaseQuest,
    isClaimItemQuest,
    isFightNPCQuest,
    isMustReadEmailQuest,
    isRaidNPCQuest,
    isStartDungeonQuest,
    isUseXCommandQuest,
    isWaitQuest,
};

export const PrestigeShardReward = UserService.PrestigeShardReward;

export { generateRandomId } from "./random";
export { calculateArrayValues, getDiffPercent, plusOrMinus } from "./math";
export { isEquipableItem, isGarment, isSpecial, isWeapon } from "./item_guards";
export {
    getCurrentDate,
    hasDone4DungeonsToday,
    isTimeNext15,
    roundToNext15Minutes,
} from "./date";

export const randomArray = pickOne;

export { findQuest };

export { findEmail };

export { editNPCLevel } from "./npc";
export {
    generateActionQuest,
    generateAnswerChineseNewYearQuizQuest,
    generateClaimItemQuest,
    generateClaimXQuest,
    generateFightQuest,
    generateMustReadEmailQuest,
    generataRaidQuest,
    generateStartDungeonQuest,
    generateUseXCommandQuest,
} from "./quest_factories";

export { findStand, findNPC };

export const getSkillPointsBonus = UserService.getSkillPointsBonus;
export const getSkillPointsFromPrestige = UserService.getSkillPointsFromPrestige;
export const getBaseHealth = UserService.getBaseHealth;
export const getBaseStamina = UserService.getBaseStamina;
export const getMaxHealth = UserService.getMaxHealth;
export const getMaxHealthNoItem = UserService.getMaxHealthNoItem;
export const getMaxStaminaNoItem = UserService.getMaxStaminaNoItem;
export const getMaxStamina = UserService.getMaxStamina;
export const getDodgeScore = UserService.getDodgeScore;
export const getSpeedScore = UserService.getSpeedScore;

export { generateDiscordTimestamp } from "./format";

export { localeNumber } from "./format";
export { getMaxXp, getRewards, getTotalXp, TopGGVoteRewards } from "./rewards";

export const RNG = randomInt;

export const percent = chance;

export const getDailyQuestRowRewards = (
    quest: RPGUserQuest,
    ctx: CommandInteractionContext,
): { coins: number; xp: number } => {
    let coins = 100;
    let xp = 75;

    if (isClaimItemQuest(quest) || isClaimXQuest(quest)) {
        coins = quest.goal / 5;
        xp = quest.goal / 15;
    } else if (isFightNPCQuest(quest)) {
        const npc = Object.values(FightableNPCS).find((r) => r.id === quest.npc);
        if (npc) {
            coins = (npc.level + 1) * 100;
            xp = (npc.level + 1) * 10;
        }
    }

    xp = Math.round(xp * 1.99);
    if (
        ctx.client.patreons.find((r) => r.id === ctx.userData.id) ||
        ctx.client.boosters.find((r) => r === ctx.userData.id)
    ) {
        xp = Math.round(xp * 1.1);
    }

    return {
        coins: Math.round(coins),
        xp,
    };
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
                    : true),
        ),
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
            pushQuest(generateClaimXQuest("coin", Math.round(getRewards(level).coins * 2.5))),
        );
    /* if (level > 25)
        quests.push(pushQuest(generateClaimXQuest("xp", Math.round(getRewards(level).xp * 2.5)))); */

    return quests;
};

export const isRPGUserDataJSON = UserService.isRPGUserDataJSON;

export const actionRow = (
    components: (ButtonBuilder | StringSelectMenuBuilder)[],
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> =>
    new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>().addComponents(...components);

export const isFighter = UserService.isFighter;

export const getAttackDamages = UserService.getAttackDamages;

export const getAbilityDamage = UserService.getAbilityDamage;

export const standAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenStand?: Stand,
): APIEmbed => {
    const stand = chosenStand ? chosenStand : isFighter(user) ? user.stand : findStand(user.stand);
    if (!stand) return { title: "No stand found", description: "No stand found", color: 0xff0000 };
    const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

    const embed: APIEmbed = {
        title: stand.name,
        description:
            stand.description +
            `\n\n**BONUSES:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                stand.skillPoints,
            )
                .map(([key, value]) => `• +${value} ${key}`)
                .join("\n")}`,
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

        let content = `> 💥 **Damages:** ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                  ? Math.round(
                        getAttackDamages(user) * (1 + ability.trueDamage / 100),
                    ).toLocaleString()
                  : "???"
        }\n> 🔋 **Stamina Cost:** ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        const dodgeScore = ability.dodgeScore ?? ability.trueDodgeScore;
        content += `\n> ⏳ **Cooldown:** ${cooldown} turns\n> 🍃 **Dodge Score:** ${
            dodgeScore ? dodgeScore : dodgeScore
        }\n> \n> *${ability.description.replace(/{standName}/gi, stand.name)}*\n`;

        if (ability.special || isLast) content += "";
        else content += "";

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
                passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n"),
            inline: false,
        });
    }

    return embed;
};

export { getEmojiId } from "./format";


export const weaponAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenWeapon?: string,
): APIEmbed => {
    const weapon = chosenWeapon
        ? findItem<Weapon>(chosenWeapon, true)
        : isFighter(user)
          ? user.weapon
          : findItem<Weapon>(
                Object.keys(user.equippedItems).find(
                    (r) => user.equippedItems[r] === equipableItemTypes.WEAPON,
                ),
            );
    if (!weapon)
        return {
            title: "No weapon found",
            description: "No weapon found",
            color: 0xff0000,
        };

    const totalWeaponSkillPoints = Object.values(weapon.effects.skillPoints).reduce(
        (a, b) => a + b,
        0,
    );

    const embed: APIEmbed = {
        title: weapon.name,
        description:
            weapon.description +
            `\n\n**BONUSES:** +${totalWeaponSkillPoints} skill-points:\n${Object.entries(
                weapon.effects.skillPoints,
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
        const index = weapon.abilities.findIndex((w) => w.name === ability.name);
        const isLast = index === weapon.abilities.length - 1;
        let content = `> 💥 **Damages:** ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                  ? Math.round(
                        getAttackDamages(user) * (1 + ability.trueDamage / 100),
                    ).toLocaleString()
                  : "???"
        }\n> 🔋 **Stamina Cost:** ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        content += `\n> ⏳ **Cooldown:** ${cooldown} turns\n> 🍃 **Dodge Score:** ${
            ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable"
        }\n> \n> *${ability.description.replace(/{weaponName}/gi, weapon.name)}*\n`;

        if (ability.special || isLast) content += "";
        else content += "";

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
                passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n"),
            inline: false,
        });
    }

    return embed;
};

export const getRawSkillPointsLeft = UserService.getRawSkillPointsLeft;

export const skillPointsIsOK = UserService.skillPointsIsOK;

export const generateSkillPoints = UserService.generateSkillPoints;

export const generateSkillPointsByBuild = UserService.generateSkillPointsByBuild;

export const getTotalSkillPoints = UserService.getTotalSkillPoints;

export const getSkillPointsBuild = UserService.getSkillPointsBuild;

export const shuffleArray = shuffleInPlace;

export const randomNumber = randomInt;


export const isClaimXQuest = UserService.isClaimXQuest;

export { findItem };

export { romanize } from "./format";

export { sleep } from "./format";

export { generateStandCart } from "./images";

export const addItem = InventoryService.addItem;

export const removeItem = InventoryService.removeItem;

export const addCoins = UserService.addCoins;

export const addPrestigeShards = UserService.addPrestigeShards;

export const addSocialCredits = UserService.addSocialCredits;

export const addXp = UserService.addXp;

export const addEmail = UserService.addEmail;

export const addStandDisc = UserService.addStandDisc;

export { s } from "./format";


export { generateWaitQuest } from "./quest_factories";

export const isConsumable = InventoryService.isConsumable;

export const addHealth = UserService.addHealth;

export const addStamina = UserService.addStamina;

export const standPrices = {
    SS: 200000,
    S: 50000,
    A: 25000,
    B: 10000,
    C: 5000,
    T: 69696,
};

export { makeNPCString } from "./format";

export const userIsCommunityBanned = UserService.userIsCommunityBanned;

export const calcEquipableItemsBonus = UserService.calcEquipableItemsBonus;

export { capitalize } from "./format";

export {
    disableComponents,
    disableRows,
    fixEmbeds,
    fixFields,
    makeEmbedReds,
    redEmbeds,
    splitEmbedIfExceedsLimit,
} from "./embed";

export { generateMessageLink } from "./format";

export const calcStandDiscLimit = InventoryService.calcStandDiscLimit;

export const shuffle = randomShuffle;

export { getBlackMarketString, getTodayString } from "./format";

export const hasExceedStandLimit = InventoryService.hasExceedStandLimit;

export { msToString } from "./format";

export { isEvolvableStand } from "./stand";

export const getRewardsCompareData = (data1: RPGUserDataJSON, data2: RPGUserDataJSON): string[] => {
    const rewards: string[] = [];

    if (data1.xp !== data2.xp)
        rewards.push(
            `**${plusOrMinus(data1.xp, data2.xp)}${Math.abs(data1.xp - data2.xp).toLocaleString(
                "en-US",
            )}** XP ${Emojis.xp} ${
                isActive(EVENT_IDS.CHRISTMAS_2024) && isWeekend()
                    ? "(christmas event [Week-End]: +25%)"
                    : ""
            }${isActive(EVENT_IDS.THIRD_ANNIVERSARY) ? "(3rd anniversary event: +15%)" : ""}`,
        );
    if (data1.coins !== data2.coins)
        rewards.push(
            `**${plusOrMinus(data1.coins, data2.coins)}${Math.abs(
                data1.coins - data2.coins,
            ).toLocaleString()}** ${Emojis.jocoins}`,
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
                        data2.inventory[item] || 0,
                    )}${Math.abs(
                        (data1.inventory[item] || 0) - (data2.inventory[item] || 0),
                    ).toLocaleString()}** ${findItem(item).emoji} ${findItem(item).name}`,
                );
        }
    }

    if (data1.health !== data2.health)
        rewards.push(
            `**${plusOrMinus(data1.health, data2.health)}${Math.abs(
                data1.health - data2.health,
            ).toLocaleString()}** health :heart: (${data2.health.toLocaleString(
                "en-US",
            )}/${getMaxHealth(data2).toLocaleString()})`,
        );
    if (data1.stamina !== data2.stamina)
        rewards.push(
            `**${plusOrMinus(data1.stamina, data2.stamina)}${Math.abs(
                data1.stamina - data2.stamina,
            ).toLocaleString()}** :battery: (${data2.stamina.toLocaleString("en-US")}/${getMaxStamina(
                data2,
            ).toLocaleString()})`,
        );

    return rewards;
};

export const givePatreonRewards = InventoryService.givePatreonRewards;

// daily claim rewards for christmas

interface DailyClaimRewardsXMas {
    coins: number;
    xp: number;
    items?: {
        [item: string]: number;
    };
}

export const dailyClaimRewardsChristmas = (
    level: number,
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

export const addHealthOrStamina = InventoryService.addHealthOrStamina;

export const useConsumableItem = InventoryService.useConsumableItem;

export { isEvolutionStand } from "./stand";

export const getCurrentStand = UserService.getCurrentStand;

UserService.configureUserService({
    findNPC,
    findStand,
    findEquipableItem: (item) => findItem<EquipableItem>(item),
    findEmail,
});

InventoryService.configureInventoryService({
    findItem,
    countStandsByRarity: (rarity) =>
        Object.values(Stands.Stands).filter((x) => x.rarity === rarity).length,
});

export { fixNpcRewards } from "./npc";

export { getStandEvolution, getRandomStand, getRandomWeapon } from "./stand";

export const hasVotedRecenty = UserService.hasVotedRecenty;

export { getProminentColor } from "./images";

// 'T̷̗̗̜̩̍̔̌͐̓͑͝Ì̴͉̖̝M̵̛̤̟̖͚̀͂̎͝Ḛ̶̮͉̉́͑͆͒̈̀̀̊̈́ ̵̢̢̮͖̘̱͈͖̯͗ͅS̷̢̭̯̭̬͎̙̼̯̿̐͂̇̍̎͆T̵̻͖͈̭͇̟̯̗̐͆̆̑̊̃͋́͘͝O̴̢̦̗̪̮̐̉̌̀̅͝͠͠͝Ṕ̶̧̰̦͛͂̚' to 'TIME STOP'

export { removeZalgo } from "./format";

export const getHealthEffect = UserService.getHealthEffect;

export const getStaminaEffect = UserService.getStaminaEffect;

export const fixUserSettings = UserService.fixUserSettings;

export const getMaxPrestigeLevel = UserService.getMaxPrestigeLevel;

export const prestigeUser = UserService.prestigeUser;

export const prestigeUserMethod2 = UserService.prestigeUserMethod2;

export const getWeapon = UserService.getWeapon;

export const getRPGUserDataChanges = UserService.getRPGUserDataChanges;

export const isWeekend = UserService.isWeekend;

export const userMeetsRequirementsForItem = UserService.userMeetsRequirementsForItem;

export const getTrueLevel = UserService.getTrueLevel;

export const calculateUserPower = UserService.calculateUserPower;

export const hasReachedMaxLevel = UserService.hasReachedMaxLevel;
