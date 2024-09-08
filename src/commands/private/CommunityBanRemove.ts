import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";
import Aes from "../../utils/Aes";

const slashCommand: SlashCommandFile = {
    data: {
        name: "communitybanremove",
        description: "yes unban user",
        options: [
            {
                name: "user",
                description: "user to unban",
                type: 6,
                required: true,
            },
        ],
    },
    adminOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const user = ctx.options.getUser("user", true);

        const data = await ctx.client.database.getRPGUserData(user.id);
        if (!data) {
            return await ctx.makeMessage({
                content: "User not found.",
            });
        }

        const hasBans = data.communityBans.filter((x) => x.until > Date.now());
        if (!hasBans.length) {
            return await ctx.makeMessage({
                content: "User is not banned.",
            });
        }

        data.communityBans.forEach((ban) => {
            if (ban.until > Date.now()) ban.until = Date.now();
        });

        ctx.client.database.saveUserData(data);

        return await ctx.makeMessage({
            content: `Successfully unbanned <@${user.id}>`,
        });
    },
};

export default slashCommand;
