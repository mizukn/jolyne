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
        name: "adminsetprestige",
        description: "instant prestige",
        options: [
            {
                name: "prestige",
                description: "prestige to set",
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
        const prestige = ctx.options.getInteger("prestige", true);
        if (prestige > 4000) {
            return void ctx.makeMessage({
                content: "prestige must be less than 4000",
            });
        }

        if (prestige < -1) {
            return void ctx.makeMessage({
                content: "prestige must be greater than -1",
            });
        }

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        ctx.userData.prestige = prestige;

        if (Functions.getSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        await ctx.client.database.saveUserData(ctx.userData);

        ctx.makeMessage({
            content: `prestige set to ${prestige}`,
        });
    },
};

export default slashCommand;
