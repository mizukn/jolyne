import { types } from "pg";

// Postgres bigint columns (OID 20) come back from node-postgres as strings by
// default, to preserve precision past 2^53. The fields we store as bigint
// (`adventureStartedAt`, `restingAtCampfire`, `lastPatreonReward`) are all
// millisecond timestamps and stay well within Number.MAX_SAFE_INTEGER, so we
// register a global parser that returns numbers directly. This drops the need
// for the `Number(...)` casts that previously littered every read site.
//
// Interim fix: once the rework is done, migrate those columns to `timestamptz`
// and read them as `Date` objects directly. Tracked by PLAN.md P4.4.
types.setTypeParser(types.builtins.INT8, Number);
