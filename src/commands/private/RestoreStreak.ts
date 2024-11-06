import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import * as Functions from "../../utils/Functions";
import Aes from "../../utils/Aes";

const slashCommand: SlashCommandFile = {
    data: {
        name: "restorestreak",
        description: "REstores streakk",
        options: [
            {
                name: "code",
                description: "Streak code",
                type: 3,
                required: true,
            },
            {
                name: "percent",
                description: "Percentage of the streak to restore",
                type: 4,
            },
        ],
    },
    adminOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const streak = ctx.options.getString("code", true);
        const dateAtMidnight = new Date().setUTCHours(0, 0, 0, 0);

        try {
            const streakData = Aes.decrypt(streak);
            const percentage = ctx.options.getInteger("percent", false) || 100;

            if (!streakData || !streakData.includes("user_id")) {
                ctx.makeMessage({
                    content: `Invalid streak code.`,
                });
                return;
            }

            if (await ctx.client.database.redis.get(`streak:${streak}`)) {
                ctx.makeMessage({
                    content: `This streak has already been restored. You should ban the user if they lied.`,
                });
                return;
            }

            await ctx.client.database.setString(`streak:${streak}`, streak);

            const streakDataParsed = JSON.parse(streakData) as {
                user_id: string;
                oldStreak: number;
                date: number;
            };

            const userData = await ctx.client.database.getRPGUserData(streakDataParsed.user_id);
            if (!userData) {
                ctx.makeMessage({
                    content: `${userMention(streakDataParsed.user_id)} doesn't have a RPG account.`,
                });
                return;
            }

            userData.daily.claimStreak = Math.round(
                userData.daily.claimStreak + streakDataParsed.oldStreak * (percentage / 100)
            );
            userData.daily.lastClaimed = dateAtMidnight;
            ctx.client.database.saveUserData(userData);

            ctx.makeMessage({
                content: `${userMention(
                    streakDataParsed.user_id
                )}'s streak has been restored to **${
                    userData.daily.claimStreak
                }** (${percentage}%) [Streak lost ${Functions.generateDiscordTimestamp(
                    streakDataParsed.date,
                    "FROM_NOW"
                )}]`,
            });
        } catch (error) {
            ctx.makeMessage({
                content: `Invalid streak code. [${(error as Error).message}]`,
            });
        }
    },
};

export default slashCommand;
