import type { User, Message, AutocompleteInteraction } from "discord.js";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import JolyneClient from "../structures/JolyneClient";
import { LocaleString, ApplicationCommandOptionType } from "discord-api-types/v10";
import { FightHandler, Fighter } from "../structures/FightHandler";

export type numOrPerc = number | `${number}%`;

export interface DJSMessage extends Message {
    client: JolyneClient;
}

/**
 * Disord Slash Command Data.
 */
export interface DiscordSlashCommandsData {
    name: string;
    name_localizations?: {
        [key in LocaleString]?: string;
    };
    description: string;
    description_localizations?: {
        [key in LocaleString]?: string;
    };
    autocomplete?: boolean;
    required?: boolean;
    type?: ApplicationCommandOptionType;
    options?: DiscordSlashCommandsData[];
    choices?: {
        name: string;
        value: string;
    }[];
}

export type itemPrize = { [key: Item["id"]]: number };

export interface SlashCommandFile {
    cooldown?: number;
    rpgCooldown?: {
        base: number;
        patronCd?: {
            [tier: number]: number;
        };
    };
    ownerOnly?: boolean;
    adminOnly?: boolean;
    checkRPGCooldown?: string;
    data: DiscordSlashCommandsData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: (ctx: CommandInteractionContext, ...args: any) => Promise<any>;
    autoComplete?: (
        interaction: AutocompleteInteraction & { client: JolyneClient },
        userData: RPGUserDataJSON,
        currentInput: string, // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<any>;
}

export interface SlashCommand extends SlashCommandFile {
    category: "private" | "rpg" | "utils";
    path: string;
}

export interface EventFile {
    /**
     * The name of the event.
     */
    name: string;
    /**
     * If this event must be called only once.
     */
    once?: boolean;
    /**
     * The function that will be called when the event is triggered.
     * @param args The arguments passed by the event.
     * @returns void
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(...args: any): void;
}

export type i18n_key =
    | "de-DE"
    | "en-US"
    | "es-ES"
    | "fr-FR"
    | "it-IT"
    | "ja-JP"
    | "ko-KR"
    | "pt-BR"
    | "ru-RU"
    | "zh-CN"
    | "zh-TW";
export type Rarity = "C" | "B" | "A" | "S" | "SS" | "T";

/**
 * UserData redis hash interface
 */

export interface RPGUserDataHash {
    /**
     * The user's ID.
     */
    id: string;
    /**
     * The user's tag.
     * @example "User#0000"
     */
    tag: User["tag"];
    /**
     * The user's level.
     */
    level: number;
    /**
     * The user's health.
     */
    health: number;
    /**
     * The user's stamina.
     */
    stamina: number;
    /**
     * The user's experience.
     */
    xp: number;
    /**
     * The user's coins.
     */
    coins: number;
    /**
     * The user's preferred language.
     */
    language: i18n_key;
    /*
     * The user's stand.
     */
    stand: string;
    /**
     * The unix timestamp of when the user started their adventure.
     */
    adventureStartedAt: number;
}

/**
 * UserData skillPoints redis hash interface
 */
export interface SkillPoints {
    defense: number;
    strength: number;
    speed: number;
    perception: number;
    stamina: number;
}

/**
 * UserData chapterQuests redis hash interface
 */
export interface RPGUserDataChapterQuestsHash {
    /**
     * Chapter quest ID
     */
    id: number;
    /**
     * Chapter quests (the result is a JSON string!)
     */
    quests: string;
}

/**
 * UserData inventory redis hash interface
 */
export interface RPGUserDataInventoryHash {
    [key: Item["id"]]: number;
}

/**
 * UserData sideQuests redis hash interface
 */
export interface RPGUserDataSideQuestsHash {
    /**
     * Side quest ID (the result is a JSON string!)
     */
    [key: string]: string;
}

/**
 * UserData redis hash interface
 */

export interface RPGUserDataJSON {
    /**
     * The user's ID.
     */
    id: string;
    /**
     * The user's tag.
     * @example "User#0000"
     */
    tag: User["tag"];
    /**
     * The user's level.
     */
    level: number;
    /**
     * The user's health.
     */
    health: number;
    /**
     * The user's stamina.
     */
    stamina: number;
    /**
     * The user's experience.
     */
    xp: number;
    /**
     * The user's coins.
     */
    coins: number;
    /**
     * The user's preferred language.
     */
    language: i18n_key;
    /**
     * The user's stand.
     */
    stand: string;
    /**
     * The user's chapter info.
     */
    chapter: {
        id: number;
        quests: RPGUserQuest[];
    };
    /**
     * The user's daily info.
     */
    daily: {
        claimStreak: number;
        lastClaimed: number;
        quests: RPGUserQuest[];
        questsStreak: number;
    };
    /**
     * The user's side quests.
     */
    sideQuests: {
        id: SideQuest["id"];
        quests: RPGUserQuest[];
        claimedPrize?: boolean;
    }[];
    /**
     * The user's skill points.
     */
    skillPoints: SkillPoints;
    /**
     * The user's inventory.
     */
    inventory: {
        [key: Item["id"]]: number;
    };
    /**
     * The user's emails.
     */
    emails: RPGUserEmail[];
    voteHistory: {
        total: number;
        [key: string]: number;
    };
    standsEvolved: {
        [key: Stand["id"]]: number;
    };
    /**
     * The unix timestamp of when the user started their adventure.
     */
    adventureStartedAt: string;
}

export interface ReminderJSON {
    author: RPGUserDataJSON["id"];
    reminder: string;
    reminderAt: number;
}

export interface SideQuest {
    /**
     * The side quest's ID.
     */
    id: string;
    /**
     * The side quest's title.
     */
    title: string;
    /**
     * The side quest's description.
     */
    description: string;
    /**
     * The side quest's quests.
     */
    quests: QuestArray;
    /**
     * The side quest's rewards.
     */
    rewards: Rewards;
    /**
     * The side quest's requirements.
     */
    requirements: Requirements;
}

/*
export interface Rewards {
    xp?: number;
    coins?: number;
    items?: Item[];
    stand?: Stand["id"];
}*/

export interface Requirements {
    level?: number;
    stand?: Stand["id"];
    chapter?: number;
}

export interface ConsumableEffects {
    health?: numOrPerc;
    stamina?: numOrPerc;
    items?: itemPrize;
}

/**
 * Item interface
 */
export interface Item {
    /**
     * The item's ID.
     */
    readonly id: string;
    /**
     * The item's name.
     */
    readonly name: string;
    /**
     * The item's description.
     */
    readonly description: string;
    /**
     * The item's rarity
     */
    readonly rarity: "C" | "B" | "A" | "S" | "SS" | "T";
    /**
     * The item's price.
     */
    readonly price?: number;
    /**
     * If the item is tradable.
     */
    readonly tradable: boolean;
    /**
     * If the item is storable.
     */
    readonly storable: boolean;
    /**
     * The item's emoji.
     */
    readonly emoji: string;
    /**
     * If the item is craftable, so its requirements.
     */
    readonly craft?: CraftRequirements;
}

/**
 * Garment interface
 */
export interface Garment extends Item {
    skillPoints: SkillPoints;
}

/**
 * Consumable items interface
 */
export interface Consumable extends Item {
    effects: ConsumableEffects;
}

/**
 * Special items interface
 */
export interface Special extends Item {
    /**
     * Function to use the item
     */
    use: (ctx: CommandInteractionContext, ...args: string[]) => Promise<boolean>;
}

export type CraftRequirements = {
    items: {
        id: Item["id"];
        amount: number;
    }[];
    coins?: number;
    level?: number;
};

/**
 * Scroll craft interface
 */
export interface ScrollCraft extends Item {
    requirements: CraftRequirements;
}

/**
 * NPC
 */
export interface NPC {
    /**
     * The NPC's ID.
     */
    id: string;
    /**
     * The NPC's name.
     */
    name: string;
    /**
     * The NPC's email adress.
     */
    email?: string;
    /**
     * Emoji that represents the NPC.
     */
    emoji: string;
    /**
     * Image that represents the NPC.
     */
    avatarURL?: string;
}

export interface FightableNPC extends NPC {
    /**
     * The NPC's level
     */
    level: number;
    /**
     * The NPC's skill points.
     */
    skillPoints: SkillPoints;
    /**
     * The NPC's stand.
     */
    stand?: string;
    /**
     * The NPC's rewards.
     */
    rewards?: Rewards;
    dialogues?: {
        win?: string;
        lose?: string;
        raid?: string;
    };
}

/**
export class FightableNPC implements FightableNPC {
	constructor(options: FightableNPC) {
		this.id = options.id;
		this.name = options.name;
		this.email = options.email;
		this.emoji = options.emoji;
		this.avatarURL = options.avatarURL;
		this.level = options.level;
		this.skill_points = options.skill_points;
		this.stand = options.stand;
	}
}
*/

/**
 * Stand interface
 */
export interface Stand {
    /**
     * The stand's ID.
     */
    id: string;
    /**
     * The stand's name.
     */
    name: string;
    /**
     * The stand's description.
     */
    description: string;
    /**
     * The stand's rarity
     */
    rarity: Rarity;
    image: string;
    /**
     * The stand's emoji.
     */
    emoji: string;
    /**
     * the stand's abilities
     */
    abilities: Ability[];
    /**
     * The stand's skill points bonuses.
     */
    skillPoints: SkillPoints;
    /**
     * If the stand has a custom attack
     */
    customAttack?: {
        name: string;
        emoji: string;
        multiplier?: number;
        cooldown?: {
            cd: number;
            fightLogs: Ability["useMessage"];
        };
    };
    color: number;
    /**
     * If the stand is available.
     */
    available: boolean;
}

/**
 * Ability interface
 */
export interface Ability {
    /**
     * The ability's name.
     */
    name: string;
    /**
     * The ability's description.
     */
    description: string;
    /**
     * What it writes when the ability is used (turn log).
     * @param {Fighter} user The user who used the ability.
     * @param {Fighter} target The target of the ability.
     * @param {number} damage The damage dealt by the ability.
     */
    useMessage?: (
        user: Fighter,
        target: Fighter,
        damage: number,
        ctx: FightHandler
    ) => string | void;

    /**
     * The ability's cooldown (in turns).
     */
    cooldown: number;
    /**
     * If the ability gives extra turns to the user (and how much) after being used.
     */
    extraTurns: number;
    extraTurnsIfGB?: number;
    /**
     * The ability's base damage.
     */
    damage: number;
    /**
     * If the ability is dodgeable.
     */
    dodgeable: boolean;
    /**
     * If the ability is blockable.
     */
    blockable: boolean;
    /**
     * If the ability's stamina usage.
     */
    stamina: number;
    special?: boolean;
}

export interface RequiemStand extends Stand {
    /**
     * The stand's base stand.
     */
    base_stand: Stand;
}

export interface Evolutions
    extends Omit<
        Stand,
        "image" | "emoji" | "customAttack" | "color" | "available" | "id" | "description"
    > {
    tier: number;
}

export interface EvolutionStand extends Stand {
    /**
     * The stand's evolution level.
     */
    evolutions: Evolutions[];
}

export type itemRewards = {
    item: Item["id"];
    amount: number;
    chance?: number;
}[];

// I don't have the faith to continue commenting everything...
export interface Quest {
    /**
     * The quest's ID.
     */
    id: string;
    completed: (user: RPGUserDataJSON) => number;
    i18n_key?: string;
    pushQuestWhenCompleted?: RPGUserQuest;
    pushEmailWhenCompleted?: {
        timeout?: number;
        mustRead?: boolean;
        email: string; // Email["id"];
    };
    pushItemWhenCompleted?: itemRewards;
    emoji: string;
    hintCommand?: string;
}
/**
 * MustReadEmailQuest interface
 * @description A quest that must be completed by reading an email.
 * @note Not initialized in /src/database/rpg/Quests, but automatically when a user completes a quest that has the pushEmailWhenCompleted?.mustRead property.
 */
export interface MustReadEmailQuest
    extends Omit<Quest, "completed" | "i18n_key" | "emoji" | "hintCommand"> {
    completed: boolean;
    email: string; // Email["id"];
}

export interface ActionQuest extends Omit<Quest, "completed" | "hintCommand"> {
    completed: boolean;
    use: (ctx: CommandInteractionContext) => Promise<void>;
}

export interface FightNPCQuest
    extends Omit<Quest, "completed" | "i18n_key" | "emoji" | "hintCommand"> {
    completed: boolean;
    npc: NPC["id"];
}

export interface ClaimXQuest
    extends Omit<Quest, "completed" | "i18n_key" | "emoji" | "hintCommand"> {
    x: "coin" | "xp" | "daily";
    amount: number;
    goal: number;
}

export interface ClaimItemQuest extends Omit<ClaimXQuest, "x" | "hintCommand"> {
    item: Item["id"];
}

export interface UseXCommandQuest extends Omit<ClaimXQuest, "x" | "hintCommand"> {
    command: string;
}

export interface WaitQuest extends Omit<Quest, "completed" | "emoji" | "hintCommand"> {
    end: number; // Date.now() + ms
    email?: Email["id"];
    quest?: Quest["id"];
    claimed?: boolean;
}

export interface Action {
    id: string;
    execute: (ctx: CommandInteractionContext) => Promise<boolean>;
}

export type Quests =
    | Quest
    | MustReadEmailQuest
    | ActionQuest
    | FightNPCQuest
    | ClaimXQuest
    | ClaimItemQuest
    | WaitQuest
    | UseXCommandQuest;
export type QuestArray = Quests[];

export type RPGUserQuest = Omit<
    | Omit<Quest, "completed">
    | MustReadEmailQuest
    | ActionQuest
    | FightNPCQuest
    | ClaimXQuest
    | ClaimItemQuest
    | WaitQuest
    | UseXCommandQuest,
    "i18n_key"
> & {
    completed?: boolean;
    npc?: NPC["id"];
};

export interface Chapter {
    /**
     * The chapter's ID.
     */
    id: number;
    /**
     * The chapter's description
     */
    description: {
        [key in i18n_key]?: string;
    };
    /**
     * The chapter's title
     */
    title: {
        [key in i18n_key]?: string;
    };
    /**
     * Dialogs for the chapter
     */
    dialogs?: {
        [key in i18n_key]?: string[];
    };
    /**
     * The mail's rewards (when completed)
     */
    rewardsWhenComplete?: {
        coins: number;
        email: string;
        items: itemRewards;
    };
    /**
     * The chapter's quests
     */
    quests: QuestArray;
    private?: boolean;
}

export interface Email {
    /**
     * The email's ID.
     */
    id: string;
    /**
     * The email's author.
     */
    author: NPC;
    /**
     * The email's subject.
     */
    subject: string;
    /**
     * The email's content.
     */
    content: string;
    /**
     * The email's image.
     */
    image?: string;
    /**
     * The email's footer
     */
    footer?: string;
    /**
     * The email's rewards.
     */
    emoji?: string;
    rewards?: {
        coins?: number;
        items?: itemRewards;
    };
    chapterQuests?: QuestArray;
}

export interface RPGUserEmail {
    id: Email["id"];
    read: number | false; // timestamp
    archived: boolean;
    date: number;
    //claimedRewards?: boolean;
}
export interface ChapterPart extends Omit<Chapter, "title"> {
    title?: Chapter["title"];
    /**
     * The part's parent.
     */
    parent: Chapter;
}

export type ChapterArray = (Chapter | ChapterPart)[];

export interface RPGUserDataEmailsHash {
    id: Email["id"];
    read: boolean;
    date: number;
    archived: boolean;
}

export interface Leaderboard {
    lastUpdated: number;
    data: {
        id: string;
        tag: string;
        level: number;
        xp: number;
        coins: number;
    }[];
}

export interface Shop {
    owner?: NPC;
    emoji?: string;
    name: string;
    items: {
        item: Item["id"];
        price?: number; // If not specified, the item's price will be used.
    }[];
}

export interface Passive {
    name: string;

    description: string;

    cooldown: number;

    execute: (ctx: CommandInteractionContext) => Promise<void>;
}

export interface Rewards {
    coins?: number;
    items?: itemRewards;
    xp?: number;
}

export interface RaidBoss {
    boss: FightableNPC;
    minions: FightableNPC[];
    baseRewards: Rewards;
    level: number;
    maxPlayers: number;
}
