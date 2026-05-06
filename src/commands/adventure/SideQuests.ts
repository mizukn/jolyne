import {
    RPGUserDataJSON,
    SlashCommandFile,
    Leaderboard,
    i18n_key,
    RequirementStatus,
    SideQuest,
    RPGUserQuest,
} from "../../@types";
import {
    Message,
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
    InteractionResponse,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { containers, V2Reply } from "../../utils/containers";
import { getSideQuestRequirements } from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import * as SideQuests from "../../rpg/SideQuests";
import { getQuestsStats } from "./Chapter";
import { cloneDeep } from "lodash";

const sideQuestsArr = Object.values(SideQuests);

const slashCommand: SlashCommandFile = {
    data: {
        name: "side",
        description: "Shows your side quests",
        type: 1,
        options: [
            {
                name: "quest",
                description: "Shows your progress about a specific side quest",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "view",
                        description: "Shows your progress about a specific side quest",
                        type: 1,
                        options: [
                            {
                                name: "side_quest",
                                description: "The side quest you want to view",
                                type: 3,
                                required: true,
                                autocomplete: true,
                            },
                        ],
                    },
                    {
                        name: "info",
                        description: "Shows information about a specific side quest",
                        type: 1,
                        options: [
                            {
                                name: "side_quest",
                                description: "The side quest you want to view",
                                type: 3,
                                required: true,
                                autocomplete: true,
                            },
                        ],
                    },
                    {
                        name: "requirements",
                        description: "Deprecated. Use /side quest info instead.",
                        type: 1,
                        options: [
                            {
                                name: "side_quest",
                                description: "The side quest you want to view",
                                type: 3,
                                required: true,
                                autocomplete: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext,
        reloaded?: boolean
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const sideQuest = ctx.options.getString("side_quest", true);
        if (ctx.options.getSubcommand() === "view") {
            if (!ctx.userData.sideQuests.find((x) => x.id === sideQuest)) {
                ctx.makeMessage({
                    content: `UH OH! You don't have this side quest! Or it doesn't exist...`,
                });
                return;
            }
            if (!sideQuestsArr.find((r) => r.id === sideQuest)) {
                ctx.makeMessage({
                    content: `${ctx.client.localEmojis.jolyne} Wow there! You've found a side quest that doesn't exist! Please report this to the developers at https://discord.gg/jolyne-support-923608916540145694. They probably temporairly removed it.`,
                });
                return;
            }
            const SideQuest = sideQuestsArr.find((r) => r.id === sideQuest);
            const status = getQuestsStats(
                ctx.userData.sideQuests.find((x) => x.id === sideQuest).quests,
                ctx
            );
            const components: ButtonBuilder[] = [];
            const rewardsButtonID = Functions.generateRandomId();
            const redoQuestID = Functions.generateRandomId();
            const reloadQuestsButtonID = Functions.generateRandomId();
            const firstStatus = Functions.getSideQuestRequirements(SideQuest, ctx);
            const rewardsButton = new ButtonBuilder()
                .setCustomId(rewardsButtonID)
                .setLabel("Claim Rewards")
                .setEmoji("🎉")
                .setDisabled(
                    ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize
                        ? true
                        : false
                )
                .setStyle(ButtonStyle.Success);
            const redoQuestButton = new ButtonBuilder()
                .setCustomId(redoQuestID)
                .setLabel("Redo Quest")
                .setDisabled(firstStatus.status ? false : true)
                .setStyle(ButtonStyle.Primary);
            const reloadQuestsButton = new ButtonBuilder()
                .setCustomId(reloadQuestsButtonID)
                .setLabel("Reload Quests")
                .setEmoji("🔁")
                .setDisabled(reloaded ? true : false)
                .setStyle(ButtonStyle.Primary);
            const deleteId = Functions.generateRandomId();
            const deleteButton = new ButtonBuilder()
                .setCustomId(deleteId)
                .setLabel("Erase Side Quest")
                .setEmoji("🗑️")
                .setDisabled(firstStatus.status ? true : false)
                .setStyle(ButtonStyle.Danger);

            if (status.percent >= 100) {
                if (
                    ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize &&
                    sideQuestsArr.find((r) => r.id === sideQuest).canRedoSideQuest &&
                    Functions.getSideQuestRequirements(
                        sideQuestsArr.find((r) => r.id === sideQuest),
                        ctx
                    )
                )
                    components.push(redoQuestButton);
                else {
                    components.push(rewardsButton);
                }
            }
            if (
                (status.percent !== 100 && !firstStatus.status) ||
                ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize
            ) {
                components.push(deleteButton);
            }

            if (status.percent !== 100 && SideQuest.canReloadQuests) {
                components.push(reloadQuestsButton);
            }

            const sideQuestRequirementStatus = Functions.getSideQuestRequirements(SideQuest, ctx);

            const userSideQuest = ctx.userData.sideQuests.find((x) => x.id === sideQuest);
            let currentPage = 0;
            const totalPages = Math.max(
                1,
                Math.ceil(status.message.split("\n").filter(Boolean).length / Functions.QUEST_LIST_ITEMS_PER_PAGE),
            );
            const buildSideQuestReply = () =>
                generateSideQuestReply(
                    SideQuest,
                    status,
                    sideQuestRequirementStatus,
                    ctx,
                    undefined,
                    userSideQuest.quests,
                    currentPage,
                );

            const sqReply = buildSideQuestReply();
            if (totalPages > 1) {
                sqReply.components.push(
                    Functions.actionRow([
                        new ButtonBuilder()
                            .setCustomId(ctx.interaction.id + "side-quest-prev")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji("⬅️")
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId(ctx.interaction.id + "side-quest-page")
                            .setStyle(ButtonStyle.Secondary)
                            .setLabel(`${currentPage + 1} / ${totalPages}`)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(ctx.interaction.id + "side-quest-next")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji("➡️")
                            .setDisabled(currentPage === totalPages - 1),
                    ]),
                );
            }
            if (components.length > 0) {
                sqReply.components.push(Functions.actionRow(components));
            }
            ctx.makeMessage(sqReply);

            if (components.length !== 0 || status.message) {
                const collector = ctx.channel.createMessageComponentCollector({
                    filter: (i) =>
                        (i.user.id === ctx.user.id && i.customId === rewardsButtonID) ||
                        (i.user.id === ctx.user.id && i.customId === redoQuestID) ||
                        (i.user.id === ctx.user.id && i.customId === deleteId) ||
                        (i.user.id === ctx.user.id && i.customId === reloadQuestsButtonID) ||
                        (i.user.id === ctx.user.id && i.customId === ctx.interaction.id + "side-quest-prev") ||
                        (i.user.id === ctx.user.id && i.customId === ctx.interaction.id + "side-quest-next"),
                    time: 60000,
                });
                collector.on("collect", async (i) => {
                    if (i.customId === ctx.interaction.id + "side-quest-prev") {
                        currentPage = Math.max(0, currentPage - 1);
                        const reply = buildSideQuestReply();
                        if (totalPages > 1) {
                            reply.components.push(
                                Functions.actionRow([
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-prev")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji("⬅️")
                                        .setDisabled(currentPage === 0),
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-page")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setLabel(`${currentPage + 1} / ${totalPages}`)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-next")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji("➡️")
                                        .setDisabled(currentPage === totalPages - 1),
                                ]),
                            );
                        }
                        if (components.length > 0) reply.components.push(Functions.actionRow(components));
                        return i.update(reply);
                    }

                    if (i.customId === ctx.interaction.id + "side-quest-next") {
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        const reply = buildSideQuestReply();
                        if (totalPages > 1) {
                            reply.components.push(
                                Functions.actionRow([
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-prev")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji("⬅️")
                                        .setDisabled(currentPage === 0),
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-page")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setLabel(`${currentPage + 1} / ${totalPages}`)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId(ctx.interaction.id + "side-quest-next")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji("➡️")
                                        .setDisabled(currentPage === totalPages - 1),
                                ]),
                            );
                        }
                        if (components.length > 0) reply.components.push(Functions.actionRow(components));
                        return i.update(reply);
                    }

                    i.deferUpdate().catch(() => {});
                    if (await ctx.antiCheat(true)) return;
                    const oldData = cloneDeep(ctx.userData);
                    switch (i.customId) {
                        case rewardsButtonID: {
                            const alreadyClaimed = ctx.userData.sideQuests.find(
                                (x) => x.id === sideQuest
                            ).claimedPrize;
                            if (alreadyClaimed) {
                                ctx.followUp({
                                    content: `You've already claimed the rewards!`,
                                });
                                collector.stop();
                                return;
                            }
                            const status = SideQuest.rewards ? SideQuest.rewards(ctx) : true;
                            if (status) {
                                ctx.userData.sideQuests.find(
                                    (x) => x.id === sideQuest
                                ).claimedPrize = true;
                                //ctx.client.database.saveUserData(ctx.userData);
                                const transaction = await ctx.client.database.handleTransaction(
                                    [
                                        {
                                            oldData,
                                            newData: ctx.userData,
                                        },
                                    ],
                                    `Claimed side quest rewards: ${sideQuest}`
                                );
                                if (!transaction) {
                                    ctx.followUp({
                                        content: `An error occurred while claiming the rewards.`,
                                    });
                                    collector.stop();
                                    return;
                                }
                            }
                            if (SideQuest.canRedoSideQuest && status) {
                                ctx.followUp({
                                    content: `You've claimed the rewards! BTW this quest can be redone as much as you want, so use this command again if you want to re do it.`,
                                });
                            }
                            collector.stop();
                            break;
                        }
                        case redoQuestID: {
                            ctx.userData.sideQuests.find((x) => x.id === sideQuest).quests =
                                SideQuest.quests(ctx).map((x) => Functions.pushQuest(x));
                            ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize =
                                false;
                            const transaction = await ctx.client.database.handleTransaction(
                                [
                                    {
                                        oldData,
                                        newData: ctx.userData,
                                    },
                                ],
                                `Redone side quest: ${sideQuest}`
                            );
                            if (!transaction) {
                                ctx.followUp({
                                    content: `An error occurred while redoing the quest.`,
                                });
                                collector.stop();
                                return;
                            }
                            //ctx.client.database.saveUserData(ctx.userData);
                            collector.stop();
                            ctx.followUp({
                                content: `You've redone the quest! Use this command again to see your progress.`,
                            });
                            break;
                        }

                        case reloadQuestsButtonID: {
                            const oldData = cloneDeep(ctx.userData);
                            ctx.userData.sideQuests.find((x) => x.id === sideQuest).quests =
                                SideQuest.quests(ctx).map((x) => Functions.pushQuest(x));
                            ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize =
                                false;
                            const transaction = await ctx.client.database.handleTransaction(
                                [
                                    {
                                        oldData,
                                        newData: ctx.userData,
                                    },
                                ],
                                `Reloaded side quest: ${sideQuest}`
                            );
                            if (!transaction) {
                                ctx.followUp({
                                    content: `An error occurred while reloading the quest.`,
                                });
                                collector.stop();
                                return;
                            }
                            //ctx.client.database.saveUserData(ctx.userData);
                            collector.stop();

                            /*ctx.followUp({
                                content: `You've reloaded the quests! Use this command again to see your progress.`,
                            });*/
                            ctx.client.commands.get("side")?.execute(ctx, true);
                            break;
                        }
                    }

                    if (i.customId === deleteId) {
                        ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
                            (x) => x.id !== sideQuest
                        );
                        //ctx.client.database.saveUserData(ctx.userData);
                        const transaction = await ctx.client.database.handleTransaction(
                            [
                                {
                                    oldData,
                                    newData: ctx.userData,
                                },
                            ],
                            `Erased side quest: ${sideQuest}`
                        );
                        if (!transaction) {
                            ctx.followUp({
                                content: `An error occurred while deleting the quest.`,
                            });
                            collector.stop();
                            return;
                        }
                        collector.stop();
                        ctx.followUp({
                            content: `You've deleted the quest!`,
                        });
                    }
                });
            }
        } else if (["info", "requirements"].includes(ctx.options.getSubcommand())) {
            if (!sideQuestsArr.find((r) => r.id === sideQuest)) {
                ctx.makeMessage({
                    content: `${ctx.client.localEmojis.jolyne} Invalid side quest.`,
                });
                return;
            }
            const SideQuest = sideQuestsArr.find((r) => r.id === sideQuest);
            const quests = SideQuest.quests(ctx).map((x) => Functions.pushQuest(x));
            const status = getQuestsStats(quests, ctx);
            const sideQuestRequirementStatus = Functions.getSideQuestRequirements(SideQuest, ctx);
            ctx.makeMessage(
                generateSideQuestReply(SideQuest, status, sideQuestRequirementStatus, ctx, `Preview: \`${SideQuest.id}\``, quests)
            );
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        let sideQuestRealArr = sideQuestsArr;
        if (interaction.options.getSubcommand() === "view") {
            sideQuestRealArr = sideQuestRealArr.filter((sideQuest) =>
                userData.sideQuests.find((x) => x.id === sideQuest.id)
            );
        }
        const matchCurringInput = sideQuestRealArr
            .filter(
                (sideQuest) =>
                    sideQuest.title.toLowerCase().includes(currentInput.toLowerCase()) ||
                    sideQuest.description.toLowerCase().includes(currentInput.toLowerCase()) ||
                    sideQuest.title.toLocaleLowerCase().startsWith(currentInput.toLowerCase()) ||
                    sideQuest.description.toLowerCase().startsWith(currentInput.toLowerCase())
            )
            .map((x) => {
                return {
                    name: x.title,
                    value: x.id,
                };
            });
        if (matchCurringInput.length > 24) matchCurringInput.length = 24;

        interaction.respond(matchCurringInput.filter((x) => x));
    },
};

export default slashCommand;

function generateSideQuestReply(
    sideQuest: SideQuest,
    status: {
        message: string;
        percent: number;
    },
    sideQuestRequirementStatus: {
        status: boolean;
        message: string;
    },
    ctx: CommandInteractionContext,
    footer?: string,
    quests?: RPGUserQuest[],
    currentPage = 0,
): V2Reply {
    const extraInfo: string[] = [];
    if (sideQuest.cancelQuestIfRequirementsNotMetAnymore)
        extraInfo.push(
            "This side quest will be automatically erased if you don't meet the requirements anymore."
        );
    if (sideQuest.canRedoSideQuest)
        extraInfo.push("You'll be able to redo this side quest as much as you want.");
    if (sideQuest.canReloadQuests)
        extraInfo.push(
            "You can reload this side quest whenever you want, but note that it will reset your progress."
        );

    const questRows = Functions.buildQuestListRows(
        ctx,
        quests ?? [],
        status.message,
        undefined,
    );
    const totalPages = Math.max(1, Math.ceil(questRows.length / Functions.QUEST_LIST_ITEMS_PER_PAGE));
    const firstQuest = currentPage * Functions.QUEST_LIST_ITEMS_PER_PAGE;
    const sections = [
        {
            text: `${ctx.client.localEmojis.a_} **Requirements**\n${sideQuestRequirementStatus.message}`,
        },
        ...questRows.slice(firstQuest, firstQuest + Functions.QUEST_LIST_ITEMS_PER_PAGE),
    ];

    if (extraInfo.length > 0) {
        sections.push({
            text: extraInfo.map((line) => `-# - ${line}`).join("\n"),
        });
    }

    return containers.primary({
        title: `${sideQuest.emoji} ${sideQuest.title}`,
        description: `\`\`\`\n${sideQuest.description}\n\`\`\`\nProgress: **${status.percent.toFixed(2)}%**`,
        descriptionDivider: true,
        sections,
        sectionDividers: true,
        color: sideQuest.color ?? Functions.QUEST_LIST_ACCENT_COLOR,
        footer: footer ?? `Page ${currentPage + 1}/${totalPages}.`,
    });
}
