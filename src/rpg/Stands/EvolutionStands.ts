import { EvolutionStand, Stand } from "../../@types";
import * as Abilities from "../Abilities";
import * as Emojis from "../../emojis.json";

/*
export const Tusk: EvolutionStand = {
    id: "Tusk",
    name: "Tusk",
    description: "Tusk is a Stand that can be evolved.",
    rarity: "C",
    image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
    emoji: "🦏",
    abilities: [],
    color: 0x000000,
    skillPoints: {
        defense: 0,
        speed: 0,
        stamina: 0,
        strength: 0,
        perception: 0,
    },
    available: true,
    evolutions: [
        {
            name: "$name$ Act 1",
            rarity: "B",
            abilities: [Abilities.NailShot, Abilities.NailSpin],
            skillPoints: {
                defense: 5,
                speed: 5,
                stamina: 5,
                strength: 5,
                perception: 5,
            },
            description: "Tusk Act 1 is the first evolution of Tusk.",
            color: 0x000000,
            image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
            emoji: "🦏",
            available: true,
        },
        {
            name: "$name$ Act 2",
            rarity: "A",
            abilities: [Abilities.GoldenRectangleNails],
            skillPoints: {
                defense: 10,
                speed: 10,
                stamina: 10,
                strength: 10,
                perception: 10,
            },
            description: "Tusk Act 1 is the first evolution of Tusk.",
            color: 0x000000,
            image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
            emoji: "🦏",
            available: true,
        },
        {
            name: "$name$ Act 3",
            rarity: "S",
            abilities: [Abilities.SpatialWormhole],
            skillPoints: {
                defense: 15,
                speed: 15,
                stamina: 15,
                strength: 15,
                perception: 15,
            },
            description: "Tusk Act 1 is the first evolution of Tusk.",
            color: 0x000000,
            image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
            emoji: "🦏",
            available: true,
        },
        {
            name: "$name$ Act 4",
            rarity: "SS",
            abilities: [Abilities.InfiniteRotation],
            skillPoints: {
                defense: 20,
                speed: 20,
                stamina: 20,
                strength: 20,
                perception: 20,
            },
            description: "Tusk Act 1 is the first evolution of Tusk.",
            color: 0x000000,
            image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
            emoji: "🦏",
            available: true,
        },
    ],
};
*/

export const SilverChariot: EvolutionStand = {
    id: "Silver_chariot",
    evolutions: [
        {
            name: "Silver Chariot",
            description:
                "Silver Chariot appears as a thin, robotic humanoid clad in silver, medieval armor, armed with a basket-hilted foil. It is the Stand of [Jean Pierre Polnareff](https://jojo.fandom.com/wiki/Jean_Pierre_Polnareff), primarily featured in Stardust Crusaders",
            rarity: "C",
            abilities: [Abilities.FencingBarrage, Abilities.Finisher],
            image: "https://static.wikia.nocookie.net/jjba/images/7/7c/SilverChariot.png/revision/latest?cb=20180609123743",
            color: 0x808080,
            emoji: Emojis.Silverchariot,
            skillPoints: {
                strength: 2,
                perception: 5,
                speed: 5,
                defense: 1,
                stamina: 0,
            },
            available: true,
        },
        /*
        {
            name: "Silver Chariot Requiem",
            description:
                "Silver Chariot Requiem is the requiem form of Silver Chariot, evolved by obtaining a Requiem Arrow. It is featured in Vento Aureo. It is known for being one of the most powerful and frightening Stands introduced in the series.",
            rarity: "SS",
        }*/
    ],
};
