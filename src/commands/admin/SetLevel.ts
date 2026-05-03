import { Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { SlashCommandFile } from "../../@types";
import { auditedAdminAction } from "../../utils/AdminAudit";

const slashCommand: SlashCommandFile = {
    data: {
        name: "adminsetlevel",
        description: "Admin: Set user level",
        options: [
            {
                name: "level",
                description: "Level to set",
                type: 4,
                required: true,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const level = ctx.options.getInteger("level", true);
        if (level > 4000) {
            return void ctx.makeMessage({
                content: "Level must be less than 4000",
            });
        }

        if (level < 1) {
            return void ctx.makeMessage({
                content: "Level must be greater than 0",
            });
        }

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        const before = { level: ctx.userData.level, xp: ctx.userData.xp, skillPoints: { ...ctx.userData.skillPoints } };

        ctx.userData.level = level;
        ctx.userData.xp = 0;

        if (Functions.getRawSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        const after = { level: ctx.userData.level, xp: ctx.userData.xp, skillPoints: { ...ctx.userData.skillPoints } };

        await ctx.client.database.saveUserData(ctx.userData);
        
        await auditedAdminAction(ctx, ctx.user.id, before, after, "SET_LEVEL");

        return void ctx.makeMessage({
            content: `Level set to ${level}`,
        });
    },
};

export default slashCommand;
