import { Ability, EvolutionStand } from "../../@types";
import * as Abilities from "../Abilities";
import * as Emojis from "../../emojis.json";
import { FighterRemoveHealthTypes } from "../../structures/FightHandler";

function addGif(ability: Ability, gif: Ability["thumbnail"]): Ability {
    return {
        ...ability,
        thumbnail: gif,
    };
}

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
                "C-Moon is the Stand of [Enrico Pucci](https://jojo.fandom.com/wiki/Enrico_Pucci), featured in Stone Ocean. It is a close-range Stand that has the ability to manipulate gravity.\n\n> `PASSIVE:` C-Moon's punches has an effect that changes every turn.",
            rarity: "S",
            abilities: [
                Abilities.StandBarrage,
                Abilities.GravityShift,
                Abilities.GravityPull,
                Abilities.GravityPush,
                Abilities.SurfaceInversion,
            ],
            image: "https://media.jolyne.moe/I7j4cq/direct",
            // green color hex code
            color: 0x5dd389,
            emoji: Emojis.cmoon,
            skillPoints: {
                strength: 10,
                perception: 10,
                speed: 10,
                defense: 10,
                stamina: 10,
            },
            available: true,
            customAttack: {
                name: (ctx, user): string => {
                    const cacheID = `${ctx.id}_${user.id}.attack.cmoon`;
                    const attacks = (ctx.ctx.client.fightCache.get(cacheID) as number) || 0;

                    if (attacks % 2 === 0) {
                        return "Inverted Punch";
                    } else {
                        return "Gravity Punch";
                    }
                },
                // punch emoji
                emoji: "👊",
                handleAttack: (ctx, user, target, damages): void => {
                    const cacheID = `${ctx.id}_${user.id}.attack.cmoon`;
                    const attacks = (ctx.ctx.client.fightCache.get(cacheID) as number) || 0;
                    user.stamina -= 1;

                    damages = Math.round(damages * (attacks % 2 === 0 ? 1.5 : 1));

                    ctx.ctx.client.fightCache.set(cacheID, attacks + 1);

                    const status = target.removeHealth(damages, user);
                    const emoji = user.stand?.customAttack?.emoji || user.stand?.emoji;

                    // example
                    /*
                                    if (status.type === FighterRemoveHealthTypes.Defended) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${emoji}:shield: \`${ctx.whosTurn.name}\` shoots **${target.name}** but they defended themselves and deals **${status.amount}** damages instead of **${damages}** (defense: -${status.defense})`
                    );
                } else if (status.type === FighterRemoveHealthTypes.Dodged) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${emoji}:x: \`${ctx.whosTurn.name}\` shoots **${target.name}** but they dodged`
                    );
                } else if (status.type === FighterRemoveHealthTypes.BrokeGuard) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${last ? "💥" : ""}${emoji}:shield: \`${ctx.whosTurn.name}\` shoots **${
                            target.name
                        }**' and broke their guard; -**${
                            status.amount
                        }** HP :heart: instead of **${damages}**`
                    );
                } else if (status.type === FighterRemoveHealthTypes.Normal) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${last ? "💥" : ""}${emoji} \`${ctx.whosTurn.name}\` shoots **${
                            target.name
                        }** and deals **${status.amount}** damages`
                    );
                }*/

                    const punchName = attacks % 2 === 0 ? "punches" : "crushes";
                    if (status.type === FighterRemoveHealthTypes.Normal) {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `${emoji} \`${ctx.whosTurn.name}\` ${punchName} **${target.name}** and deals **${status.amount}** damages`
                        );
                    } else if (status.type === FighterRemoveHealthTypes.Defended) {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `${emoji}:shield: \`${ctx.whosTurn.name}\` ${punchName} **${target.name}** but they defended themselves and deals **${status.amount}** damages instead of **${damages}** (defense: -${status.defense})`
                        );
                    } else if (status.type === FighterRemoveHealthTypes.Dodged) {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `${emoji}:x: \`${ctx.whosTurn.name}\` ${punchName} **${target.name}** but they dodged`
                        );
                    } else if (status.type === FighterRemoveHealthTypes.BrokeGuard) {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `${emoji}:shield: \`${ctx.whosTurn.name}\` ${punchName} **${target.name}**' and broke their guard; -**${status.amount}** HP :heart: instead of **${damages}**`
                        );
                    }

                    ctx.nextTurn();
                },
            },
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

export const StarPlatinum: EvolutionStand = {
    id: "star_platinum",
    evolutions: [
        {
            name: "Star Platinum",
            description:
                "Star Platinum is a very strong humanoid Stand. It was designed to look like a guardian spirit. It was used by [Jotaro Kujo](https://jojo.fandom.com/wiki/Jotaro_Kujo)",
            rarity: "S",
            image: "https://i.pinimg.com/originals/c8/a7/ed/c8a7edf03bcce4b74a24345bb1a109b7.jpg",
            emoji: Emojis["star_platinum"],
            abilities: [
                addGif(
                    Abilities.StandBarrage,
                    "https://i.pinimg.com/originals/07/9f/ad/079fad3ce8871e86b93bff8b786aa179.gif"
                ),
                Abilities.KickBarrage,
                Abilities.StarFinger,
                Abilities.TheWorld,
            ],
            skillPoints: {
                strength: 15,
                defense: 5,
                perception: 15,
                speed: 8,
                stamina: 2,
            },
            color: 0x985ca3,
            available: true,
        },
    ],
};

export const TheWorld: EvolutionStand = {
    id: "the_world",
    evolutions: [
        {
            name: "The World",
            description:
                "The World, a humanoid Stand, is tall and has a very muscular build. It bears a striking resemblance to [Dio Brando](https://jojo.fandom.com/wiki/Dio_Brando) in terms of appearance.",
            rarity: "S",
            image: "https://media.jolyne.moe/HbE4h3/direct",
            emoji: Emojis.the_world,
            abilities: [
                addGif(
                    Abilities.StandBarrage,
                    "https://img.wattpad.com/e8f5b0bedeb643f1344a8c31cb53946a1161e4b0/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f6f6a31774f4335725a3173314a513d3d2d313131373338353733352e313639633731363736353735623639373535383635393834393635392e676966"
                ),
                Abilities.KickBarrage,
                Abilities.RoadRoller,
                Abilities.TheWorld,
            ],
            skillPoints: StarPlatinum.evolutions[0].skillPoints,
            color: 0xffff00,
            available: true,
        },
        {
            name: "The World Over Heaven",
            description:
                "The World Over Heaven is the Stand of [Dio Brando](https://jojo.fandom.com/wiki/Dio_Brando), featured in Eyes of Heaven. It is a close-range Stand that has the ability to overwrite reality.",
            rarity: "SS",
            image: "https://media.jolyne.moe/xV0VDW/direct",
            emoji: "<:twoh:1284851298080002081>",
            abilities: [
                addGif(Abilities.StandBarrage, "https://media.jolyne.moe/9z7j4v/direct"),
                Abilities.KickBarrage,
                Abilities.RoadRoller,
                Abilities.RealityOverwrite,
                Abilities.RealityRevert,
                {
                    ...Abilities.TheWorld,
                    description: "Stops time for 7 turns",
                    cooldown: 9,
                },
            ],
            skillPoints: {
                strength: 25,
                defense: 25,
                perception: 25,
                speed: 25,
                stamina: 25,
            },
            color: 0xffff00,
            available: false,
        },
    ],
};
