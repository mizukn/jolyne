import type { Passive } from "../@types";
import type { Fighter } from "../structures/Fighter";
import type { FightHandler } from "../structures/FightHandler";

/**
 * Declarative passive effects, executed by `runPassiveEffects` before the
 * legacy `Passive.promise` callback. See ABILITIES.md ("Passives" section)
 * for the migration policy.
 *
 * Kept separate from `AbilityEffect` even when names overlap (e.g. a future
 * passive `bleed` vs. ability `bleed`) — the triggering contracts differ.
 */
export interface RegenEffect {
    type: "regen";
    /**
     * Cache-key namespace. Required because each passive needs unique slots in
     * `fight.cache`. Must match the legacy `getId` prefix so cache state stays
     * compatible (e.g. `"regeneration"`, `"regeneration_alter"`, `"jingle"`).
     */
    cacheKey: string;
    /** Fraction of `user.maxHealth` healed per fire. Set to 0 to skip. */
    healthPercent: number;
    /** Fraction of `user.maxStamina` healed per fire. Set to 0 to skip. */
    staminaPercent: number;
    /**
     * Stop firing once `totalHealingDone >= baseHealth * capPercent`, where
     * `baseHealth` is the user's `maxHealth` at the moment the passive first
     * fired (snapshotted in cache).
     */
    capPercent: number;
}

export type PassiveEffect = RegenEffect;

function applyRegen(
    effect: RegenEffect,
    user: Fighter,
    fight: FightHandler,
): void {
    const totalHealingDoneId = `${effect.cacheKey}_${user.id}_${fight.id}.totalhealingdone`;
    const baseHealthId = `${effect.cacheKey}_${user.id}_${fight.id}.basehealth`;
    const baseStaminaId = `${effect.cacheKey}_${user.id}_${fight.id}.basestamina`;

    if (!fight.cache.has(totalHealingDoneId)) fight.cache.set(totalHealingDoneId, 0);
    if (!fight.cache.has(baseHealthId)) fight.cache.set(baseHealthId, user.maxHealth);
    if (!fight.cache.has(baseStaminaId)) fight.cache.set(baseStaminaId, user.maxStamina);

    const totalHealingDone = Number(fight.cache.get(totalHealingDoneId));
    const baseHealth = Number(fight.cache.get(baseHealthId));

    if (totalHealingDone >= baseHealth * effect.capPercent) return;

    const healthHealed =
        effect.healthPercent > 0
            ? user.incrHealth(Math.round(user.maxHealth * effect.healthPercent)) * -1
            : 0;
    const staminaHealed =
        effect.staminaPercent > 0
            ? user.incrStamina(Math.round(user.maxStamina * effect.staminaPercent)) * -1
            : 0;

    user.totalHealingDone += healthHealed;
    fight.cache.set(totalHealingDoneId, totalHealingDone + healthHealed);

    if (healthHealed === 0 && staminaHealed === 0) return;

    const turnLogs = fight.turns[fight.turns.length - 1].logs;
    if (effect.staminaPercent > 0) {
        turnLogs.push(
            `-# ${user.weapon?.emoji} **${user.name}** regenerated **${healthHealed}** health and **${staminaHealed}** stamina.`,
        );
    } else {
        turnLogs.push(
            `-# ${user.weapon?.emoji} **${user.name}** regenerated **${healthHealed}** health.`,
        );
    }
}

export function runPassiveEffects(
    passive: Passive,
    user: Fighter,
    fight: FightHandler,
): void {
    if (!passive.effects?.length) return;
    for (const effect of passive.effects) {
        switch (effect.type) {
            case "regen":
                applyRegen(effect, user, fight);
                break;
        }
    }
}
