// Pure presentation layer for the fight UI (PLAN.md §P2.5). The handler keeps
// owning state and Discord side effects (`message.edit`, NPC timeouts, watchdog
// beacon); this module only turns a snapshot into a payload. P3.2 will move
// the file under combat/ once FightHandler is split.
//
// User-facing fight messages use V2 containers (see README_V2_UI.md). The
// webhook log embeds (start/end/stats) stay legacy APIEmbeds because Discord
// webhooks don't support V2 components.

import {
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ThumbnailBuilder,
    MessageFlags,
} from "discord.js";
import * as Functions from "../utils/Functions";
import { containers, type SectionData } from "../utils/containers";
import { emojiBar } from "../utils/emojiBar";
import {
    FightTypes,
    FightTypeColor,
    type FightInfos,
} from "../structures/FightTypes";
import {
    type Fighter,
} from "../structures/FightHandler";
import type Jolyne from "../structures/JolyneClient";
import type { Ability } from "../@types";

export interface FightSnapshot {
    id: string;
    infos: FightInfos;
    teams: Fighter[][];
    fighters: Fighter[];
    turns: { logs: string[] }[];
    whosTurn: Fighter | undefined;
    hasOneTarget: boolean;
    ctx: {
        client: Jolyne;
        guild?: { name: string; id: string };
        channel?: { name?: string; id: string };
        interaction?: { id: string };
    };
    getTeamIdx(fighter: Fighter): number;
}

// V2 message payloads share this shape: a flat components array (Container +
// any pushed ActionRowBuilders) and the IsComponentsV2 flag. discord.js
// rejects V2 payloads with a `content` or `embeds` field, so they're omitted.
// Components mixes raw Container JSON (from containers.ts) with
// ActionRowBuilder instances; discord.js accepts both at runtime, so we mirror
// the `any[]` shape that V2Reply uses across the codebase.
export interface RenderResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components: any[];
    flags: number;
}

export interface RenderTurnOptions {
    silent?: boolean;
    whoseTurn?: Fighter;
}

const fighterAvatarURL = (snap: FightSnapshot, fighter: Fighter | undefined): string | undefined => {
    const id = fighter?.manipulatedBy ? fighter.manipulatedBy.id : fighter?.id;
    return (
        snap.ctx.client.users.cache.get(id)?.displayAvatarURL() ??
        Functions.findNPC(id)?.avatarURL ??
        undefined
    );
};

const fighterLine = (fighter: Fighter): string => {
    const dead = fighter.health <= 0;
    const standEmoji = fighter.stand?.emoji ?? "";
    const weaponEmoji = fighter.weapon?.emoji ?? "";
    const prefix = `${standEmoji}${weaponEmoji}`.trim() || "👤";
    const nameLine = dead
        ? `${prefix} ~~**${fighter.name}**~~ • LVL ${fighter.trueLevel} ☠️`
        : `${prefix} **${fighter.name}** • LVL ${fighter.trueLevel}`;
    const hpBar = emojiBar("hp", fighter.health, fighter.maxHealth);
    const hpLine = `${hpBar} \`${fighter.health.toLocaleString("en-US")}/${fighter.maxHealth.toLocaleString("en-US")}\` ❤️ • 🛡️ \`${fighter.defense.toLocaleString("en-US")}/${fighter.maxDefense.toLocaleString("en-US")}\``;
    return `${nameLine}\n${hpLine}`;
};

const teamSections = (snap: FightSnapshot, ignoreTeamIndex?: number): SectionData[] => {
    return snap.teams
        .map((team, idx) => ({ team, idx }))
        .filter(({ idx }) => idx !== ignoreTeamIndex)
        .map(({ team, idx }) => ({
            text: `### 👥 Team ${idx + 1}\n${team.map(fighterLine).join("\n\n")}`,
        }));
};

const recentTurnsText = (snap: FightSnapshot): string | null => {
    if (snap.turns.length === 0) return null;
    if (snap.turns[0].logs.length === 0 && snap.turns.length === 1) {
        return "### 📜 Turn 1\nFight has started";
    }
    const turnsToShow = Math.min(2, snap.turns.length);
    const slice = snap.turns.slice(snap.turns.length - turnsToShow);
    const blocks = slice
        .map((turn, offset) => {
            const idx = snap.turns.length - turnsToShow + offset;
            if (turn.logs.length === 0) return null;
            return `### 📜 Turn ${idx + 1}\n${turn.logs.join("\n")}`;
        })
        .filter((b): b is string => b !== null);
    return blocks.length > 0 ? blocks.join("\n\n") : null;
};

export function renderTurn(snap: FightSnapshot, opts: RenderTurnOptions = {}): RenderResult {
    const silent = opts.silent ?? false;
    const whosTurn = opts.whoseTurn ?? snap.whosTurn;
    const isNPC = isNaN(
        Number(whosTurn?.manipulatedBy ? whosTurn.manipulatedBy.id : whosTurn?.id)
    );

    const headerSection: SectionData = {
        text: [
            `### 🎯 ${whosTurn?.name ?? "Unknown"}'s Turn`,
            `${emojiBar("sta", whosTurn?.stamina ?? 0, whosTurn?.maxStamina ?? 1)} \`${whosTurn?.stamina ?? 0}/${whosTurn?.maxStamina ?? 0}\` ⚡ stamina`,
        ].join("\n"),
    };
    const avatarUrl = fighterAvatarURL(snap, whosTurn);
    if (avatarUrl) {
        headerSection.accessory = new ThumbnailBuilder().setURL(avatarUrl);
    }

    const sections: SectionData[] = [headerSection, ...teamSections(snap)];
    const log = recentTurnsText(snap);
    if (log) sections.push({ text: log });

    if (snap.infos.thumbnail) {
        sections.push({ text: `> -# Effect: ${snap.infos.thumbnail}` });
    }

    const reply = containers.primary({
        title: snap.infos.type,
        sections,
        sectionDividers: true,
        color: FightTypeColor[snap.infos.type],
        footer: silent
            ? "Waiting…"
            : `Auto-target ${whosTurn?.autoLock ? "🔒 locked" : "🔓 manual"} • FightID ${snap.id.slice(0, 8)}`,
    });

    if (isNPC) {
        const waitingNPC = new ButtonBuilder()
            .setCustomId(snap.id + `waitingNPC`)
            .setLabel(`Waiting for ${whosTurn?.name ?? "NPC"}…`)
            .setEmoji("⏳")
            .setDisabled(true)
            .setStyle(ButtonStyle.Danger);
        reply.components.push(Functions.actionRow([waitingNPC]));
    } else {
        // Primary attack: weapon strike if no stand custom attack, otherwise
        // the stand's named attack.
        let attackButton: ButtonBuilder;
        if (!whosTurn?.stand?.customAttack && whosTurn?.weapon) {
            attackButton = new ButtonBuilder()
                .setCustomId(snap.id + `weaponATK`)
                .setLabel(Functions.capitalize(whosTurn.weapon.attackName))
                .setEmoji(whosTurn.weapon.emoji)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(silent ? true : whosTurn.stamina < whosTurn.weapon.staminaCost);
        } else {
            const customAttackName = whosTurn?.stand?.customAttack
                ? whosTurn.stand.customAttack.name(snap as never, whosTurn)
                : "Attack";
            const customAttackOnCooldown =
                snap.infos.cooldowns.find(
                    (cd) => cd.id === whosTurn?.id && cd.move === customAttackName
                )?.cooldown >= 0;
            attackButton = new ButtonBuilder()
                .setCustomId(snap.id + `attack`)
                .setLabel(customAttackName)
                .setEmoji(whosTurn?.stand?.customAttack?.emoji ?? "👊")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(
                    silent
                        ? true
                        : customAttackOnCooldown || !snap.whosTurn?.canAttack
                );
        }

        const defendButton = new ButtonBuilder()
            .setCustomId(snap.id + `defend`)
            .setLabel("Defend")
            .setEmoji("🛡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(
                silent
                    ? true
                    : (snap.infos.cooldowns.find(
                          (cd) => cd.id === whosTurn?.id && cd.move === "defend"
                      )?.cooldown ?? 0) > 0 || !!snap.whosTurn?.hasStoppedTime
            );

        const skipButton = new ButtonBuilder()
            .setCustomId(snap.id + `skip`)
            .setLabel("Skip")
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(silent);

        const forfeitDisabled =
            silent ||
            !!snap.whosTurn?.hasStoppedTime ||
            snap.infos.type === FightTypes.Ranked ||
            snap.infos.type === FightTypes.Boss;
        const forfeitButton = new ButtonBuilder()
            .setCustomId(snap.id + `forfeit`)
            .setLabel("Forfeit")
            .setEmoji("🏳️")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(forfeitDisabled);

        const primaryRow: ButtonBuilder[] = [attackButton, defendButton, skipButton];
        if (whosTurn?.stand) {
            primaryRow.push(
                new ButtonBuilder()
                    .setCustomId(snap.id + `stand`)
                    .setLabel(`${whosTurn.stand.name}'s Abilities`)
                    .setEmoji(whosTurn.stand.emoji ?? "✨")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(silent)
            );
        }
        primaryRow.push(forfeitButton);
        reply.components.push(Functions.actionRow(primaryRow));

        const secondaryRow: ButtonBuilder[] = [];
        if (whosTurn?.weapon) {
            const weaponOnCooldown =
                (snap.infos.cooldowns.find(
                    (cd) => cd.id === whosTurn.id && cd.move === whosTurn.weapon.attackName
                )?.cooldown ?? 0) > 0;
            secondaryRow.push(
                new ButtonBuilder()
                    .setCustomId(snap.id + `weapon`)
                    .setLabel(`${whosTurn.weapon.name} Abilities`)
                    .setEmoji(whosTurn.weapon.emoji)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(silent || weaponOnCooldown)
            );
            if (whosTurn.stand?.customAttack) {
                secondaryRow.push(
                    new ButtonBuilder()
                        .setCustomId(snap.id + `weaponATK`)
                        .setLabel(Functions.capitalize(whosTurn.weapon.attackName))
                        .setEmoji(whosTurn.weapon.emoji)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(silent || whosTurn.weapon.staminaCost > whosTurn.stamina)
                );
            }
        }
        if (!snap.hasOneTarget && !silent) {
            secondaryRow.push(
                new ButtonBuilder()
                    .setCustomId(snap.id + `lock`)
                    .setLabel("Auto-Target")
                    .setEmoji(whosTurn?.autoLock ? "🔒" : "🔓")
                    .setStyle(whosTurn?.autoLock ? ButtonStyle.Success : ButtonStyle.Secondary)
            );
        }
        if (secondaryRow.length > 0) reply.components.push(Functions.actionRow(secondaryRow));
    }

    return reply;
}

export function renderTargetSelect(
    snap: FightSnapshot,
    availableTargets: Fighter[]
): RenderResult {
    const whosTurn = snap.whosTurn;

    const reply = containers.primary({
        title: `🎯 Select a Target`,
        description: `It's **${whosTurn?.name}**'s turn — pick someone to hit (or just defend after picking).`,
        sections: teamSections(snap, snap.getTeamIdx(whosTurn)),
        sectionDividers: true,
        color: FightTypeColor[snap.infos.type],
        selectMenus: [
            new StringSelectMenuBuilder()
                .setCustomId(snap.id + "target")
                .setPlaceholder(`[${whosTurn?.name}: select a target]`)
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    availableTargets.map((target) => {
                        const tag = target.manipulatedBy
                            ? target.name
                            : (target.npc
                                  ? target.name
                                  : snap.ctx.client.users.cache.get(target.id)?.tag ??
                                    target.name);
                        return {
                            label: `${tag}: ${target.health.toLocaleString(
                                "en-US"
                            )}/${target.maxHealth.toLocaleString()} ❤️ (Team ${
                                snap.getTeamIdx(target) + 1
                            })`,
                            emoji: target.manipulatedBy
                                ? snap.ctx.client.localEmojis["hierophant_green"]
                                : Functions.findNPC(
                                      target.manipulatedBy ? target.manipulatedBy.id : target.id
                                  )?.emoji ?? undefined,
                            value: target.id,
                        };
                    })
                ),
        ],
        footer: `${availableTargets.length} target${availableTargets.length === 1 ? "" : "s"} available`,
    });

    reply.components.push(
        Functions.actionRow([
            new ButtonBuilder()
                .setCustomId(snap.id + "goBack")
                .setLabel("Back")
                .setEmoji("⬅️")
                .setStyle(ButtonStyle.Secondary),
        ])
    );

    return reply;
}

const renderAbilityMenu = (
    snap: FightSnapshot,
    availableAbilities: Ability[],
    selectCustomIdSuffix: "abilities" | "wabilities",
    title: string,
    sourceEmbed: APIEmbed
): RenderResult => {
    const whosTurn = snap.whosTurn;

    const fields = (sourceEmbed.fields ?? []).map((f) => ({
        name: f.name,
        value: f.value.length > 1024 ? f.value.slice(0, 1021) + "..." : f.value,
    }));

    const opts = {
        title,
        description: sourceEmbed.description ?? `It's **${whosTurn?.name}**'s turn — pick an ability.`,
        fields,
        color: FightTypeColor[snap.infos.type],
        selectMenus: [] as StringSelectMenuBuilder[],
        footer: `${availableAbilities.length} ability${availableAbilities.length === 1 ? "" : "s"} available`,
    };
    if (availableAbilities.length !== 0) {
        opts.selectMenus.push(
            new StringSelectMenuBuilder()
                .setCustomId(snap.id + selectCustomIdSuffix)
                .setPlaceholder(`[${whosTurn?.name}: select an ability]`)
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    availableAbilities.map((ability) => ({
                        label: ability.name,
                        value: ability.name,
                    }))
                )
        );
    }

    const reply = containers.primary(opts);

    if (availableAbilities.length === 0) {
        reply.components.push(
            Functions.actionRow([
                new ButtonBuilder()
                    .setDisabled(true)
                    .setLabel("[No abilities available]")
                    .setCustomId(snap.id + "noAbilities")
                    .setStyle(ButtonStyle.Danger),
            ])
        );
    }
    reply.components.push(
        Functions.actionRow([
            new ButtonBuilder()
                .setCustomId(snap.id + "goBack")
                .setLabel("Back")
                .setEmoji("⬅️")
                .setStyle(ButtonStyle.Secondary),
        ])
    );
    return reply;
};

export function renderStandAbilityMenu(
    snap: FightSnapshot,
    availableAbilities: Ability[]
): RenderResult {
    const embed = Functions.standAbilitiesEmbed(snap.whosTurn, snap.infos.cooldowns);
    const title = `${snap.whosTurn?.stand?.emoji ?? "✨"} ${snap.whosTurn?.stand?.name ?? "Stand"} Abilities`;
    return renderAbilityMenu(snap, availableAbilities, "abilities", title, embed);
}

export function renderWeaponAbilityMenu(
    snap: FightSnapshot,
    availableAbilities: Ability[]
): RenderResult {
    const embed = Functions.weaponAbilitiesEmbed(snap.whosTurn, snap.infos.cooldowns);
    const title = `${snap.whosTurn?.weapon?.emoji ?? "⚔️"} ${snap.whosTurn?.weapon?.name ?? "Weapon"} Abilities`;
    return renderAbilityMenu(snap, availableAbilities, "wabilities", title, embed);
}

export function renderForfeitConfirm(
    snap: FightSnapshot,
    user: { username: string; avatarURL: string }
): RenderResult {
    const reply = containers.warning(
        `Forfeit the fight, **${snap.whosTurn?.name}**?\nYou're still going to lose all your hp and stamina.`,
        `Requested by ${user.username} • ⚠️ Only forfeit if you gotta go IRL or if you're sure you can't win.`
    );
    reply.components.push(
        Functions.actionRow([
            new ButtonBuilder()
                .setCustomId(snap.id + "forfeitConfirm")
                .setLabel("Forfeit")
                .setEmoji("🏳️")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(snap.id + "goBack")
                .setLabel("Cancel")
                .setEmoji("⬅️")
                .setStyle(ButtonStyle.Secondary),
        ])
    );
    return reply;
}

// --- Webhook log embeds ---------------------------------------------------
// These targets are Discord webhooks (start/end/stats channels) which don't
// support V2 components; they stay as regular embeds.

const generateFields = (snap: FightSnapshot): { name: string; value: string }[] => {
    let fields: { name: string; value: string }[] = [];

    if (snap.turns[0].logs.length == 0) {
        fields.push({ name: "Turn 1", value: "Fight has started" });
    } else {
        for (let i = 0; i < snap.turns.length; i++) {
            const turn = snap.turns[i];
            const log = turn.logs.join("\n");
            if (log.length === 0) continue;
            fields.push({ name: `Turn ${i + 1}`, value: log });
        }
    }

    fields = fields.reverse();
    if (snap.fighters.length <= 2 && fields.length > 5) fields.length = 5;
    else if (snap.fighters.length <= 3 && fields.length > 4) fields.length = 3;
    else if (fields.length > 2) fields.length = 2;
    fields = fields.reverse();
    return fields;
};

const generateFightersInfo = (snap: FightSnapshot, ignoreTeamIndex?: number): string => {
    return (
        snap.teams
            .filter((_team, index) => index !== ignoreTeamIndex)
            .map((team, index) => {
                const healthInfo = team
                    .map(
                        (fighter) =>
                            `- ${fighter.stand?.emoji ?? ""}${fighter.weapon?.emoji ?? ""} ${
                                fighter.health > 0 ? "" : "~~"
                            }\`${fighter.name} [TRUE LVL ${fighter.trueLevel}]:\`${
                                fighter.health > 0 ? "" : "~~"
                            } ${fighter.health.toLocaleString(
                                "en-US"
                            )}/${fighter.maxHealth.toLocaleString(
                                "en-US"
                            )} :heart: ; ${fighter.defense.toLocaleString(
                                "en-US"
                            )}/${fighter.maxDefense.toLocaleString()} :shield:`
                    )
                    .join("\n");

                return `**▬▬▬▬▬▬「Team ${index + 1}」▬▬▬▬▬▬**\n${healthInfo}`;
            })
            .join("\n") + "\n"
    );
};

export function renderFightStartLog(snap: FightSnapshot): APIEmbed {
    return {
        title: snap.infos.type,
        description: generateFightersInfo(snap),
        color: FightTypeColor[snap.infos.type],
        fields: [
            {
                name: "Guild info",
                value: `\`${snap.ctx.guild?.name}\` (${snap.ctx.guild?.id})`,
                inline: true,
            },
            {
                name: "Channel info",
                value: `\`${snap.ctx.channel?.name}\` (${snap.ctx.channel?.id})`,
                inline: true,
            },
            {
                name: "Timestamp",
                value: `Started ${Functions.generateDiscordTimestamp(
                    Date.now(),
                    "FROM_NOW"
                )} (${Functions.generateDiscordTimestamp(Date.now(), "FULL_DATE")})`,
                inline: true,
            },
        ],
        footer: {
            text: `InteractionID ${snap.ctx.interaction?.id} | FightID ${snap.id}`,
        },
    };
}

export function renderFightEndLog(snap: FightSnapshot): APIEmbed {
    return {
        title: snap.infos.type,
        description: generateFightersInfo(snap) + "\n**▬▬▬▬▬▬▬▬「INFO」▬▬▬▬▬▬▬▬▬**",
        color: FightTypeColor[snap.infos.type],
        fields: [
            {
                name: "Guild info",
                value: `\`${snap.ctx.guild?.name}\` (${snap.ctx.guild?.id})`,
                inline: true,
            },
            {
                name: "Channel info",
                value: `\`${snap.ctx.channel?.name}\` (${snap.ctx.channel?.id})`,
                inline: true,
            },
            {
                name: "Timestamp",
                value: `Ended ${Functions.generateDiscordTimestamp(
                    Date.now(),
                    "FROM_NOW"
                )} (${Functions.generateDiscordTimestamp(Date.now(), "FULL_DATE")})`,
                inline: true,
            },
            ...Functions.fixFields(generateFields(snap)),
        ],
        footer: {
            text: `InteractionID ${snap.ctx.interaction?.id} | FightID ${snap.id}`,
        },
    };
}

export function renderFightStatsEmbed(snap: FightSnapshot): APIEmbed {
    const sortedByDamage = [...snap.fighters].sort(
        (a, b) => b.totalDamageDealt - a.totalDamageDealt
    );
    const sortedByDodges = [...snap.fighters].sort((a, b) => b.stats.dodges - a.stats.dodges);
    const sortedByExtraTurns = [...snap.fighters].sort(
        (a, b) => b.stats.extraTurns - a.stats.extraTurns
    );
    const sortedByHealing = [...snap.fighters].sort(
        (a, b) => b.totalHealingDone - a.totalHealingDone
    );

    return {
        title: "Fight Stats",
        fields: [
            {
                name: "👊 Total Damage Dealt",
                value: sortedByDamage
                    .map(
                        (f) =>
                            `- ${f.name}: **${Math.round(
                                f.totalDamageDealt
                            ).toLocaleString()}** damages dealt`
                    )
                    .join("\n"),
            },
            {
                name: "🍃 Dodges",
                value: sortedByDodges
                    .map((f) => `- ${f.name}: **${f.stats.dodges}** dodges`)
                    .join("\n"),
            },
            {
                name: "🔄 Extra Turns",
                value: sortedByExtraTurns
                    .map((f) => `- ${f.name}: **${f.stats.extraTurns}** extra turns`)
                    .join("\n"),
            },
            {
                name: "🩹 Healing Done",
                value: sortedByHealing
                    .map(
                        (f) =>
                            `- ${f.name}: **${Math.round(
                                f.totalHealingDone
                            ).toLocaleString()}** healing done`
                    )
                    .join("\n"),
            },
        ],
        color: FightTypeColor[snap.infos.type],
        footer: {
            text: `FightID ${snap.id}`,
        },
        timestamp: new Date().toISOString(),
    };
}

// Re-export so call-sites that want to reference the V2 flag without
// importing discord.js also work.
export const V2_FLAG = MessageFlags.IsComponentsV2;
