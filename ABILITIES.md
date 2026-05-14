# Abilities & Passives — agent handoff

> Read this before touching anything in `src/rpg/Abilities.ts`, `src/rpg/Passives.ts`,
> or their executors. PLAN.md P4.2 is the long-form spec; this doc is the
> operational brief for the people actually doing the work. Abilities and
> Passives are two different systems that share the same migration philosophy:
> declarative `effects[]` where possible, callback fallback for the weird ones.
> The Abilities migration is in flight (slices 1-3); the Passives migration
> hasn't started — its section below covers the type, callsite, and
> classification so a future slice can begin without re-reading the source.

## Why this doc exists

We're migrating active fight abilities from imperative callbacks
(`useMessage: (user, target, damage, ctx) => void`) to a declarative
`effects?: AbilityEffect[]` array. The codebase has ~150 ability definitions;
about half are already pure data (no `useMessage`), and the rest mix log
output with side effects that mutate `Fighter` / `FightHandler` state. This
migration makes the easy 80% of abilities testable, comparable for AI, and
balanceable without editing logic — while keeping the weird JoJo-specific
ones as callbacks because they don't fit a clean effect union.

This file is the source of truth for **what's migrated, what's still custom,
and how to add the next slice**. Update it in the same commit as any
migration work.

## Where things live

| File | What |
| --- | --- |
| [src/rpg/Abilities.ts](src/rpg/Abilities.ts) | All 152 active ability definitions. ~3,500 lines. |
| [src/rpg/AbilityEffects.ts](src/rpg/AbilityEffects.ts) | `AbilityEffect` discriminated union + `runAbilityEffects(...)` executor. New module added by P4.2. |
| [src/structures/FightDamage.ts](src/structures/FightDamage.ts) | `applyAbility(...)` — the integration point. After the main damage hit lands, it calls `runAbilityEffects(...)` for declarative side effects, then (if present) calls `useMessage(...)` for the log line. Lives in the `src/structures/` submodule. |
| [src/@types/index.ts](src/@types/index.ts) | `Ability` interface; `effects?: AbilityEffect[]` lives here. |
| [src/bootstrap/validate.ts](src/bootstrap/validate.ts) | Boot-time cross-reference checks. Effects validation lands here — see "Open work" below. |

## The Ability type today

```ts
interface Ability {
    name: string;
    description: string;
    cooldown: number;
    extraTurns: number;
    extraTurnsIfGB?: number;
    damage: number;
    trueDamage?: number;
    stamina: number;
    dodgeScore: number;
    target: "enemy" | "ally" | "onlyAlly" | "self" | "any";
    special?: boolean;
    thumbnail?: string;
    noNextTurn?: boolean;
    ally?: boolean;

    useMessage?: (user, target, damage, ctx) => string | void;
    effects?: AbilityEffect[];   // NEW — P4.2
}
```

**Already declarative (no `useMessage`):** numeric stats (`damage`, `stamina`,
`cooldown`, `extraTurns`, `dodgeScore`, `target`). ~75 abilities have nothing
beyond these — they fire, damage is computed by `Functions.getAbilityDamage`,
the default log line is rendered, done. **No migration needed.**

**`useMessage` does two things, sometimes both, sometimes one:**

1. **Log line override.** `return "custom log..."` overrides the default
   `<emoji> X uses Stand : Ability on Y and deals Z damages` template.
2. **Side effects.** Mutates target/user/fight directly — apply status, schedule
   DoT, manipulate, heal, summon, etc.

If `useMessage` only returns a string with no side effects, **leave it alone**
— there's nothing to migrate, the log line is the whole point.

If `useMessage` has side effects, that's the migration target.

## How `effects[]` integrates

In `FightDamage.applyAbility`:

```ts
const status = target.removeHealth(dmg, fight.whosTurn, abilityObj.dodgeScore);

if (status.type === FighterRemoveHealthTypes.Defended)   // also BrokeGuard, Normal
{
    runAbilityEffects(abilityObj.effects, fight.whosTurn, target, status.amount, fight);
    if (abilityObj.useMessage) {
        // useMessage now runs AFTER effects; returned string still becomes the
        // log line if present, else the default template renders.
        ...
    }
}
```

Effects run for Defended / BrokeGuard / Normal hits (i.e. anything that
wasn't a dodge), matching the current `useMessage` invocation rule. Effects
are computed off `status.amount` (post-defense damage), same as `useMessage`'s
`damage` argument.

## Effect types

The discriminated union is in [src/rpg/AbilityEffects.ts](src/rpg/AbilityEffects.ts).
Each effect has a `type` literal; the executor switches on it. Add a new
effect type by:

1. Adding the interface to the union.
2. Adding a `case` in the executor's switch.
3. Writing a test for that effect type in `AbilityEffects.test.ts`.
4. Migrating the abilities that use it in the same commit ("slice").
5. Updating this doc's "Migrated abilities" table.

### Current effects

| Type | Shape | What it does |
| --- | --- | --- |
| `bleed` | `{ type: "bleed", damageDivisor: number, turns: number, source?: "dealt" \| "ability" }` | Mirrors `bleedDamagePromise` exactly. Queued on `nextTurnPromises`, fires once per turn for `turns` turns. Per-tick damage is `Math.round(sourceDamage / damageDivisor)`. `source` picks between `status.amount` (default) and `Functions.getAbilityDamage(user, ability)`. Logs `-# 🩸 **target** took **N** bleed damage` (or "died from bleed damage" if killed). Re-fetches user/target from `fight.fighters` to survive references going stale across turns. |
| `poison` | `{ type: "poison", damageDivisor: number, turns: number, source?: "dealt" \| "ability" }` | Mirrors `poisonDamagePromise` exactly. Queued on **`nextRoundPromises`** (one tick per round, not per turn). Logs `-# ☠️🧪☣️ **target** took **N** poison damage` **unconditionally** — including when the target is already dead, preserving a legacy quirk. Damage applies only if alive; if killed, follows with `-# ☠️🧪☣️ **target** died from poison damage`. Does NOT re-fetch user/target. |
| `freeze` | `{ type: "freeze", turns: number, mode: "set" \| "add" }` | Immediate state mutation (no promise queue). `"set"` mode assigns `target.frozenFor = turns` (overrides existing). `"add"` mode does `target.frozenFor += turns` (stacks). The flavor log line stays in the ability's `useMessage` because each freeze ability has bespoke wording. |

## Slice convention

**One slice = one effect type + the abilities that use exactly that effect.**

- The slice introduces or extends the executor with new effect type(s).
- It migrates the abilities whose `useMessage` collapses cleanly into the
  new effect(s).
- It includes executor tests for the new effect type.
- It updates [ABILITIES.md](ABILITIES.md) "Migrated abilities" + status counts.
- It updates [PLAN.md](PLAN.md) P4.2 if status shifts category.

**One commit per slice.** No giant "migrate everything" commits.

**Test scope per slice:** one focused test per new effect type (executor
reads the effect correctly, applies the right mutation, idempotent in the
shape that matters). 2-3 integration-style tests on representative migrated
abilities to catch wiring mistakes. **No per-ability tests** — they'd be
noise.

## Hard rules

1. **`useMessage` stays available as fallback.** Never delete the field.
   When an ability has both `effects` and `useMessage`, effects run first,
   then useMessage (whose return string overrides the log if present).
2. **If an ability needs more than a clean declarative effect list, leave
   it as `useMessage`.** "Clean" means: the effect set fits the existing
   union without bespoke fields, conditional branching, or fight-context
   poking outside what the executor exposes. If you find yourself adding a
   one-off field to make some specific stand work, that ability stays
   custom.
3. **Preserve behavior first, elegance second.** Migrated abilities should
   produce indistinguishable fight outcomes from the pre-migration version.
   When porting a side effect, mirror the legacy helper (cooldown, divisor,
   log emoji, log template) exactly. Re-balancing belongs in a separate
   commit, not in a migration slice.
4. **Passives are out of scope.** Stand passives (on-turn, on-hit, on-death)
   are handled by `FightPassives.ts` with separate semantics. P4.2 is about
   **active** abilities only.
5. **`customAttack` is out of scope.** Some stands override the basic attack
   via `stand.customAttack.handleAttack`. That's not an `Ability`, it's a
   stand-level override.
6. **Don't touch `FightSpecialCases.ts`.** Hol Horse / Avdol auto-targeting
   and the 9999999 instakill are already extracted there. They're not
   inside any ability's `useMessage`.

## Abilities that stay as `useMessage` (decided)

Listed here so future agents don't try to migrate them. Add to this list
whenever you investigate an ability and decide it's not worth porting.

| Ability | File location | Why it stays custom |
| --- | --- | --- |
| `TheWorld` | Abilities.ts:58 | Time stop with stand-specific dialogue per `user.stand.id`, schedules re-enable via `nextTurnPromises`. Mutates `user.hasStoppedTime`. Pure dialogue/state combo, doesn't fit a generic effect. |
| `Manipulation` | Abilities.ts:141 | Mutates `target.name`, sets `target.manipulatedBy`, schedules `nextRoundPromises` to revert. Highly bespoke. |
| `OhMyGod` | Abilities.ts:325 | Snapshot-then-restore all skill points; the +100% (capped at 75) math doesn't generalize. |
| `BulletsRafale` | Abilities.ts:384 | Sex Pistols ammo system via `fight.cache`, multiple calls to `customAttack.handleAttack`. Comment in source says "ONLY FOR SEX PISTOLS OR ELSE IT WILL CRASH". |

Update this list as new bespoke abilities are encountered.

## Migrated abilities

| Ability | Slice | Effects |
| --- | --- | --- |
| `Finisher` | 1 | `[{ type: "bleed", damageDivisor: 10, turns: 3, source: "ability" }]` |
| `FistEnlargement` | 1 | Inherits from `Finisher` via spread (`...Finisher`). |
| `SerpentStrike` | 2 | `[{ type: "poison", damageDivisor: 10, turns: 2 }]` |
| `CelestialFang` | 2 | `[{ type: "poison", damageDivisor: 3, turns: 2 }, { type: "bleed", damageDivisor: 3, turns: 2 }]` |
| `LifeShot` | 3 | `[{ type: "freeze", turns: 4, mode: "add" }]` (useMessage retains the flavor log) |
| `YoAngelo` | 3 | `[{ type: "freeze", turns: 3, mode: "add" }]` (useMessage retains the flavor log) |
| `Flash` | 3 | `[{ type: "freeze", turns: 4, mode: "set" }]` (useMessage retains the flavor log) |
| `Freeze` | 3 | `[{ type: "freeze", turns: 3, mode: "set" }]` (useMessage retains the flavor log) |
| `DisorientingStabs` | 3 | `[{ type: "freeze", turns: 2, mode: "set" }]` (useMessage retains the flavor log) |
| `JingleStun` | 3 | `[{ type: "freeze", turns: 2, mode: "set" }]` (useMessage retains the flavor log) |
| `Frostbite` | 3 | `[{ type: "freeze", turns: 3, mode: "set" }]` (useMessage retains the flavor log) |

Update with every slice.

**Behavior subtlety — `useMessage` push vs. return:** the freeze migrations keep `useMessage` for the bespoke flavor log. CRITICAL: those callbacks must **push** the log line directly to `ctx.turns[...].logs` and return void. Do NOT refactor them to return the string. Reason: `FightDamage.applyAbility` only pushes the returned-string log when `status.amount !== 0`; for `damage: 0` abilities (most freeze ones) the return path silently drops the log. The push-directly pattern fires unconditionally and was the original semantics. Verified the hard way during slice 3.

## Migration buckets (snapshot)

Counts at the start of P4.2 work:

| Bucket | Count | What |
| --- | --- | --- |
| Already declarative (no useMessage) | ~75 | Pure-stat abilities. Nothing to do. |
| `useMessage` returns a log string only | unknown, ~15-25 estimated | Custom log line, no side effects. Leave alone — the string IS the value. |
| `useMessage` schedules DoT (bleed/burn/poison) | ~10-15 | **Easiest migration.** Slice 1 hits these. |
| `useMessage` heals / lifesteal | ~5-10 | Future slice (`heal`, `lifesteal` effects). |
| `useMessage` AoE / multi-target iteration | ~5-10 | Future slice (`aoe` effect). |
| `useMessage` temporary stat boost with revert | ~3-5 | Future slice (`stat_boost` effect with snapshot). |
| Custom / bespoke (stay as callback) | ~4+ growing | See "Abilities that stay as useMessage". |

Numbers are estimates — refine with each pass.

## Boot validation — landed

[src/bootstrap/validate.ts](src/bootstrap/validate.ts) walks every export of
`src/rpg/Abilities.ts` and `src/rpg/Passives.ts`, checks the `effects?` array
on each, and asserts:

- `effect.type` is a known union member (rejects typos like `"dotz"` or `"regenz"`).
- Per-type parameter sanity (e.g. `bleed.damageDivisor > 0`, `freeze.mode in {set, add}`, `regen.cacheKey` non-empty, `on_hit_stack.literalEmoji` required when `emojiSource === "literal"`).

Violations are reported through the same `validateRegistries` channel as the
rest of the boot checks — process-exit in production, warn in dev/BETA.
Unit-tested in [validate.test.ts](src/bootstrap/validate.test.ts).

When adding a new effect type, extend the `validateAbilityEffect` /
`validatePassiveEffect` switch in `validate.ts` with the new case.

## Don't do these

- Don't introduce a parallel `FightState` or `Combatant` model. Reuse the
  current `Fighter`, `FightHandler`, `nextTurnPromises`, `nextRoundPromises`,
  `frozenFor`, `manipulatedBy`, `hasStoppedTime` primitives.
- Don't migrate an ability and re-balance its numbers in the same commit.
  Behavior parity first.
- Don't add a "log" effect type yet. The current rule — `useMessage` returns
  the log string, effects do side effects — works for the migrations done so
  far. Add a `log` effect only if a slice genuinely needs it.
- Don't auto-generate effects from `useMessage` parsing. If you can't read
  the callback and write the effects array by hand, the ability isn't a good
  migration candidate.

## Quick start for the next ability slice

1. Read this file (you're doing that).
2. Pick a bucket from "Migration buckets" that hasn't been done yet
   (currently: heal/lifesteal, AoE, stat_boost, or expand DoT coverage).
3. Read 3-5 example abilities in that bucket from
   [src/rpg/Abilities.ts](src/rpg/Abilities.ts) to confirm the shape.
4. Add the new effect type(s) to [src/rpg/AbilityEffects.ts](src/rpg/AbilityEffects.ts).
5. Migrate those 3-5 abilities by deleting their `useMessage` and adding
   `effects: [...]` (or keeping `useMessage` for the log + `effects` for state
   mutation — see the freeze-migration note above).
6. Add executor test(s) for the new effect type.
7. Update this doc's "Effect types", "Migrated abilities", "Migration buckets".
8. Run `npx tsc --noEmit` and `npm run lint`.
9. One commit. If the slice touches `src/structures/FightDamage.ts`, that's a
   submodule commit first, then the parent.

---

# Passives

Passives are the second half of the active-fight engine. They run automatically
each turn or round (no user action required), and they currently use the same
imperative-callback style that Abilities had pre-P4.2. The migration philosophy
is identical: declarative `effects[]` for the easy patterns, keep `promise`
callbacks for the weird ones, preserve behavior first.

The Passives migration is in flight as of slice 4 — see "Migrated passives"
below.

## Where Passives live

| File | What |
| --- | --- |
| [src/rpg/Passives.ts](src/rpg/Passives.ts) | All 10 active passives. ~470 lines. |
| [src/structures/FightPassives.ts](src/structures/FightPassives.ts) | `handleFightPassives({ fighters, cache, fight, type, ... })` — the integration point. Walks every fighter's stand + weapon passives, filters by `type` (`"turn"` vs `"round"`), respects `evenIfDead`, then calls `passive.promise(...)`. Lives in the `src/structures/` submodule. |
| [src/@types/index.ts](src/@types/index.ts) | `Passive` interface. |

The integration point is called twice per cycle: once with `type: "turn"`
(every turn), once with `type: "round"` (every round). Passives self-select by
declaring their `type`.

## The Passive type today

```ts
interface Passive {
    name: string;
    description: string;
    type: "round" | "turn";        // when it fires
    cooldown?: number;             // turns/rounds before first fire
    executeOnlyOnce?: boolean;     // fire once vs. every cycle
    evenIfDead?: boolean;          // fire when fighter.health <= 0
    getId: (user, context, from) => string;     // cache-key namespace
    promise: (user, context, from) => void;     // the actual side effect
}
```

**Where Passives are attached:** `Stand.passives?: Passive[]` and
`Weapon.passives?: Passive[]`. A fighter can carry passives from BOTH their
stand and their weapon at the same time. The `from` argument in `getId` /
`promise` is `"stand" | "weapon"` so a passive applied via both sources can
namespace its cache entries.

**`fight.cache`** is a `Map<string, string | number>` that lives on the
`FightHandler` for the duration of one fight. Passives store stacks, base
values, snapshots, "has-already-fired" flags, etc. there. Every cache key must
be unique per (passive, user, fight) — that's what `getId` enforces.

## Migration design — current state

The architecture (slice 4):

1. `Passive.effects?: PassiveEffect[]` lives alongside the now-optional
   `Passive.promise?` callback.
2. [src/rpg/PassiveEffects.ts](src/rpg/PassiveEffects.ts) defines the
   `PassiveEffect` discriminated union and `runPassiveEffects(passive, user,
   fight)` executor.
3. `handleFightPassives` in [src/structures/FightPassives.ts](src/structures/FightPassives.ts)
   calls `runPassiveEffects` BEFORE invoking the legacy `promise` under the
   same cooldown gate. A passive can declare effects, a promise, or both — but
   once a passive has effects, its `promise` is usually no longer needed and
   is omitted.

The `PassiveEffect` union and the `AbilityEffect` union **stay separate**.
Even though some names overlap (both have "bleed/poison" concepts), the
contexts differ — passive ticks fire automatically per cycle, ability
effects fire after a hit lands. Cross-cutting them would entangle unrelated
semantics.

### Current passive effects

| Type | Shape | What it does |
| --- | --- | --- |
| `regen` | `{ type: "regen", cacheKey: string, healthPercent: number, staminaPercent: number, capPercent: number }` | Per-fire heal: `Math.round(user.maxHealth * healthPercent)` health and, if `staminaPercent > 0`, `Math.round(user.maxStamina * staminaPercent)` stamina. Stops once cumulative health healed `>= baseHealth * capPercent` (snapshotted at first fire). Logs the heal amounts using the user's weapon emoji. `cacheKey` must match the legacy `getId` prefix to keep cache state compatible (e.g. `"regeneration"`, `"regeneration_alter"`, `"jingle"`). |
| `on_hit_stack` | `{ type: "on_hit_stack", cacheKey: string, attackMultiplier: number, label: string, emojiSource: "stand" \| "literal", literalEmoji?: string }` | Triggered when `fight.infos.lastHit.user === self.id` and the target is a different live fighter. Applies `Math.round(getAttackDamages(user) * attackMultiplier)` damage via `target.removeHealth(damage, user, 0)`, increments a per-passive stack counter in `fight.cache`, consumes `lastHit`, and logs `-# <emoji> <target> took **N** <label> damages.`. Emoji is either the user's stand emoji or a literal string. Mirrors legacy `Poison` (75%, stand emoji) and `Fire` (50%, `:fire:`) passives. |

## Migration buckets — Passives snapshot

Counts at the start of the Passives work:

| Bucket | Passives | What |
| --- | --- | --- |
| Per-round regen (heal % of max with cap) | ✅ done — `Regeneration`, `RegenerationAlter`, `Jingle` migrated in slice 4. |
| On-hit stacking DoT | ✅ done — `Poison`, `Fire` migrated in slice 5 via the `on_hit_stack` effect. The legacy `basehealth` and `multiplier` cache entries (set but never read in either passive) were dropped during migration since they're truly dead state. |
| Conditional time-stop AoE | `KnivesThrow` | Fires only during `user.hasStoppedTime` with a specific item equipped (`dios_knives === 6`). Hits all enemies. Stand-specific. **Keep as `promise`.** |
| Snapshot-and-mutate stat scaling | `Rage`, `Darkness` | Cache base values, then scale skill points up/down based on health-lost or hit-count. Complex restore logic on stack change. **Keep as `promise`.** |
| Weapon transformation | `Alter` | Replaces `user.weapon` with `excalibur_alter`, rescales stats, renames the fighter. **Keep as `promise` forever.** |
| Revive-on-death | `Resurrection` | `evenIfDead: true`. Restores health/stamina on first death. Has special interaction with forfeit logic (currently commented-out check). **Keep as `promise`** until the resurrection vs. forfeit policy is settled. |

## Passive hard rules

The Ability rules apply, plus:

1. **Don't change `fight.cache` key conventions.** Every passive that uses the
   cache picks a namespace via `getId`. Migrating to declarative effects must
   preserve those exact keys so an in-progress fight surviving a deploy doesn't
   suddenly lose its cache state. (Realistically fights don't survive deploys,
   but the convention keeps debugging consistent.)
2. **`evenIfDead` semantics must be preserved exactly.** `FightPassives.ts`
   filters dead fighters' passives unless `evenIfDead` is set. The executor
   does NOT need to know this — `handleFightPassives` handles the filter
   before calling into the executor.
3. **Don't merge `Passive` and `Ability` types.** They look similar but the
   triggering contracts are completely different. Same goes for their
   `PassiveEffect` / `AbilityEffect` unions — keep them separate even when
   names overlap.
4. **Don't migrate `Resurrection` without confirming the forfeit policy.**
   There's a commented-out `foundForfeit` check at
   [Passives.ts:410-417](src/rpg/Passives.ts#L410-L417) that suggests the
   "resurrect on death but not after forfeit" rule was once considered and
   then reverted. Whoever migrates Resurrection needs to ask the user which
   behavior is canonical.

## Passives that stay as `promise` (decided)

Update this list when you investigate a passive and decide it stays custom.

| Passive | Why it stays custom |
| --- | --- |
| `Rage` | Cache-heavy stat scaling based on cumulative health lost. Tracks total strength gained against base strength. Doesn't fit a clean effect shape. |
| `KnivesThrow` | Fires only during `user.hasStoppedTime` with `dios_knives === 6` equipped. Item-and-state gated AoE. |
| `Darkness` | Stacking debuff that mutates target's `speed` and `perception` skill points, capped at 12 stacks (48%). Per-stack mutation + base-value snapshot. |
| `Alter` | Hot-swaps `user.weapon` to `excalibur_alter`, rescales every skill point by 1.3, renames the fighter. Highly bespoke. |
| `Resurrection` | `evenIfDead: true`, runs the forfeit-detection log scan, special revive semantics. Wait on forfeit policy decision. |

## Migrated passives

| Passive | Slice | Effects |
| --- | --- | --- |
| `Regeneration` | 4 | `[{ type: "regen", cacheKey: "regeneration", healthPercent: 0.02, staminaPercent: 0, capPercent: 0.1 }]` |
| `RegenerationAlter` | 4 | `[{ type: "regen", cacheKey: "regeneration_alter", healthPercent: 0.04, staminaPercent: 0.04, capPercent: 0.1 }]` |
| `Jingle` | 4 | `[{ type: "regen", cacheKey: "jingle", healthPercent: 0.02, staminaPercent: 0.02, capPercent: 0.1 }]` |
| `Poison` | 5 | `[{ type: "on_hit_stack", cacheKey: "poison", attackMultiplier: 0.75, label: "poison", emojiSource: "stand" }]` |
| `Fire` | 5 | `[{ type: "on_hit_stack", cacheKey: "burn_damage", attackMultiplier: 0.5, label: "burn", emojiSource: "literal", literalEmoji: ":fire:" }]` |

**Behavior note — Jingle description vs. code.** Jingle's description says
"1% of their max health and stamina" but the legacy code regenerated 2%. The
migration preserves the 2% behavior. If the intent was 1%, fix the constant
and update the description in the same commit.

## Quick start for the first passive slice

1. Read [src/rpg/Passives.ts](src/rpg/Passives.ts) end-to-end (it's only ~470 lines).
2. Read [src/structures/FightPassives.ts](src/structures/FightPassives.ts) to understand the integration point.
3. Pick the per-round regen bucket as the pilot — `Regeneration`,
   `RegenerationAlter`, `Jingle` are the three candidates and they share a
   clean structure.
4. Add `effects?: PassiveEffect[]` to the `Passive` interface in `@types`.
5. Create `src/rpg/PassiveEffects.ts` exporting the `PassiveEffect` union
   (start with a single `regen` type) and `runPassiveEffects(...)`.
6. Update `handleFightPassives` in the **submodule** to call
   `runPassiveEffects` before invoking the legacy `promise`. That's a
   submodule commit, then a parent commit.
7. Migrate the three regen passives by adding `effects: [...]` and deleting
   their `promise` callbacks.
8. Add executor tests for the regen effect (resource selection, percent,
   cap-on-total-healing).
9. Update this doc's "Migrated passives" table and the bucket counts.
10. `npx tsc --noEmit` and `npm run lint` clean before commit.
