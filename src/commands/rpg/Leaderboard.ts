import { RPGUserDataJSON, SlashCommandFile } from "../../@types";
import { Message, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

interface Leaderboard {
    lastUpdated: number;
    data: {
        tag: string;
        level: number;
        xp: number;
        coins: number;
    }[];
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "leaderboard",
        description: "Shows the leaderboard",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "level",
                description: "Shows the level leaderboard",
                type: 1,
            },
            {
                name: "coins",
                description: "Shows the richest players",
                type: 1,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const lastLeaderboard = (JSON.parse(
            await ctx.client.database.getString(
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}}`
            )
        ) as Leaderboard) || { lastUpdated: 0, data: [] };

        switch (ctx.interaction.options.getSubcommand()) {
            case "level": {
            }
        }

        if (lastLeaderboard.lastUpdated + 1000 * 5 > Date.now()) {
            let query;
            switch (ctx.interaction.options.getSubcommand()) {
                case "level":
                    query = `SELECT tag, level, xp FROM "RPGUsers" ORDER BY level DESC, xp DESC`;
                    break;
                case "coins":
                    query = `SELECT tag, coins FROM "RPGUsers" ORDER BY coins DESC`;
                    break;
            }
            const data = await ctx.client.database.postgresql
                .query(query)
                .then((res) => res.rows.map)
                .catch((err) => {
                    console.error(err);
                    return [];
                });
            ctx.client.database.setString(
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`,
                JSON.stringify({
                    lastUpdated: Date.now(),
                    data,
                })
            );
        }
    },
};

export default slashCommand;
