# Project State (handoff doc)

> Read this first if you're an AI/agent picking this up. It tells you where we are, what's been done, what's next, and what NOT to do.

## Branch + repo layout

- **Branch:** `rework` (on parent and on both submodules `src/structures` and `src/scripts`).
- **Submodules:** `src/structures` and `src/scripts` are separate repos. To edit files inside them, **commit inside the submodule first**, then bump the submodule pointer in the parent. Use absolute paths or `git -C <abs/path>` — bash `cd` doesn't persist between calls.
- **Mainline reference docs:** [`BRAINSTORM.md`](BRAINSTORM.md) (per-file deep audit) and [`PLAN.md`](PLAN.md) (phased roadmap). Read those for *why* before changing things.

## What's done

### Phase 0 — bug fixes (P0.1–P0.21, minus P0.17 which is skipped)

All landed on `rework`. Each is its own commit. Highlights:

- `fix(events): shardResume listening to wrong event`
- `fix(ready): correct cluster id parseInt for >= 10 clusters`
- `fix(dungeon): use 15min threshold for message reuse, not 1s`
- `fix(dungeon): assign rarity downgrade so the_elite gating works`
- `fix(db): remove stray space from refund channel id`
- `refactor(combat): drop dead code in whosTurn getter`
- `fix(combat): exclude ended/stale fights from channel concurrency check`
- `fix(combat): end fight gracefully when bot loses message permissions`
- `fix(watchdog): require sustained staleness or hard age cap to kill fights`
- `perf(ready): skip slash-command repost when nothing changed`
- `fix(cluster): resolve infinite busy-wait and ratelimit check bugs`
- `security(eval): remove dangling code and fix security bypasses`
- `feat(admin): add bounds checking and audit logging` (`src/utils/AdminAudit.ts` exists)
- `fix(combat): clear cooldowns on end, drop 10min mid-fight remover`
- `perf(ready): poll patreon every 15min instead of every 2min`
- `security: replace hardcoded dev id with OWNER_IDS env`

### V2 components migration (started)

- `src/utils/containers.ts` exists — Jolyne-themed V2 helpers (`containers.primary/success/error/warning`, palette in `COLORS`).
- `src/commands/social/Profile.ts` rewritten to V2.
- `src/commands/general/HelpSubcommands.ts` rewritten to V2 with category + per-command browser (multi-select pagination at >25 commands).

### Restructure (one big commit, intentional)

`refactor: reorganize commands into domain folders` (`0c702e3`). Old `commands/{private,rpg,utils}` → new `commands/{admin,adventure,casino,combat,economy,general,social}`. Type union and command loader updated to walk the new tree recursively.

## What's NOT done / in-flight

### V2 migration backlog (next work)

Profile + Help are V2; everything else still uses classic embeds. Natural next targets, in suggested order:
1. **Inventory** (subcommands: view/use/equip/unequip/throw/claim) — biggest UX win.
2. **DailySubcommands** (claim/quests view).
3. **EmailsSubcommands** (list/view/archive).
4. **Shop** + **Trade** (interactive flows).
5. **Settings**.
6. Fight UI (last — needs the FightHandler split first; see PLAN §5 P3.2).

### Emoji progress bars (queued)

User has new emoji-bar assets ready:
- HP: `<:rbegp:1499892865457848390>`, `<:rmdp:1499892463228420229>`, `<:rendp:1499892039012323540>`
- Stamina/yellow: `<:bbegp:1499893513154723920>`, `<:bmdp:1499893491461918811>`, `<:bendp:1499893459195265024>`
- Blue/XP: `<:bluebegp:1499894030840889384>`, `<:bluemdp:1499894069562966076>`, `<:blueendp:1499894088756105328>`

Not yet wired in. Reference helper signature from another bot:

```ts
emojiBar(kind: "hp" | "stamina", current: number, max: number, segments = 6): string
```

When integrating: add `bar_hp_begin/_mid/_end`, `bar_sta_*`, `bar_xp_*`, `bar_empty_*` keys to `emojis.json`, then port the helper to `src/utils/`. Use it in Profile and (eventually) the fight UI.

### Phase 1 foundations (untouched — see PLAN §3)

- P1.1 `services/UserService.ts` clean extraction (NOT the half-done version in `stash@{0}` — that one inverted the dep direction).
- P1.2 test harness (`vitest` or `bun test`).
- P1.3 `src/config/gameplay.ts` for magic numbers.
- P1.4 boot-time data validation.
- P1.5 single RNG module.
- P1.6 logger replacement + ESLint forbid `console.log`.
- P1.7 stop writing `NPCs.json` / `prestigeNPCs.json` at runtime.

## Stashes

- `stash@{0}: gemini-wip P1.1 UserService partial extraction (incomplete, inverted dep direction)` — **do not pop blindly**. The approach has UserService importing Functions (it should be the other way). Worth referencing for naming/signatures only.

## Conventions (do not break)

1. **Commit style:** one commit per fix, conventional-commit short messages (`fix(scope): brief`, `feat(scope): brief`, `refactor(scope): brief`). No body, no `Co-Authored-By`.
2. **No `Co-Authored-By`** in any commit.
3. **Never** mention or credit other Discord bots/projects in commits, file content, comments. Describe designs as "the new V2 layout" etc.
4. **No emojis in commit messages** (the user's old style had them; the new style does not).
5. **No `console.log`** for new code. Use `client.log`.
6. **No `// @ts-expect-error`** to mutate imported modules.
7. **Strangler pattern:** new code goes in new modules; the four giants (`Functions.ts`, `FightHandler.ts`, `interactionCreate.ts`, `index.ts`) only shrink, never grow.
8. **Submodule edits:** commit inside submodule, then commit the pointer bump in parent. Use the same commit message in both.
9. **The hardcoded developer ID `239739781238620160` is gone** from active code. Use `process.env.OWNER_IDS.split(",")` checks. Don't reintroduce it.

## Skipped on purpose

- **`src/scripts` submodule changes** — user explicitly said skip. `backup.json` (V1→V2 migration leftover) and `restoreVotes.ts` are still there. Do not touch.
- **`src/commands/general/Infos.ts`** still has the dev's name/id in the vanity card. Intentional — it's a public bot info display.
- **`DatabaseHandler.ts:357` `deleteUserData("239739781238620160")`** inside the dead `migrateData()` method — left alone because the whole method is dead.

## Quick command reference

```bash
# Verify type-check before committing
tsc --noEmit -p tsconfig.json

# Submodule workflow (must use absolute paths)
git -C /home/mizuki/jolyne/jolyne-rework/src/structures add <file>
git -C /home/mizuki/jolyne/jolyne-rework/src/structures commit -m "fix(scope): msg"
git add src/structures && git commit -m "fix(scope): msg"

# See current state
git status --short
git log --oneline -20
git submodule status
git stash list
```

## How the user wants to work

- One commit per fix.
- They open PRs themselves; don't push or open PRs from agent side.
- They're tracking commits live via a GitHub channel on the support server, so commit messages are user-visible — keep them readable.
- They prefer: ask before doing destructive things, propose before implementing big refactors, surface ambiguity early.
