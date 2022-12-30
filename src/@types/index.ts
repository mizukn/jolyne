import type { User, Message } from "discord.js";
import JolyneClient from "../structures/JolyneClient";

export interface DJSMessage extends Message {
	client: JolyneClient;
}

/**
 * Disord Slash Command Data.
 */
export interface DiscordSlashCommandsData {
	name: string;
	description: string;
	autocomplete?: boolean;
	required?: boolean;
	type?: 1 | 2 | 3 | 4 | 5 | 6;
	options?: DiscordSlashCommandsData[];
	choices?: {
		name: string;
		value: string;
	}[];
}

/**
 * A CommandInteraction object used to create Discord Slash Commands.
 */
export interface SlashCommand {
	/**
	 * The name of the command.
	 */
	name: string;
	/**
	 * The cooldown of the command.
	 */
	cooldown: number;
	/**
	 * The cooldown of the command (RPG).
	 */
	rpgCooldown?: {
		base: number;
		patron?: {
			[key: number]: number;
		};
		i18n: string;
		emoji: string;
	};
	/**
	 * The category of the command.
	 */
	category: "adventure" | "utils" | "others" | "admin" | "owner";
	/**
	 * The examples of the command.
	 */
	examples?: string[];
	/**
	 * The data as SlashCommandBuilder.
	 */
	data: DiscordSlashCommandsData;
	/**
	 * If the command is private (not meant to show up in the help command)
	 */
	isPrivate?: boolean;
	/**
	 * This is the function that will be called when the command is executed.
	 * @param Interaction The CommandInteraction object from the interactionCreate event.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	execute: (...args: any) => void;
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
export interface ConsumableEffects {
	health?: number;
	stamina?: number;
	items?: Item[];
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
	 * Function to use the item
	 */
	// readonly use?: (ctx: CommandInteractionContext, userData: UserData, skip?: boolean, left?: number) => Promise<any>;
}

/**
 * Garment interface
 */
export interface Garment extends Item {
	skill_points: SkillPoints;
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	use: (...args: any) => Promise<any>;
}

/**
 * Scroll craft interface
 */
export interface ScrollCraft extends Item {
	requirements: {
		level: number;
	};
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
	email: string;
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
	skill_points: SkillPoints;
	/**
	 * The NPC's stand.
	 */
	stand: string;
}

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
	skill_points: SkillPoints;
	/**
	 * If the stand is private.
	 */
	private: boolean;
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
	 * The ability's cooldown (in turns).
	 */
	cooldown: number;
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
}

export interface RequiemStand extends Stand {
	/**
	 * The stand's base stand.
	 */
	base_stand: Stand;
}

// I don't have the faith to continue commenting everything...
export interface Quest {
	/**
	 * The quest's ID.
	 */
	id: string;
	completed: boolean;
	i18n_key?: string;
	pushQuestWhenCompleted?: Quest["id"];
	pushEmailWhenCompleted?: {
		timeout?: number;
		mustRead?: boolean;
		email: string; // Email["id"];
	};
}
/**
 * MustReadEmail interface
 * @description A quest that must be completed by reading an email.
 * @note Not initialized in /src/database/rpg/Quests, but automatically when a user completes a quest that has the pushEmailWhenCompleted?.mustRead property.
 */
export interface MustReadEmail extends Quest {
	email: string; // Email["id"];
}

export interface ActionQuest extends Quest {
	actionId: string; // Action["id"];
}

export interface FightNPCQuest extends Quest {
	npc: NPC["id"];
}

export type QuestArray = (
	| Quest
	| MustReadEmail
	| ActionQuest
	| FightNPCQuest
)[];
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
	 * Hints for the chapter
	 */
	hints: {
		[key in i18n_key]?: string[];
	};
	/**
	 * Dialogs for the chapter
	 */
	dialogs: {
		[key in i18n_key]?: string[];
	};
	/**
	 * The mail's rewards (when completed)
	 */
	rewardsWhenComplete: {
		coins: number;
		email: string;
		items: Item[];
	};
	/**
	 * The chapter's quests
	 */
	quests: QuestArray;
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
	rewards?: {
		coins?: number;
		items?: Item[];
	};
	chapterQuests?: QuestArray;
}

export interface Part extends Chapter {
	/**
	 * The part's parent.
	 */
	parent: Chapter;
}

export type ChapterArray = (Chapter | Part)[];

export interface RPGUserDataEmailsHash {
	id: Email["id"];
	read: boolean;
	date: number;
	archived: boolean;
}
export const isGarment = (item: Item): item is Garment => {
	return (item as Garment).skill_points !== undefined;
};
