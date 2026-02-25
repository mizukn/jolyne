import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { ClaimXQuest, Item, SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";
import * as Stands from "../../rpg/Stands";

const slashCommand: SlashCommandFile = {
    data: {
        name: "validatechapter",
        description: "instant valide chapter",
        options: [],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

        for (const chapter of ctx.userData.chapter.quests) {
            chapter.completed = true;
            console.log(chapter.id);
            if ((chapter as ClaimXQuest).goal) {
                (chapter as ClaimXQuest).amount = (chapter as ClaimXQuest).goal;
                console.log(
                    (chapter as ClaimXQuest).amount,
                    (chapter as ClaimXQuest).goal,
                    chapter.id,
                );
            }
        }

        await ctx.client.database.saveUserData(ctx.userData);

        ctx.makeMessage({
            content: `Chapter validated.`,
        });
    },
};

export default slashCommand;
