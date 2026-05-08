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

### V2 components migration (in progress)

Done (per PLAN.md "V2 components UI" track): Profile, Help, Inventory, Daily, Settings, Trade, Emails, Side Quest, Chapter, Prestige, Leaderboard, Blackjack, Shop, Skills, plus the Fight UI itself (containers + emojiBar). Helpers in `src/utils/containers.ts` and `src/utils/emojiBar.ts`. Style guide lives in `README_V2_UI.md`.

Bar emoji palette in `emojis.json`: `bar_hp_*` = red (`r*`), `bar_sta_*` = green (`g*`), `bar_def_*` = blue (`blue*`), `bar_empty_*` = black/basic (`b*`). XP palette (purple) is still not uploaded — `bar_xp_*` keys are not defined; `emojiBar("xp", ...)` renders Unicode placeholders until added.

### Restructure (one big commit, intentional)

`refactor: reorganize commands into domain folders` (`0c702e3`). Old `commands/{private,rpg,utils}` → new `commands/{admin,adventure,casino,combat,economy,general,social}`. Type union and command loader updated to walk the new tree recursively.

## What's NOT done / in-flight

### FightHandler split (PLAN §5 P3.2) — orchestrator at 254 lines

Was 2,820. Down to 254 (−91%). The body now lives in sibling modules under `src/structures/`:

| Module | Role |
| --- | --- |
| `Fighter.ts` | Fighter class + `FighterRemoveHealthTypes` + `FighterAttackStaminaCost` |
| `FightTypes.ts` | `FightTypes`, `FightTypeColor`, `FightInfos`, `FightTurn`, `FightEvents` (no runtime deps on FightHandler) |
| `FightAI.ts` | Pure NPC decision helpers (`chooseNPCMove`, `chooseNPCStandAbility`, `chooseNPCWeaponAbility`, `chooseNPCTargetId`, `controlledFighter`, `isNPCControlled`) |
| `FightNPCTurn.ts` | `runNPCTurn(fight)` — dispatcher that the side-effecting NPC turn drives |
| `FightActionMenus.ts` | `runTargetSelection`, `runStandAbilityMenu`, `runWeaponAbilityMenu` — bodies of the former `selectTarget` / `selectStandAbility` / `showWeaponAbilities` |
| `FightTurnEngine.ts` | `advanceTurn(fight)` + `checkNewRound(fight)` |
| `FightDamage.ts` | `applyAttack(fight)` + `applyAbility(fight)` — bodies of the former `handleAttack` / `handleUseAbility` |
| `FightPassives.ts` | `handleFightPassives(...)` engine dispatcher |
| `FightPromiseQueue.ts` | `processFightPromises(...)` for next-turn / next-round queues |
| `FightRound.ts` | `shouldStartNewRound`, `tickCooldowns`, `refreshFightersForNewRound` |
| `FightExtraTurns.ts` | `grantExtraTurnIfEligible`, `clearExtraTurnLogs`, `hasExtraTurnLog`, `getOpponents` |
| `FightTargeting.ts` | `getAvailableTargets` |
| `FightTeams.ts` | `getLastStandingOutcome`, `forceLastTeamStanding`, `getTeamIndex`, `getHumanFavoredWinner` |
| `FightSpecialCases.ts` | HolHorse-vs-Avdol auto-targeting + Hol Horse 9999999 instakill |
| `FightTimeouts.ts` | Per-turn timeout penalty |
| `FightLifecycle.ts` | `runUpdateMessage(fight)` + `armTurnTimeout(fight)` + `armNPCTimeout(fight)` + `endOrUnexpected(fight, error)` + `endIfOneTeamLeft(fight)` — bodies of the former `updateMessage` / `setTimeout` / `setNPCTimeout` / `endFightOrUnexpected` / `oneTeamLeft` |
| `FightWebhookLogs.ts` | `sendFightLogs(fight)` + `sendFightStats(fight)` — bodies of the former `sendLogs` / `sendFightStats` (the latter is still callable via the FightHandler delegator since `FightHandlerWatchdog` invokes it externally) |
| `FightInteraction.ts` | `handleInteraction(fight, interaction)` — body of the former constructor-internal `listenerCallback` (the button + string-select-menu dispatch switch) |
| `FightLifecycleHandlers.ts` | `attachLifecycleHandlers(fight, fightEndCallback, fightCallFuncCallback)` — bodies of the former constructor-internal `on('unexpectedEnd')` / `on('end')` handlers |
| `FightSetup.ts` | `initializeFight(fight, type, messageX)` (cluster-event registration + message-init dispatch) + `runFightSetup(fight, type, fightEndCallback, fightCallFuncCallback)` (fighter sort, channel concurrency check, total-fight timeout, `infos` / `turns` seed, listener creation, lifecycle handler attach, fight-start webhook, listener `collect` wiring, cooldown init, initial `updateMessage`) — bodies of the former constructor `Finally()` IIFE |
| `FightActions.ts` | `handleDefend(fight)` + `handleSkip(fight)` + `continueStep(fight)` — bodies of the former turn-action handlers and the post-target-pick `currentStep` router |
| `FightTurnQueue.ts` | `getWhosTurn(fight)` + `getWhosTurnAvailableAbilities(fight)` + `getWhosTurnAvailableAbilitiesWeapon(fight)` — bodies of the former `whosTurn` / `whosTurnAvailableAbilities` / `whosTurnAvailableAbilitiesWeapon` getters |

`FightHandler.ts` is now a thin orchestrator: constructor (10 lines of state seeding + a single `initializeFight` call) + 1-line delegators into the modules above + the small `availableFighters` / `hasStoppedTime` / `hasOneTarget` getters and the 10-line `addOrEditCooldown` mutator.

**Still inline in FightHandler**:
- The 10 field-default lines + `initializeFight(this, type, messageX)` in the constructor.
- `addOrEditCooldown(id, move, cooldown)` — 10-line `this.infos.cooldowns` mutator. Three external callers (FightSetup, FightDamage). No clear destination module — keeping inline.
- The small getters: `availableFighters` (3 lines), `hasStoppedTime` (3 lines), `hasOneTarget` (10-line getAvailableTargets delegator).
- One-line delegators into all the extract modules.

**Members promoted to public for cross-module orchestration** (visibility only, no external callers): `currentStep`, `currentStepAbility`, `selectTarget`, `selectStandAbility`, `handleDefend`, `handleSkip`, `handlePassives`, `oneTeamLeft`, `hasStoppedTime`, `checkNewRound`, `timeout`, `isAttacking`, `noUpdateMessage`, `NPCTimeout`, `NPCAttack`, `fiveMinTimeout`, `listener`. Same convention every extract follows: take `fight: FightHandler` and read/write through `fight.*`.

**Method removed entirely:** the `handleUseAbility` private delegator was deleted — its only callers (`continueStep`'s `"handleUseAbility"` case) now invoke `applyAbility(fight, ...)` directly from `FightActions.ts`, so the method had no remaining purpose.

### Fight V2 migration follow-ups

- **`infos.thumbnail`** — done. Renders as a `ThumbnailBuilder` accessory on a dedicated section in `FightRenderer.renderTurn`.
- **V2 message-transition audit** — mostly done. `FightSetup` now uses `FightRenderer.renderInitializingFight()`, `/fight quest` edits any provided `messageX` into a V2 placeholder before handing it to `FightHandler`, and `DungeonHandler` no longer passes its dungeon-progress message as the fight message. Remaining live-test path: click through raid/event/matchmaking starts and verify no duplicate fallback fight message appears.
- **April Fools `randomGifs`** — gone in the V2 migration. V2 containers don't have a body image. Eight hardcoded gif URLs no longer render on April 1. Decide whether to restore via section markdown / thumbnail accessory or accept the loss.
- **Ephemeral deprecation warnings** — partially addressed. `CommandInteractionContext.makeMessage/followUp` and queued followups normalize `ephemeral` to `MessageFlags.Ephemeral`; direct command gates, `/fight` defer, Slots modal errors, Patreon followup, and Email action replies were converted. Some direct component replies still use `ephemeral` and can be swept incrementally.

### XP emoji bar (purple) — pending user upload

The user said purple XP bar emojis will be added later. When they arrive, add to [emojis.json](src/emojis.json):
```
"bar_xp_begin": "<:purplebegp:..>",
"bar_xp_mid":   "<:purplemdp:..>",
"bar_xp_end":   "<:purpleendp:..>"
```
At that point, re-add the XP bar in Profile (a previous version had it; was removed because no XP palette existed yet).

### Other PLAN status

Phases 0 and 1 are fully landed; PLAN.md's status snapshot (last swept 2026-05-08) is the source of truth. The remaining open tracks are:

- **P2.1 middleware pipeline** for `interactionCreate.ts` (still ~740-line god function).
- **P3.1 Functions.ts split** — 🟡 active. Down from 3,071 → 1,773 lines (−42% so far). Sibling modules under `src/utils/` peeled so far: `lookup.ts` (find* helpers), `quest_guards.ts` (is*Quest type guards), `quest_factories.ts` (generate*Quest + push* helpers; lives next to `random.ts` which now also owns `generateRandomId`), `quest_ui.ts` (quest list V2 row helpers + side quest requirement summaries), `rewards.ts` (reward formulas + total XP), `format.ts` (`localeNumber` / `romanize` / `msToString` / `sleep` / string/date/display helpers / Discord timestamps), `embed.ts` (`fixFields` / `splitEmbedIfExceedsLimit` / embed message helpers), `date.ts`, `item_guards.ts`, and `math.ts`. User-domain helpers and user-data diffing now live in `src/services/UserService.ts`, with Functions.ts aliases for back-compat. Bulk still inside (~1,700 lines). Next obvious peels per PLAN: `domain/items/inventory.ts`, `domain/items/equipment.ts`, `domain/prestige.ts`, `domain/stats/*`.
- **P3.4 fat command files** (`RaidSubcommands.ts` 1,192 lines, `Dungeon.ts` 826).
- **P4.x data hygiene** — type-safe registries, effect-based abilities, bigint field migration, atomic dual-write, transactions table integrity.

### BRAINSTORM live-issue sweeps landed this session

- **Empty `for (const key of Object.keys(this))` loops** — gone (cleaned up during `FightLifecycleHandlers.ts` extract).
- **Misleading `fiveMinTimeout` field name** — renamed to `totalFightTimeout` (15-minute timer; old name was a vestige).
- **`Fighter.npc = isNaN(Number(this.id))` brittle heuristic** — replaced with `Functions.isFighter(data) ? data.npc : !Functions.isRPGUserDataJSON(data)` (uses existing type guards).
- **Dead 2nd-anniversary email check** at `interactionCreate.ts:280-288` (`Date.now() < 1707606000000` permanently false since Feb 2024) — removed.
- **`console.log` debug noise** in `Fighter.removeHealth` (dodge logs), `DungeonHandler` (modifier dump, "deleting message"), `Fight.ts` ("ATTEMTPING TO DELETE", custom-level set) — removed.
- **More noisy logs** in `Functions.getAttackDamages`, `Functions.fixNpcRewards`, `Functions.hasVotedRecenty`, `Heal`, and `Patreon` — removed.
- **`FightRenderer` NPC detection** — no longer uses `isNaN(Number(id))`; it now trusts explicit `fighter.npc` / `manipulatedBy.npc`.
- **Forfeit + resurrection passive conflict** — fixed. `Fighter.flags.forfeited` is set on forfeit and the passive engine skips forfeited fighters even for `evenIfDead` passives, so Dead Revival no longer resurrects someone who gave up.
- **Anti-cheat debug logs** in `CommandInteractionContext` — removed.

### BRAINSTORM live issues still in code (decision-pending or low-impact)

- BRAINSTORM #15 (`FightHandler`) — `Fighter` weapon detection via `equippedItems[id] === equipableItemTypes.WEAPON` (`6`) is implicit. Functional but brittle; would need a data-model change to fix properly.
- BRAINSTORM #18 (`FightHandler`) — `if (this.skillPoints.perception === Infinity)` godmode trigger in `Fighter.removeHealth`. Some upstream code path sets perception to Infinity (likely admin/eval). The dodge log was removed; the guard itself is intentional.
- BRAINSTORM #8 (`FightHandler`) — extra-turn log substring matching (`logs.includes("extra turn")`) is fragile but only currently-canonical log uses that phrase. Refactor to a flag-on-`FightTurn` would be safer.
- BRAINSTORM #17 (`FightHandler`) — `Fighter.removeHealth` `dodgeScore` semantics inverted (every-true means dodged). Counter-intuitive but documented inline.

## Stashes

- `stash@{0}: gemini-wip P1.1 UserService partial extraction (incomplete, inverted dep direction)` — **do not pop blindly**. The approach has UserService importing Functions (it should be the other way). Worth referencing for naming/signatures only.

## Conventions (do not break)

1. **Commit style:** one commit per fix, short imperative phrase (e.g. `Extract fight turn engine`, `Render fight effect thumbnail as section accessory`). No `fix(scope):` prefix, no body, no `Co-Authored-By`.
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
