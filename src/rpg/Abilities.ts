import { Ability, FightableNPC, SkillPoints } from "../@types";
import { FightHandler, Fighter, FighterRemoveHealthTypes } from "../structures/FightHandler";
import { cloneDeep } from "lodash";
import * as Stands from "./Stands/Stands";
import * as Functions from "../utils/Functions";

export const StandBarrage: Ability = {
    name: "Stand Barrage",
    description:
        "Performs an astoundingly fast flurry of punches that deals a small amount damage per hit.",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 10,
    dodgeScore: 2,
    target: "enemy",
};

export const KickBarrage: Ability = {
    name: "Kick Barrage",
    description:
        "Performs an astoundingly fast flurry of kicks that deals a small amount damage per hit.",
    cooldown: 3,
    extraTurns: 0,
    damage: 8,
    stamina: 6,
    dodgeScore: 1,
    target: "enemy",
};

export const StarFinger: Ability = {
    name: "Star Finger",
    description: "Extends {standName}'s finger and stabs the target in the eyes.",
    cooldown: 8,
    extraTurns: 1,
    damage: 39,
    stamina: 18,
    dodgeScore: 9,
    target: "enemy",
};

export const RoadRoller: Ability = {
    ...StarFinger,
    name: "Road Roller",
    description:
        "Jumps into the sky and throws an entire Road Roller on the opponent. CAN STACK FREE TURNS IF ENOUGH SPEED!",
};

export const TheWorld: Ability = {
    name: "The World",
    description: "Stops time for 5 turns",
    cooldown: 10,
    extraTurns: 5,
    damage: 0,
    stamina: 35,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.nextTurnPromises.push({
            cooldown: 6,
            executeOnlyOnce: true,
            promise: (fight) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `> ${user.stand?.emoji} **${user.name}:** Toki wo Ugokidasu...`
                );
                user.hasStoppedTime = false;
            },
            id: "" + Date.now() + Math.random() + "",
        });
        user.hasStoppedTime = true;

        if (user.stand?.name === Stands.TheWorld.name) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand?.emoji} **${user.name}:** THE WORLD! TOKI WO TOMARE!`
            );
        } else if (user.stand?.name === Stands.StarPlatinum.name) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand?.emoji} **${user.name}:** STAR PLATINUM: THE WORLD! TOKI WO TOMARE!`
            );
        } else if (user.stand?.id === Stands.TheChained.id) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand?.emoji} **${user.name}:** This world and mine, and what is yours is also mine... `
            );
        } else
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand?.emoji} **${user.name}:** ${user.stand?.name}: TOKI WO TOMARE!`
            );
    },
    dodgeScore: 0,
    target: "self",
};

export const EmeraldSplash: Ability = {
    name: "Emerald Splash",
    description: "Fires off a large amount of energy which takes the form of emeralds.",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 15,
    dodgeScore: 10,
    target: "enemy",
};

export const VolaBarrage: Ability = {
    ...EmeraldSplash,
    name: "Vola Barrage",
    description: "Sends a wave of bullets in the direction the user is facing.",
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382611634913391/AdorableRemoteBigmouthbass-mobile.gif",
    dodgeScore: 3,
    target: "enemy",
};

export const LittleBoy: Ability = {
    name: "Little Boy",
    description: "Drop 3 bombs behind its opponent that will explode instantly.",
    cooldown: 8,
    extraTurns: 1,
    extraTurnsIfGB: 1,
    damage: 15,
    stamina: 8,
    dodgeScore: 3,
    target: "enemy",
};

export const Manipulation: Ability = {
    name: "Manipulation",
    description: "Manipulates the opponent's body, causing them to be uncontrollable.",
    cooldown: 10,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const baseTarget = cloneDeep(target);
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
                `${user.stand?.emoji} (target: ${target.name}) has been released from manipulation.`
            );
            unmanipulated = true;
        };

        if (user.manipulatedBy) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `**${user.manipulatedBy.name}:** [ERROR: cannot manipulate if already manipulated]`
            );
            return;
        } else if (target.manipulatedBy) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `**${user.name}:** [ERROR: cannot manipulate ${target.name} because they are already manipulated by ${target.manipulatedBy.name}]`
            );
            return;
        } else {
            target.name += " (Manipulated)";
            target.manipulatedBy = user;
            ctx.nextRoundPromises.push({
                cooldown: 2,
                executeOnlyOnce: true,
                promise: (fight) => {
                    unmanipulate(fight);
                },
                id: "" + Date.now() + Math.random() + "",
            });

            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand?.emoji} **${user.name}:** ${user.stand?.name}: Manipulation! (target: ${target.name})`
            );
        }
    },
    damage: 0,
    stamina: TheWorld.stamina,
    extraTurns: 0,
    thumbnail: "https://media.tenor.com/zOTu19A7VoEAAAAC/jojo-hierophant-green.gif",
    dodgeScore: 1,
    target: "enemy",
};

export const LightSpeedBarrage: Ability = {
    name: "Light-Speed Barrage",
    description: "Erases matter itself to punch the opponent.",
    cooldown: 5,
    damage: 12.5,
    stamina: 15,
    extraTurns: 1,
    thumbnail: "https://media.tenor.com/X1JHf1sGkwIAAAAd/okuyasu-the-hand.gif",
    dodgeScore: 4,
    target: "enemy",
};

export const DeadlyErasure: Ability = {
    name: "Deadly Erasure",
    description: "Erases Space itself and yses the element of surprise to catch you off guard.",
    cooldown: 15,
    damage: 35,
    stamina: 15,
    extraTurns: 2,
    special: true,
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382190166081647/RawDaringEeve-mobile.gif",
    dodgeScore: 4,
    target: "enemy",
};

const burnDamagePromise = (ctx: FightHandler, target: Fighter, damage: number, user: Fighter) => {
    ctx.nextTurnPromises.push({
        cooldown: 3,
        executeOnlyOnce: false,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `:fire: **${target.name}** took **${damage}** burn damage`
            );
            if (target.health > 0) {
                const oldHealth = target.health;
                target.health -= damage;
                user.totalDamageDealt += oldHealth - target.health;
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

const bleedDamagePromise = (
    ctx: FightHandler,
    target: Fighter,
    damage: number,
    user: Fighter,
    cooldown?: number
) => {
    ctx.nextTurnPromises.push({
        cooldown: cooldown ? cooldown : 3,
        executeOnlyOnce: false,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `🩸 **${target.name}** took **${damage}** bleed damage`
            );
            if (target.health > 0) {
                const oldHealth = target.health;
                target.health -= damage;
                user.totalDamageDealt += oldHealth - target.health;
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
    description: "Launches 1 cross in the shape of an ankh at the oppenent.",
    cooldown: 5,
    damage: 10,
    stamina: 12,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    thumbnail: "https://media.tenor.com/n79QWE9azhEAAAAC/magicians-red-avdol.gif",
    dodgeScore: 1,
    target: "enemy",
};

export const RedBind: Ability = {
    name: "Red Bind",
    description: "Slashes two swings at the opponent with fiery chains.",
    cooldown: 7,
    damage: 17,
    stamina: 15,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, RedBind) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy",
};

export const Bakugo: Ability = {
    name: "Bakugo",
    description: "Grabs the opponent before engulfing their head in flames.",
    cooldown: 12,
    damage: 25,
    stamina: 15,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Bakugo) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    special: true,
    dodgeScore: 3,
    target: "enemy",
};
/**
 * Hermit Purple DESU
 */

export const OhMyGod: Ability = {
    name: "Oh My God",
    description: "BOOSTS ALL YOUR STATS BY 100% FOR 3 TURNS LETS GOOOOO",
    cooldown: 4,
    damage: 0,
    stamina: 0,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(user.skillPoints);

        for (const stat in user.skillPoints) {
            user.skillPoints[stat as keyof typeof user.skillPoints] += Math.min(
                user.skillPoints[stat as keyof typeof user.skillPoints],
                75
            );
        }

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD! **${user.name}**'s skill points have been boosted by 100%...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD! **${user.name}**'s EFFECT has disappeared...`
                );
            },
        });
    },
    thumbnail: "https://media.tenor.com/RQtghGnCYxEAAAAd/jojo-oh-my-god.gif",
    dodgeScore: 0,
    target: "self",
};
export const VineSlap: Ability = {
    name: "Vine Slap",
    description: "Extends {standName}'s vines to whip twice in the opponent's direction.",
    cooldown: 4,
    damage: 15,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
    target: "enemy",
};

export const VineBarrage: Ability = {
    ...StandBarrage,
    name: "Vine Barrage",
    description: "Extends {standName}'s vines to whip the opponent.",
    target: "enemy",
};

/**
 * THIS ABILITY IS ONLY FOR SEX PISTOLS OR ELSE IT WILL CRASH
 */
export const BulletsRafale: Ability = {
    name: "Bullets Rafale",
    description: "Fires all your bullets at once.",
    cooldown: 3,
    damage: 0,
    stamina: 35,
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
            user.stand?.customAttack.handleAttack(
                ctx,
                user,
                target,
                Functions.getAttackDamages(user)
            );
        }
        ctx.ctx.client.fightCache.delete(bulletId + "fireX");
    },
    dodgeScore: 0,
    target: "enemy",
};

export const DeterminationFlurry: Ability = {
    name: "Determination Flurry",
    description: "A Barrage with multiple slashes (+ bleed damage).",
    cooldown: 5,
    damage: 25,
    stamina: 40,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy",
};

export const FencingBarrage: Ability = {
    ...StandBarrage,
    name: "Fencing Barrage",
    description: "A Barrage with multiple slashes.",
    target: "enemy",
};

export const Finisher: Ability = {
    name: "Finisher",
    description:
        "Attack or finish the opponent by aiming at one of his vital parts [CRITICAL, BLEED DAMAGE].",
    cooldown: 8,
    damage: 50,
    stamina: 40,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy",
};

export const LifeTransference: Ability = {
    name: "Life Transference",
    description:
        "Transfers life force between individuals, healing allies by 30% of their max health or heavily damaging enemies.",
    cooldown: 6,
    damage: 0,

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
                `${user.stand?.emoji} LIFE TRANSFERENCE: ${target.name} has been healed for **${(
                    target.health - oldHealth
                ).toLocaleString("en-US")}** health.`
            );
        } else {
            // Drain the life force of the enemy
            const drainAmount = Functions.getAttackDamages(user) * 3;
            const oldHealth = target.health;
            target.incrHealth(-drainAmount);
            user.totalDamageDealt += drainAmount;
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand?.emoji} LIFE TRANSFERENCE: ${target.name} has lost **${(
                    oldHealth - target.health
                ).toLocaleString("en-US")}** health due to life force drain.`
            );
        }
    },
    dodgeScore: 0,
    target: "any",
};

export const RequiemArrowBlast: Ability = {
    name: "Requiem Arrow Blast",
    description: "Unleashes **__an extremely powerful__** blast of energy using its requiem arrow.",
    cooldown: 12,
    damage: 65,
    stamina: 60,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
};

export const EternalSleep: Ability = {
    name: "Eternal Sleep",
    description:
        "Induces a deep sleep on anyone within its range, even allies, except if they are strong enough to resist it.",
    cooldown: 5,
    trueDodgeScore: 3,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((x) => x.id !== user.id)
            .forEach((x) => {
                const status = target.removeHealth(0, user, 3);

                if (status.type !== FighterRemoveHealthTypes.Dodged) {
                    x.frozenFor += 4;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} ETERNAL SLEEP: **${user.name}** has put **${x.name}** to sleep for 4 turns...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} ETERNAL SLEEP: **${x.name}** resisted.`
                    );
                }
            });
    },
    dodgeScore: 0,
    target: "self",
};

export const StandDisc: Ability = {
    name: "Stand Disc",
    description: "Removes the stand of the target temporarily.",
    cooldown: 9,
    damage: 0,
    stamina: 50,
    special: true,
    extraTurns: 0,
    thumbnail: "https://i.imgur.com/7CJQST6.gif",
    dodgeScore: 7,
    useMessage: (user, target, damage, ctx) => {
        if (!target.stand) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `:x: **${target.name}** doesn't have a stand to remove.`
            );
            return;
        }

        const stand = target.stand;
        target.stand = null;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} STAND DISC: **${user.name}** has removed temporarily the stand of **${target.name}**... (${stand?.name} ${stand?.emoji})`
        );
        ctx.nextRoundPromises.push({
            cooldown: 6,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                target.stand = stand;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} STAND DISC: **${target.name}** has recovered their stand?... (${stand?.name} ${stand?.emoji})`
                );
            },
        });
    },
    target: "enemy",
};

export const Hallucinogen: Ability = {
    name: "Hallucinogen",
    description:
        "Creates a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%.",
    cooldown: 7,
    damage: 0,
    stamina: 50,
    thumbnail: "https://i.imgur.com/b2xmYoo.gif",
    special: true,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
            .forEach((x) => {
                x.skillPoints.perception = Math.round(x.skillPoints.perception * 0.1);
                x.skillPoints.speed = Math.round(x.skillPoints.speed * 0.1);
            });
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} HALLUCINOGEN: **${user.name}** has created a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%...`
        );
        ctx.nextRoundPromises.push({
            cooldown: 5,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                ctx.availableFighters
                    .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
                    .forEach((x) => {
                        x.skillPoints.perception = Math.round(x.skillPoints.perception / 0.1);
                        x.skillPoints.speed = Math.round(x.skillPoints.speed / 0.1);
                    });
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} HALLUCINOGEN: **${user.name}**'s hallucinogen EFFECT has disappeared...`
                );
            },
        });
    },
    target: "self",
};

export const Gun: Ability = {
    name: "Gun",
    description: "Shoots the target with a gun.",
    cooldown: 6,
    damage: 38,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
};

export const Heal: Ability = {
    name: "Heal",
    description: "Heals the target by 15% of the healer's max health.",
    cooldown: 4,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.15);
        target.health += heal;
        if (target.health > target.maxHealth) target.health = target.maxHealth;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} HEAL: **${user.name}** has healed **${
                target.name
            }** by **${heal}** health... ${
                ctx.getTeamIdx(user) === ctx.getTeamIdx(target) ? "" : "[You just Healed An Ememy!]"
            }`
        );
    },
    target: "onlyAlly",
};

export const LifeShot: Ability = {
    name: "Life Shot",
    description: "Causes your opponent's soul to leave their body for some turns.",
    cooldown: 11,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor += 4;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} LIFE SHOT: **${user.name}** has caused **${target.name}**'s soul to leave their body for 4 turns...`
        );
    },
    target: "enemy",
};

export const LifeGiver: Ability = {
    name: "Life Giver",
    description:
        "Gold Experience can imbue inanimate objects with life, creating living organisms. These organisms can be used for various purposes, such as attacking enemies or providing support to allies",
    cooldown: 5,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
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
            `- ${user.stand?.emoji} LIFE GIVER: **${user.name}** has created a clone of **${target.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const idx = team.findIndex((x) => x.id === NPC.id);
                if (idx !== -1) {
                    team.splice(idx, 1);
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} LIFE GIVER: **${user.name}**'s clone of **${target.name}** has disappeared...`
                    );
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            },
        });
    },
    target: "self",
};

// sand clone ability, similar to life giver
export const SandClone: Ability = {
    name: "Sand Clone",
    description:
        "The Fool can create clones of itself out of sand, which can be used to attack or defend.",
    cooldown: 3,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const teamIndex = ctx.getTeamIdx(user);
        const team = ctx.teams[teamIndex];

        const NPC: FightableNPC = {
            id: `${user.name}_sand_clone`,
            name: `${user.name}'s Sand Clone`,
            skillPoints: {
                strength: Math.round(user.skillPoints.strength) / 10,
                perception: Math.round(user.skillPoints.perception) / 10,
                speed: Math.round(user.skillPoints.speed) / 10,
                defense: Math.round(user.skillPoints.defense) / 10,
                stamina: Math.round(user.skillPoints.stamina) / 10,
            },
            level: Math.round(user.level / 10),
            stand: user.stand?.id,
            equippedItems: user.equippedItems,
            standsEvolved: user.standsEvolved,
            emoji: user.stand?.emoji ?? "🤷‍♂️",
        };
        Functions.generateSkillPoints(NPC);

        const fighter = new Fighter(NPC);
        fighter.npc = true;
        fighter.summonedBy = user.id;

        team.push(fighter);
        ctx.fighters.push(fighter);
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} SAND CLONE: **${user.name}** has created a clone of **${user.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const userr = fight.fighters.find((x) => x.id === user.id);
                const npcc = fight.fighters.find((x) => x.id === NPC.id);

                userr.totalDamageDealt += npcc.totalDamageDealt;
                for (const team of fight.teams) {
                    if (team.find((x) => x.id === NPC.id)) {
                        team.splice(
                            team.findIndex((x) => x.id === NPC.id),
                            1
                        );
                    }
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            },
        });
    },
    target: "self",
};

export const SandProjectiles: Ability = {
    name: "Sand Projectiles",
    description: "Shoot or propel sand at high speeds towards the targets.",
    cooldown: 5,
    damage: 14,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
    target: "enemy",
};

export const SandMimicry: Ability = {
    name: "Sand Mimicry",
    description:
        "The Fool can disperse its body to avoid physical attacks or slip through narrow spaces, attacking remotely (x100 perception boost for **3 turns**).",
    cooldown: 6,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(user.skillPoints);
        user.skillPoints.perception *= 100;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} SAND MIMICRY: **${user.name}**'s perception has been boosted by x100...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} SAND MIMICRY: **${user.name}**'s perception has been reset...`
                );
            },
        });
    },
    target: "self",
};

export const SandStorm: Ability = {
    name: "Sand Storm",
    description:
        "The ability to create sandstorms, hindering visibility and disorienting opponents.",
    cooldown: 9,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints: { [key: string]: SkillPoints } = {};
        for (const fighter of ctx.fighters.filter(
            (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
        )) {
            oldSkillPoints[fighter.id] = cloneDeep(fighter.skillPoints);
            fighter.skillPoints.perception = Math.round(fighter.skillPoints.perception * 0.1);
            fighter.skillPoints.speed = Math.round(fighter.skillPoints.speed * 0.1);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} SAND STORM: **${user.name}** has decreased **${fighter.name}**'s perception & speed by 90%...`
            );
        }

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                for (const fighter of ctx.fighters.filter(
                    (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
                )) {
                    if (!fight.fighters.find((x) => x.id === fighter.id)) return;
                    fighter.skillPoints = oldSkillPoints[fighter.id];
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} SAND STORM: **${user.name}**'s sand storm EFFECT has disappeared...`
                    );
                }
            },
        });
    },
    target: "enemy",
};

export const SandSelfHealing: Ability = {
    name: "Sand Self Healing",
    description:
        "Can heal itself (+15% of max health) by reforming its sand particles around injuries, aiding in the recovery process.",
    cooldown: 8,
    damage: 0,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.15);
        user.health += heal;
        if (user.health > user.maxHealth) user.health = user.maxHealth;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} SAND SELF HEALING: **${user.name}** has healed himself by **${heal}** health...`
        );
    },
    target: "self",
};

export const SwiftStrike: Ability = {
    name: "Swift Strike",
    description: "Unleash a lightning-fast strike with your katana, dealing massive damage.",
    cooldown: 5,
    damage: 15,
    stamina: 30,
    extraTurns: 1,
    dodgeScore: 3,
    target: "enemy",
};

export const BerserkersFury: Ability = {
    name: "Berserker's Fury",
    description:
        "Enter a state of berserk fury, greatly increasing your attack power for a limited time.",
    cooldown: 6,
    damage: 0,

    stamina: 20,
    extraTurns: 4,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const strengthIncrease = Math.round(user.skillPoints.strength * 0.25); // 25% strength increase
        const defenseDecrease = Math.round(user.skillPoints.defense * 0.1); // 10% defense decrease
        const maxHealth = Math.round(user.maxHealth * 0.1); // 10% decrease in max health
        const health = Math.round(user.health * 0.1); // 10% decrease in current health

        user.skillPoints.strength += strengthIncrease;
        user.skillPoints.defense -= defenseDecrease;
        user.health -= health; // 10% decrease in current health
        user.maxHealth -= maxHealth; // 10% decrease in max health
        user.maxHealth -= Math.round(user.maxHealth * 0.1); // 10% decrease in max health
        ctx.turns[ctx.turns.length - 1].logs.push(
            `<:emoji_177:1136204824803819651> **${user.name}** enters a state of berserker's fury! Their strength is increased by **${strengthIncrease}**, but their defense and max health suffer.`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints.strength -= strengthIncrease;
                user.skillPoints.defense += defenseDecrease;
                user.maxHealth += maxHealth;
                user.health += health;
                fight.turns[fight.turns.length - 1].logs.push(
                    `<:emoji_177:1136204824803819651> **${user.name}**'s berserker's fury has worn off.`
                );
            },
        });
    },
    dodgeScore: 0,
    target: "self",
};

export const BerserkersRampage: Ability = {
    name: "Berserker's Rampage",
    description:
        "Enter a state of berserk ramapage, attacking every enemies with a flurry of strikes.",
    cooldown: 7,
    damage: 0,
    stamina: 20,
    extraTurns: 4,
    trueDodgeScore: 4,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const damages = Math.round(Functions.getAttackDamages(user) * 1.75);
                const status = x.removeHealth(damages, user, 4);
                if (status.type !== FighterRemoveHealthTypes.Dodged) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.weapon.emoji} RAMPAGE: **${
                            user.name
                        }** has dealt **${damages.toLocaleString("en-US")}** damages to **${
                            x.name
                        }**.`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} RAMPAGE: **${x.name}** dodged.`
                    );
                }
            });
    },
    dodgeScore: 0,
    target: "self",
};

export const KnivesThrow: Ability = {
    name: "Knives Throw",
    description:
        "Throw a flurry of knives at your opponent, dealing damage and reducing their stamina by 3% of their max stamina.",
    cooldown: 5,
    damage: 0,
    dodgeScore: 0,
    trueDodgeScore: 4,
    stamina: 30,
    extraTurns: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        for (let i = 0; i < 4; i++) {
            const damages = Math.round(Functions.getAttackDamages(user) * 0.75);
            const status = user.removeHealth(damages, user, 4);

            if (status.type === FighterRemoveHealthTypes.Dodged) {
                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.weapon.emoji} KNIVES THROW: **${target.name}** dodged.`
                );
            } else {
                const stamina = Math.round(target.maxStamina * 0.03);
                target.stamina -= stamina;
                if (target.stamina <= 0) target.stamina = 0;
                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.weapon.emoji} KNIVES THROW: **${
                        user.name
                    }** has dealt **${status.amount.toLocaleString("en-US")}** damages to **${
                        target.name
                    }** and reduced their stamina by **${stamina}**.`
                );
            }
        }
    },
};

export const GasolineBullets: Ability = {
    name: "Gasoline Bullets",
    description: "Shoots bullets made of gasoline at every enemy.",
    cooldown: 5,
    damage: 0,
    dodgeScore: 0,
    trueDodgeScore: 2,
    stamina: 30,
    extraTurns: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const damages = Math.round(Functions.getAttackDamages(user) * 3);
                const status = x.removeHealth(damages, user, 2);

                if (status.type !== FighterRemoveHealthTypes.Dodged) {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} GASOLINE BULLETS: **${
                            user.name
                        }** has dealt **${damages.toLocaleString("en-US")}** damages to **${
                            x.name
                        }**.`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} GASOLINE BULLETS: **${x.name}** dodged...`
                    );
                }
            });
    },
};

export const CarCrash: Ability = {
    name: "Car Crash",
    description: "Crashes a car into the opponent, dealing massive damage.",
    cooldown: 5,
    damage: StandBarrage.damage,
    dodgeScore: 0,
    stamina: 30,
    extraTurns: 0,
    target: "enemy",
};

export const Transformation: Ability = {
    name: "Transformation",
    description: "Boosts all your skill points by 100% (Max: 75) for 2 turns.",
    cooldown: 5,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(user.skillPoints);

        for (const stat in user.skillPoints) {
            user.skillPoints[stat as keyof typeof user.skillPoints] += Math.min(
                user.skillPoints[stat as keyof typeof user.skillPoints],
                75
            );
        }

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} TRANSFORMATION: **${user.name}**'s skill points have been boosted by 100%...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} TRANSFORMATION: **${user.name}**'s transformation EFFECT has disappeared...`
                );
            },
        });
    },
    target: "self",
};

export const Rage: Ability = {
    name: "Rage",
    description:
        "When enabled, the more damage you take, the more damage you deal for 3 turns (+5 strength everytime you loose 1% of your max health). [USABLE PASSIVE, USES NO STAMINA].",
    cooldown: 5,
    damage: 0,
    thumbnail: "https://i.imgur.com/S0RUnuC.gif",
    stamina: 0,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        let currentHealth = user.health;
        const oldStrength = user.skillPoints.strength;

        const endId = Functions.generateRandomId();
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} RAGE: **${user.name}** has entered a state of rage...`
        );

        ctx.nextTurnPromises.push({
            cooldown: 4,
            id: Functions.generateRandomId(),
            executeOnlyOnce: false,
            promise: (fight) => {
                if (user.health < currentHealth) {
                    // add +5 strength every time user loses 1% of Functions.maxHealth(user);
                    const healthLost = currentHealth - user.health;
                    const strengthToAdd = Math.round(healthLost * 0.05);
                    user.skillPoints.strength += strengthToAdd;
                    currentHealth = user.health;
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} RAGE: **${user.name}** has gained **${strengthToAdd}** strength due to rage...`
                    );
                }
            },
        });

        ctx.nextRoundPromises.push({
            cooldown: 4,
            executeOnlyOnce: true,
            id: endId,
            promise: (fight) => {
                user.skillPoints.strength = oldStrength;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} RAGE: **${user.name}**'s rage EFFECT has disappeared...`
                );
            },
        });
    },
};

export const ScytheSlash: Ability = {
    name: "Scythe Slash",
    description: "Slash your opponent with your scythe, dealing damage.",
    cooldown: 3,
    damage: 20,
    stamina: 5,
    dodgeScore: 0,
    extraTurns: 0,
    target: "enemy",
};

export const MysteriousGas: Ability = {
    name: "Mysterious Gas",
    description: "Release a mysterious gas that will confuse every enemies for 3 turns.", // every fighters except allies frozenFor += 3
    cooldown: 7,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    trueDodgeScore: 3,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const status = x.removeHealth(1, user, 3);

                if (status.type !== FighterRemoveHealthTypes.Dodged) {
                    x.frozenFor += 3;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} MYSTERIOUS GAS: **${user.name}** has confused **${x.name}** for 3 turns...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} MYSTERIOUS GAS: **${x.name}** resisted.`
                    );
                }
            });
    },
    target: "self",
};

export const PoisonGas: Ability = {
    name: "Poison Gas",
    description:
        "Release a poisonous gas that will poison every enemies for 3 turns This will also damage your teammates including you but 90% less.", // deals your atk damage every turn to every opponents for some turns. 10% of your atk damage is also dealt to you every turn.
    cooldown: 8,
    damage: 0,
    thumbnail: "https://i.imgur.com/fJSzpMQ.gif",
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const poisonDamage = Math.round(Functions.getAttackDamages(user));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand?.emoji} POISON GAS: **${user.name}** has released a poisonous gas...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 4,
            id: Functions.generateRandomId(),
            executeOnlyOnce: false,
            promise: (fight) => {
                fight.availableFighters.forEach((fighter) => {
                    const damages =
                        fight.getTeamIdx(fighter) !== fight.getTeamIdx(user)
                            ? poisonDamage
                            : Math.round(poisonDamage * 0.1);
                    fighter.health -= damages;
                    if (fighter.health <= 0) fighter.health = 0;
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand?.emoji} POISON GAS: **${
                            user.name
                        }** has dealt **${damages.toLocaleString("en-US")}** damages to **${
                            fighter.name
                        }**.`
                    );
                });
            },
        });
    },
    target: "self",
};

export const HealBarrage: Ability = {
    name: "Heal Barrage",
    description: "Basic Stand Barrage but heals your allies by 200% of the damages done.",
    cooldown: 4,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    thumbnail: "https://i.imgur.com/X5l1Pbi.gif",
    dodgeScore: StandBarrage.dodgeScore,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const damages = Math.round(Functions.getAbilityDamage(user, StandBarrage));
        const heal = Math.round(damages * 2);

        const oldHealth = target.health;
        target.health -= damages;
        user.totalDamageDealt += oldHealth - target.health;

        if (target.health <= 0) target.health = 0;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand?.emoji} HEAL BARRAGE: **${
                user.name
            }** has dealt **${damages.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        ctx.availableFighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user))
            .filter((w) => w.health > 0)
            .filter((z) => z.id !== user.id)
            .forEach((x) => {
                x.health += heal;
                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} HEAL BARRAGE: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });
    },
};

export const Restoration: Ability = {
    name: "Restoration",
    description: `Heals 10% of the healer's max health to every allies, except yourself **[Do not use this ability if you don't have any allies]**.`,
    cooldown: 6,
    damage: 0,
    stamina: 35,
    thumbnail: "https://i.imgur.com/zzamMNN.gif",
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.1);

        ctx.availableFighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user))
            .filter((w) => w.id !== user.id)
            .forEach((x) => {
                x.health += heal;

                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} RESTORATION: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });
    },
};

export const YoAngelo: Ability = {
    name: "Yo Angelo",
    description: "Transforms the target into a rock for 3 turns.",
    cooldown: 8,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
    special: true,
    thumbnail: "https://i.imgur.com/NZ1wC8E.gif",
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor += 3;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} YO ANGELO: **${user.name}** has transformed **${target.name}** into a rock for 3 turns... LOL GET CLAPPED BOZO`
        );
    },
};

export const HealPunch: Ability = {
    name: "Heal Punch",
    description: "Punches the target, healing your teammates by 150% of the damage dealt.",
    cooldown: 4,
    damage: 0,
    thumbnail: "https://i.imgur.com/6NMBlem.gif",
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const damages = Math.round(Functions.getAbilityDamage(user, StandBarrage) * 0.75);

        const oldHealth = target.health;
        target.health -= damages;
        user.totalDamageDealt += oldHealth - target.health;

        if (target.health <= 0) target.health = 0;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand?.emoji} HEAL PUNCH: **${
                user.name
            }** has dealt **${damages.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        ctx.availableFighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user))
            .filter((w) => w.id !== user.id)
            .forEach((x) => {
                const heal = Math.round(damages * 1.5);
                x.health += heal;

                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} HEAL PUNCH: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });
    },
};

export const CoinBarrage: Ability = {
    ...StandBarrage,
    name: "Coin Barrage",
    description: "Unleash a barrage of coins, that explodes on impact.",
};

const poisonDamagePromise = (
    ctx: FightHandler,
    target: Fighter,
    damage: number,
    user: Fighter,
    cooldown: number
) => {
    ctx.nextRoundPromises.push({
        cooldown,
        executeOnlyOnce: false,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `☠️🧪☣️ **${target.name}** took **${damage}** poison damage`
            );
            if (target.health > 0) {
                const oldHealth = target.health;
                target.health -= damage;
                user.totalDamageDealt += oldHealth - target.health;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `☠️🧪☣️ **${target.name}** died from poison damage`
                    );
                }
            }
        },
        id: "" + Date.now() + Math.random() + "",
    });
};

export const CapsuleShot: Ability = {
    name: "Capsule Shot",
    description: "Shoots the capsules from your fist at your enemy, poisoning them for 5 turns.",
    cooldown: 7,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://i.imgur.com/tpSzFjD.gif",
    useMessage: (user, target, damage, ctx) => {
        const damageX = Functions.getAttackDamages(user);
        const oldHealth = target.health;
        target.health -= damageX;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand?.emoji} CAPSULE SHOT: **${
                user.name
            }** has dealt **${damageX.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        poisonDamagePromise(ctx, target, burnDamageCalc, user, 3);
    },
};

export const LightManifestation: Ability = {
    name: "Light Manifestation",
    description:
        "Become light and slash your opponent for heavy, giving you 2 extra turns. Not dodgeable",
    cooldown: 3,
    damage: 35,
    stamina: 15,
    extraTurns: 2,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://static.wikia.nocookie.net/jjba/images/8/8d/Hanged_man_powa.gif",
};

export const WristKnives: Ability = {
    name: "Wrist Knives",
    description: "Shoots knives from your wrists at all your enemies (x2 knives).",
    cooldown: 5,
    damage: 0,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    trueDodgeScore: 3,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const damages = Math.round(Functions.getAttackDamages(user));
                for (let i = 0; i < 2; i++) {
                    const status = x.removeHealth(damages, user, 3);

                    if (status.type === FighterRemoveHealthTypes.Dodged) {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `- ${user.stand?.emoji} WRIST KNIVES: **${x.name}** dodged.`
                        );
                    } else {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `- ${user.stand?.emoji} WRIST KNIVES: **${
                                user.name
                            }** has dealt **${status.amount.toLocaleString(
                                "en-US"
                            )}** damages to **${x.name}**.`
                        );
                    }
                }
            });
    },
};

export const HomingBullets: Ability = {
    name: "Homing Bullets",
    description:
        "Shoots a bullet that will follow the enemy and hit him. This bullet can change its trajectory and is very hard to dodge.",
    cooldown: 3,
    damage: 35,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 5,
    target: "enemy",
};

export const RapidStrikes: Ability = {
    name: "Rapid Strikes - Wing Cutter",
    description:
        "Tower of Gray's wings move at incredible speeds, delivering a flurry of razor-sharp strikes to the enemy.",
    cooldown: 4,
    damage: 20,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 4,
    target: "enemy",
};

export const Razor_SharpScales: Ability = {
    ...RapidStrikes,
    name: "Razor-Sharp Scales",
    description:
        "Dark Blue Moon can also use its scales as projectiles, throwing them against the enemy.",
};

export const ObjectManipulation: Ability = {
    ...KickBarrage,
    name: "Object Manipulation",
    description: "Strength is capable of manipulating objects to attack the enemy.",
    cooldown: 2,
    damage: 12,
};

export const ViolentBurst: Ability = {
    description:
        "Spice Girl quickly makes an object go back to its original state making a burst happen sending the enemy back.",
    name: "Violent Burst",
    cooldown: 6,
    damage: StandBarrage.damage + 4,
    dodgeScore: 1,
    stamina: 15,
    extraTurns: 0,
    target: "enemy",
};

/**
 * Bones elargement: makes your bone biggers so it doubles your hp & max hp for 3 turns
 */
export const BonesEnlargement: Ability = {
    name: "Bones Enlargement",
    description: "Makes your bones bigger, doubling your max health for 3 turns.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const oldMaxHealth = user.maxHealth;
        user.maxHealth *= 2;
        user.health *= 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} BONES ELARGEMENT: **${user.name}**'s bones have been enlarged...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.maxHealth = oldMaxHealth;
                user.health = Math.min(user.health, user.maxHealth);
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} BONES ELARGEMENT: **${user.name}**'s bones have returned to their normal size...`
                );
            },
        });
    },
    target: "self",
};

/**
 * Arm splitter: You enclose your opponents arm bones until they snap, causing bleed damage and does dmg based on strength.
 */
export const ArmSplitter: Ability = {
    name: "Arm Splitter",
    description:
        "You enclose your opponents arm bones until they snap, causing bleed damage and does dmg based on strength.",
    cooldown: 7,
    damage: 0,

    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);

        const armsplitterdmg = Math.round(Functions.getAttackDamages(user) * 1.89);
        const oldHealth = target.health;
        target.health -= armsplitterdmg;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} ARM SPLITTER: **${
                user.name
            }** has dealt **${armsplitterdmg.toLocaleString("en-US")}** damages to **${
                target.name
            }**.`
        );
    },
    target: "enemy",
};

/**
 * Fist enlargement: You enlarge your fist, throwing a giant fist at the enemy! Does damage based on strength.
 */
export const FistEnlargement: Ability = {
    ...Finisher,
    name: "Fist Enlargement",
    description:
        "You enlarge your fist, throwing a giant fist at the enemy! Does damage based on strength.",
};

/**
 * Heart breaker:You enclose your opponents ribs, causing it to press down on the opponents lungs and heart. Bleed damage and does damage based on strength.
 * ULTIMATE, DEALS A LOT OF DMG
 */
export const HeartBreaker: Ability = {
    name: "Heart Breaker",
    description:
        "You enclose your opponents ribs, causing it to press down on the opponents lungs and heart. Bleed damage and does damage based on strength, giving you an extra turn.",
    cooldown: 10,
    damage: 0,
    stamina: 70,
    extraTurns: 1,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);

        const heartbreakerdmg = Math.round(Functions.getAttackDamages(user) * 4.5);
        target.health -= heartbreakerdmg;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += heartbreakerdmg;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} HEART BREAKER: **${
                user.name
            }** has dealt **${heartbreakerdmg.toLocaleString("en-US")}** damages to **${
                target.name
            }**.`
        );
    },
    target: "enemy",
};

/**
 * Bone Spear: basic ability, does damage based on strength.
 */
export const BoneSpear: Ability = {
    ...KickBarrage,
    name: "Bone Spear",
    description: "You throw a spear made of bone at the enemy.",
};

export const SheerHeartAttackBTD: Ability = {
    name: "Sheer Heart Attack [BTD ver.]",
    description: "Creates a bomb that will explode AT EVERY ENEMY for 3 turns.",
    cooldown: 3,
    damage: 0,
    stamina: 10,
    extraTurns: 0,
    thumbnail: "https://i.imgur.com/BpbkcRG.gif",
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        ctx.nextTurnPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const bombDamage = Math.round(Functions.getAttackDamages(user) * 3.5);
                fight.availableFighters
                    .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
                    .forEach((x) => {
                        x.health -= bombDamage;
                        if (x.health <= 0) x.health = 0;
                        user.totalDamageDealt += bombDamage;
                        fight.turns[fight.turns.length - 1].logs.push(
                            `- ${user.stand?.emoji} SHEER HEART ATTACK: **${
                                user.name
                            }**'s bomb exploded, dealing **${bombDamage.toLocaleString(
                                "en-US"
                            )}** damages to **${x.name}**.`
                        );
                    });
            },
        });
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} SHEER HEART ATTACK: **${user.name}**'s bomb is now targetting **EVERY ENEMIES**...`
        );
    },
};

// sheer heart attack but only to a specific target
export const SheerHeartAttack: Ability = {
    name: "Sheer Heart Attack",
    description: "Creates a bomb that will explode in 3 turns.",
    cooldown: 4,
    damage: 0,
    stamina: 10,
    thumbnail: "https://i.imgur.com/BpbkcRG.gif",
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        ctx.nextTurnPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const bombDamage = Math.round(Functions.getAttackDamages(user) * 2);
                target.health -= bombDamage;
                if (target.health <= 0) target.health = 0;
                user.totalDamageDealt += bombDamage;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} SHEER HEART ATTACK: **${
                        user.name
                    }**'s bomb exploded, dealing **${bombDamage.toLocaleString(
                        "en-US"
                    )}** damages to **${target.name}**.`
                );
            },
        });
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} SHEER HEART ATTACK: **${user.name}**'s bomb is now targetting **${target.name}**.`
        );
    },
};

export const BitesTheDust: Ability = {
    name: "Bites The Dust",
    description: "Goes back 5 turns behind and gives you Infinity perception for the next 5 turns.",
    cooldown: 10,
    damage: 0,
    stamina: 0,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        if (ctx.turns.length > 5) {
            ctx.turns = ctx.turns.slice(0, ctx.turns.length - 5);
            ctx.nextRoundPromises = ctx.turns[ctx.turns.length - 1].nextRoundPromises.filter((x) =>
                x.id.includes("bites")
            );
            ctx.nextTurnPromises = ctx.turns[ctx.turns.length - 1].nextTurnPromises.filter((x) =>
                x.id.includes("bites")
            );
            ctx.fighters = ctx.turns[ctx.turns.length - 1].fighters;
            ctx.teams = ctx.turns[ctx.turns.length - 1].teams;
            ctx.infos = ctx.turns[ctx.turns.length - 1].infos;
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} KILLER QUEEN! BITES THE DUST...`
            );
        } else {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} KILLER QUEEN! BITES THE DUST... (only perception boost)`
            );
        }

        for (const cooldown of ctx.infos.cooldowns) {
            if (cooldown.move.toLowerCase().includes("bites")) {
                cooldown.cooldown = 999999;
            }
        }
        const oldSkillPoints = cloneDeep(user.skillPoints);
        user.skillPoints.perception = Infinity;

        ctx.nextRoundPromises.push({
            cooldown: 5,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} KILLER QUEEN! BITES THE DUST: **${user.name}**'s perception boost has disappeared...`
                );
            },
        });
    },
    target: "self",
};

export const Arrivederci: Ability = {
    ...Finisher,
    name: "Arrivederci",
    description: "Arrivederci.",
    thumbnail: "https://i.pinimg.com/originals/65/ae/27/65ae270df87c3c4adcea997e48f60852.gif",
};

export const ZipperPunch: Ability = {
    ...StandBarrage,
    name: "Zipper Punch",
    description:
        "Sticky Fingers delivers a lightning-fast punch, channeling the power of its zipper-enhanced fist",
    damage: StandBarrage.damage + 7,
};

export const DimensionUppercut: Ability = {
    ...StarFinger,
    name: "Dimension Uppercut",
    description:
        "You go into the zipper dimension and then fling yourself out underneath the opponent, giving a uppercut.",
};

export const CoinBomb: Ability = {
    ...KickBarrage,
    description: "Throw a coin bomb at one of your opponent.",
    name: "Coin Bomb",
    thumbnail: "https://i.imgur.com/IKMPUlz.gif",
    cooldown: 3,
    damage: 15,
};

// megumin's wand ability:
export const Explosion: Ability = {
    name: "Explosion",
    description: "Explosion!",
    cooldown: 4,
    damage: 12,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://media.tenor.com/RjnF10XDs4cAAAAC/megumin-explosion.gif",
};

// special ability for gold experience
// punch that drains the target's stamina and health and effects that lasts for 3 turns

const lifePunchPromise = (
    ctx: FightHandler,
    target: Fighter,
    damage: number,
    user: Fighter,
    cooldown: number,
    percentage: number
) => {
    // removes 3% of the opponent's max health and stamina

    ctx.nextRoundPromises.push({
        cooldown,
        executeOnlyOnce: false,
        promise: (fight) => {
            console.log("life punch promise");
            const healthLost = Math.round(target.maxHealth * percentage);
            const staminaLost = Math.round(target.maxStamina * percentage);
            const oldHealth = target.health;

            target.health -= healthLost;
            target.stamina -= staminaLost;

            if (target.health <= 0) target.health = 0;
            if (target.stamina <= 0) target.stamina = 0;
            user.totalDamageDealt += oldHealth - target.health;

            fight.turns[fight.turns.length - 1].logs.push(
                `🩸🩸🩸 **${target.name}** lost **${healthLost}** health and **${staminaLost}** stamina`
            );
        },
        id: "" + Date.now() + Math.random() + "",
    });
};

export const LifePunch: Ability = {
    name: "Life Punch",
    description:
        "Punch that drains the target's stamina and health (by 3% of their max stats) and effects that lasts for 3 turns.",
    cooldown: 8,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        lifePunchPromise(ctx, target, damage, user, 3, 0.03);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += xdamage;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} LIFE PUNCH: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
    },
};

// life punch for ger, but removes 8% of the target's max health and stamina
export const LifePunchGER: Ability = {
    ...LifePunch,
    name: "Life Punch",
    description:
        "Punch that drains the target's stamina and health (by **5%** of their max stats) and effects that lasts for 3 turns",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        lifePunchPromise(ctx, target, damage, user, 3, 0.05);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += xdamage;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} LIFE PUNCH: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
    },
};

export const InfiniteDeathLoop: Ability = {
    // punches the opponents 5 times, and then gives the user 5 extra turns
    name: "Infinite Death Loop",
    description: "Punches the opponents 5 times, and then gives the user 5 extra turns.",
    cooldown: 10,
    damage: 0,
    stamina: 25,
    extraTurns: 5,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        for (let i = 0; i < 5; i++) {
            const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
            const oldHealth = cloneDeep(target.health);
            target.health -= xdamage;
            if (target.health <= 0) target.health = 0;
            user.totalDamageDealt += oldHealth - target.health;

            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} INFINITE DEATH LOOP: **${
                    user.name
                }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
            );
        }
    },
};

export const Fog: Ability = {
    name: "Fog",
    description:
        "A fog covers the arena, lowering all your opponents perception by 15% for 3 turns.",
    cooldown: 6,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const fighters = cloneDeep(
            ctx.fighters.filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
        );

        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                x.skillPoints.perception *= 0.85;
                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} FOG: **${user.name}** has lowered **${x.name}**'s perception by 15%...`
                );
            });

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} FOG: the effect have disappeared...`
                );
                fight.availableFighters
                    .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
                    .forEach((x, i) => {
                        x.skillPoints.perception = fighters.find(
                            (w) => w.id === x.id
                        ).skillPoints.perception;
                    });
            },
        });
    },
    target: "self",
};

export const FrogRain: Ability = {
    name: "Frog Rain",
    description: "Summons a rain of frogs, dealing damage & poison damages to all enemies.",
    cooldown: 7,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    trueDamage: 15,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
                const oldHealth = cloneDeep(x.health);
                x.health -= xdamage;
                if (x.health <= 0) x.health = 0;
                user.totalDamageDealt += oldHealth - x.health;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} FROG RAIN: **${
                        user.name
                    }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${x.name}**.`
                );
                const burnDamageCalc = Math.round(
                    Functions.getAbilityDamage(user, CrossfireHurricane) / 10
                );
                poisonDamagePromise(ctx, x, burnDamageCalc, user, 2);
            });
    },
};

// ball of lightning:
// Weather charges a ball of lightning and hits it into the opponent, giving you one extra turn.

export const BallOfLightning: Ability = {
    name: "Ball of Lightning",
    description:
        "Weather charges a ball of lightning and hits it into the opponent, giving you one extra turn.",
    cooldown: 5,
    damage: 30,
    stamina: 15,
    extraTurns: 1,
    dodgeScore: 0,
    target: "enemy",
};
// Total combustion:
// Weather report punches the opponent with firey fists, causing burn damage.
// The opponent's perception is also lowered by 5% for 3 turns.

export const TotalCombustion: Ability = {
    name: "Total Combustion",
    description:
        "Weather report punches the opponent with firey fists, causing burn damage. The opponent's perception is also lowered by 5% for 3 turns.",
    cooldown: 9,
    damage: 0,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 0,
    trueDamage: 15,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        const oldHealth = cloneDeep(target.health);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} TOTAL COMBUSTION: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        poisonDamagePromise(ctx, target, burnDamageCalc, user, 2);
    },
};

// Mach 1 tornado
// You spin weather and a tornado flings out, hitting the opponent for massive damage

export const Mach1Tornado: Ability = {
    name: "Mach 1 Tornado",
    description:
        "You spin weather and a tornado flings out, hitting the opponent for massive damage.",
    cooldown: 7,
    damage: 0,
    stamina: 25,
    extraTurns: 1,
    dodgeScore: 0,
    trueDamage: 45,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 4.5);
        const oldHealth = cloneDeep(target.health);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} MACH 1 TORNADO: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
    },
};

// ebony devil's ability
export const DollPunch: Ability = {
    name: "Doll Punch",
    description: "Punches the opponent with the doll, dealing damage.",
    cooldown: 3,
    damage: 15,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};

export const DollBarrage: Ability = {
    ...StandBarrage,
    name: "Doll Barrage",
    description: "Unleash a barrage of punches with the doll.",
};

export const DollThrow: Ability = {
    name: "Doll Throw",
    description: "Throws the doll at the opponent, dealing damage.",
    cooldown: 4,
    damage: 20,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};

export const CalamityManipulation: Ability = {
    ...StandBarrage,
    name: "Calamity Manipulation",
    description: "Damages the opponent with a flurry of deadly calamities.",
    cooldown: 2,
    stamina: 5,
    damage: 15,
    dodgeScore: 0,
};

export const IdentityAssumption: Ability = {
    ...StandDisc,
    name: "Identity Assumption",
    description:
        "Removes the opponent’s stand and damages it’s user. (Their stand will continue to be unusable for a few turns.)",
    cooldown: 7,
    stamina: 25,
    damage: 25,
    dodgeScore: 8,
    thumbnail: undefined,
};

export const IllusionCreation: Ability = {
    ...StandBarrage,
    name: "Illusion Creation",
    description: "Creates multiple illusions and attacks the opponent..",
    cooldown: 4,
    stamina: 15,
    damage: 15,
    dodgeScore: 4,
};
export const MedicExp: Ability = {
    ...Heal,
    name: "Medical Experience",
    description: "Uses its medical experience to heal the targetted player.",
    cooldown: 5,
    stamina: 20,
    target: "ally",
};

export const StaffBarrage: Ability = {
    name: "Barrage",
    description: "Performs an astoundingly fast flurry of punches that deals damage per hit.",
    cooldown: 1,
    extraTurns: 1,
    damage: 25,
    stamina: 5,
    dodgeScore: 0,
    target: "enemy",
};

export const StaffSplash: Ability = {
    name: "Crystal Splash",
    description: "Splashes the opponent with wicked dark energy.",
    cooldown: 3,
    extraTurns: 1,
    damage: 20,
    stamina: 20,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://media.jolyne.moe/UWAEPT/direct",
};

export const StaffBAN: Ability = {
    name: "FINISH",
    description: "Destroys the opponent with a single attack.",
    cooldown: 3,
    extraTurns: 1,
    damage: 100,
    stamina: 20,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://media.jolyne.moe/UWAEPT/direct",
};

export const StaffToy: Ability = {
    name: "smol attk",
    description: "pokes the opponent with a stick",
    cooldown: 0,
    extraTurns: 0,
    damage: 20,
    stamina: 0,
    dodgeScore: 0,
    target: "enemy",
};

//Stone Free
export const BallBarrage: Ability = {
    ...BallOfLightning,
    name: "Ball Barrage",
    description: "Throws balls at the opponent creating a barrage.",
    thumbnail: "https://media.tenor.com/UzE1QG36ED8AAAAC/jojo-jolyne.gif",
    cooldown: 6,
};

export const Wrap: Ability = {
    ...LightManifestation,
    name: "Wrap",
    description: "Warps behind the opponent to attack.",
    cooldown: 7,
};

export const StringWeb: Ability = {
    ...VineSlap,
    name: "String Web",
    description: "Creates a web using string to engulf the opponent.",
    thumbnail: "https://media.tenor.com/MlXpp0Dn8JUAAAAC/jolyne-cujoh-jolyne.gif",
};

//Horus
export const IceSickles: Ability = {
    ...KickBarrage,
    name: "Ice Sickles",
    description: "Throws Sickles of Ice towards the opponent",
};

export const FreezingTouch: Ability = {
    ...StandBarrage,
    name: "Freezing Touch",
    description: "Tries to infect the opponent with a Frost Bite.",
};

export const IceBlockade: Ability = {
    ...LittleBoy,
    name: "Ice Blockade",
    description: "Blocks the opponent with ice, to damage them.",
};

// defensive form:
// boosts +25% health for 3 turns

export const DefensiveForm: Ability = {
    name: "Defensive Form",
    description: "Boosts +25% health for 3 turns.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        const oldMaxHealth = user.maxHealth;
        user.maxHealth *= 1.25;
        user.health *= 1.25;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} DEFENSIVE FORM: **${user.name}**'s health has been boosted...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.maxHealth = oldMaxHealth;
                user.health = Math.min(user.health, user.maxHealth);
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} DEFENSIVE FORM: **${user.name}**'s health boost has disappeared...`
                );
            },
        });
    },
};

export const AcidicTouch: Ability = {
    name: "Acidic Touch",
    description: "Touch the opponent with acid, dealing damage.",
    cooldown: 4,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        const oldHealth = cloneDeep(target.health);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} ACIDIC TOUCH: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        poisonDamagePromise(ctx, target, burnDamageCalc, user, 2);
    },
};

// Assimilation:
// perception boost +10% for 3 turns

export const Assimilation: Ability = {
    name: "Assimilation",
    description: "Perception boost +10% for 3 turns.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(user.skillPoints);
        user.skillPoints.perception *= 1.1;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} ASSIMILATION: **${user.name}**'s perception has been boosted...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} ASSIMILATION: **${user.name}**'s perception boost has disappeared...`
                );
            },
        });
    },
};

// abilities for the femboy stand
// 3rd move: tease barrage you tease the opponent till they explode "LMAO"
export const TeaseBarrage: Ability = {
    name: "Tease Barrage",
    description: "Tease the opponent till they explode.",
    cooldown: 3,
    damage: 0,
    trueDamage: 15,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        const oldHealth = cloneDeep(target.health);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} TEASE BARRAGE: **${
                user.name
            }** has dealt **${xdamage.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc, user, 2);
    },
};

// 1st move: kiss the opponent and it removes there stand for like 6 turns and like has cooldown of like six turns
export const Kiss: Ability = {
    name: "Kiss",
    description: "Kiss the opponent and it removes their stand for 6 turns.",
    cooldown: 8,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(target.stand);
        target.stand = null;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} KISS: **${target.name}**'s stand has been removed...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 6,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                target.stand = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} KISS: **${target.name}**'s stand has returned...`
                );
            },
        });
    },
};

// 2nd move: hug the opponent which halves their speed for 3 turns and has a cooldown of 4 turns no dodging
export const Hug: Ability = {
    name: "Hug",
    description: "Hug the opponent which halves their speed for 3 turns.",
    cooldown: 4,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const oldSpeed = cloneDeep(target.skillPoints.speed);
        target.skillPoints.speed /= 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} HUG: **${target.name}**'s speed has been halved...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                target.skillPoints.speed = oldSpeed;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} HUG: **${target.name}**'s speed has returned...`
                );
            },
        });
    },
};

// 4th move: flash your opponent with the blinding light of the stands lower area ☠️☠️☠️ stunning completely for four turns and a CD of 7 turns "sounds goods?" - Luvvy no dodge
export const Flash: Ability = {
    name: "Flash",
    description:
        "Flash your opponent with the blinding light of the stands lower area, stunning them for 4 turns.",
    cooldown: 7,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor = 4;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} FLASH: **${target.name}** has been stunned... UwU`
        );
    },
};

// The Chained abilities:
export const ChainedWhip: Ability = {
    name: "Chained Whip",
    description: "Whip the opponent with the chains.",
    cooldown: 5,
    damage: 20,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
};

export const ChainedHook: Ability = {
    name: "Chained Hook",
    description: "Hook the opponent with the chains.",
    cooldown: 7,
    damage: 22,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
};

export const ChainedThrow: Ability = {
    name: "Chained Throw",
    description: "Throw the chains at the opponent.",
    cooldown: 8,
    damage: 23,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
};

export const OneThousandChains: Ability = {
    name: "One Thousand Chains",
    description: "Punch the opponent with a thousand chains.",
    cooldown: 10,
    damage: 35,
    stamina: 20,
    extraTurns: 2,
    dodgeScore: 999,
    target: "enemy",
    special: true,
};

// santa's candy cane abilities
export const Freeze: Ability = {
    name: "Freeze",
    description: "Freeze the opponent with a candy cane.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor = 3;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} FREEZE: **${target.name}** has been frozen...`
        );
    },
};

export const CandyCaneBarrage: Ability = {
    ...StandBarrage,
    name: "Candy Cane Barrage",
    description: "Barrage the opponent with the candy cane.",
};

export const CandyCanePull: Ability = {
    name: "Candy Cane Pull",
    description: "Pull the opponent with the candy cane, giving the user an extra turn.",
    cooldown: 6,
    damage: 0,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 0,
    target: "enemy",
};

// abilkity for weapon confetti bazooka
export const ConfettiBlast: Ability = {
    name: "Confetti Blast",
    description: "Blast the opponent with confetti.",
    cooldown: 3,
    damage: 37,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    special: true,
};

export const ConfettiBarrage: Ability = {
    ...StandBarrage,
    name: "Confetti Barrage",
    description: "Barrage the opponent with confetti.",
};

// king crimson abilities!

export const Chop: Ability = {
    name: "Chop",
    description: "A high precision slice with King Crimson's Hand",
    cooldown: 4,
    damage: 41,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 8,
    target: "enemy",
    thumbnail: "https://tenor.com/view/jojo-king-crimson-chop-bucciarati-kill-gif-19778774",
};

export const Impale: Ability = {
    name: "Impale",
    description: "Impale the opponent with King Crimson's Hand, dealing bleed damage.",
    cooldown: 5,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 8,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 3.75);
        const oldHealth = cloneDeep(target.health);
        target.health -= xdamage;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += oldHealth - target.health;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} IMPALE: **${user.name}** has dealt **${xdamage.toLocaleString(
                "en-US"
            )}** damages to **${target.name}**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc, user, 2);
    },
};

export const Epitaph: Ability = {
    name: "Epitaph",
    description:
        "Allows the user to see the future, thus meaning they can dodge most attacks for 5 turns.",
    cooldown: 10,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    special: true,
    noNextTurn: true,
    useMessage: (user, target, damage, ctx) => {
        const oldUserPerception = cloneDeep(user.skillPoints.perception);
        user.skillPoints.perception = Infinity;

        ctx.nextRoundPromises.push({
            cooldown: 5,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints.perception = oldUserPerception;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} EPITAPH: **${user.name}** had seen the future until now...`
                );
            },
        });
        ctx.updateMessage().catch(() => {});
    },
};

export const BloodBlind: Ability = {
    extraTurns: 1,
    name: "Blood Blind",
    description:
        "King Crimson sends some of the users blood towards the enemy blinding them for a turn granting the user a guaranteed hit (-90% speed & perception).",
    cooldown: 3,
    damage: 0,
    stamina: 20,
    dodgeScore: 6,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        user.health -= Functions.getMaxHealth(user) * 0.03;
        if (user.health <= 0) {
            user.health = 0;
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} BLOOD BLIND: **${user.name}** tried, but they failed...`
            );
            return;
        }

        target.frozenFor = 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} BLOOD BLIND: **${target.name}** has been blinded...`
        );
        const oldSkillPoints = cloneDeep(target.skillPoints);
        target.skillPoints.speed = target.skillPoints.speed * 0.1;
        target.skillPoints.perception = target.skillPoints.perception * 0.1;

        ctx.nextRoundPromises.push({
            cooldown: 2,
            executeOnlyOnce: true,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                target.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} BLOOD BLIND: **${target.name}**'s sight has returned...`
                );
            },
        });
    },
};

/*
export const SchizoidMan: Ability = {
    name: "Schizoid Man",
    description:
        "King Crimson creates a clone of the user that can attack the opponent for 3 turns.",
    cooldown: 0,
    dodgeScore: 0,
    target: "self",
    special: true,
    damage: 0,
    extraTurns: 0,
    stamina: 50,
    useMessage: (user, target, damage, ctx) => {
        const clone: Fighter = cloneDeep(user);
        clone.id = Functions.generateRandomId();
        clone.npc = true;
        clone.level = Math.round(user.level * 0.7);
        clone.stand = null;
        clone.weapon = null;

        const tempCloneOfUser = {
            ...cloneDeep(ctx.ctx.userData),
            level: clone.level,
        };

        Functions.generateSkillPoints(tempCloneOfUser);
        clone.skillPoints = tempCloneOfUser.skillPoints;

        ctx.fighters.push(clone);
        ctx.teams.forEach((team) => {
            if (team.find((x) => x.id === user.id)) team.push(clone);
        });

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} !!!: **${user.name}** has created a clone...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                ctx.fighters = ctx.fighters.filter((x) => x.id !== clone.id);
                ctx.teams.forEach((team) => {
                    if (team.find((x) => x.id === clone.id))
                        team = team.filter((x) => x.id !== clone.id);
                });
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand?.emoji} !!!: **${user.name}**'s clone has disappeared...`
                );
            },
        });
    },
};*/

export const TimeErase: Ability = {
    name: "Time Erase",
    description:
        "Erases time for 4 turns... In the erased time frame, other people will be unable to experience anything that happened and will retain no memories of it either.",
    cooldown: 8,
    damage: 0,
    stamina: 5,
    dodgeScore: 0,
    target: "self",
    special: true,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        ctx.infos.cooldowns.forEach((x) => {
            x.cooldown -= 4;
            if (x.cooldown < 0) x.cooldown = 0;
            if (x.move === "Time Erase") x.cooldown = 8;
        });

        for (let i = 0; i < 4; i++) {
            if (ctx.turns[ctx.turns.length - 1].logs.length == 0)
                ctx.turns[ctx.turns.length - 1].logs.push(`????????????????????????????`);

            ctx.turns.push({
                logs: [],
                infos: ctx.infos,
                teams: ctx.teams,
                fighters: ctx.fighters,
                nextRoundPromises: ctx.nextRoundPromises,
                nextTurnPromises: ctx.nextTurnPromises,
            });
            ctx.turns[ctx.turns.length - 1].logs.push(`????????????????????????????`);
        }
        ctx.turns.push({
            logs: [],
            infos: ctx.infos,
            teams: ctx.teams,
            fighters: ctx.fighters,
            nextRoundPromises: ctx.nextRoundPromises,
            nextTurnPromises: ctx.nextTurnPromises,
        });

        ctx.infos.orderIndex = 0;
    },
};

export const PiercingStrike: Ability = {
    name: "Piercing Strike",
    description: "An attack sent straight at the opponent to pierce them, causing them to bleed.",
    cooldown: 2,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const xdamage = Math.round(Functions.getAttackDamages(user) * 1.15);
        const status = target.removeHealth(xdamage, user, 0);

        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} PIERCING STRIKE: **${
                user.name
            }** has dealt **${status.amount.toLocaleString("en-US")}** damages to **${
                target.name
            }**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc, user, 2);
    },
};

export const DisorientingStabs: Ability = {
    name: "Disorienting Stabs",
    description: "With three quick movements, the user stabs the opponent & stuns them.",
    cooldown: 4,
    damage: 40,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor = 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand?.emoji} DISORIENTING STABS: **${target.name}** has been stunned...`
        );
    },
};

export const MikuBeam: Ability = {
    name: "Miku Beam",
    description: "I'm thinking Mikuu Mikuu OO EE OO",
    cooldown: 2,
    damage: 40,
    stamina: 5,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};

export const MikuStun: Ability = {
    name: "Miku Stun",
    description: "Stuns everyone with the power of your voice.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 4,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        ctx.availableFighters
            .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
            .forEach((x) => {
                const status = x.removeHealth(0, user, 4);

                if (status.type !== FighterRemoveHealthTypes.Dodged) {
                    x.frozenFor += 4;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.weapon?.emoji} OOO EEE OOO: **${x.name}** has been stunned...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.weapon?.emoji} OOO EEE OOO: **${x.name}** resisted.`
                    );
                }
            });
    },
};

// c-moon abilities
export const GravityShift: Ability = {
    name: "Gravity Shift",
    description: "Shift the gravity around the opponent, dealing damage.",
    cooldown: 4,
    damage: 35,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};

export const GravityPull: Ability = {
    name: "Gravity Pull",
    description: "Pull the opponent towards you with gravity, stunning them.",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    trueDodgeScore: 3,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const status = target.removeHealth(0, user, 3);

        if (status.type !== FighterRemoveHealthTypes.Dodged) {
            target.frozenFor += 2;
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} GRAVITY PULL: **${target.name}** has been pulled...`
            );
        } else {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand?.emoji} GRAVITY PULL: **${target.name}** resisted.`
            );
        }
    },
};

export const GravityPush: Ability = {
    name: "Gravity Push",
    description: "Push the opponent away from you with gravity, dealing damage.",
    cooldown: 6,
    damage: 35,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};

export const SurfaceInversion: Ability = {
    name: "Surface Inversion",
    description:
        "C-Moon punches the opponent, making the opponent's body turn inside-out and causing heavy damage.",
    cooldown: 7,
    damage: 40,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
};
