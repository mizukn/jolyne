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

export type AbilityEffect = BleedEffect;

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
        }
    }
}
