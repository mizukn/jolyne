import { SlashCommandFile } from "../../@types";
import { Message, InteractionResponse, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { generateDiscordTimestamp, TopGGVoteRewards } from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "vote",
        description: "Vote for Jolyne in Top.GG",
        options: []
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        const voteMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
        const totalVotes = ctx.userData.totalVotes || 0;
        const monthVotes = ctx.userData.voteHistory[voteMonth] ?? []; // array of timestamps
        const voteRewards = TopGGVoteRewards(ctx.userData);

        const embeds: APIEmbed[] = [
            {
                author: {
                    icon_url: "https://pbs.twimg.com/profile_images/1502418247706046466/EMg2DjtV_400x400.jpg",
                    name: "Top.GG"
                },
                description: `You have voted **${monthVotes.length}** times this month and **${totalVotes}** times in total.\nBy voting, you can earn **${voteRewards.coins.toLocaleString("en-US")}** ${ctx.client.localEmojis.jocoins}, **${voteRewards.xp.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp} and x2 ${ctx.client.localEmojis.mysterious_arrow} **Stand Arrows** every 2 votes.`,
                color: 0xff3366,
                fields: []
            }
        ];

        // check if the user has voted less than 12 hours ago
        const lastVote = monthVotes[monthVotes.length - 1] || 0;
        const canVoteTimestamp = lastVote + 43200000;
        if (lastVote && Date.now() - lastVote < 43200000 && monthVotes.length > 0) {
            embeds[0].fields.push({
                // color: 0xff3366,
                // fields: [
                // {
                name: "Thank you for voting!",
                value: `You have been given **${voteRewards.coins.toLocaleString("en-US")}** ${ctx.client.localEmojis.jocoins} and **${voteRewards.xp.toLocaleString("en-US")}** ${ctx.client.localEmojis.xp} for voting ${generateDiscordTimestamp(lastVote, "FROM_NOW")}. ${ctx.userData.totalVotes % 2 === 0 ? `\nYou have also been giving x2 ${ctx.client.localEmojis.mysterious_arrow} Stand Arrows for voting 2 times.` : `\nIf you vote 1 more time, you will be given x2 ${ctx.client.localEmojis.mysterious_arrow} Stand Arrows.`}`
                // }
                // ]
            });
        }
        embeds[0].fields.push({
            //color: 0xff3366,
            //fields: [
            //  {
            name: "Vote for Jolyne",
            value: `[${Date.now() - lastVote < 43200000 ? `You can vote again ${generateDiscordTimestamp(canVoteTimestamp, "FROM_NOW")}.` : `You can vote now!`}](https://top.gg/bot/923619190831730698)`
            //}
            //]
        });

        return await ctx.makeMessage({ embeds });

    }
};

export default slashCommand;
