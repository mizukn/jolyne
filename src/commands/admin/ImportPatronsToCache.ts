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
        name: "importpatronstocache",
        description: "yes",
        options: [
            {
                name: "stringifiedjson",
                description: "The stringified JSON of the patrons",
                type: 3,
                required: true,
            },
        ],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<InteractionResponse | Message | void> => {
        const data = ctx.options.getString("stringifiedjson", true);
        const parsedData = JSON.parse(data) as { key: string; user: string }[];

        await Promise.all(
            parsedData.map(async (x) => {
                await ctx.client.database.redis.set(x.key, x.user);
            })
        );

        await ctx.makeMessage({
            content: `Imported ${parsedData.length} patrons`,
            ephemeral: true,
        });
    },
};

export default slashCommand;
