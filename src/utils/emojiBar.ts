import emojis from "../emojis.json";

type BarKind = "hp" | "sta" | "xp";

/**
 * Builds a discrete progress bar from custom Discord emojis.
 *
 * Layout: 1 begin cap + (segments-2) mid pips + 1 end cap.
 *
 * - The end cap only colors at 100% so a near-full bar doesn't read as full.
 * - The begin cap colors as soon as there's any progress, so a tiny sliver still shows.
 * - Mid pips use ceil so high-but-not-full looks "almost full" rather than rounded down.
 *
 * Falls back to Unicode `▱` for any emoji key that's missing from `emojis.json`,
 * so referring to a not-yet-uploaded palette (e.g. `xp` purple) renders cleanly.
 */
export function emojiBar(
    kind: BarKind,
    current: number,
    max: number,
    segments = 6
): string {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const inner = Math.max(0, segments - 2);
    const innerFilled = ratio === 0 ? 0 : Math.min(inner, Math.ceil(ratio * inner));
    const beginFilled = ratio > 0;
    const endFilled = ratio >= 1;

    const e = emojis as Record<string, string>;
    const pick = (palette: string, slot: "begin" | "mid" | "end") =>
        e[`bar_${palette}_${slot}`] ?? "▱";
    const out: string[] = [pick(beginFilled ? kind : "empty", "begin")];
    for (let i = 0; i < inner; i++) {
        out.push(pick(i < innerFilled ? kind : "empty", "mid"));
    }
    out.push(pick(endFilled ? kind : "empty", "end"));
    return out.join("");
}
