// V1 embed renderers for stand and weapon abilities. Still used by
// FightRenderer (ability lookup popups) and `/weapon`. Kept as plain
// builders so the V2 container migration can adopt them piecewise.

import type { APIEmbed } from "discord.js";
import type {
    EquipableItem,
    FightableNPC,
    RPGUserDataJSON,
    Stand,
    Weapon,
} from "../@types";
import { equipableItemTypes } from "../@types";
import type { Fighter, FightInfos } from "../structures/FightHandler";
import {
    isFighter,
    getAbilityDamage,
    getAttackDamages,
} from "../services/UserService";
import { findItem, findStand } from "./lookup";
import { getEmojiId } from "./format";

export const standAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenStand?: Stand,
): APIEmbed => {
    const stand = chosenStand ? chosenStand : isFighter(user) ? user.stand : findStand(user.stand);
    if (!stand) return { title: "No stand found", description: "No stand found", color: 0xff0000 };
    const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

    const embed: APIEmbed = {
        title: stand.name,
        description:
            stand.description +
            `\n\n**BONUSES:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                stand.skillPoints,
            )
                .map(([key, value]) => `• +${value} ${key}`)
                .join("\n")}`,
        color: stand.color,
        footer: { text: `Rarity: ${stand.rarity}` },
        thumbnail: { url: stand.image },
        fields: [],
    };

    for (const ability of stand.abilities) {
        const index = stand.abilities.findIndex((w) => w.name === ability.name);
        const isLast = index === stand.abilities.length - 1;

        let content = `> 💥 **Damages:** ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                  ? Math.round(
                        getAttackDamages(user) * (1 + ability.trueDamage / 100),
                    ).toLocaleString()
                  : "???"
        }\n> 🔋 **Stamina Cost:** ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        const dodgeScore = ability.dodgeScore ?? ability.trueDodgeScore;
        content += `\n> ⏳ **Cooldown:** ${cooldown} turns\n> 🍃 **Dodge Score:** ${
            dodgeScore ? dodgeScore : dodgeScore
        }\n> \n> *${ability.description.replace(/{standName}/gi, stand.name)}*\n`;

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline: ability.special || isLast ? false : true,
        });
    }

    const passives = stand.passives ?? [];
    if (passives.length) {
        embed.fields.push({
            name: "Passives",
            value: passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n"),
            inline: false,
        });
    }

    return embed;
};

export const weaponAbilitiesEmbed = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenWeapon?: string,
): APIEmbed => {
    const weapon = chosenWeapon
        ? findItem<Weapon>(chosenWeapon, true)
        : isFighter(user)
          ? user.weapon
          : findItem<Weapon>(
                Object.keys(user.equippedItems).find(
                    (r) =>
                        (user.equippedItems as Record<string, EquipableItem["type"] | number>)[r] ===
                        equipableItemTypes.WEAPON,
                ),
            );
    if (!weapon)
        return {
            title: "No weapon found",
            description: "No weapon found",
            color: 0xff0000,
        };

    const totalWeaponSkillPoints = Object.values(weapon.effects.skillPoints).reduce(
        (a, b) => a + b,
        0,
    );

    const embed: APIEmbed = {
        title: weapon.name,
        description:
            weapon.description +
            `\n\n**BONUSES:** +${totalWeaponSkillPoints} skill-points:\n${Object.entries(
                weapon.effects.skillPoints,
            )
                .map(([key, value]) => `• +${value} ${key}`)
                .join("\n")}`,
        color: weapon.color,
        footer: { text: `Rarity: ${weapon.rarity}` },
        thumbnail: {
            url: `https://cdn.discordapp.com/emojis/${getEmojiId(weapon.emoji)}.png`,
        },
        fields: [],
    };

    for (const ability of weapon.abilities) {
        const index = weapon.abilities.findIndex((w) => w.name === ability.name);
        const isLast = index === weapon.abilities.length - 1;
        let content = `> 💥 **Damages:** ${
            getAbilityDamage(user, ability)
                ? getAbilityDamage(user, ability).toLocaleString()
                : ability.trueDamage
                  ? Math.round(
                        getAttackDamages(user) * (1 + ability.trueDamage / 100),
                    ).toLocaleString()
                  : "???"
        }\n> 🔋 **Stamina Cost:** ${ability.stamina}`;

        let cooldown: number;
        if (cooldowns)
            cooldown =
                cooldowns.find((c) => c.move === ability.name && c.id === user.id)?.cooldown ?? 0;
        else cooldown = ability.cooldown;

        content += `\n> ⏳ **Cooldown:** ${cooldown} turns\n> 🍃 **Dodge Score:** ${
            ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable"
        }\n> \n> *${ability.description.replace(/{weaponName}/gi, weapon.name)}*\n`;

        embed.fields.push({
            name: ability.name + (ability.special ? " ⭐" : ""),
            value: content,
            inline: ability.special || isLast ? false : true,
        });
    }

    const passives = weapon.passives ?? [];
    if (passives.length) {
        embed.fields.push({
            name: "Passives",
            value: passives.map((p, i) => `${i + 1}. \`${p.name}:\` ${p.description}`).join("\n"),
            inline: false,
        });
    }

    return embed;
};
