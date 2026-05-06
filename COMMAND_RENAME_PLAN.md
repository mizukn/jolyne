# Command Rename Plan

Last scanned: 2026-05-07.

This is a planning document only. It does not rename commands yet.

## Goals

- Make command names read like normal player intent.
- Use nouns for places or resources: `inventory`, `shop`, `profile`, `quests`.
- Use verbs for direct actions: `equip`, `unequip`, `sell`, `discard`, `heal`.
- Use `info` for details, rules, and requirements. Avoid `requirements` in command names.
- Avoid stuffing unrelated verbs under a dashboard command. Example: `inventory` should show the bag, not be the home for `throw`, `sell`, and `unequip`.
- Keep old commands for one migration window when possible, replying with a short redirect to the new command.

## Recommended Public Command Surface

### First-run and settings

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/adventure start` | `/start` | Rename/split | This is the onboarding action. It should be direct. |
| `/adventure language` | `/settings language` | Move | Language is a setting, not an adventure action. |
| `/settings view` | `/settings` or `/settings view` | Prefer root-only later | Discord root commands cannot also have subcommands, so keep `/settings view` unless we split settings actions. |
| `/settings notifications` | `/settings notifications` | Keep | Clear enough. |
| `/settings auto-heal sort-by-strongest` | `/settings auto-heal sort` | Rename | Shorter, still exact. |
| `/settings auto-heal exclude-items` | `/settings auto-heal exclusions` | Rename | Reads like the list it edits. |
| `/settings fight` | `/settings fight` | Keep | Clear enough. |

### Quests and story

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/chapter` | `/story` | Rename | Players understand "story progress" faster than "chapter". |
| `/daily claim` | `/daily` | Split | The daily reward is a direct daily action. |
| `/daily quests` | `/quests daily` | Move | Daily quests belong with quest progress. |
| `/side quest view` | `/quests side view` | Move | Groups all quest progress under one command family. |
| `/side quest requirements` | `/quests side info` | Rename/move | Minimum short-term rename can be `/side quest info`; final shape should be `/quests side info`. |
| `/action` | `/quests action` | Move | `action` alone is too vague. This is a quest action. |
| `/campfire rest` | `/rest start` | Rename | Player intent is "rest". Campfire is flavor. |
| `/campfire leave` | `/rest leave` | Rename | Pairs naturally with `/rest start`. |
| `/skill points view` | `/skills view` | Rename | Removes the awkward `skill points` group. |
| `/skill points invest` | `/skills invest` | Rename | Short and predictable. |
| `/prestige` | `/prestige` | Keep | Clear and already a distinct RPG action. |
| `/stand display` | `/stand view` | Rename | `view` is the bot-wide read verb. |
| `/stand delete` | `/stand erase` | Rename | Existing UI text already uses "erase"; less destructive-sounding than delete but still clear. |
| `/stand store` | `/stand store` | Keep | Clear enough. |
| `/stand list` | `/stand list` | Keep | Clear enough. |
| `/stand set-evolution` | `/stand evolve` | Rename | Player intent is "evolve", not "set evolution". |

Recommended quest command family:

| Proposed | Meaning |
| --- | --- |
| `/quests daily` | Daily quest list. |
| `/quests story` | Current story/chapter progress if we decide not to use `/story`. |
| `/quests side view` | Side quest progress. |
| `/quests side info` | Side quest details, requirements, rewards, reset/reload rules. |
| `/quests action` | Complete/select an action quest. |

If we want the shortest possible migration, do this first:

| Current | Short-term rename |
| --- | --- |
| `/side quest requirements` | `/side quest info` |
| `/chapter` | keep until `/story` is ready |
| `/daily quests` | keep until `/quests daily` is ready |

### Inventory and items

This is the biggest cleanup. `inventory` should become view-only, and item actions should move out.

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/inventory view` | `/inventory` | Split | The command name already means "show my inventory". |
| `/inventory info` | `/item info` | Move | Details are about one item, not the whole inventory. |
| `/inventory use` | `/item use` | Move | Consuming an item belongs under `item`. |
| `/inventory equip` | `/equip` | Split | The user thinks "equip sword", not "inventory equip sword". |
| `/inventory unequip` | `/unequip` | Split | Mirrors `/equip`. |
| `/inventory sell` | `/item sell` or `/sell` | Move | Prefer `/item sell` if we keep item actions grouped. |
| `/inventory throw` | `/item discard` | Rename/move | `discard` is clearer and less weird than `throw`. |
| `/inventory claim` | `/item recover` | Rename/move | This claims a discarded item by ID; `recover` describes that better than generic claim. |
| `/items` | remove after redirect | Remove | Deprecated migration command. |

Recommended final item surface:

| Proposed | Meaning |
| --- | --- |
| `/inventory` | Show inventory. |
| `/item info item:<item>` | Show item details. |
| `/item use item:<item> amount:<amount>` | Use consumables/special items. |
| `/item sell item:<item> amount:<amount>` | Sell an item. |
| `/item discard item:<item> amount:<amount>` | Throw away an item. |
| `/item recover id:<id>` | Recover a discarded item. |
| `/equip item:<item>` | Equip gear. |
| `/unequip item:<item>` | Unequip gear. |

### Combat

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/fight npc` | `/fight quest` or `/battle quest` | Rename candidate | It only fights NPCs from active quests, so `quest` is more honest. |
| `/fight train` | `/train` or `/fight train` | Optional split | If training is no-reward practice, `/train` is more intuitive. |
| `/fight custom` | `/fight custom` | Keep | Clear enough. |
| `/assault` | `/hunt` | Rename | `assault` is aggressive and not obvious. `hunt` reads like "find a random matching NPC". |
| `/raid` | `/raid` | Keep | Clear and common game language. |
| `/dungeon` | `/dungeon` | Keep | Clear and common game language. |
| `/npc-info` | `/npc info` | Rename | Groups NPC utilities under `npc`. |

Optional future shape:

| Proposed | Meaning |
| --- | --- |
| `/battle quest` | Fight a quest NPC. |
| `/battle custom` | Custom PvP/team battle. |
| `/train npc` | Friendly NPC fight. |
| `/hunt` | Random level-matched NPC. |
| `/raid` | Boss raid. |
| `/dungeon` | Dungeon run. |

### Economy

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/shop` | `/shop` | Keep | Clear. |
| `/craft` | `/craft` | Keep | Clear. |
| `/loot` | `/loot` | Keep | Clear. |
| `/trade start` | `/trade request` | Rename | Better describes inviting another player. |
| `/trade add` | `/trade add` | Keep | Clear. |
| `/trade remove` | `/trade remove` | Keep | Clear. |
| `/trade view` | `/trade status` | Rename | "Status" reads better for an active trade. |

### Casino

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/blackjack` | `/blackjack` | Keep | Clear. |
| `/slots spin` | `/slots play` or `/slots` | Rename/split | `play` is more normal than `spin`; root `/slots` would require splitting payouts. |
| `/slots chart` | `/slots payouts` or `/slots-chart` | Rename | `payouts` explains what the chart is. |

### Social and general

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/profile` | `/profile` | Keep | Clear. |
| `/heal` | `/heal` | Keep | Clear. |
| `/emails view` | `/mail inbox` | Rename | `mail` is shorter; `inbox` is clearer than view. |
| `/emails archived` | `/mail archived` | Rename | Pairs with inbox. |
| `/leaderboard level` | `/leaderboard level` | Keep | Clear. |
| `/leaderboard coins` | `/leaderboard coins` | Keep | Clear. |
| `/leaderboard items` | `/leaderboard items` | Keep | Clear. |
| `/leaderboard daily` | `/leaderboard streaks` | Rename candidate | It ranks daily streaks, not daily rewards. |
| `/vote` | `/vote` | Keep | Clear. |
| `/patreon` | `/premium` | Rename candidate | Bot UI now says premium more often than Patreon. |
| `/help` | `/help` | Keep | Clear. |
| `/infos` | `/about` | Rename | `infos` is unnatural English. |
| `/weapon` | `/weapon info` or keep `/weapon` | Optional | Current root command is fine if it only views a weapon. |

### Event commands

Event command data is seasonal and currently exported from `src/rpg/Events/2025HalloweenEvent.ts` through `src/commands/adventure/EventSubcommands.ts`.

| Current | Proposed | Decision | Notes |
| --- | --- | --- | --- |
| `/event info` | `/event info` | Keep | Clear. |
| `/event trade` | `/event shop` or `/event trade` | Keep candidate | `trade` is fine, but `shop` may match "exchange currency for items" better. |
| `/event quiz` | `/event quiz` | Keep if active | Mentioned by older events, not in current exported Halloween 2025 data. |
| `/event progress` | `/event progress` | Keep if active | Mentioned by Chinese New Year 2025, not current active export. |
| `/event raid` | `/event raid` | Keep if active | Mentioned in old email/event copy, not current active export. |
| `/event feed` | `/event feed` | Keep if active | Mentioned in old email/side quest copy, not current active export. |

## Admin Command Cleanup

Admin commands should be grouped under `/admin` where possible. Discord supports one subcommand-group level, so use groups like `/admin user set-xp`.

| Current | Proposed | Notes |
| --- | --- | --- |
| `/adminsetxp` | `/admin user set-xp` | User moderation/stat mutation. |
| `/adminsetlevel` | `/admin user set-level` | User moderation/stat mutation. |
| `/adminsetprestige` | `/admin user set-prestige` | User moderation/stat mutation. |
| `/giveitem` | `/admin item give` | Item mutation. |
| `/itemuseadmin` | `/admin item use` | Item mutation. |
| `/setpatron` | `/admin patron set` | Patreon mutation. |
| `/viewpatron` | `/admin patron view` | Patreon lookup. |
| `/importpatronstocache` | `/admin patron import-cache` | Cache action. |
| `/exportpatronsfromcache` | `/admin patron export-cache` | Cache action. |
| `/communityban` | `/admin community-ban add` | Moderation. |
| `/communitybanremove` | `/admin community-ban remove` | Moderation. |
| `/endfight` | `/admin fight end` | Fight control. |
| `/djstart` | `/admin dungeon start` | Dungeon control. |
| `/generate-npc` | `/admin npc generate` | NPC tool. |
| `/validatechapter` | `/admin chapter validate` | Story tool. |
| `/prestigesimulate` | `/admin prestige simulate` | Simulation tool. |
| `/restorestreak` | `/admin streak restore` | User support tool. |
| `/bumpstand` | `/admin stand give` | Stand mutation. |
| `/blackjack-old` | remove or `/admin casino blackjack-old` | Looks deprecated. |
| `/test` | `/admin test` | Keep private. |
| `/eval` | `/admin eval` | Keep private and permission-gated. |

## Mention Reference Scan

The command mention helper is `ctx.client.getSlashCommandMention(...)`, defined in `src/structures/JolyneClient.ts:212`.

Important behavior: it resolves only the top-level command and first option name. If a command is renamed, every string literal below must be updated or passed through a compatibility map. It also currently formats a third path part without validating that the subcommand actually exists.

### Literal helper references

| Mention literal | Files |
| --- | --- |
| `action` | `src/commands/adventure/Chapter.ts:275` |
| `campfire leave` | `src/commands/adventure/CampfireSubcommands.ts:75`, `src/commands/adventure/CampfireSubcommands.ts:94`, `src/events/interactionCreate.ts:213` |
| `campfire rest` | `src/commands/adventure/CampfireSubcommands.ts:106`, `src/events/interactionCreate.ts:246` |
| `chapter` | `src/commands/combat/Fight.ts:421`, `src/commands/combat/Fight.ts:431` |
| `craft` | `src/rpg/Emails.ts:219`, `src/rpg/Events/2024ChristmasEvent.ts`, `src/rpg/Events/2025ChineseNewYear.ts:42`, `src/rpg/Events/2025WinterEvent.ts:26` |
| `daily claim` | `src/commands/adventure/Chapter.ts:181`, `src/rpg/Emails.ts:211`, `src/rpg/Events/2024ChristmasEvent.ts` |
| `daily quests` | `src/commands/combat/Fight.ts:419`, `src/commands/combat/Fight.ts:429`, `src/events/interactionCreate.ts:634` |
| `dungeon` | `src/commands/adventure/Chapter.ts:352`, `src/commands/social/Inventory.ts:856`, `src/rpg/Emails.ts:295` |
| `email view` | `src/commands/adventure/EventSubcommands.ts:106` |
| `emails view` | `src/commands/adventure/Chapter.ts:293`, `src/events/interactionCreate.ts:267` |
| `event feed` | `src/rpg/Emails.ts:217`, `src/rpg/SideQuests.ts:304` |
| `event info` | `src/rpg/Emails.ts:157` |
| `event progress` | `src/rpg/Events/2025ChineseNewYear.ts:52` |
| `event quiz` | `src/commands/adventure/Chapter.ts:410`, `src/rpg/Events/2025ChineseNewYear.ts:31` |
| `event raid` | `src/rpg/Emails.ts:223` |
| `event trade` | `src/rpg/Events/2024ChristmasEvent.ts`, `src/rpg/Events/2024HalloweenEvent.ts`, `src/rpg/Events/2025ChineseNewYear.ts`, `src/rpg/Events/2025HalloweenEvent.ts`, `src/rpg/Events/4thAnniversaryEvent.ts`, `src/rpg/SideQuests.ts` |
| `fight npc` | `src/commands/adventure/Chapter.ts:217`, `src/commands/adventure/Chapter.ts:224`, `src/rpg/Chapters/Chapters.ts:100` |
| `fight train` | `src/commands/combat/Fight.ts:315` |
| `heal` | `src/commands/combat/Assault.ts:48`, `src/commands/combat/Fight.ts:256`, `src/commands/combat/RaidSubcommands.ts:521`, `src/commands/social/Settings.ts:284`, `src/events/interactionCreate.ts:242` |
| `help` | `src/commands/general/HelpSubcommands.ts:128` |
| `inventory claim` | `src/commands/admin/ItemsMigration.ts:28`, `src/commands/social/Inventory.ts:711` |
| `inventory equip` | `src/commands/admin/AdminItemUse.ts:116`, `src/commands/admin/ItemsMigration.ts:20`, `src/commands/social/Inventory.ts:533`, `src/rpg/SideQuests.ts:514` |
| `inventory info` | `src/commands/admin/ItemsMigration.ts:24`, `src/commands/social/Inventory.ts:474` |
| `inventory sell` | `src/commands/admin/ItemsMigration.ts:18` |
| `inventory throw` | `src/commands/admin/ItemsMigration.ts:26`, `src/commands/social/Inventory.ts:844` |
| `inventory unequip` | `src/commands/admin/ItemsMigration.ts:22` |
| `inventory use` | `src/commands/admin/ItemsMigration.ts:16`, `src/commands/combat/Assault.ts:50`, `src/commands/combat/Fight.ts:258`, `src/commands/combat/RaidSubcommands.ts:523`, `src/commands/social/Heal.ts:280`, `src/rpg/SideQuests.ts` |
| `patreon` | `src/commands/general/Infos.ts:200` |
| `prestige` | `src/events/interactionCreate.ts:608` |
| `raid` | `src/commands/adventure/Chapter.ts:331`, `src/rpg/Events/2024ChristmasEvent.ts`, `src/rpg/Events/2024HalloweenEvent.ts`, `src/rpg/Events/2025ChineseNewYear.ts`, `src/rpg/Events/2025HalloweenEvent.ts`, `src/rpg/Events/2025WinterEvent.ts`, `src/rpg/Events/3rdYearAnniversaryEvent.ts`, `src/rpg/SideQuests.ts:852` |
| `settings auto-heal exclude-items` | `src/commands/social/Settings.ts:283` |
| `settings auto-heal sort-by-strongest` | `src/commands/social/Settings.ts:280` |
| `settings fight` | `src/commands/social/Settings.ts:287` |
| `settings notifications` | `src/commands/social/Settings.ts:277`, `src/events/interactionCreate.ts:564` |
| `shop` | `src/commands/combat/Assault.ts:52`, `src/commands/combat/Fight.ts:260`, `src/commands/combat/RaidSubcommands.ts:525`, `src/commands/social/Heal.ts:206`, `src/events/interactionCreate.ts:244`, `src/events/interactionCreate.ts:562`, `src/rpg/Chapters/ChapterParts.ts:52` |
| `side quest view` | `src/commands/adventure/EventSubcommands.ts:108`, `src/commands/combat/Fight.ts:423`, `src/commands/combat/Fight.ts:434`, `src/events/interactionCreate.ts:393`, `src/rpg/Chapters/Chapters.ts:97`, `src/rpg/Emails.ts:213`, `src/rpg/Events/*`, `src/rpg/SideQuests.ts:119`, `src/rpg/SideQuests.ts:775` |
| `skill points invest` | `src/events/interactionCreate.ts:150`, `src/events/interactionCreate.ts:582`, `src/rpg/Items/SpecialItems.ts:822` |
| `stand delete` | `src/commands/adventure/StandSubcommands.ts:378`, `src/index.ts:475` |
| `stand store` | `src/index.ts:477` |
| `trade add` | `src/commands/economy/Trade.ts:140` |
| `trade remove` | `src/commands/economy/Trade.ts:142` |
| `vote` | `src/commands/combat/Fight.ts:267`, `src/rpg/Emails.ts:191`, `src/rpg/Emails.ts:297` |

### Dynamic helper references

These cannot be updated safely with search-and-replace alone:

| Location | Argument |
| --- | --- |
| `src/commands/adventure/Chapter.ts:159` | `quest.command` |
| `src/commands/adventure/Chapter.ts:255` | `originalQuest.hintCommand` |
| `src/commands/general/HelpSubcommands.ts:54` | `cmd.name` |
| `src/commands/general/HelpSubcommands.ts:114` | `cmd.name` |
| `src/commands/social/Leaderboard.ts:225` | `` `leaderboard ${subcommand}` `` |
| `src/commands/social/Vote.ts:131` | `x` |

Quest data references to update:

| Location | Current value |
| --- | --- |
| `src/rpg/Quests/Quests.ts:15` | `hintCommand: "inventory use"` |
| `src/rpg/Quests/Quests.ts:26` | `hintCommand: "skill points invest"` |
| `src/rpg/Quests/Quests.ts:42` | `hintCommand: "side quest view"` |

### Hardcoded slash text outside the helper

These do not use `getSlashCommandMention`, so they need manual updates:

| Pattern | Files |
| --- | --- |
| `/stand delete`, `/stand store` | `i18n/*/items.json` |
| `/skill-points` | `i18n/pt-PT/base.json`, `i18n/ja-JP/base.json` |
| `/raid` | `src/rpg/SideQuests.ts:541`, `src/rpg/SideQuests.ts:844` |
| `/daily claim` | `src/rpg/Chapters/ChapterParts.ts:464` |
| `/fight npc` | `src/commands/combat/Fight.ts:761` |
| `/chapter` | `src/commands/adventure/StandSubcommands.ts:399` |
| `/event quiz` | `src/rpg/Events/4thAnniversaryEvent.ts:33`, `src/rpg/Events/4thAnniversaryEvent.ts:45` |
| `/inventory claim` | `src/commands/social/Inventory.ts:149` |

## Migration Plan

1. Add a command alias/redirect map first.
   - Example: `inventory throw -> item discard`, `side quest requirements -> quests side info`.
   - Use it in `getSlashCommandMention` so old internal strings still resolve during migration.

2. Rename the lowest-risk commands first.
   - `/side quest requirements` -> `/side quest info` or `/quests side info`.
   - `/infos` -> `/about`.
   - `/emails view` -> `/mail inbox`.
   - `/emails archived` -> `/mail archived`.

3. Split inventory into the new item surface.
   - Keep old `/inventory *` subcommands temporarily with redirect messages.
   - Update all helper mentions and quest hint commands in the same change.

4. Move quest commands into the final quest surface.
   - Update chapter, side quest, daily quest, fight completion, event, and email references together.

5. Clean up combat/economy/social naming.
   - Do this after inventory and quests because fewer files reference these commands.

6. Group admin commands under `/admin`.
   - This can be separate from the public player migration.

7. Remove deprecated commands after the migration window.
   - Remove `/items`.
   - Remove old `/inventory *` redirects.
   - Remove old `/side quest requirements` redirect.

## Implementation Notes

- Every rename needs updates in command definitions, command execution branches, autocomplete branches, `getSlashCommandMention` callers, i18n hardcoded slash text, quest `hintCommand` values, and event copy.
- Because Discord command IDs change when commands are recreated, text generated by `getSlashCommandMention` should be verified after deployment.
- `getSlashCommandMention("email view")` is currently suspicious because the registered command is `emails`, not `email`.
- Seasonal event modules define command shapes outside `src/commands/adventure/EventSubcommands.ts`; rename work should scan `src/rpg/Events/*` every time an event command is swapped.
