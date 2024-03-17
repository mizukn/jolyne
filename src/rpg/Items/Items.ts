import { Item } from "../../@types";
import * as Emojis from "../../emojis.json";

// list of useless items
export const Diamond: Item = {
    id: "diamond",
    name: "Diamond",
    description: "A very shiny diamond.. (What if you sell it?)",
    rarity: "B",
    emoji: "💎",
    price: 20000,
    tradable: true,
    storable: true,
};

export const YellowHair: Item = {
    id: "yellow_hair",
    name: "Yellow Hair",
    description:
        "DIO's hair. Was available if you completed Chapter 1 of the story in the legacy version of the RPG (v1, v2).",
    rarity: "C",
    emoji: Emojis.dio,
    price: 100,
    tradable: true,
    storable: false,
};
//item drop for crafting
export const Diobone: Item = {
    id: "dio_bone",
    name: "Dio's Bone",
    description:
        "DIO's bone acquired by chance after an incredible fight with the vampire himself. It's said this bone contains something powerful.",
    rarity: "SS",
    emoji: Emojis.dio,
    price: 72700,
    tradable: true,
    storable: true,
};
// rare item used for quest
export const Greenbaby: Item = {
    id: "green_baby",
    name: "Green Baby",
    description:
        "What the hell is up with this green skinned child. Did it seriously just come from a bone? Pretty bizarre, wouldn't you say?",
    rarity: "SS",
    emoji: Emojis.greenbaby,
    price: 702070,
    tradable: true,
    storable: true,
};

export const AncientScroll: Item = {
    id: "ancient_scroll",
    name: "Ancient Scroll",
    description: "A very old scroll of ancient information..",
    rarity: "B",
    emoji: "📜",
    price: 2000,
    tradable: true,
    storable: true,
};

export const BrokenArrow: Item = {
    id: "broken_arrow",
    name: "Broken Arrow",
    description:
        "An arrow that has been broken. If you get some of these, you can craft a Stand Arrow.",
    rarity: "B",
    emoji: Emojis.mysterious_arrow,
    price: Math.round(35000 / 5),
    tradable: true,
    storable: true,
};

export const String: Item = {
    id: "string",
    name: "String",
    description: "String. A yarn of string. What do you expect?",
    rarity: "B",
    emoji: Emojis.string,
    price: 5000,
    tradable: true,
    storable: true,
};

export const BlueCloth: Item = {
    id: "blue_cloth",
    name: "Blue Cloth",
    description: "A piece of blue cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.blue_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const RedCloth: Item = {
    id: "red_cloth",
    name: "Red Cloth",
    description: "A piece of red cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.red_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const GreenCloth: Item = {
    id: "green_cloth",
    name: "Green Cloth",
    description: "A piece of green cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.green_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const YellowCloth: Item = {
    id: "yellow_cloth",
    name: "Yellow Cloth",
    description: "A piece of yellow cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.yellow_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const PurpleCloth: Item = {
    id: "purple_cloth",
    name: "Purple Cloth",
    description: "A piece of purple cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.purple_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const OrangeCloth: Item = {
    id: "orange_cloth",
    name: "Orange Cloth",
    description: "A piece of orange cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.orange_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const WhiteCloth: Item = {
    id: "white_cloth",
    name: "White Cloth",
    description: "A piece of white cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.white_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const BlackCloth: Item = {
    id: "black_cloth",
    name: "Black Cloth",
    description: "A piece of black cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.black_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const BrownCloth: Item = {
    id: "brown_cloth",
    name: "Brown Cloth",
    description: "A piece of brown cloth. Used for crafting.",
    rarity: "C",
    emoji: Emojis.brown_cloth,
    price: 2500,
    tradable: true,
    storable: true,
};

export const SteelBall: Item = {
    id: "steel_ball",
    name: "Steel Ball",
    description: "A steel ball...",
    rarity: "A",
    emoji: Emojis.steel_ball,
    price: 10000,
    tradable: true,
    storable: true,
};

export const SpookySoul: Item = {
    id: "spooky_soul",
    name: "Spooky Soul",
    description: "A spooky soul. Was available during the Halloween Event 2023.",
    rarity: "T",
    emoji: Emojis.spooky_soul,
    price: 1000,
    tradable: true,
    storable: true,
};

export const IronIngot: Item = {
    id: "iron_ingot",
    name: "Iron Ingot",
    description: "An iron ingot.",
    rarity: "A",
    emoji: Emojis.iron_ingot,
    price: 15000,
    tradable: true,
    storable: true,
};

export const Wood: Item = {
    id: "wood",
    name: "Wood",
    description: "A piece of Wood.",
    rarity: "B",
    emoji: "🪵",
    price: 5000,
    tradable: true,
    storable: true,
};

export const CorruptedSoul: Item = {
    id: "corrupted_soul",
    name: "Corrupted Soul",
    description: "A corrupted soul.",
    rarity: "SS",
    emoji: Emojis.corrupted_soul,
    price: 100000,
    tradable: true,
    storable: true,
};

export const DungeonKey: Item = {
    id: "dungeon_key",
    name: "Dungeon Key",
    description: "A key to a dungeon.",
    rarity: "A",
    emoji: "<:dungeon_key:1218578509363150969>",
    price: 1000000,
    tradable: true,
    storable: true,
};
