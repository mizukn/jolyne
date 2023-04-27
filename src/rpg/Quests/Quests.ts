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
