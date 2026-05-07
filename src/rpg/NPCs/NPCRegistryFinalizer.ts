import * as FightableNPCs from "./FightableNPCs";
import * as NPCs from "./NPCs";
import * as Functions from "../../utils/Functions";

export const finalizeNPCRegistry = (): void => {
    for (const NPC of [...Object.values(NPCs), ...Object.values(FightableNPCs)]) {
        if (!NPC.avatarURL)
            NPC.avatarURL = `https://cdn.discordapp.com/emojis/${Functions.getEmojiId(NPC.emoji)}.png`;
    }

    for (const NPC of Object.values(FightableNPCs)) {
        if (process.env.ENABLE_PRESTIGE && NPC.level > 800) NPC.level = 800;
        if (!NPC.rewards) NPC.rewards = {};
        Functions.fixNpcRewards(NPC);
    }
};
