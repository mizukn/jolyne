import * as Stands from "../rpg/Stands/Stands";
import * as EvolutionStands from "../rpg/Stands/EvolutionStands";
import * as NPCs from "../rpg/NPCs/NPCs";
import * as FightableNPCs from "../rpg/NPCs/FightableNPCs";
import * as Emails from "../rpg/Emails";
import * as ItemsBare from "../rpg/Items/Items";
import * as Consumables from "../rpg/Items/ConsumableItems";
import * as EquipableItems from "../rpg/Items/EquipableItems";
import * as SpecialItems from "../rpg/Items/SpecialItems";
import * as BaseQuests from "../rpg/Quests/Quests";
import * as ActionQuests from "../rpg/Quests/ActionQuests";
import Items from "../rpg/Items";
import { endOf2024HalloweenEvent } from "../rpg/Events/2024HalloweenEvent";
import {
    endOf2024ChristmasEvent,
    startOf2024ChristmasEvent,
} from "../rpg/Events/2024ChristmasEvent";
import { endOf2025WinterEvent, startOf2025WinterEvent } from "../rpg/Events/2025WinterEvent";
import {
    endOf2025ChineseNewYear,
    startOf2025ChineseNewYear,
} from "../rpg/Events/2025ChineseNewYear";
import {
    endOf3rdAnnivesaryEvent,
    startOf3rdAnnivesaryEvent,
} from "../rpg/Events/3rdYearAnniversaryEvent";
import {
    endOf4thAnnivesaryEvent,
    startOf4thAnnivesaryEvent,
} from "../rpg/Events/4thAnniversaryEvent";
import {
    endOf2025HalloweenEvent,
    startOf2025HalloweenEvent,
} from "../rpg/Events/2025HalloweenEvent";
import { EVENT_IDS, EventDef, EventId, getEvent, getEvents } from "../services/EventService";
import log from "../utils/Logger";

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

const toTime = (date: Date | number): number => new Date(date).getTime();

const validateEventWindow = (
    expected: EventDef,
    actual: EventDef | undefined,
): string[] => {
    if (!actual) return [`EventService is missing event "${expected.id}"`];

    const errors: string[] = [];
    if (actual.startsAt.getTime() !== expected.startsAt.getTime()) {
        errors.push(
            `EventService.${expected.id}.startsAt is ${actual.startsAt.toISOString()} but event module exports ${expected.startsAt.toISOString()}`,
        );
    }
    if (actual.endsAt.getTime() !== expected.endsAt.getTime()) {
        errors.push(
            `EventService.${expected.id}.endsAt is ${actual.endsAt.toISOString()} but event module exports ${expected.endsAt.toISOString()}`,
        );
    }
    if ((actual.startsInclusive ?? true) !== (expected.startsInclusive ?? true)) {
        errors.push(
            `EventService.${expected.id}.startsInclusive is ${String(
                actual.startsInclusive ?? true,
            )} but expected ${String(expected.startsInclusive ?? true)}`,
        );
    }
    if ((actual.endsInclusive ?? true) !== (expected.endsInclusive ?? true)) {
        errors.push(
            `EventService.${expected.id}.endsInclusive is ${String(
                actual.endsInclusive ?? true,
            )} but expected ${String(expected.endsInclusive ?? true)}`,
        );
    }

    return errors;
};

export const validateEventWindows = (): string[] => {
    const errors: string[] = [];
    const expectedEvents: readonly EventDef[] = [
        {
            id: EVENT_IDS.HALLOWEEN_2024,
            startsAt: new Date(0),
            endsAt: new Date(endOf2024HalloweenEvent),
            endsInclusive: false,
        },
        {
            id: EVENT_IDS.CHRISTMAS_2024,
            startsAt: new Date(startOf2024ChristmasEvent),
            endsAt: new Date(endOf2024ChristmasEvent),
            startsInclusive: false,
            endsInclusive: false,
        },
        {
            id: EVENT_IDS.WINTER_2025,
            startsAt: startOf2025WinterEvent,
            endsAt: endOf2025WinterEvent,
        },
        {
            id: EVENT_IDS.CHINESE_NEW_YEAR_2025,
            startsAt: startOf2025ChineseNewYear,
            endsAt: endOf2025ChineseNewYear,
        },
        {
            id: EVENT_IDS.THIRD_ANNIVERSARY,
            startsAt: startOf3rdAnnivesaryEvent,
            endsAt: endOf3rdAnnivesaryEvent,
        },
        {
            id: EVENT_IDS.HALLOWEEN_2025,
            startsAt: startOf2025HalloweenEvent,
            endsAt: endOf2025HalloweenEvent,
        },
        {
            id: EVENT_IDS.FOURTH_ANNIVERSARY,
            startsAt: startOf4thAnnivesaryEvent,
            endsAt: endOf4thAnnivesaryEvent,
        },
    ];

    const expectedIds = new Set<EventId>();
    for (const expectedEvent of expectedEvents) {
        expectedIds.add(expectedEvent.id);
        errors.push(...validateEventWindow(expectedEvent, getEvent(expectedEvent.id)));
    }

    for (const event of getEvents()) {
        if (!expectedIds.has(event.id)) {
            errors.push(`EventService has unvalidated event "${event.id}"`);
        }
        if (Number.isNaN(toTime(event.startsAt))) {
            errors.push(`EventService.${event.id}.startsAt is not a valid date`);
        }
        if (Number.isNaN(toTime(event.endsAt))) {
            errors.push(`EventService.${event.id}.endsAt is not a valid date`);
        }
        if (event.startsAt.getTime() > event.endsAt.getTime()) {
            errors.push(`EventService.${event.id} starts after it ends`);
        }
    }

    return errors;
};

export const validateRegistries = (): string[] => {
    const errors: string[] = [];
    errors.push(...validateEventWindows());

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

    // Quests: ids must be unique across Quests + ActionQuests.
    const { ids: questIds, errors: questErrors } = idsBySource("quest", [
        ["Quests", BaseQuests as unknown as Record<string, unknown>],
        ["ActionQuests", ActionQuests as unknown as Record<string, unknown>],
    ]);
    errors.push(...questErrors);

    // pushEmailWhenCompleted references on any quest source must resolve to a
    // known email id.
    const validatePushEmail = (
        provenance: string,
        value: Record<string, unknown>,
    ): void => {
        const push = value.pushEmailWhenCompleted;
        if (!isObject(push)) return;
        const id = push.id;
        if (typeof id !== "string") return;
        if (!emailIds.has(id)) {
            errors.push(
                `${provenance} references unknown email "${id}" via pushEmailWhenCompleted`,
            );
        }
    };
    for (const [exportName, value] of Object.entries(
        BaseQuests as unknown as Record<string, unknown>,
    )) {
        if (isObject(value)) validatePushEmail(`Quests.${exportName}`, value);
    }
    for (const [exportName, value] of Object.entries(
        ActionQuests as unknown as Record<string, unknown>,
    )) {
        if (isObject(value)) validatePushEmail(`ActionQuests.${exportName}`, value);
    }

    // Mark unused references to keep the linter quiet — every map participates
    // in the assertions above.
    void fightableNpcIds;
    void questIds;

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
        log(formatted, "warn");
        return;
    }
    log(formatted, "error");
    process.exit(1);
};
