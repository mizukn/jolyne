// Pure presentation layer for the fight UI (PLAN.md §P2.5). The handler keeps
// owning state and Discord side effects (`message.edit`, NPC timeouts, watchdog
// beacon); this module only turns a snapshot into a payload. P3.2 will move
// the file under combat/ once FightHandler is split.

import {
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    AnyComponentBuilder,
} from "discord.js";
import * as Functions from "../utils/Functions";
import {
    FightTypes,
    FightTypeColor,
    type Fighter,
    type FightInfos,
} from "../structures/FightHandler";
import type Jolyne from "../structures/JolyneClient";

export interface FightSnapshot {
    id: string;
    infos: FightInfos;
    teams: Fighter[][];
    fighters: Fighter[];
    turns: { logs: string[] }[];
    whosTurn: Fighter | undefined;
    hasOneTarget: boolean;
    ctx: { client: Jolyne };
}

export interface RenderResult {
    content: string;
    embeds: APIEmbed[];
    components: ActionRowBuilder<AnyComponentBuilder>[];
}

export interface RenderTurnOptions {
    silent?: boolean;
    whoseTurn?: Fighter;
}

const randomGifs = [
    "https://i.pinimg.com/originals/a2/cf/f6/a2cff6bc5fbf342595a77846b60212a8.gif",
    "https://i.makeagif.com/media/3-15-2023/7ytUsM.gif",
    "https://www.fightersgeneration.com/nx7/char/jjba/iggy-ova-group.png",
    undefined,
    undefined,
    undefined,
    "https://33.media.tumblr.com/e20836fec3e6f6efb3e7da0005038ceb/tumblr_nb0x8alD3S1rlm9ylo1_500.gif",
    "https://i.kym-cdn.com/photos/images/original/001/064/974/edb.gif",
    undefined,
    undefined,
];

const generateFields = (snap: FightSnapshot): { name: string; value: string }[] => {
    let fields: { name: string; value: string }[] = [];

    if (snap.turns[0].logs.length == 0) {
        fields.push({
            name: "Turn 1",
            value: "Fight has started",
        });
    } else {
        for (let i = 0; i < snap.turns.length; i++) {
            const turn = snap.turns[i];
            const log = turn.logs.join("\n");
            if (log.length === 0) continue;
            fields.push({
                name: `Turn ${i + 1}`,
                value: log,
            });
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

export function renderTurn(snap: FightSnapshot, opts: RenderTurnOptions = {}): RenderResult {
    const silent = opts.silent ?? false;
    const whosTurn = opts.whoseTurn ?? snap.whosTurn;

    let attackButton = new ButtonBuilder()
        .setCustomId(snap.id + `attack`)
        .setLabel(
            whosTurn?.stand?.customAttack
                ? whosTurn?.stand.customAttack.name(snap as never, whosTurn)
                : "Attack"
        )
        .setEmoji(whosTurn?.stand?.customAttack ? whosTurn?.stand?.customAttack.emoji : "👊")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
            silent
                ? true && snap.whosTurn?.canAttack
                : snap.infos.cooldowns.find(
                      (cd) =>
                          cd.id === whosTurn?.id &&
                          cd.move === whosTurn?.stand?.customAttack?.name(snap as never, whosTurn)
                  )?.cooldown < 0 && snap.whosTurn?.canAttack
        );
    if (!whosTurn?.stand?.customAttack && whosTurn?.weapon) {
        attackButton = new ButtonBuilder()
            .setCustomId(snap.id + `weaponATK`)
            .setLabel(`${Functions.capitalize(whosTurn?.weapon?.attackName)}`)
            .setEmoji(whosTurn?.weapon?.emoji)
            .setDisabled(
                silent ? true : whosTurn?.stamina < whosTurn?.weapon?.staminaCost ? true : false
            )
            .setStyle(ButtonStyle.Primary);
    }

    const defendButton = new ButtonBuilder()
        .setCustomId(snap.id + `defend`)
        .setLabel("Defend")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
            silent
                ? true
                : snap.infos.cooldowns.find(
                      (cd) => cd.id === whosTurn?.id && cd.move === "defend"
                  )?.cooldown < 0 || snap.whosTurn?.hasStoppedTime
        );
    const standButton = new ButtonBuilder()
        .setCustomId(snap.id + `stand`)
        .setLabel(`${whosTurn?.stand?.name}'s Abilities`)
        .setEmoji(whosTurn?.stand?.emoji ?? "👊")
        .setDisabled(silent ? true : false)
        .setStyle(ButtonStyle.Primary);
    const forfeitButton = new ButtonBuilder()
        .setCustomId(snap.id + `forfeit`)
        .setLabel("Forfeit")
        .setEmoji("🏳️")
        .setDisabled(
            snap.whosTurn?.hasStoppedTime
                ? true
                : silent
                ? true
                : snap.infos.type === (FightTypes.Ranked || FightTypes.Boss)
                ? true
                : false
        )
        .setStyle(ButtonStyle.Danger);
    const waitingNPC = new ButtonBuilder()
        .setCustomId(snap.id + `waitingNPC`)
        .setLabel("[Waiting for NPC...]")
        .setEmoji("⏳")
        .setDisabled(true)
        .setStyle(ButtonStyle.Danger);
    const skipButton = new ButtonBuilder()
        .setCustomId(snap.id + `skip`)
        .setLabel("Skip")
        .setEmoji("⏭️")
        .setDisabled(silent ? (snap.whosTurn?.stamina < 2 ? false : true) : false)
        .setStyle(ButtonStyle.Secondary);
    const lockButton = new ButtonBuilder()
        .setCustomId(snap.id + `lock`)
        .setLabel("Auto-Target Lock")
        .setEmoji(whosTurn?.autoLock ? "🔒" : "🔓")
        .setDisabled(silent ? true : false)
        .setStyle(whosTurn?.autoLock ? ButtonStyle.Success : ButtonStyle.Secondary);

    const weaponButton = () =>
        new ButtonBuilder()
            .setCustomId(snap.id + `weapon`)
            .setLabel(`${whosTurn?.weapon.name} Abilities`)
            .setEmoji(whosTurn?.weapon?.emoji)
            .setDisabled(
                silent
                    ? true
                    : snap.infos.cooldowns.find(
                          (cd) =>
                              cd.id === whosTurn?.id && cd.move === whosTurn?.weapon.attackName
                      )?.cooldown < 0
            )
            .setStyle(ButtonStyle.Primary);

    const embed: APIEmbed = {
        title: snap.infos.type,
        thumbnail: {
            url:
                snap.ctx.client.users.cache
                    .get(whosTurn?.manipulatedBy ? whosTurn?.manipulatedBy?.id : whosTurn?.id)
                    ?.displayAvatarURL() ??
                Functions.findNPC(
                    whosTurn?.manipulatedBy ? whosTurn?.manipulatedBy?.id : whosTurn?.id
                )?.avatarURL ??
                undefined,
        },
        description: generateFightersInfo(snap) + "\n**▬▬▬▬▬▬▬▬「TURNS」▬▬▬▬▬▬▬▬▬**",
        color: FightTypeColor[snap.infos.type],
        footer: {
            text: `You have ${whosTurn?.stamina ?? "0"} stamina left. ⚡`,
        },
        fields: Functions.fixFields(generateFields(snap)),
        image: {
            url:
                new Date().getMonth() === 3 && new Date().getDate() === 1
                    ? randomGifs[Math.floor(Math.random() * randomGifs.length)]
                    : snap.infos.thumbnail,
        },
    };

    const rows: (ButtonBuilder | StringSelectMenuBuilder)[][] = [
        [attackButton, defendButton, skipButton],
    ];
    const x = [];

    if (whosTurn?.stand) rows[0].push(standButton);
    if (whosTurn?.weapon) {
        x.push(weaponButton());
        if (whosTurn?.stand?.customAttack)
            x.push(
                new ButtonBuilder()
                    .setCustomId(snap.id + `weaponATK`)
                    .setLabel(`${Functions.capitalize(whosTurn?.weapon.attackName)}`)
                    .setEmoji(whosTurn?.weapon?.emoji)
                    .setDisabled(
                        silent ? true : whosTurn?.weapon.staminaCost > whosTurn?.stamina
                    )
                    .setStyle(ButtonStyle.Primary)
            );
    }

    if (!snap.hasOneTarget && !silent) x.push(lockButton);
    if (x.length > 0) rows.push(x);

    rows[0].push(forfeitButton);
    rows.push([
        new StringSelectMenuBuilder()
            .setCustomId("lalala")
            .setDisabled(true)
            .addOptions([
                {
                    label: "Select another target",
                    value: "selectAnotherTarget",
                },
            ])
            .setPlaceholder(`[Waiting for ${snap.whosTurn?.name}]`),
    ]);

    const isNPC = isNaN(
        Number(whosTurn?.manipulatedBy ? whosTurn?.manipulatedBy.id : whosTurn?.id)
    );

    return {
        content: `It's **${snap.whosTurn?.name}**'s turn.`,
        embeds: Functions.splitEmbedIfExceedsLimit(embed),
        components: isNPC
            ? [Functions.actionRow([waitingNPC])]
            : rows.map((row) => Functions.actionRow(row)),
    };
}
