import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { Item, SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";
import * as Stands from "../../rpg/Stands";

const totalStands = [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => {
        return {
            ...x.evolutions[0],
            id: x.id,
        };
    }),
];

const slashCommand: SlashCommandFile = {
    data: {
        name: "adminsetlevel",
        description: "instant setlevel",
        options: [
            {
                name: "level",
                description: "level to set",
                type: 4,
                required: true,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        // return COMMAND disabled because too easy to win money
        /* return void ctx.makeMessage({
            content: `This command is disabled because it is too easy to win money. Please use the slot machine instead. This command may or may not be re-enabled in the future.`,
        });*/
        const level = ctx.options.getInteger("level", true);
        if (level > 2000) {
            return void ctx.makeMessage({
                content: "Level must be less than 2000",
            });
        }

        if (level < 1) {
            return void ctx.makeMessage({
                content: "Level must be greater than 0",
            });
        }

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        ctx.userData.level = level;
        ctx.userData.xp = 0;

        if (Functions.getSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        await ctx.client.database.saveUserData(ctx.userData);

        ctx.makeMessage({
            content: `Level set to ${level}`,
        });
    },
};

export default slashCommand;
