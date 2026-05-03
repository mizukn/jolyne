import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";
import Aes from "../../utils/Aes";

const slashCommand: SlashCommandFile = {
    data: {
        name: "communityban",
        description: "yes ban user",
        options: [
            {
                name: "user",
                description: "user to ban",
                type: 6,
                required: true
            },
            {
                name: "reason",
                description: "reason for ban",
                type: 3,
                required: true
            },
            {
                name: "duration",
                description: "duration of ban (in hours)",
                type: 4,
                required: true
            }
        ]
    },
    adminOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const user = ctx.options.getUser("user", true);
        const reason = ctx.options.getString("reason", true);
        const duration = ctx.options.getInteger("duration", true);

        const data = await ctx.client.database.getRPGUserData(user.id);
        if (!data) {
            return await ctx.makeMessage({
                content: "User not found."
            });
        }

        data.communityBans.push({
            reason,
            bannedAt: Date.now(),
            until: Date.now() + duration * 60 * 60 * 1000
        });

        await ctx.client.database.saveUserData(data);

        return await ctx.makeMessage({
            content: `Successfully banned <@${user.id}> until ${Functions.generateDiscordTimestamp(
                Date.now() + duration * 60 * 60 * 1000,
                "FROM_NOW"
            )}`
        });
    }
};

export default slashCommand;
