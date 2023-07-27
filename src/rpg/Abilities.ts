import { Ability, FightableNPC, SkillPoints } from "../@types";
import { FightHandler, Fighter } from "../structures/FightHandler";
import * as Stands from "./Stands/Stands";
import * as Functions from "../utils/Functions";

export const StandBarrage: Ability = {
    name: "Stand Barrage",
    description: "Performs an astoundingly fast flurry of punches that deals small damage per hit",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 10,
    dodgeable: true,
    blockable: false,
    dodgeScore: 1,
};

export const KickBarrage: Ability = {
    name: "Kick Barrage",
    description: "Performs an astoundingly fast flurry of kicks that deals small damage per hit",
    cooldown: 3,
    extraTurns: 0,
    damage: 8,
    stamina: 10,
    dodgeable: true,
    blockable: true,
    dodgeScore: 1,
};

export const StarFinger: Ability = {
    name: "Star Finger",
    description: "Extends {standName}'s finger and stabs the target in the eyes",
    cooldown: 8,
    extraTurns: 1,
    damage: 20,
    stamina: 18,
    dodgeable: true,
    blockable: false,
    dodgeScore: 2,
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
            promise: (fight: { turns: { logs: string[] }[] }) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `**${user.name}:** Toki wo Ugokidasu...`
                );
                user.hasStoppedTime = false;
            },
            id: "" + Date.now() + Math.random() + "",
        });
        user.hasStoppedTime = true;

        if (user.stand.name === Stands.TheWorld.name) {
            return `**${user.name}:** THE WORLD! TOKI WO TOMARE!`;
        } else if (user.stand.name === Stands.StarPlatinum.name) {
            return `**${user.name}:** STAR PLATINUM: THE WORLD! TOKI WO TOMARE!`;
        }
        return `**${user.name}:** ${user.stand.name}: TOKI WO TOMARE!`;
    },
    dodgeScore: 20,
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
    dodgeScore: 10,
};

export const VolaBarrage: Ability = {
    ...EmeraldSplash,
    name: "Vola Barrage",
    description: "Sends a wave of bullets in the direction the user is facing.",
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382611634913391/AdorableRemoteBigmouthbass-mobile.gif",
    dodgeScore: 3,
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
    dodgeScore: 3,
};

export const Manipulation: Ability = {
    name: "Manipulation",
    description: "Manipulates the opponent's body, causing them unable to control therseivles",
    cooldown: 10,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const baseTarget = { ...target };
        let unmanipulated = false;

        const unmanipulate = (fight: {
            turns: {
                logs: string[];
            }[];
        }) => {
            if (unmanipulated) return;
            target.name = baseTarget.name;
            target.manipulatedBy = undefined;
            fight.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} (target: ${target.name}) has been released from manipulation.`
            );
            unmanipulated = true;
        };

        if (user.manipulatedBy) {
            return `**${user.manipulatedBy.name}:** [ERROR: cannot manipulate if already manipulated]`;
        } else if (target.manipulatedBy) {
            return `**${user.name}:** [ERROR: cannot manipulate ${target.name} because they are already manipulated by ${target.manipulatedBy.name}]`;
        } else {
            target.name += " (Manipulated)";
            target.manipulatedBy = user;
            ctx.nextRoundPromises.push({
                cooldown: 2,
                promise: (fight: { turns: { logs: string[] }[] }) => {
                    unmanipulate(fight);
                },
                id: "" + Date.now() + Math.random() + "",
            });

            return `${user.stand.emoji} **${user.name}:** ${user.stand.name}: Manipulation! (target: ${target.name})`;
        }
    },
    blockable: false,
    dodgeable: false,
    damage: 0,
    stamina: TheWorld.stamina,
    extraTurns: 0,
    thumbnail: "https://media.tenor.com/zOTu19A7VoEAAAAC/jojo-hierophant-green.gif",
    dodgeScore: 1,
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
    thumbnail: "https://media.tenor.com/X1JHf1sGkwIAAAAd/okuyasu-the-hand.gif",
    dodgeScore: 4,
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
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382190166081647/RawDaringEeve-mobile.gif",
    dodgeScore: 4,
};

const burnDamagePromise = (ctx: FightHandler, target: Fighter, damage: number) => {
    ctx.nextRoundPromises.push({
        cooldown: 3,
        promise: (fight: { turns: { logs: string[] }[] }) => {
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
        id: "" + Date.now() + Math.random() + "",
    });
};

const bleedDamagePromise = (ctx: FightHandler, target: Fighter, damage: number) => {
    ctx.nextRoundPromises.push({
        cooldown: 3,
        promise: (fight: { turns: { logs: string[] }[] }) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `🩸 **${target.name}** took **${damage}** bleed damage`
            );
            if (target.health > 0) {
                target.health -= damage;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `🩸 **${target.name}** died from bleed damage`
                    );
                }
            }
        },
        id: "" + Date.now() + Math.random() + "",
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
    thumbnail: "https://media.tenor.com/n79QWE9azhEAAAAC/magicians-red-avdol.gif",
    dodgeScore: 1,
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
    dodgeScore: 2,
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
    dodgeScore: 3,
};

export const NailShot: Ability = {
    name: "Nail Shot",
    description: "Shoot a nail, at the speed of a bullet",
    cooldown: 4,
    damage: 40,
    blockable: true,
    dodgeable: true,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 3,
};

export const NailSpin: Ability = {
    name: "Nail Spin",
    description: "Spin your nails, allowing you to practically use them as melee weapons",
    cooldown: 6,
    damage: 30,
    blockable: true,
    dodgeable: true,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 1,
};

export const GoldenRectangleNails: Ability = {
    name: "Golden Rectangle Nails",
    description: "Shoot a nail, at the speed of a bullet, but with the power of a golden rectangle",
    cooldown: 8,
    damage: 60,
    blockable: true,
    dodgeable: true,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 1,
};

export const SpatialWormhole: Ability = {
    name: "Spatial Wormhole",
    description: "Creates a wormhole that can teleport the user to any location",
    cooldown: 10,
    damage: 70,
    blockable: false,
    dodgeable: false,
    stamina: 40,
    extraTurns: 0,
    dodgeScore: 1,
};

export const InfiniteRotation = {
    name: "Infinite Rotation",
    description: "Creates a wormhole that can teleport the user to any location",
    cooldown: 20,
    damage: 150,
    blockable: false,
    dodgeable: false,
    stamina: 60,
    extraTurns: 0,
    dodgeScore: 1,
};

/**
 * Hermit Purple DESU
 */

export const OhMyGod: Ability = {
    name: "Oh My God",
    description: "BOOSTS ALL YOUR STATS BY 100% FOR 3 TURNS LETS GOOOOO",
    cooldown: 3,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 30,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        for (const stat in user.skillPoints) {
            user.skillPoints[stat as keyof typeof user.skillPoints] +=
                user.skillPoints[stat as keyof typeof user.skillPoints];
        }
        ctx.turns[ctx.turns.length - 1].logs.push(
            `${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD **${user.name}**'s stats are boosted by 100% !1!1!1!!!!1!1`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            promise: (fight: { turns: { logs: string[] }[] }) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD **${user.name}**'s stats are back...`
                );
                for (const stat in user.skillPoints) {
                    user.skillPoints[stat as keyof typeof user.skillPoints] -=
                        user.skillPoints[stat as keyof typeof user.skillPoints] / 2;
                }
            },
            id: "" + Date.now() + Math.random() + "",
        });
    },
    thumbnail: "https://media.tenor.com/RQtghGnCYxEAAAAd/jojo-oh-my-god.gif",
    dodgeScore: 0,
};

export const VineSlap: Ability = {
    name: "Vine Slap",
    description: "extends {{standName}}'s vines to whip twice in the opponent's direction",
    cooldown: 4,
    damage: 30,
    blockable: true,
    dodgeable: true,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
};

export const VineBarrage: Ability = {
    ...StandBarrage,
    name: "Vine Barrage",
    description: "extends {{standName}}'s vines to whip the opponent",
};

/**
 * THIS ABILITY IS ONLY FOR SEX PISTOLS OR ELSE IT WILL CRASH
 */
export const BulletsRafale: Ability = {
    name: "Bullets Rafale",
    description: "fires all your bullets at once",
    cooldown: 3,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 30,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const bulletId = `${ctx.id}_${user.id}`;
        ctx.ctx.client.fightCache.set(bulletId + "fireX", true);

        const bullets: number = (ctx.ctx.client.fightCache.get(bulletId) as number) || 0;
        if (bullets === 6) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${ctx.ctx.client.localEmojis.sexPistols} **${user.name}** has no bullets left... You just wasted your ability & stamina omg you're so dumb`
            );
            return;
        }
        ctx.turns[ctx.turns.length - 1].logs.push(
            `>> ${ctx.ctx.client.localEmojis.sexPistols} **${
                user.name
            }** fires all their bullets at once! (${6 - bullets})`
        );
        for (let i = 0; i < 6 - bullets; i++) {
            user.stand.customAttack.handleAttack(
                ctx,
                user,
                target,
                Functions.getAttackDamages(user)
            );
        }
        ctx.ctx.client.fightCache.delete(bulletId + "fireX");
    },
    dodgeScore: 0,
};

export const DeterminationFlurry: Ability = {
    name: "Determination Flurry",
    description: "A Barrage with multiple Slashs (+ bleed damage)",
    cooldown: 5,
    damage: 25,
    blockable: true,
    dodgeable: true,
    stamina: 40,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc);
    },
    dodgeScore: 2,
};

export const FencingBarrage: Ability = {
    ...StandBarrage,
    name: "Fencing Barrage",
    description: "A Barrage with multiple Slashs",
};

export const Finisher: Ability = {
    name: "Finisher",
    description:
        "attacks or finish the opponent by aiming at one of his vital parts [CRITICAL, BLEED DAMAGES]",
    cooldown: 8,
    damage: 300,
    blockable: true,
    dodgeable: true,
    stamina: 40,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc);
    },
    dodgeScore: 2,
};

export const LifeTransference: Ability = {
    name: "Life Transference",
    description:
        "Transfers life force between individuals, healing allies by 30% of their max health or heavily damaging enemies ",
    cooldown: 0,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 60,
    ally: true,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        if (
            ctx.getTeamIdx(user.manipulatedBy ? user.manipulatedBy : user) ===
            ctx.getTeamIdx(target.manipulatedBy ? target.manipulatedBy : target)
        ) {
            // Heal the target by transferring life force
            const healAmount = Math.round(target.maxHealth * 0.3); // Adjust the heal amount as desired
            const oldHealth = target.health;
            target.incrHealth(healAmount);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} LIFE TRANSFERENCE: ${target.name} has been healed for **${(
                    target.health - oldHealth
                ).toLocaleString("en-US")}** health.`
            );
        } else {
            // Drain the life force of the enemy
            const drainAmount = Functions.getAttackDamages(user) * 3;
            const oldHealth = target.health;
            target.incrHealth(-drainAmount);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} LIFE TRANSFERENCE: ${target.name} has lost **${(
                    oldHealth - target.health
                ).toLocaleString("en-US")}** health due to life force drain.`
            );
        }
    },
    dodgeScore: 0,
};

export const RequiemArrowBlast: Ability = {
    name: "Requiem Arrow Blast",
    description: "Unleashes **__an extremely powerful__** blast of energy using its requiem arrow.",
    cooldown: 12,
    damage: 400,
    blockable: true,
    dodgeable: true,
    stamina: 60,
    extraTurns: 0,
    dodgeScore: 2,
};

export const EternalSleep: Ability = {
    name: "Eternal Sleep",
    description:
        "Induces a deep sleep on anyone within its range, even allies, except if they are strong enough to resist it.",
    cooldown: 0,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((x) => x.id !== user.id)
            .forEach((x) => {
                const dodgeResults: boolean[] = [];

                for (let i = 0; i < 3; i++) {
                    const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                    const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                    const randomNumber = Functions.randomNumber(0, 100);
                    const dodgeThreshold =
                        userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                    if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                }
                if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                    x.frozenFor = 3;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} ETERNAL SLEEP: **${user.name}** has put **${x.name}** to sleep for 3 turns...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} ETERNAL SLEEP: **${user.name}** resisted.`
                    );
                }
            });

        target.frozenFor = 3;
    },
    dodgeScore: 0,
};

export const StandDisc: Ability = {
    name: "Stand Disc",
    description: "Removes temporarily the stand of the target",
    cooldown: 9,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    special: true,
    extraTurns: 0,
    dodgeScore: 7,
    useMessage: (user, target, damage, ctx) => {
        const stand = target.stand;
        target.stand = null;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} STAND DISC: **${user.name}** has removed temporarily the stand of **${target.name}**... (${stand.name} ${stand.emoji})`
        );
        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                target.stand = stand;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} STAND DISC: **${target.name}** has recovered his stand... (${stand.name} ${stand.emoji})`
                );
            },
        });
    },
};

export const Hallucinogen: Ability = {
    name: "Hallucinogen",
    description:
        "Creates a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%",
    cooldown: 7,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    special: true,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
            .forEach((x) => {
                x.skillPoints.perception = Math.round(x.skillPoints.perception * 0.1);
                x.skillPoints.speed = Math.round(x.skillPoints.speed * 0.1);
            });
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} HALLUCINOGEN: **${user.name}** has created a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%...`
        );
        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                ctx.fighters
                    .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
                    .forEach((x) => {
                        x.skillPoints.perception = Math.round(x.skillPoints.perception / 0.1);
                        x.skillPoints.speed = Math.round(x.skillPoints.speed / 0.1);
                    });
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} HALLUCINOGEN: **${user.name}**'s hallucinogen EFFECT has disappeared...`
                );
            },
        });
    },
};

export const Heal: Ability = {
    name: "Heal",
    description: "Heals the target by 15% of their max health",
    cooldown: 4,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(target.maxHealth * 0.15);
        target.health += heal;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} HEAL: **${user.name}** has healed **${
                target.name
            }** by **${heal}** health... ${
                ctx.getTeamIdx(user) === ctx.getTeamIdx(target)
                    ? ""
                    : "(wtf dude you just healed an enemy lol)"
            }`
        );
    },
};

export const LifeShot: Ability = {
    name: "Life Shot",
    description: "Causes your opponent's soul to leave their body for some turns",
    cooldown: 11,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor = 3;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} LIFE SHOT: **${user.name}** has caused **${target.name}**'s soul to leave their body for 3 turns...`
        );
    },
};

export const LifeGiver: Ability = {
    name: "Life Giver",
    description:
        "Gold Experience can imbue inanimate objects with life, creating living organisms. These organisms can be used for various purposes, such as attacking enemies or providing support to allies",
    cooldown: 0,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 3,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const teamIndex = ctx.getTeamIdx(user);
        const team = ctx.teams[teamIndex];

        const NPC: FightableNPC = {
            id: Functions.randomArray(["speedwagon_foundation", "kakyoin", "jotaro", "dio"]),
            name: `${user.name}'s Life Giver [${target.name} CLONE]`,
            skillPoints: {
                strength: Math.round(target.skillPoints.strength) / 10,
                perception: Math.round(target.skillPoints.perception) / 10,
                speed: Math.round(target.skillPoints.speed) / 10,
                defense: Math.round(target.skillPoints.defense) / 10,
                stamina: Math.round(target.skillPoints.stamina) / 10,
            },
            level: target.level / 10,
            stand: target.stand?.id,
            equippedItems: target.equippedItems,
            standsEvolved: target.standsEvolved,
            emoji: target.stand?.emoji ?? "🤷‍♂️",
        };
        team.push(new Fighter(NPC));
        ctx.fighters.push(new Fighter(NPC));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} LIFE GIVER: **${user.name}** has created a clone of **${target.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                const idx = team.findIndex((x) => x.id === NPC.id);
                if (idx !== -1) {
                    team.splice(idx, 1);
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} LIFE GIVER: **${user.name}**'s clone of **${target.name}** has disappeared...`
                    );
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            },
        });
    },
};

// sand clone ability, similar to life giver
export const SandClone: Ability = {
    name: "Sand Clone",
    description:
        "The Fool can create clones of itself out of sand, which can be used to attack or defend",
    cooldown: 0,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 3,
    useMessage: (user, target, damage, ctx) => {
        const teamIndex = ctx.getTeamIdx(user);
        const team = ctx.teams[teamIndex];
        console.log(team);

        const NPC: FightableNPC = {
            id: Functions.randomArray(["speedwagon_foundation", "kakyoin", "jotaro", "dio"]),
            name: `${user.name}'s Sand Clone`,
            skillPoints: {
                strength: Math.round(user.skillPoints.strength) / 10,
                perception: Math.round(user.skillPoints.perception) / 10,
                speed: Math.round(user.skillPoints.speed) / 10,
                defense: Math.round(user.skillPoints.defense) / 10,
                stamina: Math.round(user.skillPoints.stamina) / 10,
            },
            level: user.level / 10,
            stand: user.stand?.id,
            equippedItems: user.equippedItems,
            standsEvolved: user.standsEvolved,
            emoji: user.stand?.emoji ?? "🤷‍♂️",
        };
        team.push(new Fighter(NPC));
        ctx.fighters.push(new Fighter(NPC));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND CLONE: **${user.name}** has created a clone of **${user.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                const idx = team.findIndex((x) => x.id === NPC.id);
                if (idx !== -1) {
                    team.splice(idx, 1);
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} SAND CLONE: **${user.name}**'s clone of **${user.name}** has disappeared...`
                    );
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            },
        });
    },
};

export const SandProjectiles: Ability = {
    name: "Sand Projectiles",
    description: "shoot or propel sand at high speeds towards its targets",
    cooldown: 5,
    damage: 20,
    blockable: true,
    dodgeable: true,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
};

export const SandMimicry: Ability = {
    name: "Sand Mimicry",
    description:
        "The Fool can disperse its body to avoid physical attacks or slip through narrow spaces, attacking remotely (x100 perception huge boost for **3 turns**)",
    cooldown: 6,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = user.skillPoints;
        user.skillPoints.perception *= 100;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND MIMICRY: **${user.name}**'s perception has been boosted by x100...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} SAND MIMICRY: **${user.name}**'s perception has been reset...`
                );
            },
        });
    },
};

export const SandStorm: Ability = {
    name: "Sand Storm",
    description:
        "has the ability to create sandstorms, hindering visibility and disorienting opponents",
    cooldown: 9,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints: { [key: string]: SkillPoints } = {};
        for (const fighter of ctx.fighters.filter(
            (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
        )) {
            oldSkillPoints[fighter.id] = fighter.skillPoints;
            fighter.skillPoints.perception = Math.round(fighter.skillPoints.perception * 0.1);
            fighter.skillPoints.speed = Math.round(fighter.skillPoints.speed * 0.1);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand.emoji} SAND STORM: **${user.name}** has decreased **${fighter.name}**'s perception & speed by 90%...`
            );
        }

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight: { turns: { logs: string[] }[] }) => {
                for (const fighter of ctx.fighters.filter(
                    (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
                )) {
                    fighter.skillPoints = oldSkillPoints[fighter.id];
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} SAND STORM: **${user.name}**'s sand storm EFFECT has disappeared...`
                    );
                }
            },
        });
    },
};

export const SandSelfHealing: Ability = {
    name: "Sand Self Healing",
    description:
        "can heal itself (+15% max health) by reforming its sand particles around injuries and aiding in the recovery process",
    cooldown: 8,
    damage: 0,
    blockable: false,
    dodgeable: false,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.15);
        user.health += heal;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND SELF HEALING: **${user.name}** has healed himself by **${heal}** health...`
        );
    },
};
