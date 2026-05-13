import type { EventFile, RPGUserQuest } from "../@types";
import {
    Events,
    Interaction,
    MessageFlags,
} from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import { commandLogsWebhook, specialLogsWebhook } from "../utils/Webhooks";
import { runCommandEntryHooks } from "../services/EventService";
import { runStep } from "../middlewares/pipeline";
import { channelMiddleware } from "../middlewares/channel";
import { bannedUserMiddleware } from "../middlewares/bannedUser";
import { commandCooldownMiddleware } from "../middlewares/commandCooldown";
import { dailyResetMiddleware } from "../middlewares/dailyReset";
import { deprecatedRedirectMiddleware } from "../middlewares/deprecatedRedirect";
import { equippedItemsMiddleware } from "../middlewares/equippedItems";
import { firstFightSkillPointsHintMiddleware } from "../middlewares/firstFightSkillPointsHint";
import { levelUpMiddleware } from "../middlewares/levelUp";
import { maintenanceMiddleware } from "../middlewares/maintenance";
import { permissionsMiddleware } from "../middlewares/permissions";
import { restingAtCampfireMiddleware } from "../middlewares/restingAtCampfire";
import { patreonRewardsMiddleware } from "../middlewares/patreonRewards";
import { questEffectsMiddleware } from "../middlewares/questEffects";
import { rpgCooldownMiddleware } from "../middlewares/rpgCooldown";
import { seasonalEmailsMiddleware } from "../middlewares/seasonalEmails";
import { sideQuestEnrollmentMiddleware } from "../middlewares/sideQuestEnrollment";
import { userBusyMiddleware } from "../middlewares/userBusy";
import { userDataFixupsMiddleware } from "../middlewares/userDataFixups";
import { userDataMiddleware } from "../middlewares/userData";
import { userStateNotificationsMiddleware } from "../middlewares/userStateNotifications";
import type { MiddlewareInput } from "../middlewares/types";

function returnUniqueQuests(quests: RPGUserQuest[]): RPGUserQuest[] {
    const fixedQuests: RPGUserQuest[] = [];
    for (const quest of quests) {
        if (!fixedQuests.find((r) => r.id === quest.id)) fixedQuests.push(quest);
    }
    return fixedQuests;
}

const Event: EventFile = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction & { client: JolyneClient }) {
        if (interaction.isCommand() && interaction.isChatInputCommand()) {
            const pipeline: MiddlewareInput = { interaction };

            if (await runStep(pipeline, maintenanceMiddleware)) return;

            if (!interaction.client.allCommands) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;
            pipeline.command = command;

            if (await runStep(pipeline, permissionsMiddleware)) return;
            if (await runStep(pipeline, channelMiddleware)) return;
            if (await runStep(pipeline, deprecatedRedirectMiddleware)) return;
            if (await runStep(pipeline, commandCooldownMiddleware)) return;
            if (await runStep(pipeline, userDataMiddleware)) return;
            if (await runStep(pipeline, rpgCooldownMiddleware)) return;

            const ctx = pipeline.ctx;
            if (!ctx) return;

            if (command.data.name !== "help" && ctx.userData) {
                runCommandEntryHooks(ctx);

                if (await runStep(pipeline, bannedUserMiddleware)) return;
                if (await runStep(pipeline, firstFightSkillPointsHintMiddleware)) return;
                if (await runStep(pipeline, userBusyMiddleware)) return;
                if (await runStep(pipeline, restingAtCampfireMiddleware)) return;

                const commandName = pipeline.commandName ?? command.data.name;
                interaction.client.log(
                    `${ctx.user.username} used ${commandName} with options: ${JSON.stringify(
                        interaction.options["data"],
                    )}`,
                    "command",
                );
                const notifications: string[] = (pipeline.notifications ??= []);
                const oldDataJSON = JSON.stringify(ctx.userData);

                // quests must be unique
                ctx.userData.chapter.quests = returnUniqueQuests(ctx.userData.chapter.quests);
                ctx.userData.daily.quests = returnUniqueQuests(ctx.userData.daily.quests);
                ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
                    (x) => x && x.quests?.length > 0,
                );
                for (const sideQuest of ctx.userData.sideQuests) {
                    sideQuest.quests = returnUniqueQuests(sideQuest.quests);
                }

                if (await runStep(pipeline, seasonalEmailsMiddleware)) return;
                if (await runStep(pipeline, patreonRewardsMiddleware)) return;
                if (await runStep(pipeline, sideQuestEnrollmentMiddleware)) return;
                if (await runStep(pipeline, userDataFixupsMiddleware)) return;
                if (await runStep(pipeline, questEffectsMiddleware)) return;
                if (await runStep(pipeline, levelUpMiddleware)) return;
                if (await runStep(pipeline, dailyResetMiddleware)) return;
                if (await runStep(pipeline, equippedItemsMiddleware)) return;
                if (await runStep(pipeline, userStateNotificationsMiddleware)) return;

                if (notifications.length > 0) {
                    ctx.followUpQueue.push({
                        content: `${notifications.join("\n\n")}\n-# <@${ctx.user.id}>`,
                    });
                }

                if (oldDataJSON !== JSON.stringify(ctx.userData))
                    ctx.client.database.saveUserData(ctx.userData);
            }

            try {
                await command.execute(ctx);
            } catch (error) {
                interaction.client.log(
                    error instanceof Error ? error.stack ?? error.message : String(error),
                    "error",
                );
                await interaction
                    .reply({
                        content: `There was an error while executing this command. Please try again later.\nError: ${
                            (error as Error)["message"]
                        }`,
                        flags: MessageFlags.Ephemeral,
                    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .catch(() => {});
            }

            let optionsString = JSON.stringify(interaction.options["data"] || {});
            if (optionsString.length > 1000) {
                optionsString = optionsString.slice(0, 1000) + "... (truncated)";
            }

            commandLogsWebhook.send(
                `🤖 | ${interaction.user.username} \`(${interaction.user.id})\` used \`/${
                    interaction.commandName
                }\` in guild ${interaction.guild?.name || "DMs"} \`(${
                    interaction.guild?.id || "N/A"
                })\` with options: \`\`\`${optionsString}\`\`\` _ _`,
            ).catch(() => {});

            if (command.category === "admin") {
                specialLogsWebhook.send(
                    `:warning: | ${interaction.user.username} \`(${
                        interaction.user.id
                    })\` used \`/${interaction.commandName}\` in guild ${
                        interaction.guild?.name || "DMs"
                    } \`(${interaction.guild?.id || "N/A"})\` with options: \`\`\`${optionsString}\`\`\` _ _`,
                ).catch(() => {});
            }
        } else if (interaction.isAutocomplete()) {
            if (
                interaction.client.maintenanceReason &&
                !process.env.OWNER_IDS.split(",").includes(interaction.user.id)
            )
                return;
            if (!interaction.client.allCommands) return;
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;

            const userData = await interaction.client.database.getRPGUserData(interaction.user.id);
            if (!userData) {
                interaction.respond([]);
                return;
            }
            if (
                (await interaction.client.database.getCooldown(userData.id)) &&
                command.data.name !== "trade"
            ) {
                interaction.respond([]);
                return;
            }
            command.autoComplete(
                interaction,
                userData,
                interaction.options.getFocused().toString(),
            );
            /*
            commandLogsWebhook.send(
                `[AUTOCOMPLETE] ${interaction.user.username} used ${
                    interaction.commandName
                } with options: ${JSON.stringify(interaction.options["data"])} (${command})`
            );*/
        }
    },
};

export default Event;
