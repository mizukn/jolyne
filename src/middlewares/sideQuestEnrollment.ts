import * as SideQuests from "../rpg/SideQuests";

import { getSideQuestRequirements, pushQuest } from "../utils/Functions";

import type { Middleware, MiddlewareDecision } from "./types";

// Walks every defined SideQuest each command-tick and reconciles enrollment:
//   - If the user now meets the requirements and isn't enrolled → enroll them.
//   - If the user no longer meets the requirements AND the side quest opted
//     into `cancelQuestIfRequirementsNotMetAnymore` (or has zero remaining
//     quest steps and no claimed prize) → drop them.
//
// Notifications go onto the shared `pipeline.notifications` array so the
// save middleware can fold them into a single follow-up at the end.
export const sideQuestEnrollmentMiddleware: Middleware = (input): MiddlewareDecision => {
    const { ctx } = input;
    if (!ctx?.userData) return { stop: false };

    const notifications = (input.notifications ??= []);

    for (const sideQuest of Object.values(SideQuests)) {
        const status = getSideQuestRequirements(sideQuest, ctx);
        const enrollment = ctx.userData.sideQuests.find((r) => r.id === sideQuest.id);

        if (status.status) {
            if (enrollment) continue;
            const fixedQuests = sideQuest.quests(ctx).map((v) => pushQuest(v));
            ctx.userData.sideQuests.push({ id: sideQuest.id, quests: fixedQuests });
            notifications.push(
                `${sideQuest.emoji} | You now have the **${sideQuest.title}** SideQuest! (${ctx.client.getSlashCommandMention(
                    "quests side view",
                )})`,
            );
            continue;
        }

        if (!enrollment) continue;
        const droppable =
            sideQuest.cancelQuestIfRequirementsNotMetAnymore ||
            (enrollment.quests && enrollment.quests.length === 0);
        if (!droppable) continue;
        if (enrollment.claimedPrize) continue;

        ctx.userData.sideQuests = ctx.userData.sideQuests.filter((r) => r.id !== sideQuest.id);
        notifications.push(
            `:x: | You no longer meet the requirements for the **${sideQuest.title}** sidequest, so it has been removed from your sidequests list. Sorry! All your progress on it has been lost.\n\n${status.notMeet}`,
        );
    }

    return { stop: false };
};
