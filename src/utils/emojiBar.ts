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
 * Empty positions fall back to a Unicode placeholder (`▱`) until empty-pip emojis
 * are uploaded; swap `bar_empty_*` in `emojis.json` once available.
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
    const out: string[] = [e[`bar_${beginFilled ? kind : "empty"}_begin`]];
    for (let i = 0; i < inner; i++) {
        out.push(e[`bar_${i < innerFilled ? kind : "empty"}_mid`]);
    }
    out.push(e[`bar_${endFilled ? kind : "empty"}_end`]);
    return out.join("");
}
