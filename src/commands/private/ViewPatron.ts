import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";
import Aes from "../../utils/Aes";

const slashCommand: SlashCommandFile = {
    data: {
        name: "viewpatron",
        description: "REstores streakk",
        options: [
            {
                name: "user",
                description: "user ID",
                type: 6,
                required: true,
            },
        ],
    },
    adminOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const userid = ctx.options.getUser("user", true);

        return ctx.client.commands.get("patreon")?.execute(ctx, userid.id);
    },
};

export default slashCommand;
