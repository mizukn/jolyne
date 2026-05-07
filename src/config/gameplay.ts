// Centralized gameplay constants. Anything timing-related for the combat
// stack (fights, dungeons, the watchdog) belongs here so the three windows
// stop drifting against each other (see BRAINSTORM TL;DR §3).

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

// FightHandler — per-turn timing.
export const FIGHT_TURN_TIMEOUT_MS = 45 * SECOND_MS;
export const FIGHT_NPC_DECISION_DELAY_MS = 1 * SECOND_MS;
export const FIGHT_END_GRACE_MS = 700;

// FightHandler — fight-level limits.
export const FIGHT_TOTAL_TIMEOUT_MS = 15 * MINUTE_MS;
export const FIGHT_CHANNEL_CONCURRENCY_WINDOW_MS = 30 * MINUTE_MS;

// DungeonHandler.
export const DUNGEON_HEARTBEAT_MS = 1 * SECOND_MS;
export const DUNGEON_PRE_FIGHT_DELAY_MS = 3 * SECOND_MS;
export const DUNGEON_BETWEEN_ROOMS_DELAY_MS = 5 * SECOND_MS;
export const DUNGEON_NEXT_ROOM_MESSAGE_AGE_MS = 15 * MINUTE_MS;
export const DUNGEON_SAFE_TIMEOUT_MS = 16 * MINUTE_MS;
export const DUNGEON_RETRY_END_DELAY_MS = 1 * SECOND_MS;
export const DUNGEON_FALLBACK_END_DELAY_MS = 5 * SECOND_MS;

// FightHandlerWatchdog. The hard age cap must stay >= FIGHT_TOTAL_TIMEOUT_MS
// (otherwise the watchdog ends fights that the FightHandler still considers
// in-progress) and must stay <= FIGHT_CHANNEL_CONCURRENCY_WINDOW_MS (otherwise
// the concurrency check ignores fights the watchdog hasn't killed yet).
export const WATCHDOG_TICK_MS = 1 * MINUTE_MS;
export const WATCHDOG_STALE_TICKS_THRESHOLD = 3;
export const WATCHDOG_FIGHT_MAX_AGE_MS = 30 * MINUTE_MS;
