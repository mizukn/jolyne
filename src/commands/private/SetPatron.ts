import { SlashCommandFile } from "../../@types";
import { APIEmbed, ButtonBuilder, ButtonStyle, InteractionResponse, Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { Patron } from "../../structures/JolyneClient";
import { text } from "node:stream/consumers";
import color from "get-image-colors";

const tiers = {
    1: "Supporter",
    2: "Ascended Supporter",
    3: "Heaven Ascended Supporter",
    4: "Over Heaven Supporter",
    0: "Former Supporter",
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "setpatron",
        description: "yes",
        options: [
            {
                name: "user",
                description: "If the message should be public (everyone can see it)",
                type: 6,
                required: true,
            },
            {
                name: "name",
                description: "bame",
                type: 3,
                required: true,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<InteractionResponse | Message | void> => {
        const user = ctx.options.getUser("user", true);
        const name = ctx.options.getString("name", true);

        await ctx.client.database.setString(`patronCache_${name}`, user.id);
        await ctx.makeMessage({
            content: `Set ${user.username} as ${name}`,
            ephemeral: true,
        });
    },
};

export default slashCommand;
