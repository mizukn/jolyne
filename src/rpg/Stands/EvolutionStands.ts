import { EvolutionStand } from "../../@types";
import * as Abilities from "../Abilities";
import * as Emojis from "../../emojis.json";

export const SilverChariot: EvolutionStand = {
    id: "silver_chariot",
    evolutions: [
        {
            name: "Silver Chariot",
            description:
                "Silver Chariot appears as a thin, robotic humanoid clad in silver, medieval armor, armed with a basket-hilted foil. It is the Stand of [Jean Pierre Polnareff](https://jojo.fandom.com/wiki/Jean_Pierre_Polnareff), primarily featured in Stardust Crusaders",
            rarity: "B",
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

        {
            name: "Silver Chariot Requiem",
            description:
                "Silver Chariot Requiem is the requiem form of Silver Chariot, evolved by obtaining a Requiem Arrow. It is featured in Vento Aureo. It is known for being one of the most powerful and frightening Stands introduced in the series.",
            rarity: "SS",
            abilities: [
                Abilities.FencingBarrage,
                Abilities.Finisher,
                Abilities.RequiemArrowBlast,
                Abilities.LifeTransference,
                Abilities.EternalSleep,
            ],
            image: "https://static.jojowiki.com/images/1/12/latest/20211210020712/Chariot_Requiem_Infobox_Anime.png",
            color: 0x000000,
            emoji: Emojis.SCR,
            skillPoints: {
                strength: 15,
                perception: 15,
                speed: 15,
                defense: 15,
                stamina: 15,
            },
            available: true,
        },
    ],
};

export const GoldExperience: EvolutionStand = {
    id: "gold_experience",
    evolutions: [
        {
            name: "Gold Experience",
            description:
                "Gold Experience is the Stand of [Giorno Giovanna](https://jojo.fandom.com/wiki/Giorno_Giovanna), featured in Vento Aureo. It is a Stand that is said to have the power to create life. It is a close-range Stand, with a range of 2 meters from its user.",
            rarity: "S",
            abilities: [
                Abilities.StandBarrage,
                Abilities.Heal,
                Abilities.LifeShot,
                Abilities.LifePunch,
            ],
            image: "https://static.jojowiki.com/images/8/81/latest/20210707053105/Gold_Experience_Infobox_Anime.png",
            // yellow color
            color: 0xffff00,
            emoji: Emojis.gold_experience,
            skillPoints: {
                strength: 5,
                perception: 5,
                speed: 5,
                defense: 5,
                stamina: 5,
            },
            available: true,
        },
        {
            name: "Gold Experience Requiem",
            description:
                "Gold Experience Requiem is the requiem form of Gold Experience, created by the Stand Arrow. It is featured in Vento Aureo. It is arguably one of the most powerful Stand in the series.",
            rarity: "SS",
            abilities: [
                Abilities.StandBarrage,
                Abilities.Heal,
                Abilities.LifeShot,
                Abilities.LifePunchGER,
                Abilities.RequiemArrowBlast,
                Abilities.InfiniteDeathLoop,
            ],
            image: "https://static.jojowiki.com/images/thumb/1/13/latest/20210525092302/GER_Infobox_Manga.png/400px-GER_Infobox_Manga.png",
            color: 0x8b8000,
            emoji: Emojis.GER,
            skillPoints: {
                strength: 15,
                perception: 15,
                speed: 15,
                defense: 15,
                stamina: 15,
            },
            available: true,
        },
    ],
};

export const Whitesnake: EvolutionStand = {
    id: "whitesnake",
    evolutions: [
        {
            name: "Whitesnake",
            description:
                "Whitesnake is a humanoid Stand of a height and build similar to [Pucci](https://jojo.fandom.com/wiki/Enrico_Pucci)'s. It is sparsely clothed in black, with a mask covering its face to the bottom of where its nose would be, in a piece that rises above its head by half its height in a row of peaks, like a crown.",
            rarity: "S",
            abilities: [
                Abilities.StandBarrage,
                Abilities.Gun,
                Abilities.Hallucinogen,
                Abilities.StandDisc,
            ],
            image: "https://static.wikia.nocookie.net/jjba/images/e/ea/WhitesnakeAnime1.png/revision/latest?cb=20211202052847&path-prefix=pt-br",
            // white color hex code
            color: 0xffffff,
            emoji: Emojis.whitesnake,
            skillPoints: {
                strength: 3,
                perception: 25,
                speed: 5,
                defense: 5,
                stamina: 5,
            },
            available: true,
        },
        {
          name: "C-Moon",
            description:
                "C-MOON is a humanoid Stand with a threatening, inhuman appearance. It is born as a result of the Green Baby fusing with Pucci and his original Stand, Whitesnake. Due to this, its appearance shares similarities with both.",
            rarity: "S",
            abilities: [{
              ...Abilities.StandBarrage,
              name: "Gravity Shift",
              description: "Shifts the gravity around the user in a 3KM (1.9mil) Radius to another direction.",
              thumbnail: "https://jojowiki.com/File:C_moon_powa_01.gif",
              damage: 20,
              dodgeScore: 0,
              cooldown: 4,
              extraTurns: 0,
            },{
              ...Abilities.Gun,
              name: "Surface Inversion",
              description "Modify the Source of Gravity of an Object by touching it, Hence, inverting the object.",
              thumbnail: "https://jojowiki.com/File:C_moon_powa_02.gif",
              dodgeScore: 4,
              damage: 40,
            },
                Abilities.Hallucinogen,
                Abilities.StandDisc,
            ],
            image: "https://static.jojowiki.com/images/thumb/2/23/latest/20221204031754/C-MOON_Infobox_Manga.png/800px-C-MOON_Infobox_Manga.png",
            color: 0xffffff,
            emoji: Emojis.cmoon,
            skillPoints: {
                strength: 5,
                perception: 20,
                speed: 20,
                defense: 5,
                stamina: 10,
            },
            available: true,
        },
    ],
};

export const KillerQueen: EvolutionStand = {
    id: "killer_queen",
    evolutions: [
        {
            name: "Killer Queen",
            description:
                "Killer Queen is a humanoid Stand of average height and build. Its face is hidden apart from the mouth by a helmet-like covering adorned with a mohawk-like row of short spikes. It has a cat-like mouth and ears, and its eyes are inverted, producing a negative effect with pure-white irises and black sclera.",
            rarity: "S",
            image: "https://static.jojowiki.com/images/thumb/f/fb/latest/20210420222949/Killer_Queen_Infobox_Manga.png/400px-Killer_Queen_Infobox_Manga.png",
            abilities: [
                Abilities.CoinBomb,
                {
                    ...Abilities.StandBarrage,
                    name: "Bomb Barrage",
                    description: "Killer Queen punches the enemy with its bombs",
                },
                Abilities.SheerHeartAttack,
            ],
            emoji: Emojis.killer_queen,
            skillPoints: {
                perception: 5,
                strength: 5,
                speed: 5,
                stamina: 5,
                defense: 5,
            },
            available: true,
            color: 0x000000,
        },
        {
            name: "Killer Queen Bites The Dust",
            description:
                "Killer Queen Bites the Dust is the Stand of [Yoshikage Kira](https://jojo.fandom.com/wiki/Yoshikage_Kira), featured in Diamond is Unbreakable. It is a sub-Stand that takes the form of a light purple cat-like entity, and is the evolved form of Killer Queen.",
            rarity: "SS",
            image: "https://static.jojowiki.com/images/thumb/f/fb/latest/20210420222949/Killer_Queen_Infobox_Manga.png/400px-Killer_Queen_Infobox_Manga.png",
            abilities: [
                Abilities.CoinBomb,
                {
                    ...Abilities.StandBarrage,
                    name: "Bomb Barrage",
                    description: "Killer Queen punches the enemy with its **huge** bombs",
                    damage: Abilities.StandBarrage.damage + 15,
                },
                Abilities.SheerHeartAttackBTD,
                Abilities.BitesTheDust,
            ],
            emoji: Emojis.killer_queen,
            skillPoints: {
                perception: 15,
                strength: 15,
                speed: 15,
                stamina: 15,
                defense: 15,
            },
            available: true,
            color: 0x000000,
        },
    ],
};

export const Echoes: EvolutionStand = {
    id: "echoes",
    evolutions: [
        {
            name: "Echoes Act 1",
            description:
                "Echoes, You feel something echoing deep in your heart. It seems like this stand is more powerful than it may seem.",
            rarity: "B",
            image: "https://static.jojowiki.com/images/d/dc/latest/20210424210829/Echoes_ACT1_DU_Infobox_Anime.png",
            abilities: [
                {
                    ...Abilities.StandBarrage,
                    name: "Sound Generation",
                    description: "Marks the opponent with a sound to repeat it.",
                    thumbnail: "https://i.imgur.com/PTLo7ab.gif",
                },
            ],
            emoji: Emojis.echoes_1,
            skillPoints: {
                perception: 5,
                strength: 5,
                speed: 0,
                stamina: 0,
                defense: 2,
            },
            available: true,
            color: 0x000000,
        },
        {
            name: "Echoes Act 2",
            description:
                "Echoes Act 2, You seem to be discovering more mysteries about your stand. Maybe you can dig deeper?",
            rarity: "A",
            image: "https://static.jojowiki.com/images/thumb/6/69/latest/20231215131846/Echoes_ACT2_DU_Infobox_Anime.png/800px-Echoes_ACT2_DU_Infobox_Anime.png",
            abilities: [
                {
                    ...Abilities.StandBarrage,
                    name: "Sound Generation",
                    description: "Marks the opponent with a sound to repeat it.",
                },
                {
                    ...Abilities.StandBarrage,
                    name: "Sound Manipulation",
                    description: "The marked sounds now affect the opponent.",
                    damage: Abilities.StandBarrage.damage + 5,
                    cooldown: Abilities.StandBarrage.cooldown + 1,
                },
            ],
            emoji: Emojis.echoes_2,
            skillPoints: {
                perception: 3,
                strength: 5,
                speed: 0,
                stamina: 3,
                defense: 5,
            },
            available: true,
            color: 0x000000,
        },
        {
            name: "Echoes Act 3",
            description: "Echoes Act 3, This seems to be thr peak of the power you can extract.",
            rarity: "S",
            image: "https://static.jojowiki.com/images/8/8e/latest/20210422175130/Echoes_ACT3_DU_Infobox_Anime.png",
            abilities: [
                {
                    ...Abilities.StandBarrage,
                    name: "Sound Generation",
                    description: "Marks the opponent with a sound to repeat it.",
                },
                {
                    ...Abilities.StandBarrage,
                    name: "Sound Manipulation",
                    description: "The marked sounds now affect the opponent.",
                    damage: Abilities.StandBarrage.damage + 5,
                    cooldown: Abilities.StandBarrage.cooldown + 1,
                },
                {
                    ...Abilities.StandBarrage,
                    name: "Freeze",
                    description: "Freezes the opponent’s targeted part.",
                    damage: Abilities.StandBarrage.damage + 10,
                    cooldown: Abilities.StandBarrage.cooldown + 2,
                    extraTurns: 1,
                },
                {
                    name: "Let’s kill da ho",
                    description: "KILL DA HO!!!",
                    damage: 45,
                    cooldown: 8,
                    extraTurns: 1,
                    target: "enemy",
                    dodgeScore: 0,
                    stamina: 50,
                    special: true,
                },
            ],
            emoji: Emojis.echoes_3,
            skillPoints: {
                perception: 5,
                strength: 7,
                speed: 2,
                stamina: 5,
                defense: 5,
            },
            available: true,
            color: 0x000000,
        },
    ],
};
