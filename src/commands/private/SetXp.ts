import { Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { SlashCommandFile } from "../../@types";
import { auditedAdminAction } from "../../utils/AdminAudit";

const slashCommand: SlashCommandFile = {
    data: {
        name: "adminsetxp",
        description: "Admin: Set user XP",
        options: [
            {
                name: "xp",
                description: "XP to set",
                type: 4,
                required: true,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const xp = ctx.options.getInteger("xp", true);
        
        if (xp < 0) {
            return void ctx.makeMessage({
                content: "XP must be greater than or equal to 0.",
            });
        }

        if (xp > 2147483647) {
            return void ctx.makeMessage({
                content: "XP DOES NOT FIT IN A 32-BIT SIGNED INTEGER",
            });
        }

        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        const before = { xp: ctx.userData.xp, skillPoints: { ...ctx.userData.skillPoints } };
        
        ctx.userData.xp = xp;

        if (Functions.getRawSkillPointsLeft(ctx.userData) < 0) {
            for (const key in ctx.userData.skillPoints) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] = 0;
            }
        }

        const after = { xp: ctx.userData.xp, skillPoints: { ...ctx.userData.skillPoints } };

        await ctx.client.database.saveUserData(ctx.userData);
        
        await auditedAdminAction(ctx, ctx.user.id, before, after, "SET_XP");

        return void ctx.makeMessage({
            content: `XP set to ${xp}`,
        });
    },
};

export default slashCommand;
