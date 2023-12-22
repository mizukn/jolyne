import { Stand, Ability } from "../../@types";
import * as Emojis from "../../emojis.json";
import { FighterRemoveHealthTypes } from "../../structures/FightHandler";
import * as Abilities from "../Abilities";
import {
    HealPunch,
    MysteriousGas,
    RapidStrikes,
    Razor_SharpScales,
    Transformation,
} from "../Abilities";

function addGif(ability: Ability, gif: Ability["thumbnail"]): Ability {
    return {
        ...ability,
        thumbnail: gif,
    };
}

export const StarPlatinum: Stand = {
    id: "star_platinum",
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
        strength: 10,
        defense: 5,
        perception: 5,
        speed: 5,
        stamina: 2,
    },
    color: 0x985ca3,
    available: true,
};

export const TheWorld: Stand = {
    id: "the_world",
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
    skillPoints: StarPlatinum.skillPoints,
    color: 0xffff00,
    available: true,
};

export const HierophantGreen: Stand = {
    id: "hierophant_green",
    name: "Hierophant Green",
    description:
        "Hierophant Green is an elastic and remote Stand, capable of being deployed far away from its user and performing actions. It is the Stand of [Noriaki Kakyoin](https://jojowiki.com/Noriaki_Kakyoin), featured in Stardust Crusaders.",
    rarity: "A",
    image: "https://media.jolyne.moe/snoSrJ/direct",
    emoji: Emojis["hierophant_green"],
    abilities: [Abilities.StandBarrage, Abilities.EmeraldSplash, Abilities.Manipulation],
    skillPoints: {
        strength: 5,
        defense: 0,
        perception: 5,
        speed: 3,
        stamina: 1,
    },
    color: 0x6ad398,
    available: true,
};

export const Aerosmith: Stand = {
    id: "aerosmith",
    name: "Aerosmith",
    description:
        "Aerosmith is a plane. It is a long-ranged stand. In the JJBA series, Aerosmith's owner was [Narancia Ghirga](https://jojo.fandom.com/wiki/Narancia_Ghirga)",
    rarity: "C",
    skillPoints: {
        strength: 2,
        defense: 0,
        perception: 2,
        speed: 2,
        stamina: 1,
    },
    image: "https://media.jolyne.moe/IDOJUv/direct",
    emoji: Emojis.aerosmith,
    abilities: [Abilities.VolaBarrage, Abilities.LittleBoy],
    color: 0x0981d1,
    available: true,
};

export const TheHand: Stand = {
    id: "the_hand",
    name: "The Hand",
    rarity: "A",
    description:
        "The hand is a humanoid-type stand who can erase things from existence, it was originally owned by [Okuyasu Nijimura](https://jojo.fandom.com/wiki/Okuyasu_Nijimura)",
    abilities: [Abilities.LightSpeedBarrage, Abilities.DeadlyErasure],
    skillPoints: {
        strength: 15,
        defense: 0,
        perception: 0,
        stamina: 0,
        speed: 0,
    },
    image: "https://media.jolyne.moe/8IBtli/direct",
    emoji: Emojis.the_hand,
    color: 0x1d57e5,
    available: true,
};

export const MagiciansRed: Stand = {
    id: "magicians_red",
    name: "Magician's Red",
    rarity: "A",
    description:
        "Magicians Red is a humanoid figure with a bird-like head. It has a muscular upper body and its feathered legs are sometimes covered in burning flames. It is the Stand of Muhammad Avdol, featured in Stardust Crusaders",
    image: "https://media.jolyne.moe/mR1hDR/direct",
    abilities: [Abilities.CrossfireHurricane, Abilities.RedBind, Abilities.Bakugo],
    emoji: Emojis.Magiciansred,
    skillPoints: {
        strength: 10,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    color: 0xff0000,
    available: true,
};

export const HermitPurple: Stand = {
    id: "hermit_purple",
    name: "Hermit Purple",
    rarity: "C",
    description:
        "Hermit Purple is the Stand of [Joseph Joestar](https://jojo.fandom.com/wiki/Joseph_Joestar), featured in Stardust Crusaders, and occasionally in Diamond is Unbreakable. The Hermit Hermit Purple manifests itself as multiple, purple, thorn-covered vines that spawn from its handler's hand.",
    image: "https://media.jolyne.moe/KNRkGI/direct",
    abilities: [Abilities.VineBarrage, Abilities.VineSlap, Abilities.OhMyGod],
    emoji: Emojis.hermit_purple,
    skillPoints: {
        strength: 2,
        defense: 0,
        perception: 2,
        speed: 2,
        stamina: 1,
    },
    color: 0x800080,
    available: true,
};

export const SexPistols: Stand = {
    id: "sex_pistols",
    name: "Sex Pistols",
    rarity: "A",
    description:
        "Sex pistols is a stand that can shoot bullets, it was originally owned by [Guido Mista](https://jojo.fandom.com/wiki/Guido_Mista)",
    abilities: [Abilities.BulletsRafale],
    emoji: Emojis.sexPistols,
    skillPoints: {
        strength: 0,
        defense: 0,
        perception: 3,
        speed: 0,
        stamina: 0,
    },
    color: 0x800080,
    available: true,
    image: "https://media.jolyne.moe/VyLw65/direct",
    customAttack: {
        name: (ctx, user) => {
            const bulletId = `${ctx.id}_${user.id}`;
            const cooldown = ctx.ctx.client.fightCache.get(bulletId) || 0;

            if (cooldown === 6) {
                return "Reload";
            } else return "Shoot";
        },
        emoji: Emojis.sexPistols,
        handleAttack: (ctx, user, target, damages) => {
            damages *= 1.1;
            damages = Math.round(damages);
            const bulletId = `${ctx.id}_${user.id}`;
            const cooldown = (ctx.ctx.client.fightCache.get(bulletId) as number) || 0;

            if (cooldown >= 6) {
                ctx.ctx.client.fightCache.set(bulletId, 0);
                ctx.turns[ctx.turns.length - 1].logs.push(`${user.name} reloaded their bullets...`);
                ctx.nextTurn();
                return;
            }
            ctx.ctx.client.fightCache.set(bulletId, cooldown + 1);
            let last = false;

            if (cooldown + 1 === 6) {
                damages = Math.round(damages * 1.7);
                last = true;
            }

            if (target.health > 0) {
                const status = target.removeHealth(damages, user); // damages, user, isGBreakble, isDodgeable
                const emoji = user.stand.customAttack.emoji;
                status.amount = Math.round(status.amount);

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
                }

                if (cooldown + 1 === 6)
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `:exclamation: ${user.name} will have to reload in order to shoot again...`
                    );
                else if (!ctx.ctx.client.fightCache.get(bulletId + "fireX"))
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${emoji} [BULLETS LEFT: ${6 - cooldown - 1}/6]`
                    );

                if (target.health <= 0) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `> :skull_crossbones: \`${target.name}\` has been defeated`
                    );
                }
            }
            if (!ctx.ctx.client.fightCache.get(bulletId + "fireX")) ctx.nextTurn();
        },
    },
};

export const TheFool: Stand = {
    id: "the_fool",
    name: "The Fool",
    rarity: "A",
    description: "waf waf sand grr wuwu",
    abilities: [
        Abilities.SandProjectiles,
        //Abilities.SandClone,
        Abilities.SandMimicry,
        Abilities.SandStorm,
    ],
    emoji: Emojis.theFool,
    skillPoints: {
        strength: 2,

        defense: 8,
        perception: 2,
        speed: 2,
        stamina: 1,
    },
    color: 0x800080,
    available: true,
    image: "https://media.jolyne.moe/SZEJL4/direct",
};

export const WheelOfFortune: Stand = {
    id: "wheel_of_fortune",
    name: "Wheel Of Fortune",
    rarity: "B",
    description:
        "Wheel of Fortune is the Stand ZZ. As a Stand bound to a car, it is capable of morphing its exterior to suit the needs of its driver. (jojowiki.com)",
    abilities: [Abilities.GasolineBullets, Abilities.CarCrash, Abilities.Transformation],
    emoji: Emojis.wheelOfFortune,
    available: true,
    skillPoints: {
        strength: 0,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    color: 0xff0000,
    image: "https://media.jolyne.moe/1NLw3n/direct",
};

export const PurpleHaze: Stand = {
    id: "purple_haze",
    name: "Purple Haze",
    rarity: "S",
    description:
        "Purple Haze is a humanoid stand of height and and builds similar to Fugo's. Its face and body are patterned by horizontal lozenges of alternating shade, and armor pieces are present on its shoulders, elbows, and knees. It has spikes along its back.",
    image: "https://media.jolyne.moe/NNszFI/direct",
    abilities: [Abilities.StandBarrage, Abilities.CapsuleShot, Abilities.PoisonGas, Abilities.Rage],
    emoji: Emojis.purple_haze,
    skillPoints: {
        strength: 10,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    available: true,
    color: 0x800080,
};

export const HalloweenSpooks: Stand = {
    id: "halloween_spooks",
    name: "Halloween Spooks",
    rarity: "T",
    description:
        "Halloween Spooks is a limited stand, was available during the Halloween event (2022).",
    image: "https://media.jolyne.moe/g3w4Ec/direct",
    abilities: [Abilities.Rage, Abilities.ScytheSlash, Abilities.MysteriousGas],
    emoji: "🎃",
    skillPoints: {
        // event stands have 0 skill points
        strength: 0,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    available: true,
    // purple hex code
    color: 0x800080,
};

export const BuffOPlatinum: Stand = {
    name: "Buff O' Platinum",
    id: "buff_o_platinum",
    rarity: "T",
    description:
        "Buff O' Platinum is a limited stand, was available during the Christmas event (2022).",
    image: "https://media.jolyne.moe/7A6SF4/direct",
    abilities: StarPlatinum.abilities,
    emoji: Emojis.buffOPlatinum,
    skillPoints: {
        // event stands have 0 skill points
        strength: 0,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    available: true,
    color: StarPlatinum.color,
};

export const CrazyDiamond: Stand = {
    id: "crazy_diamond",
    name: "Crazy Diamond",
    rarity: "S",
    description:
        "Crazy Diamond is a humanoid Stand of a height and build similar to Josuke's. Its face and body are patterned by horizontal lozenges of alternating shade, and armor pieces are present on its shoulders, elbows, and knees. It has spikes along its back.",
    image: "https://media.jolyne.moe/hZ8DN4/direct",
    abilities: [
        Abilities.StandBarrage,
        Abilities.HealPunch,
        Abilities.HealBarrage,
        Abilities.Restoration,
        Abilities.YoAngelo,
    ], //[Abilities.Heal, Abilities.HealBarrage, Abilities.HealPunch],
    emoji: Emojis.crazy_diamond,
    skillPoints: {
        defense: 5,
        strength: 5,
        perception: 5,
        speed: 5,
        stamina: 5,
    },
    available: true,
    // blue-white hex code
    color: 0xd8deec,
};

export const HangedMan: Stand = {
    id: "hanged_man",
    description:
        "Hanged Man is a Stand that attacks via reflections. It deals insane damages, consumes a bit of stamina and has low cooldowns.",
    rarity: "A",
    name: "Hanged Man",
    image: "https://media.jolyne.moe/tAYO5I/direct",
    abilities: [Abilities.LightManifestation, Abilities.WristKnives],
    emoji: Emojis.hangedMan,
    skillPoints: {
        strength: 5,
        perception: 7,
        speed: 1,
        stamina: 1,
        defense: 1,
    },
    available: true,
    color: 0x964b00,
};

export const Emperor: Stand = {
    id: "emperor",
    name: "Emperor",
    description:
        "Emperor is a gun. It has infinite bullets, its only ability is powerful and is almost impossible to dodge.",
    rarity: "B",
    image: "https://media.jolyne.moe/kVvExO/direct",
    abilities: [Abilities.HomingBullets],
    emoji: Emojis.emperor,
    skillPoints: {
        strength: 5,
        perception: 0,
        speed: 0,
        stamina: 0,
        defense: 0,
    },
    available: true,
    color: 0xd3d3d3,
    customAttack: {
        name: (ctx, user) => "Shoot",
        emoji: Emojis["emperor"],
        handleAttack: (ctx, user, target, damages) => {
            damages = Math.round(damages);
            if (target.health > 0) {
                const status = target.removeHealth(damages, user); // damages, user, isGBreakble, isDodgeable
                const emoji = user.stand.customAttack.emoji;
                status.amount = Math.round(status.amount);

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
                        `${emoji}:shield: \`${ctx.whosTurn.name}\` shoots **${target.name}**' and broke their guard; -**${status.amount}** HP :heart: instead of **${damages}**`
                    );
                } else if (status.type === FighterRemoveHealthTypes.Normal) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${emoji} \`${ctx.whosTurn.name}\` shoots **${target.name}** and deals **${status.amount}** damages`
                    );
                }

                if (target.health <= 0) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `> :skull_crossbones: \`${target.name}\` has been defeated`
                    );
                }
            }

            ctx.nextTurn();
        },
    },
};

export const TowerOfGray: Stand = {
    id: "tower_of_gray",
    name: "Tower Of Gray",
    description:
        "Tower of Gray is a Stand bound to a fly. In the JJBA series, Tower of Gray's owner was [Gray Fly](https://jojo.fandom.com/wiki/Gray_Fly)",
    rarity: "C",
    image: "https://media.jolyne.moe/RlcG9C/direct",
    abilities: [Abilities.RapidStrikes],
    emoji: Emojis.TowerOfGrey,
    skillPoints: {
        perception: 15,
        strength: 0,
        speed: 0,
        stamina: 0,
        defense: 0,
    },
    available: true,
    color: 0x808080,
};

export const DarkBlueMoon: Stand = {
    id: "dark_blue_moon",
    name: "Dark Blue Moon",
    description:
        "Dark Blue Moon is a Stand bound to a shark. In the JJBA series, Dark Blue Moon's owner was [Impostor Captain Tennille](https://jojo.fandom.com/wiki/Impostor_Captain_Tennille)",
    rarity: "C",
    image: "https://media.jolyne.moe/dRytbl/direct",
    abilities: [
        Abilities.Razor_SharpScales,
        // TODO: Abilities.Bernacles: Dark Blue Moon is capable of creating barnacles, specifically acorn barnaclesW, as seen when they attach to Star Platinum soon after making contact with Dark Blue Moon's skin.
        //
        // The barnacles drain the target of its strength and also allow Dark Blue Moon slight control over the infected body parts, allowing it to drag its foes back into the water if they try to escape it.[7]
    ],
    emoji: Emojis.DarkBlueMoon,
    skillPoints: {
        perception: 0,
        strength: 6,
        speed: 6,
        stamina: 0,
        defense: 0,
    },
    available: true,
    color: 0x0000ff,
};

export const Strength: Stand = {
    id: "strength",
    name: "Strength",
    description:
        "Strength is a Stand bound to a ship. In the JJBA series, Strength's owner was [Forever](https://jojo.fandom.com/wiki/Forever). Its only ability has no cooldown and has a slow stamina usage.",
    rarity: "C",
    image: "https://media.jolyne.moe/em7NnO/direct",
    abilities: [Abilities.ObjectManipulation],
    emoji: Emojis.strength,
    skillPoints: {
        // 0 on everything
        perception: 0,
        strength: 0,
        speed: 0,
        stamina: 0,
        defense: 0,
    },
    available: true,
    color: 0x964b00,
};

export const SkeletalSpectre: Stand = {
    id: "skeletal_spectre",
    name: "Skeletal Spectre",
    description:
        "Skeletal Spectre is an event stand, was available during the Halloween event (2023).",
    rarity: "T",
    image: "https://media.jolyne.moe/BZVkXX/direct",
    abilities: [
        Abilities.StandBarrage,
        Abilities.BoneSpear,
        Abilities.BonesEnlargement,
        Abilities.ArmSplitter,
        Abilities.FistEnlargement,
        Abilities.HeartBreaker,
    ],
    emoji: "💀",
    skillPoints: {
        // event stands have 0 skill points
        perception: 0,
        strength: 0,
        speed: 0,
        stamina: 0,
        defense: 0,
    },
    available: true,
    // grey
    color: 0x808080,
};

/**
 * The WORLD: Ru version (halloween 2023)
 */
export const TheWorldRu: Stand = {
    id: "the_world_ru",
    name: "The World (RU)",
    description:
        "The World (Russian Ver.) is an unobtainable stand. It was given to active beta testers during the V3 release.",
    rarity: "T",
    image: "https://media.jolyne.moe/4lLQMv/direct",
    abilities: [
        {
            ...Abilities.StandBarrage,
            name: "Suka Barrage",
            description: "SUKA SUKA SUKA SUKA SUKA SUKA SUKA SUKA",
        },
        {
            ...Abilities.KickBarrage,
            name: "Bear Attack",
            description: "The World summons its bear to attack the enemy",
        },
        {
            ...Abilities.RoadRoller,
            name: "AK-47",
            description: "The World summons an AK-47 and shoots the enemy",
        },
        {
            ...Abilities.TheWorld,
            description: "SUKA BLYAT!",
        },
    ],
    emoji: Emojis.TWRU,
    skillPoints: {
        // event stands have 0 skill points
        perception: 0,
        strength: 0,
        speed: 0,
        stamina: 0,
        defense: 0,
    },
    color: TheWorld.color,
    available: true,
};

export const StickyFingers: Stand = {
    id: "sticky_fingers",
    name: "Sticky Fingers",
    description:
        "Sticky Fingers is the Stand of Bruno Bucciarati, featured in the fifth part of the JoJo's Bizarre Adventure series, Vento Aureo. Sticky Fingers is a short-range humanoid Stand that can create zippers on any surface",
    rarity: "A",
    image: "https://media.jolyne.moe/3fhpZj/direct",
    color: 0x0000ff,
    abilities: [
        {
            ...Abilities.StandBarrage,
            name: "ARI Barrage",
            description: "ARI ARI ARI ARI ARI ARI ARI ARI!",
        },
        Abilities.ZipperPunch,
        Abilities.DimensionUppercut,
        Abilities.Arrivederci,
    ],
    emoji: Emojis.sticky_fingers,
    skillPoints: {
        perception: 7,
        speed: 7,
        strength: 3,
        stamina: 3,
        defense: 0,
    },
    available: true,
};

export const WeatherReport: Stand = {
    id: "weather_report",
    name: "Weather Report",
    description:
        "Weather Report is the Stand of Weather Report, featured in Stone Ocean. Weather Report is a humanoid Stand of a height and build similar to Weather Report's. Its face and body are patterned by horizontal lozenges of alternating shade, and armor pieces are present on its shoulders, elbows, and knees. It has spikes along its back.",
    rarity: "S",
    image: "https://media.jolyne.moe/QIlCcG/direct",
    color: 0x0000ff,
    abilities: [
        Abilities.StandBarrage,
        Abilities.BallOfLightning,
        Abilities.Fog,
        Abilities.FrogRain,
        Abilities.Mach1Tornado,
        Abilities.TotalCombustion,
    ],
    emoji: Emojis.WeatherReport,
    skillPoints: {
        perception: 7,
        speed: 7,
        strength: 3,
        stamina: 3,
        defense: 0,
    },
    available: true,
};

export const EbonyDevil: Stand = {
    id: "ebony_devil",
    name: "Ebony Devil",
    description:
        "Ebony Devil is a Stand bound to a doll. In the JJBA series, Ebony Devil's owner was [Devo](https://jojo.fandom.com/wiki/Devo_the_Cursed)",
    rarity: "C",
    image: "https://media.jolyne.moe/VtTZXn/direct",
    abilities: [Abilities.DollBarrage, Abilities.DollPunch, Abilities.DollThrow],
    emoji: Emojis.ebony,
    skillPoints: {
        perception: 0,
        strength: 6,
        speed: 6,
        stamina: 0,
        defense: 0,
    },
    available: true,
    color: 0x666420,
};

export const WonderOfU: Stand = {
    id: "wonder_of_u",
    name: "Wonder of U",
    description:
        "Wonder Of U is a stand from JoJo Part 8, its user is known as [Toru](https://jojowiki.com/Toru). It has a robotic body and can summoncalimaties at will.",
    rarity: "SS",
    image: "https://static.jojowiki.com/images/2/24/latest/20210418202241/Wonder_of_U_Hybrid_Infobox_Manga.png",
    color: 0x5c212d,
    abilities: [
        Abilities.CalamityManipulation,
        Abilities.IllusionCreation,
        Abilities.MedicExp,
        Abilities.IdentityAssumption,
    ],
    emoji: Emojis.WonderOfU,
    skillPoints: {
        perception: 5,
        speed: 7,
        strength: 3,
        stamina: 5,
        defense: 0,
    },
    available: true,
};

export const StoneFree: Stand = {
    id: "stone_free",
    name: "Stone Free",
    description:
        "Stone Free is an incredibly versatile stand from part 6. It's ability being strings had a wide variety of uses. It was used by [Jolyne Cujoh](https://jojo.fandom.com/wiki/Jolyne_Cujoh)",
    rarity: "A",
    image: "https://media.jolyne.moe/rMwxNj/direct",
    emoji: Emojis.stone_free,
    abilities: [
        addGif(
            Abilities.StandBarrage,
            "https://tenor.com/view/jolyne-kujo-jolyne-cujoh-jolyne-kujo-cujoh-gif-23791539"
        ),
        Abilities.BallBarrage,
        Abilities.Heal,
        Abilities.Wrap,
        Abilities.StringWeb,
    ],
    skillPoints: {
        strength: 5,
        defense: 0,
        perception: 10,
        speed: 5,
        stamina: 0,
    },
    color: 0x5c78a3,
    available: true,
};

export const Horus: Stand = {
    id: "Horus",
    name: "Horus",
    description:
        "Horus is a Non-Humanoid Stand, being the guardian of Dio's Mansion it is decently strong",
    rarity: "B",
    image: "https://media.jolyne.moe/Pp3O03/direct",
    emoji: Emojis.horus,
    abilities: [Abilities.IceSickles, Abilities.FreezingTouch, Abilities.IceBlockade],
    skillPoints: {
        strength: 0,
        defense: 0,
        perception: 5,
        speed: 5,
        stamina: 0,
    },
    color: 0xa9aaab,
    available: true,
};

export const AdminStand: Stand = {
    id: "admin_stand",
    name: "The WICKED",
    description: "Enchant the power of the wicked through yourself. **[Staff Only]**",
    rarity: "SS",
    image: "https://media.jolyne.moe/UWAEPT/direct",
    color: 0xa83232,
    abilities: [
        Abilities.StaffToy,
        Abilities.StaffBarrage,
        Abilities.StaffSplash,
        Abilities.StaffBAN,
    ],
    emoji: Emojis.BanHammer,
    skillPoints: {
        perception: 20,
        speed: 20,
        strength: 100,
        stamina: 300,
        defense: 200,
    },
    available: true,
};

export const YellowTemperance: Stand = {
    id: "yellow_temperance",
    name: "Yellow Temperance",
    rarity: "B",
    description:
        "Yellow Temperance is a Stand with the ability to assimilate any material, providing its user with an incredible defense.",
    abilities: [Abilities.Assimilation, Abilities.AcidicTouch, Abilities.DefensiveForm],
    emoji: Emojis.yellowTemperance,
    skillPoints: {
        strength: 3,
        defense: 7,
        perception: 2,
        speed: 2,
        stamina: 3,
    },
    color: 0xffff00, // Yellow color
    available: true,
    image: "https://media.jolyne.moe/3T8Vf8/direct", // Replace with the actual image URL
};

export const TheFemboy: Stand = {
    id: "the_femboy",
    name: "The Femboy",
    rarity: "SS",
    description:
        "The Femboy is a Stand with the ability to make anyone horny, providing its user with an incredible defense. [limited custom stand]",
    abilities: [
        Abilities.DefensiveForm,
        Abilities.TeaseBarrage,
        Abilities.Hug,
        Abilities.Flash,
        Abilities.Kiss,
    ],
    emoji: Emojis.theFemboy,
    skillPoints: {
        strength: 15,
        defense: 25,
        perception: 25,
        speed: 5,
        stamina: 5,
    },
    // uwu pink color
    color: 0xff69b4,
    available: true,
    image: "https://media.jolyne.moe/ONObhp/direct", // Replace with the actual image URL
};

export const TheChained: Stand = {
    id: "the_chained",
    name: "The Chained",
    rarity: "T",
    description: "The Chained is a limited stand, was available during the 2023 Christmas Event",
    abilities: [
        {
            ...Abilities.StandBarrage,
            name: "Chain Barrage",
            damage: Abilities.StandBarrage.damage + 6,
            description: "The Chained barrages the enemy with its chains",
        },
        Abilities.ChainedHook,
        Abilities.ChainedWhip,
        Abilities.OneThousandChains,
    ],
    emoji: "⛓",
    skillPoints: {
        strength: 35,
        defense: 0,
        perception: 10,
        speed: 0,
        stamina: 0,
    },
    color: 0x808080,
    available: true,
    image: "https://media.jolyne.moe/osoTRS/direct", // to be decided
};
