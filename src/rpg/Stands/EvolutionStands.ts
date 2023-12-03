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
            abilities: [Abilities.StandBarrage, Abilities.Hallucinogen, Abilities.StandDisc],
            image: "https://static.wikia.nocookie.net/jjba/images/e/ea/WhitesnakeAnime1.png/revision/latest?cb=20211202052847&path-prefix=pt-br",
            // white color hex code
            color: 0xffffff,
            emoji: Emojis.whitesnake,
            skillPoints: {
                strength: 3,
                perception: 10,
                speed: 5,
                defense: 5,
                stamina: 5,
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
