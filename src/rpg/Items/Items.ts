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
    storable: true,
};

export const YellowHair: Item = {
    id: "yellow_hair",
    name: "Yellow Hair",
    description: "A yellow hair... DIO's hair?",
    rarity: "B",
    emoji: Emojis.dio,
    price: 100,
    tradable: true,
    storable: true,
};
