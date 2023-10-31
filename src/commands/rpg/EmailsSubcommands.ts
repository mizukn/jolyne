import { SlashCommandFile, Shop, FightNPCQuest } from "../../@types";
import {
    Message,
    APIEmbed,
    InteractionResponse,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as Emojis from "../../emojis.json";

const standPercent = {
    SS: 2,
    S: 4,
    A: 14,
    B: 38,
    C: 50,
    T: 2,
};

export const standPrice = {
    SS: 2000000000000000,
    S: 100000,
    A: 50000,
    B: 25000,
    C: 10000,
    T: 6969696969696969,
};

type cShop = {
    name: string;
    data: StringSelectMenuBuilder;
    items: Shop["items"];
    emoji: string;
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "emails",
        description: "View your emails",
        type: 1,
        options: [
            {
                name: "view",
                description: "Shows your non-archived emails",
                type: 1,
            },
            {
                name: "archived",
                description: "Shows your archived emails",
                type: 1,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const type = ctx.interaction.options.getSubcommand() as "view" | "archived";
        const emails =
            type === "view"
                ? ctx.userData.emails.filter((email) => !email.archived)
                : ctx.userData.emails.filter((email) => email.archived);
        if (!emails.length) {
            ctx.makeMessage({
                content: "You don't have any emails..",
            });
            return;
        }
        const emoji = type === "view" ? "📬" : "📥";
        const name = type === "view" ? "non-archived" : "archived";

        const goBackID = Functions.generateRandomId();
        const deleteEmailID = Functions.generateRandomId();
        const EmailsSelectionID = Functions.generateRandomId();
        const actionID = Functions.generateRandomId();
        let currentEmail: string;

        const goBackButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setEmoji(Emojis.arrowLeft)
            .setCustomId(goBackID);
        const deleteEmailBtn = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")
            .setCustomId(deleteEmailID);
        let EmailsSelection = new StringSelectMenuBuilder()
            .setCustomId(EmailsSelectionID)
            .setPlaceholder("Select an email to view");
        const actionBtn = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emoji)
            .setLabel(type === "view" ? "Archive" : "Unarchive")
            .setCustomId(actionID);

        function menuEmbed(): void {
            currentEmail = null;
            EmailsSelection = new StringSelectMenuBuilder()
                .setCustomId(EmailsSelectionID)
                .setPlaceholder("Select an email to view");

            const menuEmbed: APIEmbed = {
                author: {
                    name: "Inbox",
                    icon_url: ctx.user.displayAvatarURL(),
                },
                description: `${emoji} You have ${emails.length} ${name} e-mails.`,
                fields: [],
                color: 0x70926c,
            };

            for (const email of emails) {
                const emailData = Functions.findEmail(email.id);
                if (!emailData) continue;
                EmailsSelection.addOptions([
                    {
                        label: emailData.subject,
                        description: `From: ${emailData.author.email ?? emailData.author.name}`,
                        value: email.id,
                        emoji: emailData.emoji ?? emailData.author.emoji,
                    },
                ]);
                menuEmbed.fields.push({
                    name:
                        (emailData.emoji ?? emailData.author.emoji) +
                        " | " +
                        emailData.subject +
                        (email.read ? "" : " (❗Unread)"),
                    value: `${ctx.client.localEmojis.reply} From: \`${emailData.author.name} (${
                        emailData.author.email ?? emailData.author.name
                    })\`\n${
                        ctx.client.localEmojis.replyEnd
                    } Date: ${Functions.generateDiscordTimestamp(
                        email.date,
                        "FULL_DATE"
                    )} (${Functions.generateDiscordTimestamp(email.date, "FROM_NOW")})`,
                });
            }

            ctx.makeMessage({
                embeds: [menuEmbed],
                components: [Functions.actionRow([EmailsSelection])],
            });
        }

        function makeEmailEmbed(email: string): void {
            const emailData = Functions.findEmail(email);
            const emailBrut = ctx.userData.emails.find((email) => email.id === emailData?.id);

            if (!emailData) return;
            currentEmail = email;

            const emailEmbed: APIEmbed = {
                title: (emailData.emoji ?? emailData.author.emoji) + " | " + emailData.subject,
                description: `${ctx.client.localEmojis.reply} From: \`${emailData.author.name} (${
                    emailData.author.email ?? emailData.author.name
                })\`\n${ctx.client.localEmojis.replyEnd} Date: ${Functions.generateDiscordTimestamp(
                    emailBrut.date,
                    "FULL_DATE"
                )} (${Functions.generateDiscordTimestamp(
                    emailBrut.date,
                    "FROM_NOW"
                )})\n\n${emailData.content(ctx).replace(/{{userName}}/gi, ctx.user.username)}`,
                footer: {
                    text: emailData.footer,
                },
                color: 0x70926c,
                image: {
                    url: emailData.image,
                },
            };

            if (!emailBrut.read) {
                emailBrut.read = Date.now();
                const winContent: string[] = [];

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests) {
                        if (Functions.isMustReadEmailQuest(quest) && quest.email === email) {
                            quest.completed = true;
                            let chapterFrom = "ERROR";
                            if (ctx.userData.daily.quests.find((v) => v.id === quest.id)) {
                                chapterFrom = "Daily Quest";
                            } else if (ctx.userData.chapter.quests.find((v) => v.id === quest.id)) {
                                chapterFrom = "Chapter Quest";
                            } else if (
                                ctx.userData.sideQuests.find((v) =>
                                    v.quests.find((q) => q.id === quest.id)
                                )
                            ) {
                                chapterFrom = `Side Quest: ${
                                    ctx.userData.sideQuests.find((v) =>
                                        v.quests.find((q) => q.id === quest.id)
                                    ).id
                                }`;
                            }
                            winContent.push(
                                `:white_check_mark: Validated quest: ${quest.id} [${chapterFrom}]`
                            );
                        }
                    }
                }
                // TBC

                if (emailData.chapterQuests) {
                    for (const chapter of emailData.chapterQuests) {
                        if ((chapter as FightNPCQuest).npc) {
                            winContent.push(
                                `:scroll: Defeat ${(chapter as FightNPCQuest).npc} (Chapter Quest)`
                            );
                        } else winContent.push(`:scroll: ${chapter.id} (Chapter Quest)`);
                        ctx.userData.chapter.quests.push(Functions.pushQuest(chapter));
                    }
                }

                if (emailData.rewards) {
                    if (emailData.rewards.coins) {
                        Functions.addCoins(ctx.userData, emailData.rewards.coins);
                        winContent.push(
                            `+${emailData.rewards.coins.toLocaleString("en-US")} ${
                                ctx.client.localEmojis.jocoins
                            }`
                        );
                    }
                    if (emailData.rewards.items) {
                        for (const item of emailData.rewards.items) {
                            const itemData = Functions.findItem(item.item);
                            Functions.addItem(ctx.userData, itemData.id, item.amount);
                            winContent.push(
                                `${item.amount}x **${itemData.name}** ${itemData.emoji} `
                            );
                        }
                    }
                }

                if (winContent.length) {
                    emailEmbed.fields = [
                        {
                            name: ":gift: You got:",
                            value: winContent.join("\n"),
                        },
                    ];
                }
                ctx.client.database.saveUserData(ctx.userData);
            }
            ctx.makeMessage({
                embeds: [emailEmbed],
                components: [
                    Functions.actionRow([deleteEmailBtn, actionBtn]),
                    Functions.actionRow([EmailsSelection]),
                    Functions.actionRow([goBackButton]),
                ],
            });
        }

        menuEmbed();

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (interaction) =>
                (interaction.user.id === ctx.user.id && interaction.customId === goBackID) ||
                interaction.customId === deleteEmailID ||
                interaction.customId === EmailsSelectionID ||
                interaction.customId === actionID,
            time: 60000,
        });

        collector.on("collect", async (interaction) => {
            interaction.deferUpdate();
            if (await ctx.antiCheat(true)) {
                collector.stop();
                return;
            }
            switch (interaction.customId) {
                case goBackID:
                    menuEmbed();
                    break;
                case EmailsSelectionID:
                    makeEmailEmbed((interaction as StringSelectMenuInteraction).values[0]);
                    break;
            }
        });
    },
};

export default slashCommand;
