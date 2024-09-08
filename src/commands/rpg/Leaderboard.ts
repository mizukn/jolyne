import { RPGUserDataJSON, SlashCommandFile, Leaderboard } from "../../@types";
import { Message, APIEmbed, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
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
            {
                name: "items",
                description: "Shows the most owned items",
                type: 1,
                // reverse option
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
        // refresh:

        const startDate = Date.now();
        let query;
        switch (ctx.interaction.options.getSubcommand()) {
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
            case "items": // most owned items
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
                console.error(err);
                return [];
            });
        await ctx.client.database.setString(
            `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`,
            JSON.stringify({
                lastUpdated: Date.now(),
                data: data,
            })
        );
        console.log(
            `Leaderboard ${ctx.interaction.options.getSubcommand()} took ${
                Date.now() - startDate
            }ms to update`
        );

        const lastLeaderboard = (JSON.parse(
            await ctx.client.database.getString(
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`
            )
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        lastLeaderboard.data = lastLeaderboard.data.filter(
            (x) => !Functions.userIsCommunityBanned(x)
        );
        let userPos: "N/A" | number =
            lastLeaderboard.data.findIndex((user) => user.id === ctx.user.id) + 1 || "N/A";
        if (ctx.interaction.options.getSubcommand() === "daily") {
            for (const user of lastLeaderboard.data) {
                const userData = user.daily as RPGUserDataJSON["daily"];
                // check if last time user claimed exceeds 25 hours
                if (userData.lastClaimed + 1000 * 60 * 60 * 48 < Date.now()) {
                    userData.claimStreak = 0;
                }
            }

            lastLeaderboard.data.sort((a, b) => b.daily.claimStreak - a.daily.claimStreak);
            userPos =
                lastLeaderboard.data.findIndex((user) => user.id === ctx.user.id) + 1 || "N/A";
        }

        const embed: APIEmbed = {
            title: "Leaderboard",
            description: "Loading...",
            color: 0x70926c,
            fields: [],
        };

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
            .setDisabled(userPos === "N/A" || ctx.interaction.options.getSubcommand() === "items")
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
        const totalItemsK = Object.values(totalItemsAmount).reduce((a, b) => a + b, 0);
        const totalPages =
            ctx.interaction.options.getSubcommand() === "items"
                ? Math.ceil(Object.keys(totalItemsAmount).length / 10)
                : Math.ceil(lastLeaderboard.data.length / 10);

        function updateMessage(page: number) {
            currentPage = page;

            if (currentPage > totalPages) {
                currentPage = totalPages;
            } else if (currentPage < 1) {
                currentPage = 1;
            }

            embed.footer = {
                text: `Page ${currentPage}/${totalPages} | Last updated: ${new Date(
                    lastLeaderboard.lastUpdated
                ).toLocaleString()}`,
            };

            switch (ctx.interaction.options.getSubcommand()) {
                case "level": {
                    embed.title = "Level Leaderboard";
                    // only users with page currentPage
                    embed.fields = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user, i) => ({
                            name: `${
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1 || "N/A"
                            } - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}`,
                            value: `${
                                ctx.client.localEmojis.a_
                            } Level **${user.level.toLocaleString(
                                "en-US"
                            )}** with **${user.xp.toLocaleString("en-US")}** ${
                                ctx.client.localEmojis.xp
                            }`,
                            inline: false,
                        }));

                    break;
                }

                case "coins": {
                    embed.title = "Richest Players";
                    embed.fields = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user, i) => ({
                            name: `${
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1 || "N/A"
                            } - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}`,
                            value: `${ctx.client.localEmojis.a_} **${user.coins.toLocaleString(
                                "en-US"
                            )}** ${ctx.client.localEmojis.jocoins}`,
                            inline: false,
                        }));
                    break;
                }

                case "items": {
                    // user.inventory is like that { "itemID": amount }
                    const reverse = ctx.interaction.options.getBoolean("reverse", false);
                    embed.title = `${reverse ? "Less" : "Most"} Owned Items`;
                    // field.name should be like 1 - Item Name ${item.emoji}
                    // to get the item we can do Functions.findItem(itemID)
                    // and to get the emoji we can do Functions.findItem(itemID).emoji
                    // value should be the amount of the item/total amount of items (percentage)
                    // check if reverse is true
                    embed.fields = Object.entries(totalItemsAmount)
                        .sort((a, b) => (reverse ? a[1] - b[1] : b[1] - a[1]))
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map(([itemID, amount], i) => {
                            const item = Functions.findItem(itemID);
                            const ownedByXUsers = totalItems.filter((x) => x[itemID] > 0).length;
                            return {
                                name: `${(currentPage - 1) * 10 + i + 1} - ${item.name} ${
                                    item.emoji
                                }`,
                                value: `${
                                    ctx.client.localEmojis.replyEnd
                                } \`${amount.toLocaleString(
                                    "en-US"
                                )}\` copies owned by **${ownedByXUsers.toLocaleString(
                                    "en-US"
                                )}** players (${((amount / totalItemsK) * 100).toFixed(2)}%)`,
                                inline: false,
                            };
                        });
                    break;
                }

                // daily streaks are stored in UserData.daily.claimStreak
                case "daily": {
                    embed.title = "Highest Daily Streaks";
                    embed.fields = lastLeaderboard.data
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((user, i) => ({
                            name: `${
                                lastLeaderboard.data.findIndex((x) => x.id === user.id) + 1 || "N/A"
                            } - ${user.tag}${user.id === ctx.user.id ? " 📍" : ""}`,
                            value: `${ctx.client.localEmojis.replyEnd} **${user.daily.claimStreak}** days in a row 📅`,
                            inline: false,
                        }));
                    break;
                }
            }

            ctx.interaction.editReply({
                embeds: [embed],
                // if last updated is more than 6 hours, show a warning
                content:
                    lastLeaderboard.lastUpdated + 1000 * 60 * 60 * 6 < Date.now()
                        ? `:warning: The leaderboard is outdated. Use ${ctx.client.getSlashCommandMention(
                              `leaderboard ${ctx.interaction.options.getSubcommand()}`
                          )} command to refresh it!`
                        : "",
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

        await ctx.interaction
            .reply({
                embeds: [embed],
                content:
                    lastLeaderboard.lastUpdated + 1000 * 60 * 60 * 6 < Date.now()
                        ? `:warning: The leaderboard is outdated. Use ${ctx.client.getSlashCommandMention(
                              `leaderboard ${ctx.interaction.options.getSubcommand()}`
                          )} command to refresh it!`
                        : "",
            }) // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {})
            .then(() => {
                if (ctx.interaction.options.getSubcommand() !== "items")
                    embed.description = `${ctx.client.localEmojis.replyEnd} 📍 Your position: \`${userPos}\`/\`${lastLeaderboard.data.length}\``;
                else
                    embed.description = `:information_source: There are \`${totalItemsK.toLocaleString(
                        "en-US"
                    )}\` items in the game`;
                updateMessage(currentPage);
            });

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                interaction.user.id === ctx.user.id &&
                interaction.customId.includes(ctx.interaction.id),
        });

        collector.on("collect", (interaction) => {
            if (!interaction.isButton()) return;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
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

            updateMessage(currentPage);
        });

        /*
        if (lastLeaderboard.lastUpdated + 1000 * 5 < Date.now()) {
            const startDate = Date.now();
            let query;
            switch (ctx.interaction.options.getSubcommand()) {
                case "level":
                    query = `SELECT id, tag, level, xp
                             FROM "RPGUsers"
                             ORDER BY level DESC, xp DESC`;
                    break;
                case "coins":
                    query = `SELECT id, tag, coins
                             FROM "RPGUsers"
                             ORDER BY coins DESC`;
                    break;
                case "items": // most owned items
                    query = `SELECT inventory
                             FROM "RPGUsers"`;
                    break;
                case "daily":
                    query = `SELECT id, tag, daily
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
                .then((res) => res.rows)
                .catch((err) => {
                    console.error(err);
                    return [];
                });
            await ctx.client.database.setString(
                `${ctx.client.user.id}_leaderboard:${ctx.interaction.options.getSubcommand()}`,
                JSON.stringify({
                    lastUpdated: Date.now(),
                    data: data,
                })
            );
            console.log(
                `Leaderboard ${ctx.interaction.options.getSubcommand()} took ${
                    Date.now() - startDate
                }ms to update`
            );
        }*/
    },
};

export default slashCommand;
