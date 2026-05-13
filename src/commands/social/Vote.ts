import { SlashCommandFile } from "../../@types";
import { Message, InteractionResponse, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import {
    generateDiscordTimestamp,
    TopGGVoteRewards,
    findItem,
    addXp,
    hasVotedRecenty,
} from "../../utils/Functions";
import { cloneDeep } from "lodash";
import { containers, COLORS, SectionData } from "../../utils/containers";

const voteForJolyneButton = new ButtonBuilder()
    .setLabel("Vote on Top.GG")
    .setStyle(ButtonStyle.Link)
    .setEmoji("<:topgg:1502772726073397409>") // Use a placeholder or appropriate emoji if available
    .setURL("https://top.gg/bot/923619190831730698");

const slashCommand: SlashCommandFile = {
    data: {
        name: "vote",
        description: "Vote for Jolyne on Top.GG to earn rewards.",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        const now = Date.now();
        const voteMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
        
        // Handle previous month for streak/history display
        const monthOffset = new Date().getUTCMonth() - 1;
        const yearOffset = new Date().getFullYear();
        const previousMonthDateFormat = new Date(yearOffset, monthOffset, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });

        const monthVotes = ctx.userData.voteHistory[voteMonth]?.sort((a, b) => a - b) ?? [];
        const previousMonthVotes = ctx.userData.voteHistory[previousMonthDateFormat]?.sort((a, b) => a - b) ?? [];
        const totalVotes = ctx.userData.totalVotes || 0;

        const lastVote = monthVotes[monthVotes.length - 1] ?? previousMonthVotes[previousMonthVotes.length - 1] ?? 0;
        const canVoteTimestamp = lastVote + 43200000; // 12 hours
        const canVoteNow = now >= canVoteTimestamp;

        const voteRewards = TopGGVoteRewards(ctx.userData);
        const xpRewards = addXp(ctx.userData, voteRewards.xp, ctx.client, true);

        const sections: SectionData[] = [];

        // Section 1: Stats
        let statsText = `### 📊 Voting Stats\n> **Month Votes:** ${monthVotes.length}\n> **Total Votes:** ${totalVotes}`;
        if (lastVote > 0) {
            statsText += `\n> **Last Vote:** ${generateDiscordTimestamp(lastVote, "FROM_NOW")}`;
        }
        sections.push({ text: statsText });

        // Section 2: Rewards
        const dungeonEmoji = findItem("dungeon").emoji;
        const arrowEmoji = ctx.client.localEmojis.mysterious_arrow;
        
        sections.push({
            text: `### 🎁 Voting Rewards\n> **Coins:** ${voteRewards.coins.toLocaleString()} ${ctx.client.localEmojis.jocoins}\n> **XP:** ${xpRewards.toLocaleString()} ${ctx.client.localEmojis.xp}\n> **Items:** x2 ${arrowEmoji} Stand Arrows, x2 ${arrowEmoji} Rare Stand Arrows`
        });
        sections.push({
            text: `### ⭐ Bonus Rewards\n> Every **2 votes**, you get a bonus **${dungeonEmoji} Dungeon Key**! ${ctx.userData.totalVotes % 2 === 0 ? "*(Next vote gives bonus)*" : "*(Earned on last vote)*"}`
        })

        // Section 3: Status / Perks
        const cooldownPerkActive = hasVotedRecenty(cloneDeep(ctx.userData), ctx.client);
        if (cooldownPerkActive) {
            const expire = lastVote + 60000 * 5; // 5 minute base
            sections.push({
                text: `### ⚡ Perk: Low Cooldowns\n> All your cooldowns are reduced to **45 seconds**!\n> **Expires:** ${generateDiscordTimestamp(expire, "FROM_NOW")}\n> *Includes: Assault, Loot, and Raid.*`
            });
        } else {
            sections.push({
                text: `### 🕒 Voting Perks\n> Voting reduces all your cooldowns to **45 seconds** for **5 minutes**!\n> *Bonus time for boosters and patrons.*`
            });
        }

        // Section 4: Call to Action
        if (canVoteNow) {
            sections.push({
                text: `### 🗳️ Vote Now!\n> You can vote right now to claim your rewards and activate your perks.`
            });
        } else {
            sections.push({
                text: `### 🕒 Next Vote\n> You can vote again in ${generateDiscordTimestamp(canVoteTimestamp, "FROM_NOW")}.`
            });
        }

        const reply = containers.primary({
            title: "<:topgg:1502772726073397409> Vote for Jolyne",
            description: "Support the bot and earn exclusive rewards and perks!",
            descriptionDivider: true,
            sections,
            sectionDividers: true,
            color: 0xff3366, // Top.GG Brand Color
        });

        reply.components.push(Functions.actionRow([voteForJolyneButton]));

        return await ctx.makeMessage(reply);
    },
};

export default slashCommand;
