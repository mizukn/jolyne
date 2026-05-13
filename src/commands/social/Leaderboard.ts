import { RPGUserDataJSON, SlashCommandFile, Leaderboard } from "../../@types";
import { Message, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageActionRowComponentBuilder, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { containers, V2Reply, COLORS, SectionData } from "../../utils/containers";

const ITEMS_PER_PAGE = 10;

const slashCommand: SlashCommandFile = {
    hiddenCommandNames: ["leaderboard daily"],
    data: {
        name: "leaderboard",
        description: "View competitive rankings for level, coins, items, and streaks.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "level",
                description: "Shows the top level players",
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
                        description: "Reverse the leaderboard (least owned)",
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: "daily",
                description: "Shows the users with the highest daily streaks",
                type: 1,
            },
            {
                name: "streaks",
                description: "Shows the users with the highest daily streaks",
                type: 1,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const subcommand = ctx.interaction.options.getSubcommand();
        const startTime = Date.now();

        // 1. Data Retrieval Logic
        let query: string;
        switch (subcommand) {
            case "level":
                query = `SELECT id, tag, level, xp, "communityBans" FROM "RPGUsers" ORDER BY level DESC, xp DESC`;
                break;
            case "coins":
                query = `SELECT id, tag, coins, "communityBans" FROM "RPGUsers" ORDER BY coins DESC`;
                break;
            case "items":
                query = `SELECT inventory, "communityBans" FROM "RPGUsers"`;
                break;
            case "daily":
            case "streaks":
                query = `SELECT id, tag, daily, "communityBans" FROM "RPGUsers" ORDER BY daily->>'claimStreak' DESC`;
                break;
            default:
                query = `SELECT id, tag, level, xp, "communityBans" FROM "RPGUsers" ORDER BY level DESC, xp DESC`;
        }

        const rows = await ctx.client.database.postgresql
            .query(query)
            .then((res) => res.rows.filter((x) => !Functions.userIsCommunityBanned(x)))
            .catch((err) => {
                ctx.client.log(`Leaderboard SQL error: ${err.message}`, "error");
                return [];
            });

        const lastUpdated = Date.now();
        await ctx.client.database.setString(
            `${ctx.client.user.id}_leaderboard:${subcommand}`,
            JSON.stringify({ lastUpdated, data: rows })
        );

        ctx.client.log(`Leaderboard ${subcommand} updated in ${Date.now() - startTime}ms`, "cmd");

        // 2. Data Processing
        const cached = JSON.parse(
            await ctx.client.database.getString(`${ctx.client.user.id}_leaderboard:${subcommand}`)
        ) as Leaderboard;
        
        const data = cached.data.filter((x) => !Functions.userIsCommunityBanned(x));
        let userPos: number | "N/A" = data.findIndex((u) => u.id === ctx.user.id) + 1 || "N/A";

        if (subcommand === "daily" || subcommand === "streaks") {
            const now = Date.now();
            for (const user of data) {
                const daily = user.daily as RPGUserDataJSON["daily"];
                if (daily.lastClaimed + 172800000 < now) { // 48 hours
                    daily.claimStreak = 0;
                }
            }
            data.sort((a, b) => (b.daily.claimStreak || 0) - (a.daily.claimStreak || 0));
            userPos = data.findIndex((u) => u.id === ctx.user.id) + 1 || "N/A";
        }

        // 3. Item-Specific Processing
        const totalItemsMap: Record<string, number> = {};
        const inventoryRows = subcommand === "items" ? data.map(r => r.inventory) : [];
        if (subcommand === "items") {
            for (const inv of inventoryRows) {
                for (const itemId in inv) {
                    totalItemsMap[itemId] = (totalItemsMap[itemId] || 0) + inv[itemId];
                }
            }
        }
        const totalItemsCount = Object.values(totalItemsMap).reduce((a, b) => a + b, 0);

        // 4. Pagination Setup
        let currentPage = 1;
        const totalPages = subcommand === "items"
            ? Math.ceil(Object.keys(totalItemsMap).length / ITEMS_PER_PAGE)
            : Math.ceil(data.length / ITEMS_PER_PAGE);

        const sessionId = `${ctx.user.id}${Date.now()}`;

        function buildReply(page: number): V2Reply {
            currentPage = Math.max(1, Math.min(page, totalPages));
            
            let title: string;
            let accentColor: number = COLORS.primary;
            let sections: SectionData[] = [];
            let posLine = "";

            switch (subcommand) {
                case "level":
                    title = "🏆 Level Leaderboard";
                    accentColor = COLORS.primary;
                    posLine = `📍 **Your Position:** \`#${userPos}\` of \`${data.length.toLocaleString()}\` players\n\n`;
                    sections = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user, i) => {
                        const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                        const isMe = user.id === ctx.user.id;
                        return {
                            text: `### ${rank}. ${user.tag}${isMe ? " 📍" : ""}\n> Level **${user.level.toLocaleString()}** • **${user.xp.toLocaleString()}** ${ctx.client.localEmojis.xp}`
                        };
                    });
                    break;
                case "coins":
                    title = "💰 Richest Players";
                    accentColor = COLORS.warning;
                    posLine = `📍 **Your Position:** \`#${userPos}\` of \`${data.length.toLocaleString()}\` players\n\n`;
                    sections = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user, i) => {
                        const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                        const isMe = user.id === ctx.user.id;
                        return {
                            text: `${rank}. ${user.tag}${isMe ? " 📍" : ""}\n> **${user.coins.toLocaleString()}** ${ctx.client.localEmojis.jocoins}`
                        };
                    });
                    break;
                case "items": {
                    const reverse = ctx.interaction.options.getBoolean("reverse", false);
                    title = reverse ? "💎 Rarest Items" : "📦 Most Owned Items";
                    accentColor = COLORS.accent;
                    posLine = `ℹ️ There are **${totalItemsCount.toLocaleString()}** items currently held by players.\n\n`;
                    const entries = Object.entries(totalItemsMap).sort((a, b) => reverse ? a[1] - b[1] : b[1] - a[1]);
                    sections = entries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(([itemId, amount], i) => {
                        const item = Functions.findItem(itemId);
                        const ownedBy = inventoryRows.filter(inv => inv[itemId] > 0).length;
                        const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                        const percent = ((amount / totalItemsCount) * 100).toFixed(2);
                        return {
                            text: `${rank}. ${item.name} ${item.emoji}\n> \`${amount.toLocaleString()}\` copies held by **${ownedBy.toLocaleString()}** players (${percent}%)`
                        };
                    });
                    break;
                }
                case "daily":
                case "streaks":
                    title = "📆 Daily Streaks";
                    accentColor = COLORS.info;
                    posLine = `📍 **Your Position:** \`#${userPos}\` of \`${data.length.toLocaleString()}\` players\n\n`;
                    sections = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user, i) => {
                        const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                        const isMe = user.id === ctx.user.id;
                        return {
                            text: `${rank}. ${user.tag}${isMe ? " 📍" : ""}\n> **${user.daily.claimStreak}** day streak`
                        };
                    });
                    break;
                default:
                    title = "Leaderboard";
                    sections = [];
            }

            let footer = `Page ${currentPage} of ${totalPages} • Last updated: ${new Date(cached.lastUpdated).toLocaleString()}`;
            if (cached.lastUpdated + 21600000 < Date.now()) { // 6 hours
                footer += `\n⚠️ Outdated - Refresh with /leaderboard ${subcommand}`;
            }

            const reply = containers.primary({
                title,
                description: posLine,
                descriptionDivider: true,
                sections,
                sectionDividers: true,
                color: accentColor,
                footer,
            });

            const buttons = [
                new ButtonBuilder().setCustomId(`lb:${sessionId}:first`).setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
                new ButtonBuilder().setCustomId(`lb:${sessionId}:prev`).setEmoji("⬅️").setStyle(ButtonStyle.Primary).setDisabled(currentPage === 1),
                new ButtonBuilder().setCustomId(`lb:${sessionId}:user`).setEmoji("📍").setStyle(ButtonStyle.Secondary).setDisabled(userPos === "N/A" || subcommand === "items"),
                new ButtonBuilder().setCustomId(`lb:${sessionId}:next`).setEmoji("➡️").setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages),
                new ButtonBuilder().setCustomId(`lb:${sessionId}:last`).setEmoji("⏭️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
            ];

            reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons));
            return reply;
        }

        await ctx.makeMessage(buildReply(currentPage));
        const message = await ctx.interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(`lb:${sessionId}:`),
            time: 300000,
        });

        collector.on("collect", async (i) => {
            const action = i.customId.split(":")[2];
            
            switch (action) {
                case "first": currentPage = 1; break;
                case "prev": currentPage = Math.max(1, currentPage - 1); break;
                case "next": currentPage = Math.min(totalPages, currentPage + 1); break;
                case "last": currentPage = totalPages; break;
                case "user": currentPage = Math.ceil(userPos !== "N/A" ? userPos / ITEMS_PER_PAGE : 1); break;
            }

            await i.update(buildReply(currentPage));
        });
    },
};

export default slashCommand;
