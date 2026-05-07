// Single registry for every seasonal event window. Replaces the scattered
// `is2024XEvent()` / `is2025XEvent()` / `is3rdAnniversaryEvent()` etc.
// helpers that the codebase otherwise has to import file-by-file. Each event's
// game-data module (rpg/Events/<EventName>.ts) keeps owning its own gameplay
// content and dates, but delegates the boolean check to this registry so
// callers stop having to know which file an event lives in.

export const EVENT_IDS = {
    HALLOWEEN_2024: "halloween_2024",
    CHRISTMAS_2024: "christmas_2024",
    WINTER_2025: "winter_2025",
    CHINESE_NEW_YEAR_2025: "chinese_new_year_2025",
    THIRD_ANNIVERSARY: "third_anniversary",
    HALLOWEEN_2025: "halloween_2025",
    FOURTH_ANNIVERSARY: "fourth_anniversary",
} as const;

export type EventId = (typeof EVENT_IDS)[keyof typeof EVENT_IDS];

export interface EventDef {
    id: EventId;
    startsAt: Date;
    endsAt: Date;
    startsInclusive?: boolean;
    endsInclusive?: boolean;
}

// Date constants are duplicated from the per-event game-data modules on
// purpose: the registry is the source of truth for "is this event active?"
// while the data modules continue to own their copy/items/raid bosses. If a
// future date drifts in one place but not the other, the boot-time validator
// (src/bootstrap/validate.ts) is the right place to bolt on a cross-check.
const EPOCH = new Date(0);

const EVENTS: readonly EventDef[] = [
    {
        // The original module never recorded a start date; use epoch so
        // `now >= startsAt` is always true and the active window collapses to
        // `now <= endsAt`, matching the legacy `Date.now() < endOf...` check.
        id: EVENT_IDS.HALLOWEEN_2024,
        startsAt: EPOCH,
        endsAt: new Date(1730700000000),
        endsInclusive: false,
    },
    {
        id: EVENT_IDS.CHRISTMAS_2024,
        startsAt: new Date(1732996800000),
        endsAt: new Date(1735772399000),
        startsInclusive: false,
        endsInclusive: false,
    },
    {
        id: EVENT_IDS.WINTER_2025,
        startsAt: new Date("2024-12-31"),
        endsAt: new Date("2025-01-20"),
    },
    {
        id: EVENT_IDS.CHINESE_NEW_YEAR_2025,
        startsAt: new Date(1738080000000),
        endsAt: new Date(1738080000000 + 14 * 24 * 60 * 60 * 1000),
    },
    {
        id: EVENT_IDS.THIRD_ANNIVERSARY,
        startsAt: new Date("2025-03-01"),
        endsAt: new Date("2025-03-21"),
    },
    {
        id: EVENT_IDS.HALLOWEEN_2025,
        startsAt: new Date(Date.UTC(2025, 9, 31, 0, 0, 0)),
        endsAt: new Date(Date.UTC(2025, 10, 14, 23, 59, 59)),
    },
    {
        id: EVENT_IDS.FOURTH_ANNIVERSARY,
        startsAt: new Date("2026-03-06"),
        endsAt: new Date("2026-03-30"),
    },
];

export const getEvent = (id: EventId): EventDef | undefined =>
    EVENTS.find((event) => event.id === id);

const isInsideWindow = (event: EventDef, now: Date): boolean => {
    const time = now.getTime();
    const startsAt = event.startsAt.getTime();
    const endsAt = event.endsAt.getTime();
    const startsAfter = event.startsInclusive === false ? time > startsAt : time >= startsAt;
    const endsBefore = event.endsInclusive === false ? time < endsAt : time <= endsAt;
    return startsAfter && endsBefore;
};

export const isActive = (id: EventId, now: Date = new Date()): boolean => {
    const event = getEvent(id);
    if (!event) return false;
    return isInsideWindow(event, now);
};

export const isEndingSoon = (
    id: EventId,
    withinMs: number,
    now: Date = new Date(),
): boolean => {
    const event = getEvent(id);
    if (!event || !isActive(id, now)) return false;
    return event.endsAt.getTime() - now.getTime() < withinMs;
};

export const getActive = (now: Date = new Date()): EventDef[] =>
    EVENTS.filter((event) => isInsideWindow(event, now));

// --- Command-entry hooks ----------------------------------------------------
//
// Some events ship logic that has to fire on every command (e.g. the 2025
// Chinese New Year quiz handler). Each event registers itself here at module
// load and `interactionCreate.ts` calls `runCommandEntryHooks(ctx)` once,
// without having to know which event modules exist or import them directly.
// Hooks are fire-and-forget by design: they self-gate on isActive() and a
// failure inside one event must not block command execution for the user.

// `unknown` for the ctx type avoids a circular import on
// CommandInteractionContext; the hook signatures are loose by intent — only
// the event modules know what they really need from ctx.
type CommandEntryHook = (ctx: unknown) => unknown | Promise<unknown>;

const commandEntryHooks: Map<EventId, CommandEntryHook[]> = new Map();

export const registerCommandEntryHook = (id: EventId, hook: CommandEntryHook): void => {
    const existing = commandEntryHooks.get(id) ?? [];
    existing.push(hook);
    commandEntryHooks.set(id, existing);
};

const reportCommandEntryHookError = (id: EventId, error: unknown): void => {
    // Surface to the existing console for now; promote to a structured logger
    // when src/utils/logger lands (PLAN P1.6).
    // eslint-disable-next-line no-console
    console.error(`Event hook for "${id}" threw:`, error);
};

export const runCommandEntryHooks = (ctx: unknown, now: Date = new Date()): void => {
    for (const event of getActive(now)) {
        const hooks = commandEntryHooks.get(event.id);
        if (!hooks) continue;
        for (const hook of hooks) {
            try {
                void Promise.resolve(hook(ctx)).catch((error: unknown) =>
                    reportCommandEntryHookError(event.id, error),
                );
            } catch (error) {
                reportCommandEntryHookError(event.id, error);
            }
        }
    }
};
