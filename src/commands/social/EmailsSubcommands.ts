import { SlashCommandFile, FightNPCQuest } from "../../@types";
import {
    Message,
    InteractionResponse,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { containers, SectionData, COLORS, V2Reply } from "../../utils/containers";
import { cloneDeep } from "lodash";

type MailboxType = "inbox" | "archived";

const EMAILS_PER_PAGE = 5;

function getMailboxType(subcommand: string): MailboxType {
    return subcommand === "archived" ? "archived" : "inbox";
}

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
        const type = getMailboxType(ctx.interaction.options.getSubcommand());
        let currentPage = 0;
        let viewingEmailId: string | null = null;

        const getEmails = () =>
            type === "inbox"
                ? ctx.userData.emails.filter((email) => !email.archived)
                : ctx.userData.emails.filter((email) => email.archived);

        function renderMailbox(): V2Reply {
            const list = getEmails();
            if (!list.length) {
                return containers.warning(`You don't have any emails in your ${type}.`);
            }

            const totalPages = Math.max(1, Math.ceil(list.length / EMAILS_PER_PAGE));
            if (currentPage >= totalPages) currentPage = totalPages - 1;

            const pageItems = list.slice(
                currentPage * EMAILS_PER_PAGE,
                (currentPage + 1) * EMAILS_PER_PAGE
            );

            const sections: SectionData[] = pageItems.map((email) => {
                const data = Functions.findEmail(email.id);
                const emoji = data?.emoji ?? data?.author.emoji ?? "📩";
                const unread = !email.read ? " ❗" : "";
                
                return {
                    text: `### ${emoji} **${data?.subject ?? "Unknown Subject"}**${unread}\n> -# From: **${data?.author.name}** • ${Functions.generateDiscordTimestamp(email.date, "FROM_NOW")}`,
                    accessory: new ButtonBuilder()
                        .setCustomId(`view_${email.id}`)
                        .setLabel("Read")
                        .setStyle(ButtonStyle.Secondary)
                };
            });

            const emoji = type === "inbox" ? "📬" : "📥";
            const reply = containers.primary({
                title: `# ${emoji} ${Functions.capitalize(type)}`,
                description: `You have **${list.length}** emails in your ${type}.`,
                descriptionDivider: true,
                sections,
                sectionDividers: true,
                color: COLORS.primary,
                footer: `Page ${currentPage + 1}/${totalPages}`,
            });

            const actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

            // Select Menu for current page
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select_email")
                .setPlaceholder("Select an email to read")
                .addOptions(
                    pageItems.map((email) => {
                        const data = Functions.findEmail(email.id);
                        return {
                            label: data?.subject.substring(0, 100) ?? "Unknown",
                            value: email.id,
                            description: `From: ${data?.author.name}`,
                            emoji: data?.emoji ?? data?.author.emoji,
                        };
                    })
                );
            actionRows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu));

            // Pagination
            if (totalPages > 1) {
                actionRows.push(
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev_page")
                            .setEmoji("⬅️")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId("page_info")
                            .setLabel(`${currentPage + 1} / ${totalPages}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("next_page")
                            .setEmoji("➡️")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === totalPages - 1)
                    )
                );
            }

            return {
                components: [...reply.components, ...actionRows],
                flags: reply.flags
            };
        }

        async function renderEmail(emailId: string): Promise<V2Reply> {
            const emailData = Functions.findEmail(emailId);
            const userEmail = ctx.userData.emails.find((e) => e.id === emailId);

            if (!emailData || !userEmail) {
                return containers.error("Email not found.");
            }

            const oldData = cloneDeep(ctx.userData);
            const rewardsLines: string[] = [];

            // Logic for first-time reading
            if (!userEmail.read) {
                userEmail.read = Date.now();

                // 1. Quests validation
                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests) {
                        if (Functions.isMustReadEmailQuest(quest) && quest.email === emailId) {
                            quest.completed = true;
                            rewardsLines.push(`✅ **Quest Validated:** ${quest.id}`);
                        }
                    }
                }

                // 2. Chapter quests injection
                if (emailData.chapterQuests) {
                    for (const q of emailData.chapterQuests) {
                        ctx.userData.chapter.quests.push(Functions.pushQuest(q));
                        const label = (q as FightNPCQuest).npc ? `Defeat ${(q as FightNPCQuest).npc}` : q.id;
                        rewardsLines.push(`📜 **New Chapter Quest:** ${label}`);
                    }
                }

                // 3. Rewards claiming
                if (emailData.rewards) {
                    if (emailData.rewards.coins) {
                        Functions.addCoins(ctx.userData, emailData.rewards.coins);
                        rewardsLines.push(`+**${emailData.rewards.coins.toLocaleString()}** ${ctx.client.localEmojis.jocoins}`);
                    }
                    if (emailData.rewards.xp) {
                        const addedXp = Functions.addXp(ctx.userData, emailData.rewards.xp, ctx.client);
                        rewardsLines.push(`+**${addedXp.toLocaleString()}** ${ctx.client.localEmojis.xp}`);
                    }
                    if (emailData.rewards.items) {
                        for (const item of emailData.rewards.items) {
                            const itemData = Functions.findItem(item.item);
                            Functions.addItem(ctx.userData, itemData.id, item.amount);
                            rewardsLines.push(`+**${item.amount}x** ${itemData.name} ${itemData.emoji}`);
                        }
                    }
                }

                // Save changes via transaction
                await ctx.client.database.handleTransaction(
                    [{ oldData, newData: ctx.userData }],
                    `Read email: ${emailId}`
                );
            }

            const sections: SectionData[] = [
                {
                    text: emailData.content(ctx).replace(/{{userName}}/gi, ctx.user.username),
                    accessory: new ButtonBuilder()
                        .setCustomId("back_to_list")
                        .setEmoji("↩️")
                        .setStyle(ButtonStyle.Secondary)
                }
            ];

            if (rewardsLines.length > 0) {
                sections.push({
                    text: `### 🎁 **Rewards & Quests**\n${rewardsLines.join("\n")}`
                });
            }

            const reply = containers.primary({
                title: `# ${emailData.emoji ?? emailData.author.emoji} ${emailData.subject}`,
                description: `> -# From: **${emailData.author.name}** (${emailData.author.email ?? emailData.author.name})\n> -# Received: ${Functions.generateDiscordTimestamp(userEmail.date, "FULL_DATE")}`,
                descriptionDivider: true,
                sections,
                sectionDividers: true,
                color: COLORS.accent,
                footer: emailData.footer,
            });

            reply.components.push(
                Functions.actionRow([
                    new ButtonBuilder()
                        .setCustomId(`archive_${emailId}`)
                        .setLabel(userEmail.archived ? "Unarchive" : "Archive")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(type === "inbox" ? "📥" : "📬"),
                    new ButtonBuilder()
                        .setCustomId(`delete_${emailId}`)
                        .setLabel("Delete")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️"),
                ])
            );

            return reply;
        }

        const initialReply = renderMailbox();
        await ctx.makeMessage(initialReply);

        if (getEmails().length === 0) return;

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 120000,
        });

        collector.on("collect", async (i) => {
            if (i.isStringSelectMenu()) {
                if (i.customId === "select_email") {
                    viewingEmailId = i.values[0];
                    await i.deferUpdate();
                    await ctx.interaction.editReply(await renderEmail(viewingEmailId));
                }
                return;
            }

            const customId = i.customId;

            if (customId === "prev_page") {
                currentPage = Math.max(0, currentPage - 1);
                await i.update(renderMailbox());
            } else if (customId === "next_page") {
                currentPage++;
                await i.update(renderMailbox());
            } else if (customId === "back_to_list") {
                viewingEmailId = null;
                await i.update(renderMailbox());
            } else if (customId.startsWith("view_")) {
                viewingEmailId = customId.slice("view_".length);
                await i.deferUpdate();
                await ctx.interaction.editReply(await renderEmail(viewingEmailId));
            } else if (customId.startsWith("archive_")) {
                const id = customId.slice("archive_".length);
                const email = ctx.userData.emails.find((e) => e.id === id);
                if (email) {
                    email.archived = !email.archived;
                    await ctx.client.database.saveUserData(ctx.userData);
                    await i.reply({
                        ...containers.success(`Email ${email.archived ? "archived" : "unarchived"} successfully.`),
                        ephemeral: true
                    });
                    // If we were viewing it, go back to list (since it might have moved to another mailbox)
                    viewingEmailId = null;
                    await ctx.interaction.editReply(renderMailbox());
                }
            } else if (customId.startsWith("delete_")) {
                const id = customId.slice("delete_".length);
                ctx.userData.emails = ctx.userData.emails.filter((e) => e.id !== id);
                await ctx.client.database.saveUserData(ctx.userData);
                await i.reply({
                    ...containers.success("Email deleted successfully."),
                    ephemeral: true
                });
                viewingEmailId = null;
                await ctx.interaction.editReply(renderMailbox());
            }
        });
    },
};

export default slashCommand;
