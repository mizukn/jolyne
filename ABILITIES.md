# Abilities — agent handoff

> Read this before touching anything in `src/rpg/Abilities.ts` or the ability
> executor. PLAN.md P4.2 is the long-form spec; this doc is the operational
> brief for the people actually doing the work.

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
| `dot` | `{ type: "dot", kind: "bleed" \| "burn" \| "poison", damageDivisor: number, turns: number }` | Schedules `turns` ticks of `Math.round(damage / damageDivisor)` damage via `fight.nextTurnPromises`. Mirrors the legacy `bleedDamagePromise` / `burnDamagePromise` / `poisonDamagePromise` helpers exactly. |

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
| `BulletsRafale` | Abilities.ts:384 | Sex Pistols ammo system via `fightCache`, multiple calls to `customAttack.handleAttack`. Comment in source says "ONLY FOR SEX PISTOLS OR ELSE IT WILL CRASH". |

Update this list as new bespoke abilities are encountered.

## Migrated abilities

| Ability | Slice | Effects |
| --- | --- | --- |
| `Finisher` | 1 | `[{ type: "dot", kind: "bleed", damageDivisor: 10, turns: 3 }]` |
| `DeterminationFlurry` | 1 | `[{ type: "dot", kind: "bleed", damageDivisor: 10, turns: 3 }]` |
| `SerpentStrike` | 1 | `[{ type: "dot", kind: "poison", damageDivisor: 10, turns: 2 }]` |
| `CelestialFang` | 1 | `[{ type: "dot", kind: "poison", damageDivisor: 3, turns: 2 }, { type: "dot", kind: "bleed", damageDivisor: 3, turns: 2 }]` |

Update with every slice.

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

## Boot validation — open work

When the executor lands, add to [src/bootstrap/validate.ts](src/bootstrap/validate.ts):

- Walk every `Ability.effects?` array.
- For each effect, assert the `type` is a known union member.
- Per-type sanity: `dot.damageDivisor > 0`, `dot.turns > 0`, etc.
- Process-exit (production) or warn (dev) with the offending ability name.

This catches typos like `type: "dotz"` that would silently no-op at runtime.

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

## Quick start for the next slice

1. Read this file (you're doing that).
2. Pick a bucket from "Migration buckets" that hasn't been done yet
   (currently: heal/lifesteal, AoE, stat_boost, or expand DoT coverage).
3. Read 3-5 example abilities in that bucket from
   [src/rpg/Abilities.ts](src/rpg/Abilities.ts) to confirm the shape.
4. Add the new effect type(s) to [src/rpg/AbilityEffects.ts](src/rpg/AbilityEffects.ts).
5. Migrate those 3-5 abilities by deleting their `useMessage` and adding
   `effects: [...]`.
6. Add executor test(s) for the new effect type.
7. Update this doc's "Effect types", "Migrated abilities", "Migration buckets".
8. Run `npx tsc --noEmit` and `npm run lint`.
9. One commit. If the slice touches `src/structures/FightDamage.ts`, that's a
   submodule commit first, then the parent.
