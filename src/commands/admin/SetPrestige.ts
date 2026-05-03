import { Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { SlashCommandFile } from "../../@types";
import { auditedAdminAction } from "../../utils/AdminAudit";

const slashCommand: SlashCommandFile = {
    data: {
        name: "adminsetprestige",
        description: "Admin: Set user prestige",
        options: [
            {
                name: "prestige",
                description: "Prestige to set",
                type: 4,
                required: true,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const prestige = ctx.options.getInteger("prestige", true);
        if (prestige > 4000) {
            return void ctx.makeMessage({
                content: "prestige must be less than 4000",
            });
        }

        if (prestige < 0) {
            return void ctx.makeMessage({
                content: "prestige must be greater than or equal to 0",
            });
        }

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        const before = { prestige: ctx.userData.prestige, skillPoints: { ...ctx.userData.skillPoints } };

        ctx.userData.prestige = prestige;

        if (Functions.getRawSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        const after = { prestige: ctx.userData.prestige, skillPoints: { ...ctx.userData.skillPoints } };

        await ctx.client.database.saveUserData(ctx.userData);
        
        await auditedAdminAction(ctx, ctx.user.id, before, after, "SET_PRESTIGE");

        return void ctx.makeMessage({
            content: `prestige set to ${prestige}`,
        });
    },
};

export default slashCommand;
