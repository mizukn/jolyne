import { Ability } from "../@types";
import { FightHandler, Fighter } from "../structures/FightHandler";
import * as Stands from "./Stands/Stands";
import * as Functions from "../utils/Functions";

export const StandBarrage: Ability = {
    name: "Stand Barrage",
    description: "Performs an astoundingly fast flurry of punches that deals small damage per hit",
    cooldown: 5,
    extraTurns: 1,
    damage: 5,
    stamina: 10,
    dodgeable: true,
    blockable: false,
};

export const KickBarrage: Ability = {
    name: "Kick Barrage",
    description: "Performs an astoundingly fast flurry of kicks that deals small damage per hit",
    cooldown: 3,
    extraTurns: 0,
    damage: 3,
    stamina: 10,
    dodgeable: true,
    blockable: true,
};

export const StarFinger: Ability = {
    name: "Star Finger",
    description: "Extends {standName}'s finger and stabs the target in the eyes",
    cooldown: 8,
    extraTurns: 1,
    damage: 12.5,
    stamina: 18,
    dodgeable: true,
    blockable: false,
};

export const RoadRoller: Ability = {
    ...StarFinger,
    name: "Road Roller",
    description:
        "jumps high into the sky, bringing a steamroller down with them, slamming it down where they were previously standing",
};

export const TheWorld: Ability = {
    name: "The World",
    description: "Stops time for 5 turns",
    cooldown: 10,
    extraTurns: 5,
    damage: 0,
    stamina: 25,
    dodgeable: false,
    blockable: false,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.nextTurnPromises.push({
            cooldown: 6,
            promise: (fight) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `**${user.name}:** Toki wo Ugokidasu...`
                );
                user.hasStoppedTime = false;
            },
        });
        user.hasStoppedTime = true;

        if (user.stand.name === Stands.TheWorld.name) {
            return `**${user.name}:** THE WORLD! TOKI WO TOMARE!`;
        } else if (user.stand.name === Stands.StarPlatinum.name) {
            return `**${user.name}:** STAR PLATINUM: THE WORLD! TOKI WO TOMARE!`;
        }
        return `**${user.name}:** ${user.stand.name}: TOKI WO TOMARE!`;
    },
};

export const EmeraldSplash: Ability = {
    name: "Emerald Splash",
    description: "fires off a large amount of energy which takes the form of emeralds.",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 15,
    dodgeable: true,
    blockable: false,
};

export const VolaBarrage: Ability = {
    ...EmeraldSplash,
    name: "Vola Barrage",
    description: "Sends a wave of bullets in the direction the user is facing.",
};

export const LittleBoy: Ability = {
    name: "Little Boy",
    description: "drop 3 bombs behind its opponent that will explode instantly",
    cooldown: 8,
    extraTurns: 1,
    extraTurnsIfGB: 1,
    damage: 15,
    stamina: 20,
    dodgeable: false,
    blockable: false,
};

export const Manipulation: Ability = {
    name: "Manipulation",
    description: "Manipulates the opponent's body, causing them unable to control therseivles",
    cooldown: 10,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const baseTarget = { ...target };

        if (user.manipulatedBy) {
            return `**${user.manipulatedBy.name}:** [ERROR: cannot manipulate if already manipulated]`;
        } else if (target.manipulatedBy) {
            return `**${user.name}:** [ERROR: cannot manipulate ${target.name} because they are already manipulated by ${target.manipulatedBy.name}]`;
        } else {
            target.id = user.id;
            target.name += " (Manipulated)";
            target.manipulatedBy = user;
            ctx.nextRoundPromises.push({
                cooldown: 2,
                promise: (fight) => {
                    target.id = baseTarget.id;
                    target.name = baseTarget.name;
                    target.manipulatedBy = undefined;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `${user.stand.emoji} (target: ${target.name}) has been released from manipulation.`
                    );
                },
            });
            return `${user.stand.emoji} **${user.name}:** ${user.stand.name}: Manipulation! (target: ${target.name})`;
        }
    },
    blockable: false,
    dodgeable: false,
    damage: 0,
    stamina: TheWorld.stamina,
    extraTurns: 0,
};

export const LightSpeedBarrage: Ability = {
    name: "Light-Speed Barrage",
    description: "erases matter to jump on the enemies and assault them with rapid punches.",
    cooldown: 5,
    damage: 12.5,
    blockable: false,
    dodgeable: false,
    stamina: 15,
    extraTurns: 1,
};

export const DeadlyErasure: Ability = {
    name: "Deadly Erasure",
    description:
        "uses their right hand to erase space and jump one you and use the effect of surprise to erase you",
    cooldown: 15,
    damage: 100,
    blockable: false,
    dodgeable: false,
    stamina: 35,
    extraTurns: 2,
    special: true,
};

const burnDamagePromise = (ctx: FightHandler, target: Fighter, damage: number) => {
    ctx.nextRoundPromises.push({
        cooldown: 3,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `:fire: **${target.name}** took **${damage}** burn damage`
            );
            if (target.health > 0) {
                target.health -= damage;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `:fire: **${target.name}** died from burn damage`
                    );
                }
            }
        },
    });
};

export const CrossfireHurricane: Ability = {
    name: "Crossfire Hurricane",
    description: "launches 1 cross in the shape of an ankh at the oppenent",
    cooldown: 5,
    damage: 10,
    blockable: true,
    dodgeable: true,
    stamina: 15,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        burnDamagePromise(ctx, target, burnDamageCalc);
    },
};

export const RedBind: Ability = {
    name: "Red Bind",
    description: "takes two swings at the opponent with fiery chains",
    cooldown: 7,
    damage: 17,
    blockable: true,
    dodgeable: true,
    stamina: 20,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, RedBind) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc);
    },
};

export const Bakugo: Ability = {
    name: "Bakugo",
    description: "grabs the opponent before engulfing the opponent's head in flames",
    cooldown: 12,
    damage: 35,
    blockable: false,
    dodgeable: false,
    stamina: 30,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Bakugo) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc);
    },
    special: true,
};
