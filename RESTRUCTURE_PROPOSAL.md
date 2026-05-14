# Plan de Restructuration de `src/`

> Document de planification — **rien à exécuter en l'état**. Lire en parallèle de [`PLAN.md`](PLAN.md) (qui définit la roadmap par phases) et [`STATE.md`](STATE.md) (qui décrit l'état courant et les conventions).

## 0. Pourquoi

Trois irritants concrets motivent une restructuration :

1. **Sous-modules pénibles.** `src/structures` et `src/scripts` sont des dépôts Git séparés. Toute modification implique deux commits (sous-module → bump du pointeur parent). Erreurs fréquentes, friction permanente.
2. **Casing incohérent.** Mélange `Chapters/`, `Items/`, `chapters.ts`, `items.ts`. Pas de règle suivie.
3. **`structures/` encore trop large.** Le dossier contient à la fois :
   - des **types/interfaces purs** (modélisation),
   - des **classes de logique métier** (`FightHandler`, `DungeonHandler`, `DatabaseHandler`),
   - des **clients** (`JolyneClient`, `MediaHost`).
   La frontière est déjà beaucoup plus nette qu'avant (`FightHandler.ts` est devenu un orchestrateur fin), mais elle reste fragile : les prochains ajouts doivent aller dans les modules/domain services existants, pas regonfler les vieux fichiers.

Ce document propose une cible. Il ne remplace **pas** les phases 2 et 3 de `PLAN.md` (extraction de `CombatService`, `FightRenderer`, etc.) ; il les **complète** en réglant la question de l'arborescence.

## 1. Risques à connaître avant de commencer

- **Perte d'historique Git** si on absorbe les sous-modules sans précaution. `git rm --cached` + `git add` n'importe **pas** l'historique du sous-module ; tous les anciens commits de `src/structures` deviennent invisibles depuis le dépôt parent. Pour préserver l'historique, il faut passer par `git subtree merge --squash` ou `git filter-repo`.
- **Renames "case-only" cassés sur macOS/Windows.** Renommer `Chapters/` → `chapters/` est un no-op sur un système de fichiers insensible à la casse. Il faut faire `Chapters → _tmp_chapters → chapters` en deux commits, ou activer `core.ignorecase=false`.
- **Sweep d'imports massif.** Renommer un dossier ou fichier casse chaque `import` qui le référence. Sur ce dépôt, ça touche couramment ~50–150 sites par renommage. Prévoir `tsc --noEmit -p tsconfig.json` à chaque étape.
- **PRs/branches en cours bloquées.** Toute branche en revue qui touche `src/structures` aura un conflit majeur après absorption. Coordonner avec l'équipe avant de lancer.
- **Conflit avec les conventions actuelles.** [`STATE.md`](STATE.md) indique explicitement que `src/scripts` est hors scope (changements interdits). À aligner avec l'utilisateur avant de toucher ce sous-module.
- **Conflit avec `PLAN.md` Principe 2.** « No new code in `Functions.ts`, `FightHandler.ts`, `interactionCreate.ts`, or `index.ts`. » Renommer `FightHandler.ts` en `services/FightHandler.ts` ne fait rien gagner ; c'est l'**extraction** des couches pures qui compte (P2.4 / P3.2).

## 2. Absorption des sous-modules

### Procédure correcte (perd l'historique)

```bash
# 1. Désenregistrer le sous-module (nettoie .git/config et .git/modules)
git submodule deinit -f src/structures
git submodule deinit -f src/scripts

# 2. Retirer du cache Git ET du working tree (force pour outrepasser le check)
git rm -f src/structures
git rm -f src/scripts

# 3. Nettoyer les métadonnées résiduelles
rm -rf .git/modules/src/structures
rm -rf .git/modules/src/scripts

# 4. Ré-importer les fichiers en tant que dossiers normaux
#    (les fichiers existent encore physiquement sur disque après git rm -f
#    s'ils n'étaient pas trackés par le sous-module ; sinon il faut les
#    sortir d'une copie de sauvegarde)
git add src/structures src/scripts

# 5. Si .gitmodules ne référence plus rien, le supprimer
git rm .gitmodules  # ou éditer si d'autres entrées subsistent

git commit -m "Absorb structures and scripts submodules"
```

### Procédure préservant l'historique (recommandée si on tient à la traçabilité)

`git subtree` réécrit les commits du sous-module dans le dépôt parent, en préfixant les chemins. L'historique reste accessible via `git log -- src/structures/`.

```bash
# Avant : noter le SHA actuel des sous-modules
git -C src/structures rev-parse HEAD  # ex: abc1234
git -C src/scripts rev-parse HEAD     # ex: def5678

# 1. Retirer les sous-modules comme ci-dessus (sections 1–3)
git submodule deinit -f src/structures
git submodule deinit -f src/scripts
git rm -f src/structures src/scripts
rm -rf .git/modules/src/structures .git/modules/src/scripts

# 2. Importer chaque sous-module via subtree depuis son URL distante
git subtree add --prefix=src/structures <URL-du-sous-module> abc1234 --squash
git subtree add --prefix=src/scripts    <URL-du-sous-module> def5678 --squash

git commit -m "Absorb structures and scripts submodules with history"
```

> **Note :** `--squash` réduit l'historique du sous-module à un seul commit dans le parent. Sans `--squash`, on importe l'historique complet, ce qui peut alourdir la revue mais reste utilisable.

## 3. Cible d'arborescence

Plutôt qu'un grand renommage, **piloter par les extractions** prévues dans `PLAN.md`. À chaque extraction (P2.x, P3.x), placer le nouveau code à sa place définitive ; laisser les fichiers existants où ils sont jusqu'à ce qu'ils rétrécissent assez pour bouger sans douleur.

```text
src/
├── Cluster.ts                    # (entrypoint cluster manager — laisser à la racine)
├── index.ts                      # (entrypoint worker — devient un thin shell après P2.6)
├── @types/index.ts               # (à éclater plus tard, P5)
│
├── assets/                       # (optionnel) ressources statiques non-data
│   └── emojis.json
│
# Pas de data/ par défaut pour l'instant.
# Les anciens NPCs.json / prestigeNPCs.json sont des artefacts legacy :
# ils doivent disparaître après migration des derniers lecteurs, pas être
# déplacés vers un nouveau dossier "data" comme si c'était une cible stable.

├── bootstrap/                    # déjà OK
│   └── validate.ts
│
├── config/                       # déjà OK
│   └── gameplay.ts
│
├── commands/{admin,adventure,casino,combat,economy,general,social}/
│                                 # (déjà OK depuis 0c702e3)
│                                 # les grosses commandes peuvent avoir des siblings
│                                 # métier locaux : dungeon_*.ts, raid_*.ts, etc.
│
├── events/                       # handlers Discord — pas un domaine "rpg/Events"
│
├── rpg/                          # données pures du jeu (registres, pas de logique d'orchestration)
│   ├── Chapters/                 # (laisser le casing actuel ; rename = sweep d'imports)
│   ├── Events/                   # idem
│   ├── Items/
│   ├── NPCs/
│   ├── Quests/
│   └── Stands/
│
├── services/                     # logique métier extraite (sources de vérité)
│   ├── DatabaseMaintenanceService.ts # ✅ scripts de maintenance DB/runtime
│   ├── DeprecatedCommandService.ts   # ✅ redirections slash-command deprecated
│   ├── EventService.ts           # ✅ existe
│   ├── EventNPCGenerator.ts      # ✅ génération déterministe des NPCs event/index
│   ├── FightRenderer.ts          # ✅ existe (rendu Discord/V2 + logs webhook)
│   ├── InventoryService.ts       # ✅ domaine inventory
│   ├── SkillPointBuildService.ts # ✅ builds skill points
│   ├── TradeService.ts           # ✅ domaine trade ; durcissement TOCTOU à finir
│   ├── TransactionRollbackService.ts # 🟡 si gardé : scripts rollback hors DatabaseHandler
│   ├── UserService.ts            # ✅ domaine user/progression
│   └── CombatService/            # ⏳ seulement si une vraie frontière apparaît ;
│                                 # aujourd'hui le combat est dans Fight*.ts
│
├── structures/                   # clients + orchestrateurs Discord/stateful
│   ├── JolyneClient.ts           # client Discord — reste ici
│   ├── CommandInteractionContext.ts
│   ├── DatabaseHandler.ts        # client Postgres+Redis — reste ici (pas un "service métier")
│   ├── FightHandler.ts           # orchestrateur Discord thin (~260 lignes), délègue aux Fight*.ts
│   ├── FightTypes.ts             # types combat partagés
│   ├── FightSetup.ts             # construction/initialisation d'un combat
│   ├── FightActions.ts           # actions utilisateur/ability/weapon
│   ├── FightDamage.ts            # application dégâts/soins
│   ├── FightPassives.ts          # dispatch passifs
│   ├── FightTurnEngine.ts        # moteur tour/round
│   ├── FightLifecycle.ts         # update/end lifecycle
│   ├── DungeonHandler.ts         # idem
│   ├── FightMessageAccess.ts     # autoplay/fast-forward quand Discord refuse edit/send
│   ├── MediaHost.ts
│   ├── i18n.ts
│   └── Fighter.ts                # ✅ extrait de FightHandler.ts
│
├── scripts/                      # outils CLI hors-runtime (à n'absorber QUE si l'utilisateur le valide)
│
└── utils/                        # helpers purs sans dépendance Discord
    ├── random.ts
    ├── logger.ts
    ├── emojiBar.ts
    ├── containers.ts
    ├── webhooks.ts
    └── ...
```

### Différences clés avec la proposition d'origine

- **`FightHandler.ts` reste dans `structures/`.** Le déplacer dans `services/` ne ferait que changer son chemin. Ce qui comptait était d'**extraire** la logique pure (`Damage`, `Passive`, `Turn`, `Render`) : c'est maintenant largement fait, avec `FightHandler.ts` à ~260 lignes et les modules `Fight*.ts` autour. `FightMessageAccess.ts` porte le comportement de secours quand Discord refuse les edits/sends : autoplay rapide, puis `end` avec metadata. Prochain objectif : continuer à stabiliser ces modules et éviter d'y remettre de la logique de rendu.
- **`DatabaseHandler.ts` reste dans `structures/`.** C'est un **client** d'infra (Postgres+Redis), pas un service métier. Le mettre dans `services/` brouillerait la frontière.
- **`data/` n'est pas une destination pour les vieux JSON.** `NPCs.json` et `prestigeNPCs.json` existent encore comme dette de compatibilité, mais P1.7 a déjà arrêté l'écriture runtime. La cible propre est : lecteurs migrés vers registres/factories déterministes, puis suppression des JSON legacy. Si un dossier `data/` existe un jour, il doit contenir des sources versionnées stables, jamais des caches ou snapshots générés.
- **Pas de renames "case-only" sur `rpg/Chapters/` → `rpg/chapters/`.** Le coût (sweep d'imports + risques macOS) excède le gain. À reporter à une phase de polissage globale, pas en parallèle des extractions Phase 2.
- **`utils/` reste plat.** Pas de sous-dossiers `math/`, `discord/`, `game/` tant qu'il n'y a pas au moins 5 fichiers par groupe. Sur-organiser tôt fragilise plus que ça aide.
- **`Fighter.ts` est maintenant extrait.** Il doit rester une classe de modèle/combat state, pas devenir un endroit où remettre l'orchestration de `FightHandler`.

## 4. Plan d'action incrémental

Chaque étape doit être un commit/PR isolé qui passe `tsc --noEmit` et `npm test`. Pas de big-bang.

1. **Décision préalable :** confirmer avec l'utilisateur que l'absorption des sous-modules est désirée et choisir la procédure (avec ou sans historique).
2. **Sous-modules :** absorber `src/structures` (`src/scripts` séparément, après accord — voir `STATE.md`).
3. **Phase 2 restante :** P2.3 et P2.4 ne sont plus surtout des déplacements de fichiers. `TradeService.ts` existe ; le travail restant est le durcissement transactionnel/TOCTOU. Côté combat, créer `CombatService/` seulement si une vraie frontière métier apparaît au-delà des modules `Fight*.ts`.
4. **Phase 3 active :** continuer à faire maigrir les géants restants : `Functions.ts` (re-export shell), `DatabaseHandler.ts` (rollback/maintenance déjà extraits en services), puis `clientReady.ts` si un bloc clair ressort. Ne pas créer de nouveau code dans ces fichiers.
5. **Combat :** `FightHandler.ts` est déjà thin ; garder les nouvelles règles/comportements dans les modules `Fight*.ts` ou `services/FightRenderer.ts` selon leur rôle. Les cas Discord impossibles (`Unknown Message`, `Missing Access`, maintenance active) restent du ressort de `FightMessageAccess.ts`.
6. **`assets/` :** déplacer éventuellement `emojis.json` vers `assets/` en un commit isolé, avec sweep d'imports. Ne pas déplacer `NPCs.json` / `prestigeNPCs.json` : migrer les derniers lecteurs, puis supprimer.
7. **Renames `rpg/<Cap>/` :** seulement si on décide collectivement de standardiser le casing. Faire le sweep en deux commits (`Chapters → _tmp` puis `_tmp → chapters`) pour gérer les FS insensibles à la casse.
8. **Standardisation `utils/` :** uniformiser le casing (`Logger.ts` → `logger.ts`, `Aes.ts` → `aes.ts`, `Webhooks.ts` → `webhooks.ts`) — un fichier par commit pour limiter le churn de revue.

## 5. Conventions de nommage (rappel + état réel)

| Type                                              | Convention      | Exemples conformes        | Exceptions actuelles à corriger un jour |
| ------------------------------------------------- | --------------- | ------------------------- | --------------------------------------- |
| Dossiers                                          | `lowercase`     | `services/`, `utils/`     | `rpg/Chapters/`, `rpg/Items/`, `rpg/NPCs/`, `rpg/Quests/`, `rpg/Stands/`, `rpg/Events/` |
| Fichiers exportant une classe/interface dominante | `PascalCase.ts` | `UserService.ts`, `CommandInteractionContext.ts` | — |
| Fichiers de fonctions pures / helpers             | `camelCase.ts`  | `emojiBar.ts`, `random.ts`, `containers.ts` | `Functions.ts` (devrait être `functions.ts` ou éclaté), `Logger.ts`, `Aes.ts`, `Webhooks.ts`, `Matchmaking.ts`, `TopGG.ts`, `FightHandlerWatchdog.ts`, `AdminAudit.ts` |
| Tests                                             | `<nom>.test.ts` | `random.test.ts`, `UserService.test.ts` | — |
| Constantes JSON                                   | `lowercase.json`| `emojis.json`             | `NPCs.json`, `prestigeNPCs.json` sont legacy à supprimer après migration ; `standUsersNPCS.json` si encore présent doit suivre la même règle |

> **Lecture :** la colonne « exceptions » est une dette à régler par la **phase 5 polissage** (un PR par dossier ou par fichier), pas par un commit en bloc. Chaque rename casse les imports en cascade et doit être isolé pour la revue.
