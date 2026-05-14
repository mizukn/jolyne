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

### V2 components migration (done)

Done: Profile, Help, Inventory, Daily, Settings, Trade, Emails, Side Quest, Chapter, Prestige, Leaderboard, Blackjack, Shop, Skills, Fight UI, Vote, Heal, Stand, Adventure, Dungeon, plus the new `/guide` paginated command. Helpers in `src/utils/containers.ts` and `src/utils/emojiBar.ts`. Style guide lives in `README_V2_UI.md`.

Bar emoji palette in `emojis.json`: `bar_hp_*` = red (`r*`), `bar_sta_*` = green (`g*`), `bar_def_*` = blue (`blue*`), `bar_empty_*` = black/basic (`b*`). XP palette (purple) is still not uploaded — `bar_xp_*` keys are not defined; `emojiBar("xp", ...)` renders Unicode placeholders until added.

### Restructure (one big commit, intentional)

`refactor: reorganize commands into domain folders` (`0c702e3`). Old `commands/{private,rpg,utils}` → new `commands/{admin,adventure,casino,combat,economy,general,social}`. Type union and command loader updated to walk the new tree recursively.

## What's NOT done / in-flight

### FightHandler split (PLAN §5 P3.2) — orchestrator at 264 lines

Was 2,820. Down to 264 (−91%). The body now lives in sibling modules under `src/structures/`:

| Module | Role |
| --- | --- |
| `Fighter.ts` | Fighter class + `FighterRemoveHealthTypes` + `FighterAttackStaminaCost` |
| `FightTypes.ts` | `FightTypes`, `FightTypeColor`, `FightInfos`, `FightTurn`, `FightEndMeta`, `FightEvents` (no runtime deps on FightHandler) |
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
| `FightMessageAccess.ts` | Detects Discord message-access failures and maintenance mode, then fast-forwards the fight in autoplay mode until an outcome exists. |
| `FightWebhookLogs.ts` | `sendFightLogs(fight)` + `sendFightStats(fight)` — bodies of the former `sendLogs` / `sendFightStats` (the latter is still callable via the FightHandler delegator since `FightHandlerWatchdog` invokes it externally) |
| `FightInteraction.ts` | `handleInteraction(fight, interaction)` — body of the former constructor-internal `listenerCallback` (the button + string-select-menu dispatch switch) |
| `FightLifecycleHandlers.ts` | `attachLifecycleHandlers(fight, fightEndCallback, fightCallFuncCallback)` — bodies of the former constructor-internal `on('unexpectedEnd')` / `on('end')` handlers |
| `FightSetup.ts` | `initializeFight(fight, type, messageX)` (cluster-event registration + message-init dispatch) + `runFightSetup(fight, type, fightEndCallback, fightCallFuncCallback)` (fighter sort, channel concurrency check, total-fight timeout, `infos` / `turns` seed, listener creation, lifecycle handler attach, fight-start webhook, listener `collect` wiring, cooldown init, initial `updateMessage`) — bodies of the former constructor `Finally()` IIFE |
| `FightActions.ts` | `handleDefend(fight)` + `handleSkip(fight)` + `continueStep(fight)` — bodies of the former turn-action handlers and the post-target-pick `currentStep` router |
| `FightTurnQueue.ts` | `getWhosTurn(fight)` + `getWhosTurnAvailableAbilities(fight)` + `getWhosTurnAvailableAbilitiesWeapon(fight)` — bodies of the former `whosTurn` / `whosTurnAvailableAbilities` / `whosTurnAvailableAbilitiesWeapon` getters |

`FightHandler.ts` is now a thin orchestrator: constructor state seeding + a single `initializeFight` call, one-line delegators into the modules above, the small `availableFighters` / `hasStoppedTime` / `hasOneTarget` getters, and the 10-line `addOrEditCooldown` mutator.

**Still inline in FightHandler**:
- The 10 field-default lines + `initializeFight(this, type, messageX)` in the constructor.
- `addOrEditCooldown(id, move, cooldown)` — 10-line `this.infos.cooldowns` mutator. Three external callers (FightSetup, FightDamage). No clear destination module — keeping inline.
- The small getters: `availableFighters` (3 lines), `hasStoppedTime` (3 lines), `hasOneTarget` (10-line getAvailableTargets delegator).
- One-line delegators into all the extract modules.

**Members promoted to public for cross-module orchestration** (visibility only, no external callers): `currentStep`, `currentStepAbility`, `selectTarget`, `selectStandAbility`, `handleDefend`, `handleSkip`, `handlePassives`, `oneTeamLeft`, `hasStoppedTime`, `checkNewRound`, `timeout`, `isAttacking`, `noUpdateMessage`, `endedByMessageAccessLoss`, `endedByMaintenance`, `messageAccessAutoplaying`, `fastForwardingToEnd`, `maintenanceMonitor`, `NPCTimeout`, `NPCAttack`, `listener`. Same convention every extract follows: take `fight: FightHandler` and read/write through `fight.*`.

**Method removed entirely:** the `handleUseAbility` private delegator was deleted — its only callers (`continueStep`'s `"handleUseAbility"` case) now invoke `applyAbility(fight, ...)` directly from `FightActions.ts`, so the method had no remaining purpose.

### Fight fast-forward policy

If Discord rejects fight message edits/sends with missing access, missing permissions, or unknown-message errors, `FightMessageAccess.startMessageAccessAutoplay(fight, error)` takes over instead of emitting a generic unexpected end. If `client.maintenanceReason` becomes truthy during an active fight, `FightSetup`'s maintenance monitor calls `FightMessageAccess.startMaintenanceAutoplay(fight)` within `FIGHT_MAINTENANCE_CHECK_MS` (currently 1s). Both paths:

- set `fight.noUpdateMessage` and `fight.fastForwardingToEnd`;
- set either `fight.endedByMessageAccessLoss` or `fight.endedByMaintenance`;
- stops the interaction collector and clears pending turn/NPC timers;
- marks every fighter as NPC-controlled with `autoLock = true`;
- fast-forwards turns with `fight.NPCAttack()` until one team remains;
- emits `end` with `FightEndMeta`: `{ endedByMessageAccessLoss?: true, endedByMaintenance?: true, fastForwardedTurns }`;
- force-resolves via `forceLastTeamStanding` after a 300-turn safety cap.

Command handlers should prefer the metadata flags over parsing error strings. Dungeon already consumes them: if a dungeon sub-fight finishes through message-access autoplay, `DungeonHandler` stops the dungeon and lets `/dungeon` apply the current policy (earned rewards, host key consumed, dungeon attempt/cooldown recorded). If a dungeon sub-fight finishes through maintenance autoplay, `DungeonHandler` stops the dungeon with reason `"maintenance"` so `/dungeon` can finalize current rewards without starting another room. Other unexpected dungeon ends still grant earned rewards and refund the key.

### Fight V2 migration follow-ups

- **`infos.thumbnail`** — done. Renders as a `ThumbnailBuilder` accessory on a dedicated section in `FightRenderer.renderTurn`.
- **V2 message-transition audit** — mostly done. `FightSetup` now uses `FightRenderer.renderInitializingFight()`, `/fight quest` edits any provided `messageX` into a V2 placeholder before handing it to `FightHandler`, and `DungeonHandler` no longer passes its dungeon-progress message as the fight message. Remaining live-test path: click through raid/event/matchmaking starts and verify no duplicate fallback fight message appears. Message-access loss now fast-forwards the fight rather than trying to keep rendering.
- **April Fools `randomGifs`** — gone in the V2 migration and staying gone. User decided the body-image gifs were ugly; we're not restoring them.
- **Ephemeral deprecation warnings** — done. `CommandInteractionContext.makeMessage/followUp` and queued followups normalize `ephemeral` to `MessageFlags.Ephemeral`; `ephemeralV2(reply)` in `src/utils/containers.ts` is the shared helper for ephemeral V2 container replies (bitwise-OR'd with the `IsComponentsV2` flag); the last three direct `ephemeral: true` literals in `EmailsSubcommands` and `Inventory` were converted, and three buggy `flags: MessageFlags.Ephemeral`-after-spread sites in `Inventory` (community-ban / "stop trying to find glitches" guards) were fixed to preserve the V2 flag.

### XP emoji bar (purple) — done

Purple XP bar emojis are in [src/emojis.json](src/emojis.json) under `bar_xp_begin` / `bar_xp_mid` / `bar_xp_end`. Profile already calls `emojiBar("xp", rpgData.xp, Functions.getMaxXp(rpgData.level))` at [Profile.ts:266-270](src/commands/social/Profile.ts#L266-L270); the Unicode `▱` fallback that was rendering before the upload now resolves to the custom emojis automatically on next deploy.

### Other PLAN status

Phases 0 and 1 are fully landed; PLAN.md's status snapshot (last swept 2026-05-14) is the source of truth. The remaining open tracks are:

- **P2.1 middleware pipeline** — ✅ done. `interactionCreate.ts` is 91 lines (down from ~740), running a clean middleware chain. 22 middleware files live under `src/middlewares/` + a `pipeline.ts` runner + a `types.ts` for `Middleware` / `MiddlewareDecision` / `MiddlewareInput`. Sibling helpers: `handleAutocomplete.ts`, `logCommandUsage.ts`, `runCommand.ts`. `middlewares.test.ts` covers 54 cases.
- **P3.1 Functions.ts split** — 🟡 active. Down from 3,071 → 670 lines (−78% so far). Sibling modules under `src/utils/` now: `lookup.ts`, `quest_guards.ts`, `quest_factories.ts` (also owns `generateDailyQuests` + `getDailyQuestRowRewards`), `quest_ui.ts`, `rewards.ts`, `format.ts`, `embed.ts`, `date.ts`, `item_guards.ts`, `math.ts`, `random.ts`, `images.ts` (stand-card canvas + dominant-color), `stand.ts` (stand helpers + random pickers), `npc.ts` (NPC level/reward scaling), `discord.ts` (`actionRow`), and `ability_embeds.ts` (`buildStandAbilityView` / `buildWeaponAbilityView` / `standAbilitiesContainer` / `weaponAbilitiesContainer` — V2-container ability lookups). User-domain helpers, combat stat/power math, prestige, skill-point generation, user-data diffing, and reward-diff formatting live in `src/services/UserService.ts`; `InventoryService.ts` owns inventory add/remove/type checks, stand-disc limits, consumable application, and Patreon item rewards. The remaining Functions.ts content is mostly aliasing re-exports plus the `dailyClaimRewardsChristmas` archive block (kept intentionally — useful for 2026+ seasonal reuse). `standPrices.T = 69696` is now consistent between `Functions.ts` (used by `/stand store`) and `StandDiscFactory.ts` (price stamped on the disc Item).
- **DatabaseHandler split** — ✅ `DatabaseHandler.ts` is 555 lines (down from 907) after extracting rollback/fixup scripts (`fixRaidTransactions`, `rollbackDailyClaim`, `rollbackTransaction`) to `src/services/TransactionRollbackService.ts` and deleting the dead `migrateData` archive block (the V2→V3 migration, which also carried the last hardcoded dev id `239739781238620160` in active code). The `V2UserData` interface in `src/@types/index.ts` and the commented `// client.database.migrateData();` caller in `src/events/clientReady.ts` were removed at the same time. DatabaseHandler is no longer in the "giants" set; it stays in `src/structures/` as an infra client per `RESTRUCTURE_PROPOSAL.md`.
- **P3.4 fat command files** — 🟡 `RaidSubcommands.ts` is 297 lines after extracting result/cooldown/reward handling to `src/commands/combat/raid_results.ts`, lobby rendering to `src/commands/combat/raid_menu.ts`, and join/leave/ban/start flow to `src/commands/combat/raid_lobby.ts`; `Dungeon.ts` is 151 lines after extracting config, rewards, lifecycle helpers, lobby rendering, and collector flow to sibling files. Existing extracts: `src/rpg/SeasonalRaids.ts`, `src/commands/combat/dungeon_config.ts`, `src/commands/combat/dungeon_rewards.ts`, `src/commands/combat/dungeon_lifecycle.ts`, `src/commands/combat/dungeon_lobby.ts`, and `src/commands/combat/dungeon_flow.ts`. `clientReady.ts` is 452 lines after extracting `/help` command-list flattening to `src/events/clientReadyCommands.ts`. Next: move to the remaining giant (`DatabaseHandler.ts`) or only revisit command files when they grow again.
- **P4.x data hygiene** — P4.1 type-safe registries is effectively done via `src/bootstrap/validate.ts`: duplicate-id + cross-reference checks now cover Items / Stands / NPCs / Emails / Quests / `pushEmailWhenCompleted`, plus per-effect parameter validation for every ability and passive (rejects typos like `type: "dotz"` and bad param values at boot). Smoke-tested by `validate.test.ts`. P4.2 (effect-based abilities + passives) is now 🟡 partial: see `ABILITIES.md` for the full handoff. 11 abilities migrated across 3 effect types (`bleed`, `poison`, `freeze`); 5 passives migrated across 2 effect types (`regen`, `on_hit_stack`). The bespoke remainder (TheWorld, Manipulation, OhMyGod, BulletsRafale, Rage, KnivesThrow, Darkness, Alter, Resurrection, plus the AoE / cross-ability-scaling / stat-snapshot patterns) stays as `useMessage` / `promise` per the "if it needs more than a clean declarative effect list, leave it as callback" rule. P4.4 (bigint columns) now has an **interim fix in place**: `src/bootstrap/pgTypes.ts` registers a global `int8 → Number` parser for node-postgres, so `restingAtCampfire` / `lastPatreonReward` / `adventureStartedAt` read as numbers natively. Once the rework is done, those columns should be migrated to `timestamptz` and read as `Date` objects directly — tracked in PLAN.md P4.4. P4.5 (atomic dual-write) is intentional design and not a real defect: the writer runs Postgres-then-Redis, so a Postgres outage leaves Redis intact and serves reads from cache without downtime; a Postgres-success-then-Redis-failure leaves one stale revision until the next save catches it up. P4.6 (`transactions` table integrity) was misdiagnosed: the `TransactionTableQuery` constant declared `jsonb[]` but was never executed; the production column is plain `jsonb`, the writer/reader round-trip already matches, and the dead constant has been deleted along with the broken `GangMemberSQLQuery` and the dead `params<T>` test.

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
- **Fight message-access loss** — no longer throws or force-ends immediately. If Discord refuses message edits/sends, fights enter autoplay fast-forward and emit `end` with `meta.endedByMessageAccessLoss`.
- **Fight maintenance mode** — active fights now enter autoplay fast-forward within 1s of `client.maintenanceReason` being set and emit `end` with `meta.endedByMaintenance`.
- **Dungeon message-access economy policy** — if message access is lost during a dungeon after progress, earned rewards are granted, the host key is consumed, and dungeon attempt/cooldown is recorded; other unexpected ends refund the key while still granting earned rewards.
- **`ephemeralV2` shared helper** — `src/utils/containers.ts` now exports `ephemeralV2(reply)` which OR's `MessageFlags.Ephemeral` into the V2 reply's existing `flags`. Three latent bugs in `Inventory.ts` (community-ban and "stop trying to find glitches" guards) were stripping the `IsComponentsV2` flag via spread-override and are now fixed; the local copy of the helper in `Slots.ts` was deleted.

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
