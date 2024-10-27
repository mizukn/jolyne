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
        name: "adminsetxp",
        description: "instant xp",
        options: [
            {
                name: "xp",
                description: "xp to set",
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
        const xp = ctx.options.getInteger("xp", true);
        if (xp > 2147483647) {
            return void ctx.makeMessage({
                content: "XP DOES NOT FIT IN A 32-BIT SIGNED INTEGER",
            });
        }

        if (xp < -2147483648) {
            return void ctx.makeMessage({
                content: "XP DOES NOT FIT IN A 32-BIT SIGNED INTEGER",
            });
        }

        // 	-2147483648 to +2147483647

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        ctx.userData.xp = xp;

        if (Functions.getSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        await ctx.client.database.saveUserData(ctx.userData);

        ctx.makeMessage({
            content: `XP set to ${xp}`,
        });
    },
};

export default slashCommand;
