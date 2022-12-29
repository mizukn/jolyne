import { User } from 'discord.js';

/**
 * Disord Slash Command Data.
 */
export interface DiscordSlashCommandsData {

  name: string,
  description: string,
  autocomplete?: boolean,
  required?: boolean,
  type?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    options?: DiscordSlashCommandsData[]
    choices?: {
      name: string,
      value: string
    }[]
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
      base: number,
      patron?: {
        [key: number]: number
      },
      i18n: string,
      emoji: string
    }
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

export type i18n_key = "de-DE" | "en-US" | "es-ES" | "fr-FR" | "it-IT" | "ja-JP" | "ko-KR" | "pt-BR" | "ru-RU" | "zh-CN" | "zh-TW";
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

export interface ItemBenefits {
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
  stamina?: `${number}%` | number;
  health?: `${number}%` | number;
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
  }
}

export const isGarment = (item: Item): item is Garment => {
  return (item as Garment).skill_points !== undefined;
};
