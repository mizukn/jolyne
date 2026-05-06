import { RPGUserDataJSON, SlashCommandFile, Leaderboard } from "../../@types";
import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { containers, V2Reply } from "../../utils/containers";

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
            {
                name: "items",
                description: "Shows the most owned items",
                type: 1,
                options: [
                    {
                        name: "reverse",
                        description: "Reverse the leaderboard",
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: "daily",
                description: "Shows the users with the highest daily streak",
                type: 1,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const startDate = Date.now();
        const subcommand = ctx.interaction.options.getSubcommand();
        let query;
        switch (subcommand) {
            case "level":
                query = `SELECT id, tag, level, xp,"communityBans"
                             FROM "RPGUsers"
                             ORDER BY level DESC, xp DESC`;
                break;
            case "coins":
                query = `SELECT id, tag, coins,"communityBans"
                             FROM "RPGUsers"
                             ORDER BY coins DESC`;
                break;
            case "items":
                query = `SELECT inventory,"communityBans"
                             FROM "RPGUsers"`;
                break;
            case "daily":
                query = `SELECT id, tag, daily,"communityBans"
                             FROM "RPGUsers"
                             ORDER BY daily->>'claimStreak' DESC`;
                break;
            default:
                query = `SELECT *
                             FROM "RPGUsers"
                             ORDER BY level DESC, xp DESC`;
        }
        const data = await ctx.client.database.postgresql
            .query(query)
            .then((res) => res.rows.filter((x) => !Functions.userIsCommunityBanned(x)))
            .catch((err) => {
                ctx.client.log(err, "error");
                return [];
            });
        await ctx.client.database.setString(
            `${ctx.client.user.id}_leaderboard:${subcommand}`,
            JSON.stringify({
                lastUpdated: Date.now(),
                data: data,
            })
        );
        ctx.client.log(
            `Leaderboard ${subcommand} took ${Date.now() - startDate}ms to update`,
            "cmd"
        );

        const lastLeaderboard = (JSON.parse(
            await ctx.client.database.getString(
                `${ctx.client.user.id}_leaderboard:${subcommand}`
            )
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        lastLeaderboard.data = lastLeaderboard.data.filter(
            (x) => !Functions.userIsCommunityBanned(x)
        );
        let userPos: "N/A" | number =
            lastLeaderboard.data.findIndex((user) => user.id === ctx.user.id) + 1 || "N/A";

        if (subcommand === "daily") {
            for (const user of lastLeaderboard.data) {
                const userData = user.daily as RPGUserDataJSON["daily"];
                if (userData.lastClaimed + 1000 * 60 * 60 * 48 < Date.now()) {
                    userData.claimStreak = 0;
                }
            }
            lastLeaderboard.data.sort((a, b) => b.daily.claimStreak - a.daily.claimStreak);
            userPos =
                lastLeaderboard.data.findIndex((user) => user.id === ctx.user.id) + 1 || "N/A";
        }

        let currentPage = 1;
        const previousPageButton = new ButtonBuilder()
            .setCustomId("previousPage" + ctx.interaction.id)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary);
        const firstPageButton = new ButtonBuilder()
            .setCustomId("firstPage" + ctx.interaction.id)
            .setEmoji("⏮️")
            .setStyle(ButtonStyle.Primary);
        const nextPageButton = new ButtonBuilder()
            .setCustomId("nextPage" + ctx.interaction.id)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary);
        const lastPageButton = new ButtonBuilder()
            .setCustomId("lastPage" + ctx.interaction.id)
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Primary);
        const userPageButton = new ButtonBuilder()
            .setCustomId("userPage" + ctx.interaction.id)
            .setEmoji("📍")
            .setDisabled(userPos === "N/A" || subcommand === "items")
            .setStyle(ButtonStyle.Secondary);

        const totalItems = lastLeaderboard.data.map((user) => user.inventory);
        const totalItemsAmount = totalItems.reduce((acc, val) => {
            for (const item in val) {
                if (acc[item]) {
                    acc[item] += val[item];
                } else {
                    acc[item] = val[item];
                }
            }
            return acc;
        }, {});
        const totalItemsK = Object.values(totalItemsAmount).reduce((a: number, b) => a + (b as number), 0);
        const totalPages =
            subcommand === "items"
                ? Math.ceil(Object.keys(totalItemsAmount).length / 10)
                : Math.ceil(lastLeaderboard.data.length / 10);

        function buildReply(page: number): V2Reply {
            currentPage = page;
            if (currentPage > totalPages) currentPage = totalPages;
            else if (currentPage < 1) currentPage = 1;

            let title: string;
            let lines: string[];

            switch (subcommand) {
                case "level": {
                    title = "Level Leaderboard";
                    lines = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user) => {
                            const rank =
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1;
                            return `**${rank} - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}**\n${ctx.client.localEmojis.a_} Level **${user.level.toLocaleString("en-US")}** with **${user.xp.toLocaleString()}** ${ctx.client.localEmojis.xp}`;
                        });
                    break;
                }
                case "coins": {
                    title = "Richest Players";
                    lines = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user) => {
                            const rank =
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1;
                            return `**${rank} - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}**\n${ctx.client.localEmojis.a_} **${user.coins.toLocaleString("en-US")}** ${ctx.client.localEmojis.jocoins}`;
                        });
                    break;
                }
                case "items": {
                    const reverse = ctx.interaction.options.getBoolean("reverse", false);
                    title = `${reverse ? "Less" : "Most"} Owned Items`;
                    lines = Object.entries(totalItemsAmount)
                        .sort((a, b) => (reverse ? (a[1] as number) - (b[1] as number) : (b[1] as number) - (a[1] as number)))
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map(([itemID, amount], i) => {
                            const item = Functions.findItem(itemID);
                            const ownedByXUsers = totalItems.filter((x) => x[itemID] > 0).length;
                            return `**${(currentPage - 1) * 10 + i + 1} - ${item.name} ${item.emoji}**\n${ctx.client.localEmojis.replyEnd} \`${(amount as number).toLocaleString("en-US")}\` copies owned by **${ownedByXUsers.toLocaleString("en-US")}** players (${(((amount as number) / totalItemsK) * 100).toFixed(2)}%)`;
                        });
                    break;
                }
                case "daily": {
                    title = "Highest Daily Streaks";
                    lines = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user) => {
                            const rank =
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1;
                            return `**${rank} - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}**\n${ctx.client.localEmojis.replyEnd} **${user.daily.claimStreak}** days in a row 📅`;
                        });
                    break;
                }
                default: {
                    title = "Leaderboard";
                    lines = [];
                }
            }

            const posLine =
                subcommand !== "items"
                    ? `${ctx.client.localEmojis.replyEnd} 📍 Your position: \`${userPos}\`/\`${lastLeaderboard.data.length}\`\n\n`
                    : `:information_source: There are \`${totalItemsK.toLocaleString("en-US")}\` items in the game\n\n`;

            let footer = `Page ${currentPage}/${totalPages} | Last updated: ${new Date(
                lastLeaderboard.lastUpdated
            ).toLocaleString()}`;
            if (lastLeaderboard.lastUpdated + 1000 * 60 * 60 * 6 < Date.now()) {
                footer += `\n⚠️ Outdated — use ${ctx.client.getSlashCommandMention(
                    `leaderboard ${subcommand}`
                )} to refresh`;
            }

            const reply = containers.primary({
                title,
                description: posLine + lines.join("\n\n"),
                footer,
            });
            reply.components.push(
                Functions.actionRow([
                    firstPageButton,
                    previousPageButton,
                    userPageButton,
                    nextPageButton,
                    lastPageButton,
                ])
            );
            return reply;
        }

        await ctx.makeMessage(buildReply(currentPage));

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                interaction.user.id === ctx.user.id &&
                interaction.customId.includes(ctx.interaction.id),
        });

        collector.on("collect", (interaction) => {
            if (!interaction.isButton()) return;
            interaction.deferUpdate().catch(() => {});

            switch (interaction.customId.replace(ctx.interaction.id, "")) {
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
                    currentPage = totalPages;
                    break;
                case "userPage":
                    currentPage = Math.ceil(userPos !== "N/A" ? userPos / 10 : 1 / 10);
                    break;
            }

            ctx.makeMessage(buildReply(currentPage));
        });
    },
};

export default slashCommand;
