import { Stand, Ability } from "../../@types";
import * as Emojis from "../../emojis.json";
import { FighterRemoveHealthTypes } from "../../structures/FightHandler";
import * as Abilities from "../Abilities";

function addGif(ability: Ability, gif: string): Ability {
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
    emoji: Emojis["sp"],
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
    image: "https://naniwallpaper.com/files/wallpapers/za-warudo/2-za%20warudo-1080x1920.jpg",
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
    image: "https://static.wikia.nocookie.net/jjba/images/c/c8/HierophantGreen.png/revision/latest/scale-to-width-down/350?cb=20140807094417",
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
    image: "https://static.wikia.nocookie.net/jjba/images/6/66/Aerosmithcolor.png/revision/latest?cb=20180414181107&path-prefix=fr",
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
    image: "https://static.wikia.nocookie.net/jjba/images/4/46/The_Hand_Anime.png/revision/latest?cb=20161217225524&path-prefix=fr",
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
    image: "https://i.pinimg.com/736x/8a/cb/27/8acb27c4640370a8919e5fdc30d1d581.jpg",
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
    image: "https://static.wikia.nocookie.net/heros/images/9/94/Joseph_Joestar_senior_Infobox.jpg/revision/latest?cb=20201223201734&path-prefix=fr",
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
    description: "later",
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
    image: "https://cdn.discordapp.com/attachments/1095946844770684938/1100527627581800469/oln1vl85gbq31.png",
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
            damages *= 1.3;
            console.log("handleAttack triggered");
            const bulletId = `${ctx.id}_${user.id}`;
            const cooldown = (ctx.ctx.client.fightCache.get(bulletId) as number) || 0;

            if (cooldown >= 6) {
                ctx.ctx.client.fightCache.set(bulletId, 0);
                ctx.turns[ctx.turns.length - 1].logs.push(`${user.name} reloaded his bullets...`);
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
                const status = target.removeHealth(damages, user, last, last); // damages, user, isGBreakble, isDodgeable
                const emoji = user.stand.customAttack.emoji;
                status.amount = Math.round(status.amount);

                if (status.type === FighterRemoveHealthTypes.Defended) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `${emoji}:shield: \`${ctx.whosTurn.name}\` shoots **${target.name}** but they defended theirselves and deals **${status.amount}** damages instead of **${damages}** (defense: -${status.defense})`
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
        Abilities.SandClone,
        Abilities.SandMimicry,
        Abilities.SandStorm,
    ],
    emoji: "<:the_fool:1133820601904152626>",
    skillPoints: {
        strength: 2,

        defense: 8,
        perception: 2,
        speed: 2,
        stamina: 1,
    },
    color: 0x800080,
    available: true,
    image: "https://static.jojowiki.com/images/thumb/1/10/latest/20210312225357/The_Fool_Infobox_Anime.png/400px-The_Fool_Infobox_Anime.png",
};
