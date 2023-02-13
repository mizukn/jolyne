import { RPGUserDataJSON, SlashCommandFile, Leaderboard } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionCollector,
    ButtonInteraction,
    CacheType,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

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
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`
            )
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        const userPos =
            lastLeaderboard.data.findIndex((user) => user.id === ctx.user.id) + 1 || "N/A";

        const embed: APIEmbed = {
            title: "Leaderboard",
            description: "Loading...",
            color: 0x70926c,
            fields: [],
        };
        await ctx.makeMessage({ embeds: [embed] });
        let currentPage = 1;

        embed.description = `${ctx.client.localEmojis.replyEnd} 📍 Your position: \`${userPos}\`/\`${lastLeaderboard.data.length}\``;

        const previousPageButton = new ButtonBuilder()
            .setCustomId("previousPage")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary);
        const firstPageButton = new ButtonBuilder()
            .setCustomId("firstPage")
            .setEmoji("⏮️")
            .setStyle(ButtonStyle.Primary);
        const nextPageButton = new ButtonBuilder()
            .setCustomId("nextPage")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary);
        const lastPageButton = new ButtonBuilder()
            .setCustomId("lastPage")
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Primary);
        const userPageButton = new ButtonBuilder()
            .setCustomId("userPage")
            .setEmoji("📍")
            .setStyle(ButtonStyle.Secondary);

        function updateMessage(page: number) {
            currentPage = page;

            if (currentPage > Math.ceil(lastLeaderboard.data.length / 10)) {
                currentPage = Math.ceil(lastLeaderboard.data.length / 10);
            } else if (currentPage < 1) {
                currentPage = 1;
            }

            embed.footer = {
                text: `Page ${currentPage}/${Math.ceil(
                    lastLeaderboard.data.length / 10
                )} | Last updated: ${new Date(lastLeaderboard.lastUpdated).toLocaleString()}`,
            };

            switch (ctx.interaction.options.getSubcommand()) {
                case "level": {
                    embed.title = "Level Leaderboard";
                    // only users with page currentPage
                    embed.fields = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user, i) => ({
                            name: `${i + 1} - ${user.tag}`,
                            value: `${ctx.client.localEmojis.a_} Level **${user.level}** with  **${user.xp}** ${ctx.client.localEmojis.xp}`,
                            inline: false,
                        }));

                    break;
                }

                case "coins": {
                    embed.title = "Richest Players";
                    embed.fields = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user, i) => ({
                            name: `${i + 1} - ${user.tag}`,
                            value: `${ctx.client.localEmojis.a_} **${user.coins}** ${ctx.client.localEmojis.jocoins}`,
                            inline: false,
                        }));
                    break;
                }
            }
            ctx.makeMessage({
                embeds: [embed],
                components: [
                    Functions.actionRow([
                        firstPageButton,
                        previousPageButton,
                        userPageButton,
                        nextPageButton,
                        lastPageButton,
                    ]),
                ],
            });
        }

        updateMessage(currentPage);

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === ctx.user.id,
        });

        collector.on("collect", (interaction) => {
            if (!interaction.isButton()) return;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            interaction.deferUpdate().catch(() => {});

            switch (interaction.customId) {
                case "previousPage":
                    currentPage--;
                    break;
                case "firstPage":
                    currentPage = 1;
                    break;
                case "nextPage":
                    currentPage++;
                    break;
                case "lastPage":
                    currentPage = Math.ceil(lastLeaderboard.data.length / 10);
                    break;
                case "userPage":
                    currentPage = Math.ceil(userPos !== "N/A" ? userPos : 1 / 10);
                    break;
            }

            updateMessage(currentPage);
        });

        if (lastLeaderboard.lastUpdated + 1000 * 5 < Date.now()) {
            let query;
            switch (ctx.interaction.options.getSubcommand()) {
                case "level":
                    query = `SELECT id, tag, level, xp FROM "RPGUsers" ORDER BY level DESC, xp DESC`;
                    break;
                case "coins":
                    query = `SELECT id, tag, coins FROM "RPGUsers" ORDER BY coins DESC`;
                    break;
                default:
                    query = `SELECT * FROM "RPGUsers" ORDER BY level DESC, xp DESC`;
            }
            const data = await ctx.client.database.postgresql
                .query(query)
                .then((res) => res.rows)
                .catch((err) => {
                    console.error(err);
                    return [];
                });
            ctx.client.database.setString(
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`,
                JSON.stringify({
                    lastUpdated: Date.now(),
                    data: data,
                })
            );
        }
    },
};

export default slashCommand;
