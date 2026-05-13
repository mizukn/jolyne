// Quests are appended-to from many places (quest factories, event hooks,
// retroactive emails, admin tools). Duplicates can sneak in if two writers
// add the same quest id in the same tick. This middleware guarantees the
// per-user quest arrays carry each id at most once before downstream
// middlewares act on them.

import type { Middleware } from "./types";
import type { RPGUserQuest } from "../@types";

function uniqueById(quests: RPGUserQuest[]): RPGUserQuest[] {
    const seen = new Set<string>();
    const out: RPGUserQuest[] = [];
    for (const quest of quests) {
        if (seen.has(quest.id)) continue;
        seen.add(quest.id);
        out.push(quest);
    }
    return out;
}

export const questDeduplicationMiddleware: Middleware = ({ ctx }) => {
    if (!ctx?.userData) return { stop: false };

    ctx.userData.chapter.quests = uniqueById(ctx.userData.chapter.quests);
    ctx.userData.daily.quests = uniqueById(ctx.userData.daily.quests);
    ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
        (sq) => sq && sq.quests?.length > 0,
    );
    for (const sideQuest of ctx.userData.sideQuests) {
        sideQuest.quests = uniqueById(sideQuest.quests);
    }

    return { stop: false };
};
