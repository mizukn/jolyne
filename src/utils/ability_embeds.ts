// V2-container renderers for stand and weapon ability lookups. Mirrors the
// `/stand display` layout in `src/commands/adventure/StandSubcommands.ts`:
// one section per ability with damage / cost / cooldown / dodge, plus a
// trailing bonuses block. Returns both raw parts (for callers that need to
// compose with their own select menus / buttons — like the in-fight ability
// menu) and a ready-to-send `V2Reply` (for one-shot commands like `/weapon`).

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
import { containers, type SectionData, type V2Reply, COLORS } from "./containers";

export interface AbilityView {
    title: string;
    description: string;
    sections: SectionData[];
    color: number;
    footer: string;
    image?: string;
}

const formatAbilityDamage = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    ability: { trueDamage?: number },
): string => {
    const damage = getAbilityDamage(user, ability as Parameters<typeof getAbilityDamage>[1]);
    if (damage) return damage.toLocaleString();
    if (ability.trueDamage) {
        return Math.round(
            getAttackDamages(user) * (1 + ability.trueDamage / 100),
        ).toLocaleString();
    }
    return "???";
};

const resolveCooldown = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    abilityName: string,
    defaultCooldown: number,
    cooldowns?: FightInfos["cooldowns"],
): number => {
    if (!cooldowns) return defaultCooldown;
    return cooldowns.find((c) => c.move === abilityName && c.id === user.id)?.cooldown ?? 0;
};

export const buildStandAbilityView = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenStand?: Stand,
): AbilityView | null => {
    const stand = chosenStand ? chosenStand : isFighter(user) ? user.stand : findStand(user.stand);
    if (!stand) return null;

    const sections: SectionData[] = [];

    for (const ability of stand.abilities) {
        const cooldown = resolveCooldown(user, ability.name, ability.cooldown, cooldowns);
        const dodge = ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable";
        sections.push({
            text:
                `### ${ability.special ? "⭐ " : ""}${ability.name}\n` +
                `> *${ability.description.replace(/{standName}/gi, stand.name)}*\n` +
                `> 💥 **Damages:** ${formatAbilityDamage(user, ability)}\n` +
                `> 🔋 **Stamina Cost:** ${ability.stamina}\n` +
                `> ⏳ **Cooldown:** ${cooldown} turns\n` +
                `> 🍃 **Dodge Score:** ${dodge}`,
        });
    }

    const totalSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);
    if (totalSkillPoints > 0) {
        const lines = Object.entries(stand.skillPoints)
            .map(([k, v]) => `> • +${v} ${k}`)
            .join("\n");
        sections.push({
            text: `### 📈 Bonuses (+${totalSkillPoints} Skill-Points)\n${lines}`,
        });
    }

    const passives = stand.passives ?? [];
    if (passives.length) {
        const lines = passives
            .map((p, i) => `> ${i + 1}. \`${p.name}:\` ${p.description}`)
            .join("\n");
        sections.push({ text: `### 🌀 Passives\n${lines}` });
    }

    return {
        title: `${stand.emoji ?? "✨"} ${stand.name}`,
        description: stand.description,
        sections,
        color: stand.color ?? COLORS.primary,
        footer: `Rarity: ${stand.rarity}`,
        image: stand.image,
    };
};

export const buildWeaponAbilityView = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenWeapon?: string,
): AbilityView | null => {
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
    if (!weapon) return null;

    const sections: SectionData[] = [];

    for (const ability of weapon.abilities) {
        const cooldown = resolveCooldown(user, ability.name, ability.cooldown, cooldowns);
        const dodge = ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable";
        sections.push({
            text:
                `### ${ability.special ? "⭐ " : ""}${ability.name}\n` +
                `> *${ability.description.replace(/{weaponName}/gi, weapon.name)}*\n` +
                `> 💥 **Damages:** ${formatAbilityDamage(user, ability)}\n` +
                `> 🔋 **Stamina Cost:** ${ability.stamina}\n` +
                `> ⏳ **Cooldown:** ${cooldown} turns\n` +
                `> 🍃 **Dodge Score:** ${dodge}`,
        });
    }

    const totalSkillPoints = Object.values(weapon.effects.skillPoints ?? {}).reduce(
        (a, b) => a + b,
        0,
    );
    if (totalSkillPoints > 0) {
        const lines = Object.entries(weapon.effects.skillPoints ?? {})
            .map(([k, v]) => `> • +${v} ${k}`)
            .join("\n");
        sections.push({
            text: `### 📈 Bonuses (+${totalSkillPoints} Skill-Points)\n${lines}`,
        });
    }

    const passives = weapon.passives ?? [];
    if (passives.length) {
        const lines = passives
            .map((p, i) => `> ${i + 1}. \`${p.name}:\` ${p.description}`)
            .join("\n");
        sections.push({ text: `### 🌀 Passives\n${lines}` });
    }

    return {
        title: `${weapon.emoji ?? "⚔️"} ${weapon.name}`,
        description: weapon.description,
        sections,
        color: weapon.color ?? COLORS.primary,
        footer: `Rarity: ${weapon.rarity}`,
    };
};

const NOT_FOUND_STAND: V2Reply = containers.error("No stand found.");
const NOT_FOUND_WEAPON: V2Reply = containers.error("No weapon found.");

export const standAbilitiesContainer = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenStand?: Stand,
): V2Reply => {
    const view = buildStandAbilityView(user, cooldowns, chosenStand);
    if (!view) return NOT_FOUND_STAND;
    return containers.primary({
        title: `# ${view.title}`,
        description: view.description,
        descriptionDivider: true,
        sections: view.sections,
        sectionDividers: true,
        color: view.color,
        image: view.image,
        footer: view.footer,
    });
};

export const weaponAbilitiesContainer = (
    user: Fighter | RPGUserDataJSON | FightableNPC,
    cooldowns?: FightInfos["cooldowns"],
    chosenWeapon?: string,
): V2Reply => {
    const view = buildWeaponAbilityView(user, cooldowns, chosenWeapon);
    if (!view) return NOT_FOUND_WEAPON;
    return containers.primary({
        title: `# ${view.title}`,
        description: view.description,
        descriptionDivider: true,
        sections: view.sections,
        sectionDividers: true,
        color: view.color,
        footer: view.footer,
    });
};
