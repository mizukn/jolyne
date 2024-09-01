import { RPGUserDataJSON, SlashCommandFile, Leaderboard, i18n_key } from "../../@types";
import {
    Message,
    APIEmbed,
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
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import * as SideQuests from "../../rpg/SideQuests";
import { getQuestsStats } from "./Chapter";

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
                ],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext,
        reloaded?: boolean
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const sideQuest = ctx.options.getString("side_quest", true);
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
        const rewardsButton = new ButtonBuilder()
            .setCustomId(rewardsButtonID)
            .setLabel("Claim Rewards")
            .setEmoji("🎉")
            .setDisabled(
                ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize ? true : false
            )
            .setStyle(ButtonStyle.Success);
        const redoQuestButton = new ButtonBuilder()
            .setCustomId(redoQuestID)
            .setLabel("Redo Quest")
            .setStyle(ButtonStyle.Primary);
        const reloadQuestsButton = new ButtonBuilder()
            .setCustomId(reloadQuestsButtonID)
            .setLabel("Reload Quests")
            .setEmoji("🔁")
            .setDisabled(reloaded ? true : false)
            .setStyle(ButtonStyle.Primary);

        if (status.percent >= 100) {
            if (
                ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize &&
                sideQuestsArr.find((r) => r.id === sideQuest).canRedoSideQuest
            )
                components.push(redoQuestButton);
            else {
                components.push(rewardsButton);
            }
        }

        if (status.percent !== 100 && SideQuest.canReloadQuests) {
            components.push(reloadQuestsButton);
        }

        ctx.makeMessage({
            /*content: `${SideQuest.emoji} **__${SideQuest.title}__**\n\`\`\`\n${
                SideQuest.description
            }\n\`\`\`\n\n${ctx.client.localEmojis.a_} **__Requirements:__**\n${
                SideQuest.requirementsMessage
            }${
                SideQuest.cancelQuestIfRequirementsNotMetAnymore
                    ? "\n- ❗ This SideQuest will be automatically erased if you don't meet the requirements anymore! Be careful."
                    : ""
            }${
                SideQuest.canRedoSideQuest
                    ? `\n- 🔁 You'll be able to redo this SideQuest as much as you want`
                    : ""
            }${
                SideQuest.canReloadQuests
                    ? `\n- 🔁 NPCs are too hard? Feel free to reload this quest whenever you want`
                    : ""
            }
            }\n\n📜 **__Quests:__** (${status.percent.toFixed(2)}%)\n${status.message}`,*/
            embeds: [
                {
                    title: `${SideQuest.emoji} **__${SideQuest.title}__**`,
                    description: `\`\`\`\n${SideQuest.description}\n\`\`\`\n\n${
                        ctx.client.localEmojis.a_
                    } **__Requirements:__**\n${SideQuest.requirementsMessage}${
                        SideQuest.cancelQuestIfRequirementsNotMetAnymore
                            ? "\n- ❗ This SideQuest will be automatically erased if you don't meet the requirements anymore! Be careful."
                            : ""
                    }${
                        SideQuest.canRedoSideQuest
                            ? `\n- 🔁 You'll be able to redo this SideQuest as much as you want`
                            : ""
                    }${
                        SideQuest.canReloadQuests
                            ? `\n- 🔁 NPCs are too hard? Feel free to reload this quest whenever you want`
                            : ""
                    }
                    \n\n📜 **__Quests:__** (${status.percent.toFixed(2)}%)\n${status.message}`,
                    color: SideQuest.color,
                },
            ],
            components: components.length === 0 ? [] : [Functions.actionRow(components)],
        });
        console.log(status.message);

        if (components.length !== 0) {
            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    (i.user.id === ctx.user.id && i.customId === rewardsButtonID) ||
                    (i.user.id === ctx.user.id && i.customId === redoQuestID) ||
                    (i.user.id === ctx.user.id && i.customId === reloadQuestsButtonID),
                time: 60000,
            });
            collector.on("collect", async (i) => {
                i.deferUpdate().catch(() => {});
                if (await ctx.antiCheat(true)) return;
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
                            ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize =
                                true;
                            ctx.client.database.saveUserData(ctx.userData);
                        }
                        if (SideQuest.canRedoSideQuest) {
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
                        ctx.client.database.saveUserData(ctx.userData);
                        collector.stop();
                        ctx.followUp({
                            content: `You've redone the quest! Use this command again to see your progress.`,
                        });
                        break;
                    }

                    case reloadQuestsButtonID: {
                        ctx.userData.sideQuests.find((x) => x.id === sideQuest).quests =
                            SideQuest.quests(ctx).map((x) => Functions.pushQuest(x));
                        ctx.userData.sideQuests.find((x) => x.id === sideQuest).claimedPrize =
                            false;
                        ctx.client.database.saveUserData(ctx.userData);
                        collector.stop();
                        /*ctx.followUp({
                            content: `You've reloaded the quests! Use this command again to see your progress.`,
                        });*/
                        ctx.client.commands.get("side")?.execute(ctx, true);
                        break;
                    }
                }
            });
        }
        //
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const sideQuestRealArr = sideQuestsArr.filter((sideQuest) =>
            userData.sideQuests.find((x) => x.id === sideQuest.id)
        );
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
