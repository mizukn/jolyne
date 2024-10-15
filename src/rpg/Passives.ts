import { cloneDeep, last } from "lodash";
import { Passive, Weapon } from "../@types";
import { Fighter, FighterRemoveHealthTypes, FightHandler } from "../structures/FightHandler";
import { findItem, getAttackDamages, getMaxHealth, getMaxStamina } from "../utils/Functions";

export const Rage: Passive = {
    name: "Rage",
    description: "For every 1% of health lost, the user gains 1% of their strength.",
    type: "turn",
    getId: (user: Fighter, context: FightHandler, from) => `${from}rage_${user.id}_${context.id}`,
    promise: (user: Fighter, thus: FightHandler, from) => {
        const lastHealthId = `${from}rage_${user.id}_${thus.id}.lasthealth`;
        const baseStrengthId = `${from}rage_${user.id}_${thus.id}.basestrength`;
        const totalStrengthGainedId = `${from}rage_${user.id}_${thus.id}.totalstrengthgained`;
        if (!thus.cache.has(baseStrengthId)) {
            thus.cache.set(baseStrengthId, user.skillPoints.strength);
        }
        if (!thus.cache.has(lastHealthId)) {
            thus.cache.set(lastHealthId, user.health);
        }
        if (!thus.cache.has(totalStrengthGainedId)) {
            thus.cache.set(totalStrengthGainedId, 0);
        }

        const totalStrengthGained = Number(thus.cache.get(totalStrengthGainedId));
        const baseStrength = Number(thus.cache.get(baseStrengthId));
        if (totalStrengthGained >= baseStrength) return;

        const newUser = thus.fighters.find((x) => x.id === user.id);
        if (!newUser) return;
        const lastHealth = Number(thus.cache.get(lastHealthId)) ?? newUser.health;

        const healthLost = lastHealth - newUser.health;
        console.log(lastHealth, newUser.health, healthLost);

        if (healthLost > 0) {
            const healthLostPercent = healthLost / user.maxHealth;
            const strengthIncrease = Math.round(baseStrength * healthLostPercent);

            newUser.skillPoints.strength += strengthIncrease;
            if (strengthIncrease > 0) {
                thus.turns[thus.turns.length - 1].logs.push(
                    `-# ${newUser.name} gained **${strengthIncrease}** strength from Rage!`
                );
                thus.cache.set(
                    totalStrengthGainedId,
                    Number(thus.cache.get(totalStrengthGainedId)) + strengthIncrease
                );
            }
        }

        thus.cache.set(lastHealthId, newUser.health);
        thus.cache.set(baseStrengthId, newUser.skillPoints.strength);
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
    promise: (user: Fighter, thus: FightHandler) => {
        if (user.hasStoppedTime && user.equippedItems.dios_knives === 6) {
            thus.fighters
                .filter((x) => x.health > 0 && thus.getTeamIdx(x) !== thus.getTeamIdx(user))
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

                    thus.turns[thus.turns.length - 1].logs.push(
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
    promise: (user: Fighter, thus: FightHandler) => {
        const maxStacks = 12;
        const stackId = `darkness_${user.id}_${thus.id}.stacks`;
        const baseSpeedId = `darkness_${user.id}_${thus.id}.basespeed`;
        const basePerceptionId = `darkness_${user.id}_${thus.id}.baseperception`;
        const multiplierId = `darkness_${user.id}_${thus.id}.multiplier`;

        if (!thus.cache.has(stackId)) {
            thus.cache.set(stackId, 0); // Initialize stacks if not present
        }
        if (!thus.cache.has(baseSpeedId)) {
            thus.cache.set(baseSpeedId, user.skillPoints.speed);
        }
        if (!thus.cache.has(basePerceptionId)) {
            thus.cache.set(basePerceptionId, user.skillPoints.perception);
        }
        if (!thus.cache.has(multiplierId)) {
            thus.cache.set(multiplierId, 1);
        }

        const currentStacks = Number(thus.cache.get(stackId));
        const multiplier = Number(thus.cache.get(multiplierId));

        // Find an enemy to apply the stack of Darkness
        const enemy = thus.infos.lastHit?.target
            ? thus.fighters.find((x) => x.id === thus.infos.lastHit.target)
            : null;
        const userAttacker = thus.infos.lastHit?.user
            ? thus.fighters.find((x) => x.id === thus.infos.lastHit.user)
            : null;
        if (!enemy || !userAttacker) return;
        if (userAttacker.id !== user.id) return;
        if (userAttacker.id === enemy.id) return;
        thus.infos.lastHit = undefined;

        if (currentStacks < maxStacks) {
            // Increment stack and apply debuffs
            const newStacks = currentStacks + 1;
            thus.cache.set(stackId, newStacks);

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
            thus.turns[thus.turns.length - 1].logs.push(
                `-# ${enemy.name} is afflicted with Darkness! ${newStacks} stack(s) applied, reducing speed by **${speedReduction}** and perception by **${perceptionReduction}**.`
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
    promise: (user: Fighter, thus: FightHandler, from) => {
        const isEnabledId = `alter_${user.id}_${thus.id}.enabled`;
        const baseHealthId = `alter_${user.id}_${thus.id}.basehealth`;
        const baseStaminaId = `alter_${user.id}_${thus.id}.basestamina`;

        if (!thus.cache.has(isEnabledId)) {
            thus.cache.set(isEnabledId, 0);
        }

        const isEnabled = Number(thus.cache.get(isEnabledId));

        if (!thus.cache.has(baseHealthId)) {
            thus.cache.set(baseHealthId, user.maxHealth);
        }

        if (!thus.cache.has(baseStaminaId)) {
            thus.cache.set(baseStaminaId, user.maxStamina);
        }

        const baseHealth = Number(thus.cache.get(baseHealthId));
        const baseStamina = Number(thus.cache.get(baseStaminaId));

        if (isEnabled === 0 && (user.health <= baseHealth / 2 || user.stamina <= baseStamina / 2)) {
            thus.cache.set(isEnabledId, 1);
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
            thus.turns[thus.turns.length - 1].logs.push(
                `-# ${weapon.emoji} **${user.name}:** EXCALIBUR!`
            );
            user.extraTurns++;
        }
    },
};

export const Regeneration: Passive = {
    name: "Regeneration",
    description: "At the end of each 'round', the user regenerates 2% of their max health.",
    type: "round",
    getId: (user: Fighter, context: FightHandler) => `regeneration_${user.id}_${context.id}`,
    promise: (user: Fighter, thus: FightHandler) => {
        const status = user.incrHealth(Math.round(user.maxHealth * 0.02));
        if (status !== 0)
            thus.turns[thus.turns.length - 1].logs.push(
                `-# ${user.weapon?.emoji} **${user.name}** regenerated **${status}** health.`
            );
    },
};

export const RegenerationAlter: Passive = {
    name: "Regeneration Alter",
    description:
        "At the end of each 'round', the user regenerates 4% of their max health and stamina.",
    type: "round",
    getId: (user: Fighter, context: FightHandler) => `regeneration_alter_${user.id}_${context.id}`,
    promise: (user: Fighter, thus: FightHandler) => {
        const status = user.incrHealth(Math.round(user.maxHealth * 0.04));
        const statusStamina = user.incrStamina(Math.round(user.maxStamina * 0.04));
        if (statusStamina !== 0 || status !== 0)
            thus.turns[thus.turns.length - 1].logs.push(
                `-# ${user.weapon?.emoji} **${user.name}** regenerated **${status}** health and **${statusStamina}** stamina.`
            );
    },
};
