import { Quest } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as Functions from "../../utils/Functions";

export const AwakenYourStand: Quest = {
    type: "baseQuest",
    id: "getstand",
    i18n_key: "AWAKE_STAND",
    emoji: Emojis.mysterious_arrow,
    completed: (user) => {
        if (Functions.findStand(user.stand)) return 100;

        return 0;
    },
    hintCommand: "inventory use",
};

export const InvestSkillPoints: Quest = {
    type: "baseQuest",
    id: "invest_skill_points",
    i18n_key: "INVEST_SKILL_POINTS",
    emoji: "➕",
    completed: (user) => {
        return Functions.getSkillPointsLeft(user) / user.level * 3;
    },
    hintCommand: "skill points invest",
};


export const CompleteBeginnerSideQuest: Quest = {
    type: "baseQuest",
    id: "complete_beginner_side_quest",
    i18n_key: "COMPLETE_BEGINNER_SIDE_QUEST",
    emoji: Emojis.mysterious_arrow,
    completed: (user) => {
        if (user.sideQuests.find((x) => x.id === "Beginner")) {
            if (user.sideQuests.find((x) => x.id === "Beginner").claimedPrize) return 100;
            return 0;
        }

        return 100;
    },
    hintCommand: "side quest view",
};
