import { EvolutionStand, Stand } from "../../@types";
import * as Abilities from "../Abilities";

export const Tusk: EvolutionStand = {
    id: "Tusk",
    name: "Tusk",
    description: "Tusk is a Stand that can be evolved.",
    rarity: 'C',
    image: "https://static.wikia.nocookie.net/jjba/images/5/58/TuskAct1color.png/revision/latest?cb=20140813205839",
    emoji: '🦏',
    abilities: [],
    color: 0x000000,
    skillPoints: {
        defense: 0,
        speed: 0,
        stamina: 0,
        strength: 0,
        perception: 0
    },
    available: true,
    evolutions: [
        {
            name: 'Act 1',
            tier: 1,
            rarity: 'B',
            abilities: [Abilities.NailShot, Abilities.NailSpin],
            skillPoints: {
                defense: 5,
                speed: 5,
                stamina: 5,
                strength: 5,
                perception: 5
            }
        },
        {
            name: 'Act 2',
            tier: 2,
            rarity: 'A',
            abilities: [Abilities.GoldenRectangleNails],
            skillPoints: {
                defense: 10,
                speed: 10,
                stamina: 10,
                strength: 10,
                perception: 10
            }
        },
        {
            name: 'Act 3',
            tier: 3,
            rarity: 'S',
            abilities: [Abilities.SpatialWormhole],
            skillPoints: {
                defense: 15,
                speed: 15,
                stamina: 15,
                strength: 15,
                perception: 15
            }
        },
        {
            name: 'Act 4',
            tier: 4,
            rarity: 'SS',
            abilities: [Abilities.InfiniteRotation],
            skillPoints: {
                defense: 20,
                speed: 20,
                stamina: 20,
                strength: 20,
                perception: 20
            }
        }
    ],
};