import { SlashCommandFile } from "../../@types";
import { Message, InteractionResponse, APIEmbed, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import {
    generateDiscordTimestamp,
    TopGGVoteRewards,
    findItem,
    addXp,
    hasVotedRecenty,
    actionRow,
} from "../../utils/Functions";
import { cloneDeep } from "lodash";

const voteForJolyneButton = new ButtonBuilder()
    .setLabel("Vote for Jolyne")
    .setStyle(ButtonStyle.Link)
    .setURL("https://top.gg/bot/923619190831730698");

const slashCommand: SlashCommandFile = {
    data: {
        name: "vote",
        description: "Vote for Jolyne in Top.GG",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        const voteMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
        /*const previousMonthDateFormat = new Date(
            `${new Date().getMonth() - 1}/1/${new Date().getFullYear()}`
        ).toLocaleString("en-US", { month: "long", year: "numeric" });*/
        // the code above is bad because if we're in january, it will return december of the previous year
        // so we have to adapt
        const month = new Date().getUTCMonth() - 1;
        const year = new Date().getFullYear();
        const previousMonthDateFormat = new Date(year, month, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
        const previousMonthVotes =
            ctx.userData.voteHistory[previousMonthDateFormat]?.sort((a, b) => a - b) ?? [];
        const totalVotes = ctx.userData.totalVotes || 0;
        const monthVotes = ctx.userData.voteHistory[voteMonth]?.sort((a, b) => a - b) ?? []; // array of timestamps

        const voteRewards = TopGGVoteRewards(ctx.userData);
        const lastVote =
            cloneDeep(
                monthVotes[monthVotes.length - 1] ??
                    previousMonthVotes[previousMonthVotes.length - 1]
            ) || 0;
        const canVoteTimestamp = lastVote + 43200000; // 12 hours

        const xpRewards = addXp(ctx.userData, voteRewards.xp, ctx.client, true);

        const embeds: APIEmbed[] = [
            {
                author: {
                    icon_url:
                        "https://pbs.twimg.com/profile_images/1502418247706046466/EMg2DjtV_400x400.jpg",
                    name: "Top.GG",
                },
                description: `You have voted **${
                    monthVotes.length
                }** times this month and **${totalVotes}** times in total${
                    monthVotes[monthVotes.length - 1] ??
                    previousMonthVotes[previousMonthVotes.length - 1]
                        ? " (last vote " +
                          generateDiscordTimestamp(
                              monthVotes[monthVotes.length - 1] ??
                                  previousMonthVotes[previousMonthVotes.length - 1],
                              "FROM_NOW"
                          ) +
                          ")"
                        : ""
                }.\nBy voting, you can earn **${voteRewards.coins.toLocaleString("en-US")}** ${
                    ctx.client.localEmojis.jocoins
                }, **${xpRewards.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp}, x2 ${
                    ctx.client.localEmojis.mysterious_arrow
                } **Stand Arrows** and x2 ${
                    ctx.client.localEmojis.mysterious_arrow
                } **Rare Stand Arrows** + 1x ${
                    findItem("dungeon").emoji
                } **Dungeon Key** every 2 votes.${
                    hasVotedRecenty(cloneDeep(ctx.userData), ctx.client)
                        ? ""
                        : `\nAlso, voting will reduce all your cooldowns to **45 seconds** for **5 minutes** (+1 minute if you're a [booster](https://discord.gg/jolyne-support-923608916540145694), +X minutes* where X equals your current tier if [you're an active patron](https://patreon.com/mizuki54)).`
                }`,
                color: 0xff3366,
                fields: [],
            },
        ];

        if (
            canVoteTimestamp > Date.now() &&
            (monthVotes.length > 0 || previousMonthVotes.length > 0)
        ) {
            const rewardXP = addXp(ctx.userData, voteRewards.xp, ctx.client, true);
            embeds[0].fields.push({
                // color: 0xff3366,
                // fields: [
                // {
                name: "Thank you for voting!",
                value: `You have been given **${voteRewards.coins.toLocaleString("en-US")}** ${
                    ctx.client.localEmojis.jocoins
                }, **${rewardXP.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp}, x2 ${
                    ctx.client.localEmojis.mysterious_arrow
                } **Stand Arrows** for voting ${generateDiscordTimestamp(lastVote, "FROM_NOW")}. ${
                    ctx.userData.totalVotes % 2 === 0
                        ? `\nYou have also been giving x2 ${
                              ctx.client.localEmojis.mysterious_arrow
                          } Rare Stand Arrows and a ${
                              findItem("dungeon").emoji
                          } **Dungeon Key** for voting 2 times.`
                        : `\nIf you vote 1 more time, you will be given x2 ${
                              ctx.client.localEmojis.mysterious_arrow
                          } Rare Stand Arrows and a ${findItem("dungeon").emoji} **Dungeon Key**.`
                }`,
                // }
                // ]
            });

            if (hasVotedRecenty(cloneDeep(ctx.userData), ctx.client)) {
                const expire = lastVote + 60000 * 5; // only lasts for 5 minutes
                embeds[0].fields.push({
                    name: `${ctx.client.localEmojis.timerIcon} Low Cooldown!`,
                    value: `Since you have voted recently, all your cooldowns are reduced to **45 seconds** !! (${[
                        "assault",
                        "loot",
                        "raid",
                    ]
                        .map((x) => ctx.client.getSlashCommandMention(x))
                        .join(", ")}) [expires ${generateDiscordTimestamp(
                        expire,
                        "FROM_NOW"
                    )}]\nYou have also been fully healed and your stamina has been restored.`,
                });
                return await ctx.makeMessage({ embeds });
            }
        }
        embeds[0].fields.push({
            //color: 0xff3366,
            //fields: [
            //  {
            name: "Vote for Jolyne",
            value: `[${
                hasVotedRecenty(cloneDeep(ctx.userData), ctx.client, 43200000)
                    ? `You can vote again ${generateDiscordTimestamp(
                          (monthVotes[monthVotes.length - 1] ??
                              previousMonthVotes[previousMonthVotes.length - 1] ??
                              Date.now()) + 43200000,
                          "FROM_NOW"
                      )}.`
                    : `You can vote now!`
            }](https://top.gg/bot/923619190831730698)`,
            //}
            //]
        });

        return await ctx.makeMessage({ embeds, components: [actionRow([voteForJolyneButton])] });
    },
};

export default slashCommand;
