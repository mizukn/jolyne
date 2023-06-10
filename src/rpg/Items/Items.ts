import { Item } from "../../@types";
import * as Emojis from "../../emojis.json";

// list of useless items
export const Diamond: Item = {
    id: "diamond",
    name: "Diamond",
    description: "A diamond. It's very shiny.",
    rarity: "C",
    emoji: "💎",
    price: 100,
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

export const AncientScroll: Item = {
    id: "ancient_scroll",
    name: "Ancient Scroll",
    description: "An ancient scroll. It's very old.",
    rarity: "B",
    emoji: "📜",
    price: 2000,
    tradable: true,
    storable: true,
};

export const BrokenArrow: Item = {
    id: "broken_arrow",
    name: "Broken Arrow",
    description: "An arrow that has been broken.",
    rarity: "B",
    emoji: Emojis.mysterious_arrow,
    price: Math.round(35000 / 5),
    tradable: true,
    storable: true,
};
