import {
    FightableNPC,
    type EventFile,
    type RPGUserDataJSON,
    type RPGUserQuest,
    type UseXCommandQuest,
} from "../@types";
import {
    Events,
    Interaction,
    InteractionReplyOptions,
    MessageFlags,
    MessagePayload,
} from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "../utils/Functions";
import * as SideQuests from "../rpg/SideQuests";
import { cloneDeep, set } from "lodash";
import { commandLogsWebhook, specialLogsWebhook } from "../utils/Webhooks";
import { EVENT_IDS, isActive, runCommandEntryHooks } from "../services/EventService";
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
import type { Middleware, MiddlewareDecision } from "../middlewares/types";
function returnUniqueQuests(quests: RPGUserQuest[]): RPGUserQuest[] {
    const fixedQuests: RPGUserQuest[] = [];
    for (const quest of quests) {
        if (!fixedQuests.find((r) => r.id === quest.id)) fixedQuests.push(quest);
    }
    return fixedQuests;
}

// Runs a single middleware against a shared `pipeline` object. Middlewares
// may mutate the pipeline (e.g. to publish `ctx` for later steps); keeping
// one mutable object across the chain matches the standard middleware idiom
// and avoids passing a growing extras bag through every call.
async function runMiddleware(
    pipeline: import("../middlewares/types").MiddlewareInput,
    middleware: Middleware,
): Promise<MiddlewareDecision> {
    return await middleware(pipeline);
}

async function applyDecision(
    interaction: Interaction & { client: JolyneClient },
    decision: MiddlewareDecision,
): Promise<boolean> {
    if (!decision.stop) return false;
    if (decision.log) {
        interaction.client.log(decision.log.message, decision.log.type ?? "info");
    }
    if (decision.reply && interaction.isRepliable()) {
        await interaction.reply(decision.reply);
    }
    return true;
}

const Event: EventFile = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction & { client: JolyneClient }) {
        if (interaction.isCommand() && interaction.isChatInputCommand()) {
            const pipeline: import("../middlewares/types").MiddlewareInput = { interaction };

            if (await applyDecision(interaction, await runMiddleware(pipeline, maintenanceMiddleware))) return;

            if (!interaction.client.allCommands) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;
            pipeline.command = command;

            if (await applyDecision(interaction, await runMiddleware(pipeline, permissionsMiddleware))) return;
            if (await applyDecision(interaction, await runMiddleware(pipeline, channelMiddleware))) return;
            if (await applyDecision(interaction, await runMiddleware(pipeline, deprecatedRedirectMiddleware))) return;
            if (await applyDecision(interaction, await runMiddleware(pipeline, commandCooldownMiddleware))) return;
            if (await applyDecision(interaction, await runMiddleware(pipeline, userDataMiddleware))) return;
            if (await applyDecision(interaction, await runMiddleware(pipeline, rpgCooldownMiddleware))) return;

            const ctx = pipeline.ctx;
            if (!ctx) return;

            if (command.data.name !== "help" && ctx.userData) {
                runCommandEntryHooks(ctx);

                if (await applyDecision(interaction, await runMiddleware(pipeline, bannedUserMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, firstFightSkillPointsHintMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, userBusyMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, restingAtCampfireMiddleware))) return;

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

                if (await applyDecision(interaction, await runMiddleware(pipeline, seasonalEmailsMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, patreonRewardsMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, sideQuestEnrollmentMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, userDataFixupsMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, questEffectsMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, levelUpMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, dailyResetMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, equippedItemsMiddleware))) return;
                if (await applyDecision(interaction, await runMiddleware(pipeline, userStateNotificationsMiddleware))) return;

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

            commandLogsWebhook.send(
                `🤖 | ${interaction.user.username} \`(${interaction.user.id})\` used \`/${
                    interaction.commandName
                }\` in guild ${interaction.guild.name} \`(${
                    interaction.guild.id
                })\` with options: \`\`\`${JSON.stringify(interaction.options["data"])}\`\`\` _ _`,
            );

            if (command.category === "admin") {
                specialLogsWebhook.send(
                    `:warning: | ${interaction.user.username} \`(${
                        interaction.user.id
                    })\` used \`/${interaction.commandName}\` in guild ${
                        interaction.guild.name
                    } \`(${interaction.guild.id})\` with options: \`\`\`${JSON.stringify(
                        interaction.options["data"],
                    )}\`\`\` _ _`,
                );
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
