import type { Ability } from "../@types";
import type { Fighter } from "../structures/Fighter";
import type { FightHandler } from "../structures/FightHandler";
import * as Functions from "../utils/Functions";

/**
 * Declarative side effects, executed by `runAbilityEffects` after the main
 * damage hit lands. See ABILITIES.md for the migration policy.
 *
 * Each effect type mirrors a legacy `useMessage` callback pattern. When a new
 * kind is added, its executor must reproduce the legacy helper's queue
 * (`nextTurnPromises` vs `nextRoundPromises`), log emoji, and log ordering
 * exactly — behavior parity first.
 */
export interface BleedEffect {
    type: "bleed";
    /**
     * Per-tick damage is `Math.round(sourceDamage / damageDivisor)`. Matches
     * the legacy `bleedDamagePromise` argument shape.
     */
    damageDivisor: number;
    /**
     * Number of ticks. Mirrors the `cooldown` arg passed to
     * `bleedDamagePromise` (default 3).
     */
    turns: number;
    /**
     * Where the per-tick damage scales from.
     * - `"dealt"` (default): post-defense damage of the triggering hit
     *   (`status.amount`).
     * - `"ability"`: `Functions.getAbilityDamage(user, ability)` — the user's
     *   potential damage with that ability, ignoring defense. Matches the
     *   legacy `getAbilityDamage(user, Self) / N` pattern in callbacks like
     *   `Finisher.useMessage`.
     */
    source?: "dealt" | "ability";
}

export interface PoisonEffect {
    type: "poison";
    /** Per-tick damage is `Math.round(sourceDamage / damageDivisor)`. */
    damageDivisor: number;
    /** Number of ticks. Mirrors the `cooldown` arg of `poisonDamagePromise`. */
    turns: number;
    source?: "dealt" | "ability";
}

export interface FreezeEffect {
    type: "freeze";
    /** Number of turns the target is frozen / stunned. */
    turns: number;
    /**
     * - `"set"`: `target.frozenFor = turns` (overrides any existing freeze).
     * - `"add"`: `target.frozenFor += turns` (stacks with existing freeze).
     *
     * Legacy callbacks used both. Pick whichever matches the original behavior
     * of the migrated ability — usually the description gives it away
     * (`stunned for N turns` ≈ "set", `puts to sleep for additional N turns`
     * ≈ "add").
     */
    mode: "set" | "add";
}

export type AbilityEffect = BleedEffect | PoisonEffect | FreezeEffect;

function applyBleed(
    effect: BleedEffect,
    ability: Ability,
    user: Fighter,
    target: Fighter,
    dealtDamage: number,
    fight: FightHandler,
): void {
    const sourceDamage =
        (effect.source ?? "dealt") === "ability"
            ? Functions.getAbilityDamage(user, ability)
            : dealtDamage;
    const tickDamage = Math.round(sourceDamage / effect.damageDivisor);

    fight.nextTurnPromises.push({
        cooldown: effect.turns,
        executeOnlyOnce: false,
        callerId: user.id,
        id: Functions.generateRandomId(),
        promise: (resolvedFight) => {
            const liveUser =
                resolvedFight.fighters.find((f) => f.id === user.id) ?? user;
            const liveTarget =
                resolvedFight.fighters.find((f) => f.id === target.id) ?? target;
            if (liveTarget.health <= 0) return;

            const oldHealth = liveTarget.health;
            liveTarget.health -= tickDamage;
            liveUser.totalDamageDealt += oldHealth - liveTarget.health;
            const turnLogs =
                resolvedFight.turns[resolvedFight.turns.length - 1].logs;
            if (liveTarget.health <= 0) {
                liveTarget.health = 0;
                turnLogs.push(
                    `-# 🩸 **${liveTarget.name}** died from bleed damage`,
                );
            } else {
                turnLogs.push(
                    `-# 🩸 **${liveTarget.name}** took **${
                        oldHealth - liveTarget.health
                    }** bleed damage`,
                );
            }
        },
    });
}

function applyPoison(
    effect: PoisonEffect,
    ability: Ability,
    user: Fighter,
    target: Fighter,
    dealtDamage: number,
    fight: FightHandler,
): void {
    const sourceDamage =
        (effect.source ?? "dealt") === "ability"
            ? Functions.getAbilityDamage(user, ability)
            : dealtDamage;
    const tickDamage = Math.round(sourceDamage / effect.damageDivisor);

    // Mirrors `poisonDamagePromise` exactly: queued on nextRoundPromises (not
    // nextTurnPromises), logs "took N damage" unconditionally with the static
    // tickDamage (even if the target is already dead by then), then applies
    // damage only if alive, then conditionally logs "died from poison".
    fight.nextRoundPromises.push({
        cooldown: effect.turns,
        executeOnlyOnce: false,
        callerId: user.id,
        id: Functions.generateRandomId(),
        promise: (resolvedFight) => {
            const turnLogs =
                resolvedFight.turns[resolvedFight.turns.length - 1].logs;
            turnLogs.push(
                `-# ☠️🧪☣️ **${target.name}** took **${tickDamage}** poison damage`,
            );
            if (target.health > 0) {
                const oldHealth = target.health;
                target.health -= tickDamage;
                user.totalDamageDealt += oldHealth - target.health;
                if (target.health <= 0) {
                    target.health = 0;
                    turnLogs.push(
                        `-# ☠️🧪☣️ **${target.name}** died from poison damage`,
                    );
                }
            }
        },
    });
}

function applyFreeze(effect: FreezeEffect, target: Fighter): void {
    if (effect.mode === "set") {
        target.frozenFor = effect.turns;
    } else {
        target.frozenFor += effect.turns;
    }
}

export function runAbilityEffects(
    ability: Ability,
    user: Fighter,
    target: Fighter,
    dealtDamage: number,
    fight: FightHandler,
): void {
    if (!ability.effects?.length) return;
    for (const effect of ability.effects) {
        switch (effect.type) {
            case "bleed":
                applyBleed(effect, ability, user, target, dealtDamage, fight);
                break;
            case "poison":
                applyPoison(effect, ability, user, target, dealtDamage, fight);
                break;
            case "freeze":
                applyFreeze(effect, target);
                break;
        }
    }
}
