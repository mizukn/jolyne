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
        name: "exportpatronsfromcache",
        description: "yes",
        options: [],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<InteractionResponse | Message | void> => {
        const patrons = await ctx.client.database.redis.keys("patronCache_*");

        const results = await Promise.all(
            patrons.map(async (key) => {
                const user = await ctx.client.database.redis.get(key);
                return { key, user };
            })
        );

        ctx.makeMessage({
            embeds: [
                {
                    description: JSON.stringify(results),
                },
            ],
            ephemeral: true,
        });
    },
};

export default slashCommand;
