import type { Passive } from "../@types";
import type { Fighter } from "../structures/Fighter";
import type { FightHandler } from "../structures/FightHandler";
import { getAttackDamages } from "../utils/Functions";

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

export interface OnHitStackEffect {
    type: "on_hit_stack";
    /**
     * Cache-key namespace, mirrors the legacy `getId` prefix (e.g. `"poison"`,
     * `"burn_damage"`).
     */
    cacheKey: string;
    /**
     * Multiplier on `getAttackDamages(user)`. Mirrors the legacy
     * `getAttackDamages(user) * N` constant in each passive's promise.
     */
    attackMultiplier: number;
    /** Damage label in the log line: e.g. `"poison"`, `"burn"`. */
    label: string;
    /**
     * Emoji source for the log line:
     * - `"stand"`: `user.stand?.emoji` (Poison passive style)
     * - `"literal"`: the `literalEmoji` field (Fire passive uses `":fire:"`)
     */
    emojiSource: "stand" | "literal";
    literalEmoji?: string;
}

export type PassiveEffect = RegenEffect | OnHitStackEffect;

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

function applyOnHitStack(
    effect: OnHitStackEffect,
    user: Fighter,
    fight: FightHandler,
): void {
    // Mirrors the legacy Poison/Fire passives. Fires only when the user's last
    // hit landed on a non-self, still-alive target. Consumes `lastHit` so each
    // hit triggers at most one stacking-DoT passive per fighter.
    const lastHit = fight.infos.lastHit;
    if (!lastHit) return;

    const enemy = fight.fighters.find((f) => f.id === lastHit.target);
    const userAttacker = fight.fighters.find((f) => f.id === lastHit.user);
    if (!enemy || !userAttacker) return;
    if (userAttacker.id !== user.id) return;
    if (userAttacker.id === enemy.id) return;
    if (enemy.health <= 0) return;

    fight.infos.lastHit = undefined;

    const stackId = `${effect.cacheKey}_${user.id}_${fight.id}.stacks`;
    const currentStacks = Number(fight.cache.get(stackId) ?? 0);
    fight.cache.set(stackId, currentStacks + 1);

    const damages = Math.round(getAttackDamages(user) * effect.attackMultiplier);
    const status = enemy.removeHealth(damages, user, 0);

    const emoji =
        effect.emojiSource === "stand" ? user.stand?.emoji : effect.literalEmoji;
    fight.turns[fight.turns.length - 1].logs.push(
        `-# ${emoji} ${enemy.name} took **${status.amount}** ${effect.label} damages.`,
    );
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
            case "on_hit_stack":
                applyOnHitStack(effect, user, fight);
                break;
        }
    }
}
