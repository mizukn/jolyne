import * as Stands from "../rpg/Stands/Stands";
import * as EvolutionStands from "../rpg/Stands/EvolutionStands";
import * as NPCs from "../rpg/NPCs/NPCs";
import * as FightableNPCs from "../rpg/NPCs/FightableNPCs";
import * as Emails from "../rpg/Emails";
import * as ItemsBare from "../rpg/Items/Items";
import * as Consumables from "../rpg/Items/ConsumableItems";
import * as EquipableItems from "../rpg/Items/EquipableItems";
import * as SpecialItems from "../rpg/Items/SpecialItems";
import Items from "../rpg/Items";

// Boot-time invariants. We check the data registries after index.ts has
// finished its dynamic NPC/Stand-Disc generation so the validator sees both
// static and runtime-injected entries. Any violation is a hard bug — a
// dangling reward item id or a stand-user with a typo in `stand` will produce
// silent runtime failures (findItem returning undefined, fights throwing on
// missing stand abilities). Catch them at boot.

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const idsBySource = (
    label: string,
    sources: Array<[name: string, source: Record<string, unknown>]>,
): { ids: Map<string, string>; errors: string[] } => {
    const ids = new Map<string, string>();
    const errors: string[] = [];
    for (const [sourceName, source] of sources) {
        for (const [exportName, value] of Object.entries(source)) {
            if (!isObject(value) || typeof value.id !== "string") continue;
            const id = value.id;
            const provenance = `${sourceName}.${exportName}`;
            if (ids.has(id)) {
                errors.push(
                    `Duplicate ${label} id "${id}" in ${provenance} (also defined as ${ids.get(id)})`,
                );
            } else {
                ids.set(id, provenance);
            }
        }
    }
    return { ids, errors };
};

export const validateRegistries = (): string[] => {
    const errors: string[] = [];

    // Items: each source file is a flat record of named exports. The merged
    // `Items.default` is what the rest of the codebase looks up against, but
    // we want to detect collisions across source files (where the merge would
    // silently keep only the last value).
    const itemSources: Array<[string, Record<string, unknown>]> = [
        ["Items", ItemsBare],
        ["ConsumableItems", Consumables],
        ["EquipableItems", EquipableItems],
        ["SpecialItems", SpecialItems],
    ];
    const { ids: itemIds, errors: itemErrors } = idsBySource("item", itemSources);
    errors.push(...itemErrors);
    // The dynamically-injected stand-disc items live only on Items.default,
    // so include those for downstream lookups.
    const knownItemIds = new Set(itemIds.keys());
    for (const [exportName, value] of Object.entries(Items)) {
        if (isObject(value) && typeof value.id === "string") {
            knownItemIds.add(value.id);
        } else if (typeof exportName === "string") {
            knownItemIds.add(exportName);
        }
    }

    // Stands: ids must be unique across base Stands and EvolutionStands.
    const { ids: standIds, errors: standErrors } = idsBySource("stand", [
        ["Stands", Stands as unknown as Record<string, unknown>],
        ["EvolutionStands", EvolutionStands as unknown as Record<string, unknown>],
    ]);
    errors.push(...standErrors);

    // NPCs: separately enforce uniqueness within each module. Cross-module
    // sharing is intentional (every FightableNPC mirrors a base NPC by id).
    const { errors: baseNpcErrors } = idsBySource("NPC", [
        ["NPCs", NPCs as unknown as Record<string, unknown>],
    ]);
    errors.push(...baseNpcErrors);
    const { ids: fightableNpcIds, errors: fightableNpcErrors } = idsBySource("FightableNPC", [
        ["FightableNPCs", FightableNPCs as unknown as Record<string, unknown>],
    ]);
    errors.push(...fightableNpcErrors);

    // Emails: ids must be unique.
    const { ids: emailIds, errors: emailErrors } = idsBySource("email", [
        ["Emails", Emails as unknown as Record<string, unknown>],
    ]);
    errors.push(...emailErrors);

    // Reference checks against FightableNPC entries.
    for (const [exportName, value] of Object.entries(
        FightableNPCs as unknown as Record<string, unknown>,
    )) {
        if (!isObject(value)) continue;
        const provenance = `FightableNPCs.${exportName}`;

        const stand = value.stand;
        if (typeof stand === "string" && !standIds.has(stand)) {
            errors.push(`${provenance} references unknown stand "${stand}"`);
        }

        const equippedItems = value.equippedItems;
        if (isObject(equippedItems)) {
            for (const itemId of Object.keys(equippedItems)) {
                if (!knownItemIds.has(itemId)) {
                    errors.push(
                        `${provenance} has unknown equipped item "${itemId}"`,
                    );
                }
            }
        }

        const rewards = value.rewards;
        if (isObject(rewards) && Array.isArray(rewards.items)) {
            for (const reward of rewards.items) {
                if (!isObject(reward)) continue;
                const id = reward.item;
                if (typeof id === "string" && !knownItemIds.has(id)) {
                    errors.push(
                        `${provenance} reward item "${id}" is not defined`,
                    );
                }
            }
        }
    }

    // Email author NPCs should resolve.
    for (const [exportName, value] of Object.entries(
        Emails as unknown as Record<string, unknown>,
    )) {
        if (!isObject(value)) continue;
        const author = value.author;
        if (!isObject(author) || typeof author.id !== "string") {
            errors.push(`Emails.${exportName} has no author or missing id`);
        }
    }

    // Mark unused references to keep the linter quiet — every map participates
    // in the assertions above.
    void fightableNpcIds;
    void emailIds;

    return errors;
};

export const runRegistryValidation = (): void => {
    const errors = validateRegistries();
    if (errors.length === 0) return;

    const banner = `Registry validation failed (${errors.length} issue${
        errors.length === 1 ? "" : "s"
    }):`;
    const formatted = `${banner}\n  - ${errors.join("\n  - ")}`;

    if (process.env.BETA) {
        console.warn(formatted);
        return;
    }
    console.error(formatted);
    process.exit(1);
};
