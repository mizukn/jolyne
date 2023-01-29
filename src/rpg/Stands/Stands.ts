import { Stand } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as Abilities from "../Abilities";

export const StarPlatinum: Stand = {
    id: "star_platinum",
    name: "Star Platinum",
    description:
        "Star Platinum is a very strong humanoid Stand. It was designed to look like a guardian spirit. It was used by [Jotaro Kujo](https://jojo.fandom.com/wiki/Jotaro_Kujo)",
    rarity: "S",
    image: "https://i.pinimg.com/originals/c8/a7/ed/c8a7edf03bcce4b74a24345bb1a109b7.jpg",
    emoji: Emojis["sp"],
    abilities: [
        Abilities.StandBarrage,
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
        Abilities.StandBarrage,
        Abilities.KickBarrage,
        Abilities.RoadRoller,
        Abilities.TheWorld,
        Abilities.Manipulation,
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
        strength: 1000,
        defense: 0,
        perception: 0,
        speed: 0,
        stamina: 0,
    },
    color: 0xff0000,
    available: true,
};
