import {
    addEmail,
} from "../services/UserService";
import { addItem } from "../services/InventoryService";
import {
    findEmail,
    findItem,
    findQuest,
    generateMustReadEmailQuest,
    generateWaitQuest,
    isUseXCommandQuest,
    isWaitQuest,
    percent,
    pushQuest,
} from "../utils/Functions";

import type { RPGUserDataJSON, RPGUserQuest } from "../@types";
import type { Middleware, MiddlewareDecision } from "./types";

// Walks every quest the user has across daily / chapter / each sidequest and
// applies the queued side effects:
//
//   pushEmailWhenCompleted  → either schedule a wait quest (if `timeout`) or
//                             grant the mail immediately (+ optional
//                             must-read follow-up quest).
//   pushQuestWhenCompleted  → enqueue a follow-up quest in the same list.
//   pushItemWhenCompleted   → grant items (with optional drop chance) and
//                             notify the user line by line.
//   isUseXCommandQuest      → bump `quest.amount` if the current command
//                             matches.
//   isWaitQuest (expired)   → mark claimed, grant the queued mail/quest.
//
// Each effect zeroes its trigger field after firing so it doesn't double-
// fire on the next command.
const findQuestList = (
    userData: RPGUserDataJSON,
    questId: string,
): RPGUserQuest[] | undefined => {
    if (userData.chapter.quests.find((r) => r.id === questId)) return userData.chapter.quests;
    if (userData.daily.quests.find((r) => r.id === questId)) return userData.daily.quests;
    for (const sideQuest of userData.sideQuests) {
        if (sideQuest.quests.find((r) => r.id === questId)) return sideQuest.quests;
    }
    return undefined;
};

export const questEffectsMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx, commandName } = input;
    if (!ctx?.userData) return { stop: false };

    const notifications = (input.notifications ??= []);

    for (const quests of [
        ctx.userData.daily.quests,
        ctx.userData.chapter.quests,
        ...ctx.userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests) {
            if (quest.pushEmailWhenCompleted && quest.completed) {
                const mailData = findEmail(quest.pushEmailWhenCompleted.email);
                if (quest.pushEmailWhenCompleted.timeout) {
                    quests.push(
                        generateWaitQuest(
                            quest.pushEmailWhenCompleted.timeout,
                            mailData.id,
                            null,
                            null,
                            quest.pushEmailWhenCompleted.mustRead,
                        ),
                    );
                } else {
                    addEmail(ctx.userData, quest.pushEmailWhenCompleted.email);
                    if (quest.pushEmailWhenCompleted.mustRead) {
                        quests.push(generateMustReadEmailQuest(mailData));
                    }
                }
                quest.pushEmailWhenCompleted = null;
            }

            if (quest.pushQuestWhenCompleted && quest.completed) {
                if (!quests.find((x) => x.id === quest.pushQuestWhenCompleted.id))
                    quests.push(quest.pushQuestWhenCompleted);
                quest.pushQuestWhenCompleted = null;
            }

            if (quest.pushItemWhenCompleted && quest.completed) {
                for (const item of quest.pushItemWhenCompleted) {
                    const itemData = findItem(item.item);
                    if (!itemData) continue;
                    const grant = !item.chance || percent(item.chance);
                    if (!grant) continue;
                    addItem(ctx.userData, item.item, item.amount);
                    notifications.push(
                        `-# You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest [${quest.type}:${quest.id}].`,
                    );
                }
                quest.pushItemWhenCompleted = null;
            }

            if (commandName && isUseXCommandQuest(quest) && quest.command === commandName) {
                quest.amount++;
            }

            if (isWaitQuest(quest) && !quest.claimed && quest.end < Date.now()) {
                quest.claimed = true;
                if (quest.email) {
                    const mailData = findEmail(quest.email);
                    addEmail(ctx.userData, quest.email);
                    if (quest.mustRead) {
                        quests.push(generateMustReadEmailQuest(mailData));
                    }
                }
                if (quest.quest) {
                    const questData = findQuest(quest.quest);
                    if (questData) {
                        const list = findQuestList(ctx.userData, quest.id);
                        if (list) list.push(pushQuest(questData));
                    }
                }
            }
        }
    }

    return { stop: false };
};
