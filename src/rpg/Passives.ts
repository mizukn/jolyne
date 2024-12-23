import { cloneDeep, last } from "lodash";
import { Passive, Weapon } from "../@types";
import { Fighter, FighterRemoveHealthTypes, FightHandler } from "../structures/FightHandler";
import { findItem, getAttackDamages, getMaxHealth, getMaxStamina } from "../utils/Functions";

export const Rage: Passive = {
    name: "Rage",
    description: "For every 1% of health lost, the user gains 1% of their strength.",
    type: "turn",
    getId: (user: Fighter, context: FightHandler, from) => `${from}rage_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler, from) => {
        const hasTwo =
            user.stand?.passives?.find((x) => x.name === "Rage") &&
            user.weapon?.passives?.find((x) => x.name === "Rage");
        const lastHealthId = `${from}rage_${user.id}_${fight.id}.lasthealth`;
        const baseStrengthId = `$rage_${user.id}_${fight.id}.basestrength`;
        const totalStrengthGainedId = `${from}rage_${user.id}_${fight.id}.totalstrengthgained`;
        if (!fight.cache.has(baseStrengthId)) {
            fight.cache.set(baseStrengthId, user.skillPoints.strength);
        }
        if (!fight.cache.has(lastHealthId)) {
            fight.cache.set(lastHealthId, user.health);
        }
        if (!fight.cache.has(totalStrengthGainedId)) {
            fight.cache.set(totalStrengthGainedId, 0);
        }

        const totalStrengthGained = Number(fight.cache.get(totalStrengthGainedId));
        const baseStrength = Number(fight.cache.get(baseStrengthId));
        if (totalStrengthGained >= baseStrength) return;

        const newUser = fight.fighters.find((x) => x.id === user.id);
        if (!newUser) return;
        const lastHealth = Number(fight.cache.get(lastHealthId)) ?? newUser.health;

        const healthLost = lastHealth - newUser.health;
        console.log(totalStrengthGained, baseStrength);

        if (healthLost > 0) {
            const healthLostPercent = healthLost / user.maxHealth;
            const strengthIncrease = Math.round(baseStrength * healthLostPercent);

            newUser.skillPoints.strength += strengthIncrease;
            if (strengthIncrease > 0) {
                fight.turns[fight.turns.length - 1].logs.push(
                    `-# ${newUser.name} gained **${strengthIncrease}** strength from Rage! ${
                        hasTwo ? `[${from}]` : ""
                    }`
                );
                fight.cache.set(
                    totalStrengthGainedId,
                    Number(fight.cache.get(totalStrengthGainedId)) + strengthIncrease
                );
            }
        }

        fight.cache.set(lastHealthId, newUser.health);
        //fight.cache.set(baseStrengthId, newUser.skillPoints.strength);
    },
};

export const KnivesThrow: Passive = {
    name: "Knives Throw",
    description:
        "During time stop, knives are thrown at all enemies, dealing 50% of the user's attack damages.",
    type: "turn",
    getId: (user: Fighter, context: FightHandler) => {
        return `knives_throw_${user.id}_${context.id}`;
    },
    promise: (user: Fighter, fight: FightHandler) => {
        if (user.hasStoppedTime && user.equippedItems.dios_knives === 6) {
            fight.fighters
                .filter((x) => x.health > 0 && fight.getTeamIdx(x) !== fight.getTeamIdx(user))
                .forEach((enemy) => {
                    const damages = Math.round(getAttackDamages(user) / 2);
                    const status = enemy.removeHealth(damages, user, 0);
                    let emojis = user.weapon?.emoji;

                    if (status.type === FighterRemoveHealthTypes.Defended) {
                        emojis += ":shield:";
                    }
                    if (status.type === FighterRemoveHealthTypes.BrokeGuard) {
                        emojis += "💥";
                    }

                    fight.turns[fight.turns.length - 1].logs.push(
                        `-# ${emojis} **${user.name}** throws a knife at **${enemy.name}** and deals **${status.amount}** damages`
                    );
                });
        }
    },
};

export const Darkness: Passive = {
    name: "Darkness",
    description:
        "For every successful hit, applies a stack of Darkness. Each stack reduces the enemy's speed and perception by 4%, stacking up to 12 times (max 48%).",
    type: "turn",
    getId: (user: Fighter, context: FightHandler) => `darkness_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const maxStacks = 12;
        const stackId = `darkness_${user.id}_${fight.id}.stacks`;
        const baseSpeedId = `darkness_${user.id}_${fight.id}.basespeed`;
        const basePerceptionId = `darkness_${user.id}_${fight.id}.baseperception`;
        const multiplierId = `darkness_${user.id}_${fight.id}.multiplier`;

        if (!fight.cache.has(stackId)) {
            fight.cache.set(stackId, 0); // Initialize stacks if not present
        }
        if (!fight.cache.has(baseSpeedId)) {
            fight.cache.set(baseSpeedId, user.skillPoints.speed);
        }
        if (!fight.cache.has(basePerceptionId)) {
            fight.cache.set(basePerceptionId, user.skillPoints.perception);
        }
        if (!fight.cache.has(multiplierId)) {
            fight.cache.set(multiplierId, 1);
        }

        const currentStacks = Number(fight.cache.get(stackId));
        const multiplier = Number(fight.cache.get(multiplierId));

        // Find an enemy to apply the stack of Darkness
        const enemy = fight.infos.lastHit?.target
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.target)
            : null;
        const userAttacker = fight.infos.lastHit?.user
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.user)
            : null;
        if (!enemy || !userAttacker) return;
        if (userAttacker.id !== user.id) return;
        if (userAttacker.id === enemy.id) return;
        if (enemy.health <= 0) return;
        fight.infos.lastHit = undefined;

        if (currentStacks < maxStacks) {
            // Increment stack and apply debuffs
            const newStacks = currentStacks + 1;
            fight.cache.set(stackId, newStacks);

            const speedReduction = Math.floor(
                enemy.skillPoints.speed * 0.04 * newStacks * multiplier
            );
            const perceptionReduction = Math.floor(
                enemy.skillPoints.perception * 0.04 * newStacks * multiplier
            );

            enemy.skillPoints.speed -= speedReduction;
            enemy.skillPoints.perception -= perceptionReduction;
            if (enemy.skillPoints.speed < 0) enemy.skillPoints.speed = 0;
            if (enemy.skillPoints.perception < 0) enemy.skillPoints.perception = 0;
            // Log the application of Darkness
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${enemy.name} is afflicted with Darkness! ${newStacks} stack(s) applied, reducing speed by **${speedReduction}** and perception by **${perceptionReduction}**.`
            );
        }
    },
};

export const Poison: Passive = {
    name: "Poison",
    description:
        "For every successful hit, applies a stack of Poison. Each stack deals 75% of the user's attack damages", // turn based
    type: "turn",
    getId: (user: Fighter, context: FightHandler) => `poison_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const maxStacks = Infinity;
        const stackId = `poison_${user.id}_${fight.id}.stacks`;
        const baseHealthId = `poison_${user.id}_${fight.id}.basehealth`;
        const multiplierId = `poison_${user.id}_${fight.id}.multiplier`;

        if (!fight.cache.has(stackId)) {
            fight.cache.set(stackId, 0); // Initialize stacks if not present
        }
        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }
        if (!fight.cache.has(multiplierId)) {
            fight.cache.set(multiplierId, 1);
        }

        const currentStacks = Number(fight.cache.get(stackId));
        const multiplier = Number(fight.cache.get(multiplierId));

        // Find an enemy to apply the stack of Poison
        const enemy = fight.infos.lastHit?.target
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.target)
            : null;
        const userAttacker = fight.infos.lastHit?.user
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.user)
            : null;
        if (!enemy || !userAttacker) return;
        if (userAttacker.id !== user.id) return;
        if (userAttacker.id === enemy.id) return;
        if (enemy.health <= 0) return;
        fight.infos.lastHit = undefined;

        if (currentStacks < maxStacks) {
            // Increment stack and apply debuffs
            const newStacks = currentStacks + 1;
            fight.cache.set(stackId, newStacks);

            const damages = Math.round(getAttackDamages(user) * 0.75 * multiplier);
            const status = enemy.removeHealth(damages, user, 0);

            // Log the application of Poison
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${user.stand?.emoji} ${enemy.name} took **${status.amount}** poison damages.`
            );
        }
    },
};

export const Fire: Passive = {
    name: "Fire",
    description:
        "For every successful hit, applies a stack of Burn Damage. Each stack deals 50% of the user's attack damages.",
    type: "turn",
    getId: (user: Fighter, context: FightHandler) => `burn_damage_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const maxStacks = Infinity;
        const stackId = `burn_damage_${user.id}_${fight.id}.stacks`;
        const baseHealthId = `burn_damage_${user.id}_${fight.id}.basehealth`;
        const multiplierId = `burn_damage_${user.id}_${fight.id}.multiplier`;

        if (!fight.cache.has(stackId)) {
            fight.cache.set(stackId, 0); // Initialize stacks if not present
        }
        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }
        if (!fight.cache.has(multiplierId)) {
            fight.cache.set(multiplierId, 1);
        }

        const currentStacks = Number(fight.cache.get(stackId));
        const multiplier = Number(fight.cache.get(multiplierId));

        // Find an enemy to apply the stack of Burn Damage
        const enemy = fight.infos.lastHit?.target
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.target)
            : null;
        const userAttacker = fight.infos.lastHit?.user
            ? fight.fighters.find((x) => x.id === fight.infos.lastHit.user)
            : null;
        if (!enemy || !userAttacker) return;
        if (userAttacker.id !== user.id) return;
        if (userAttacker.id === enemy.id) return;
        if (enemy.health <= 0) return;
        fight.infos.lastHit = undefined;

        if (currentStacks < maxStacks) {
            // Increment stack and apply debuffs
            const newStacks = currentStacks + 1;
            fight.cache.set(stackId, newStacks);

            const damages = Math.round(getAttackDamages(user) * 0.5 * multiplier);
            const status = enemy.removeHealth(damages, user, 0);

            // Log the application of Burn Damage
            fight.turns[fight.turns.length - 1].logs.push(
                `-# :fire: ${enemy.name} took **${status.amount}** burn damages.`
            );
        }
    },
};

// passive for weapon excalibur: called
export const Alter: Passive = {
    name: "Alter",
    // excalibur transforms from excalibur to excalibur alter
    description:
        "When the holder has 50% less health or stamina, the weapon transforms into **Excalibur Alter**, healing the user by 15% of their max health and stamina, gains new abilities and increases every user's stats by 30%.",
    type: "turn",
    getId: (user: Fighter, context: FightHandler) => `alter_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler, from) => {
        const isEnabledId = `alter_${user.id}_${fight.id}.enabled`;
        const baseHealthId = `alter_${user.id}_${fight.id}.basehealth`;
        const baseStaminaId = `alter_${user.id}_${fight.id}.basestamina`;

        if (!fight.cache.has(isEnabledId)) {
            fight.cache.set(isEnabledId, 0);
        }

        const isEnabled = Number(fight.cache.get(isEnabledId));

        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }

        if (!fight.cache.has(baseStaminaId)) {
            fight.cache.set(baseStaminaId, user.maxStamina);
        }

        const baseHealth = Number(fight.cache.get(baseHealthId));
        const baseStamina = Number(fight.cache.get(baseStaminaId));

        if (isEnabled === 0 && (user.health <= baseHealth / 2 || user.stamina <= baseStamina / 2)) {
            fight.cache.set(isEnabledId, 1);
            const weapon = findItem<Weapon>("excalibur_alter", true);
            if (!weapon) return;
            user.weapon = cloneDeep(weapon);

            for (const key in user.skillPoints) {
                user.skillPoints[key as keyof typeof user.skillPoints] = Math.round(
                    user.skillPoints[key as keyof typeof user.skillPoints] * 1.3
                );
            }

            user.maxHealth = getMaxHealth(user);
            user.maxStamina = getMaxStamina(user);
            user.health += Math.round(user.maxHealth * 0.15);
            user.stamina += Math.round(user.maxStamina * 0.15);

            user.name += " (Alter)";
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${weapon.emoji} **${user.name}:** EXCALIBUR!`
            );
            user.extraTurns++;
        }
    },
};

export const Regeneration: Passive = {
    name: "Regeneration",
    description:
        "At the end of each 'round', the user regenerates 2% of their max health (capped at 10%).",
    type: "round",
    getId: (user: Fighter, context: FightHandler) => `regeneration_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const totalHealingDoneId = `regeneration_${user.id}_${fight.id}.totalhealingdone`;
        if (!fight.cache.has(totalHealingDoneId)) {
            fight.cache.set(totalHealingDoneId, 0);
        }
        const baseHealthId = `regeneration_${user.id}_${fight.id}.basehealth`;
        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }

        const totalHealingDone = Number(fight.cache.get(totalHealingDoneId));
        const baseHealth = Number(fight.cache.get(baseHealthId));

        if (totalHealingDone >= baseHealth * 0.1) return;

        const status = user.incrHealth(Math.round(user.maxHealth * 0.02)) * -1;

        user.totalHealingDone += status;
        if (status !== 0)
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${user.weapon?.emoji} **${user.name}** regenerated **${status}** health.`
            );
    },
};

export const RegenerationAlter: Passive = {
    name: "Regeneration Alter",
    description:
        "At the end of each 'round', the user regenerates 4% of their max health and stamina (capped at 10%).",
    type: "round",
    getId: (user: Fighter, context: FightHandler) => `regeneration_alter_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const totalHealingDoneId = `regeneration_alter_${user.id}_${fight.id}.totalhealingdone`;
        if (!fight.cache.has(totalHealingDoneId)) {
            fight.cache.set(totalHealingDoneId, 0);
        }

        const totalHealingDone = Number(fight.cache.get(totalHealingDoneId));
        const baseHealthId = `regeneration_alter_${user.id}_${fight.id}.basehealth`;
        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }

        const baseStaminaId = `regeneration_alter_${user.id}_${fight.id}.basestamina`;
        if (!fight.cache.has(baseStaminaId)) {
            fight.cache.set(baseStaminaId, user.maxStamina);
        }

        const baseHealth = Number(fight.cache.get(baseHealthId));

        if (totalHealingDone >= baseHealth * 0.1) return;

        const status = user.incrHealth(Math.round(user.maxHealth * 0.04)) * -1;

        const statusStamina = user.incrStamina(Math.round(user.maxStamina * 0.04)) * -1;
        user.totalHealingDone += status;
        if (statusStamina !== 0 || status !== 0)
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${user.weapon?.emoji} **${user.name}** regenerated **${status}** health and **${statusStamina}** stamina.`
            );
    },
};

export const Resurrection: Passive = {
    name: "Resurrection",
    description:
        "When the user dies, they are resurrected with 50% of their max health and stamina. This passive can only be triggered once per battle.",
    type: "turn",
    evenIfDead: true,
    getId: (user: Fighter, context: FightHandler) => `resurrection_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const isEnabledId = `resurrection_${user.id}_${fight.id}.enabled`;
        if (!fight.cache.has(isEnabledId)) {
            fight.cache.set(isEnabledId, 0);
        }

        const isEnabled = Number(fight.cache.get(isEnabledId));
        // check if user has forfeited
        // fight.turns.forEach((x) => x.logs.forEach(g => g.includes(user.name) && g.includes("forfeited")))

        let foundForfeit = false;
        fight.turns.forEach((x) => {
            x.logs.forEach((g) => {
                if (g.includes(user.name) && g.includes("forfeited")) {
                    foundForfeit = true;
                }
            });
        });

        /*if (foundForfeit) {
            console.log("Forfeit found");
            return;
        }*/
        if (isEnabled === 0 && user.health <= 0) {
            fight.cache.set(isEnabledId, 1);
            user.health = Math.round(user.maxHealth / 2);
            user.stamina = Math.round(user.maxStamina / 2);
            fight.turns[fight.turns.length - 1].logs.push(
                `-# **${user.name}** has been resurrected!`
            );
        }
    },
};

// passive for santa's bell
export const Jingle: Passive = {
    name: "Jingle",
    description:
        "At the end of each 'round', the user regenerates 1% of their max health and stamina (capped at 10%).",
    type: "round",
    getId: (user: Fighter, context: FightHandler) => `jingle_${user.id}_${context.id}`,
    promise: (user: Fighter, fight: FightHandler) => {
        const totalHealingDoneId = `jingle_${user.id}_${fight.id}.totalhealingdone`;
        if (!fight.cache.has(totalHealingDoneId)) {
            fight.cache.set(totalHealingDoneId, 0);
        }

        const totalHealingDone = Number(fight.cache.get(totalHealingDoneId));
        const baseHealthId = `jingle_${user.id}_${fight.id}.basehealth`;
        if (!fight.cache.has(baseHealthId)) {
            fight.cache.set(baseHealthId, user.maxHealth);
        }

        const baseStaminaId = `jingle_${user.id}_${fight.id}.basestamina`;
        if (!fight.cache.has(baseStaminaId)) {
            fight.cache.set(baseStaminaId, user.maxStamina);
        }

        const baseHealth = Number(fight.cache.get(baseHealthId));

        if (totalHealingDone >= baseHealth * 0.1) return;

        const status = user.incrHealth(Math.round(user.maxHealth * 0.02)) * -1;

        const statusStamina = user.incrStamina(Math.round(user.maxStamina * 0.02)) * -1;
        user.totalHealingDone += status;
        if (statusStamina !== 0 || status !== 0)
            fight.turns[fight.turns.length - 1].logs.push(
                `-# ${user.weapon?.emoji} **${user.name}** regenerated **${status}** health and **${statusStamina}** stamina.`
            );
    },
};
