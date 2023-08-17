import { Item } from "../../@types";
import * as Emojis from "../../emojis.json";

// list of useless items
export const Diamond: Item = {
    id: "diamond",
    name: "Diamond",
    description: "A diamond. It's very shiny.",
    rarity: "B",
    emoji: "💎",
    price: 100,
    tradable: true,
    storable: true
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
    storable: false
};

export const AncientScroll: Item = {
    id: "ancient_scroll",
    name: "Ancient Scroll",
    description: "An ancient scroll. It's very old.",
    rarity: "B",
    emoji: "📜",
    price: 2000,
    tradable: true,
    storable: true
};

export const BrokenArrow: Item = {
    id: "broken_arrow",
    name: "Broken Arrow",
    description: "An arrow that has been broken. If you get some of these, you can craft a Stand Arrow.",
    rarity: "B",
    emoji: Emojis.mysterious_arrow,
    price: Math.round(35000 / 5),
    tradable: true,
    storable: true
};

export const String: Item = {
    id: "string",
    name: "String",
    description: "string. . . . .  | | l l I I",
    rarity: "B",
    emoji: "<:emoji_178:1138099413055709275>",
    price: 5000,
    tradable: true,
    storable: true
};

export const BlueCloth: Item = {
    id: "blue_cloth",
    name: "Blue Cloth",
    description: "A piece of blue cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:blue_cloth:1138103715363045437>",
    price: 2500,
    tradable: true,
    storable: true
};

export const RedCloth: Item = {
    id: "red_cloth",
    name: "Red Cloth",
    description: "A piece of red cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:red_cloth:1138103728851927092>",
    price: 2500,
    tradable: true,
    storable: true
};

export const GreenCloth: Item = {
    id: "green_cloth",
    name: "Green Cloth",
    description: "A piece of green cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:green_cloth:1138103716814266430>",
    price: 2500,
    tradable: true,
    storable: true
};

export const YellowCloth: Item = {
    id: "yellow_cloth",
    name: "Yellow Cloth",
    description: "A piece of yellow cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:yellow_cloth:1138103734581346443>",
    price: 2500,
    tradable: true,
    storable: true
};

export const PurpleCloth: Item = {
    id: "purple_cloth",
    name: "Purple Cloth",
    description: "A piece of purple cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:purple_cloth:1138103722149412875>",
    price: 2500,
    tradable: true,
    storable: true
};

export const OrangeCloth: Item = {
    id: "orange_cloth",
    name: "Orange Cloth",
    description: "A piece of orange cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:orange_cloth:1138103720245211136>",
    price: 2500,
    tradable: true,
    storable: true
};

export const WhiteCloth: Item = {
    id: "white_cloth",
    name: "White Cloth",
    description: "A piece of white cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:white_cloth:1138103731456593942>",
    price: 2500,
    tradable: true,
    storable: true
};

export const BlackCloth: Item = {
    id: "black_cloth",
    name: "Black Cloth",
    description: "A piece of black cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:black_cloth:1138103711831425105>",
    price: 2500,
    tradable: true,
    storable: true
};

export const BrownCloth: Item = {
    id: "brown_cloth",
    name: "Brown Cloth",
    description: "A piece of brown cloth. Used for crafting.",
    rarity: "C",
    emoji: "<:brown_cloth:1138105263417737246>",
    price: 2500,
    tradable: true,
    storable: true
};

export const SteelBall: Item = {
    id: "steel_ball",
    name: "Steel Ball",
    description: "A steel ball...",
    rarity: "A",
    emoji: "<:steel_ball:1138105735813795921>",
    price: 10000,
    tradable: true,
    storable: true
};
