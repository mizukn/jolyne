import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "djstart",
        description: "Starts intantly a dungeon",
        options: [
            {
                name: "stage",
                description: "Stage of the dungeon",
                type: 4,
                required: true
            },
            {
                name: "user",
                description: "User to start the dungeon",
                type: 6,
                required: false
            }
        ]
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        // return COMMAND disabled because too easy to win money
        /* return void ctx.makeMessage({
            content: `This command is disabled because it is too easy to win money. Please use the slot machine instead. This command may or may not be re-enabled in the future.`,
        });*/
        const userOption = ctx.options.getUser("user", false);
        const stage = ctx.options.getInteger("stage", true);
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(
            userOption ? userOption.id : ctx.user.id
        );

        ctx.client.commands.get("dungeon")?.execute(ctx, stage);
    }
};

export default slashCommand;
