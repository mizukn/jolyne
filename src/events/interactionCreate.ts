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
import { deprecatedRedirectMiddleware } from "../middlewares/deprecatedRedirect";
import { firstFightSkillPointsHintMiddleware } from "../middlewares/firstFightSkillPointsHint";
import { maintenanceMiddleware } from "../middlewares/maintenance";
import { permissionsMiddleware } from "../middlewares/permissions";
import { restingAtCampfireMiddleware } from "../middlewares/restingAtCampfire";
import { patreonRewardsMiddleware } from "../middlewares/patreonRewards";
import { rpgCooldownMiddleware } from "../middlewares/rpgCooldown";
import { seasonalEmailsMiddleware } from "../middlewares/seasonalEmails";
import { sideQuestEnrollmentMiddleware } from "../middlewares/sideQuestEnrollment";
import { userBusyMiddleware } from "../middlewares/userBusy";
import { userDataFixupsMiddleware } from "../middlewares/userDataFixups";
import { userDataMiddleware } from "../middlewares/userData";
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

                let commandName = command.data.name;
                if (command.data.options?.filter((r) => r.type === 1)?.length !== 0) {
                    commandName += ` ${interaction.options.getSubcommand()}`;
                }
                interaction.client.log(
                    `${ctx.user.username} used ${commandName} with options: ${JSON.stringify(
                        interaction.options["data"],
                    )}`,
                    "command",
                );
                const notifications: string[] = (pipeline.notifications ??= []);
                // check if ctx.userData.health is lower than 10% of their Functions.getMaxHealth(ctx.userData) and/or for stamina
                if (
                    (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1 ||
                        ctx.userData.stamina < Functions.getMaxStamina(ctx.userData) * 0.1) &&
                    command.data.name !== "shop" &&
                    command.data.name !== "inventory" &&
                    command.data.name !== "campfire" &&
                    command.data.name !== "heal"
                ) {
                    if (ctx.userData.settings.notifications.low_health_or_stamina)
                        notifications.push(
                            `🩸 | You're low in health/stamina. You should  ${ctx.client.getSlashCommandMention(
                                "heal",
                            )} yourself. You can use the ${ctx.client.getSlashCommandMention(
                                "shop",
                            )} command to use consumables. If you don't want to waste your money/items, you can rest at the ${ctx.client.getSlashCommandMention(
                                "rest start",
                            )} (1% of your max health every 2 minutes)`,
                        );
                }

                const oldDataJSON = JSON.stringify(ctx.userData);
                // quests must be unique;
                ctx.userData.chapter.quests = returnUniqueQuests(ctx.userData.chapter.quests);
                ctx.userData.daily.quests = returnUniqueQuests(ctx.userData.daily.quests);

                // check if emails filter !read      and tell user has x emails unread
                const unreadEmails = ctx.userData.emails.filter((r) => !r.read);
                if (
                    unreadEmails.length > 0 &&
                    command.data.name !== "emails" &&
                    ctx.userData.settings.notifications.email
                ) {
                    notifications.push(
                        `📧 | You have **${unreadEmails.length}** unread email${
                            unreadEmails.length > 1 ? "s" : ""
                        }. Use the ${ctx.client.getSlashCommandMention(
                            "mail inbox",
                        )} command to read them.`,
                    );
                }
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

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests) {
                        if (quest.pushEmailWhenCompleted && quest.completed) {
                            const mailData = Functions.findEmail(
                                quest.pushEmailWhenCompleted.email,
                            );
                            if (quest.pushEmailWhenCompleted.timeout) {
                                quests.push(
                                    Functions.generateWaitQuest(
                                        quest.pushEmailWhenCompleted.timeout,
                                        mailData.id,
                                        null,
                                        null,
                                        quest.pushEmailWhenCompleted.mustRead,
                                    ),
                                );
                            } else {
                                Functions.addEmail(
                                    ctx.userData,
                                    quest.pushEmailWhenCompleted.email,
                                );
                                if (quest.pushEmailWhenCompleted.mustRead) {
                                    quests.push(Functions.generateMustReadEmailQuest(mailData));
                                }
                            }
                            quest.pushEmailWhenCompleted = null;
                        }

                        if (quest.pushQuestWhenCompleted && quest.completed) {
                            if (!quests.find((x) => x.id === quest.pushQuestWhenCompleted.id))
                                quests.push(quest.pushQuestWhenCompleted);
                            quest.pushQuestWhenCompleted = null;
                        }

                        if (quest.pushItemWhenCompleted && quest.completed) {
                            for (const item of quest.pushItemWhenCompleted) {
                                const itemData = Functions.findItem(item.item);
                                if (!itemData) continue;
                                if (item.chance) {
                                    if (Functions.percent(item.chance)) {
                                        // wtf is this
                                        Functions.addItem(ctx.userData, item.item, item.amount);
                                        notifications.push(
                                            `-# You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest [${quest.type}:${quest.id}].`,
                                        );
                                    }
                                } else {
                                    Functions.addItem(ctx.userData, item.item, item.amount);
                                    notifications.push(
                                        `-# You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest [${quest.type}:${quest.id}].`,
                                    );
                                }
                            }
                            quest.pushItemWhenCompleted = null;
                        }
                        if (
                            Functions.isUseXCommandQuest(quest) &&
                            quest.command === commandName
                        ) {
                            quest.amount++;
                        }

                        if (Functions.isWaitQuest(quest) && !quest.claimed) {
                            if (quest.end < Date.now()) {
                                quest.claimed = true;
                                if (quest.email) {
                                    const mailData = Functions.findEmail(quest.email);
                                    Functions.addEmail(ctx.userData, quest.email);
                                    if (quest.mustRead) {
                                        quests.push(Functions.generateMustReadEmailQuest(mailData));
                                    }
                                }
                                if (quest.quest) {
                                    const questData = Functions.findQuest(quest.quest);
                                    // find a way to find if from daily, quests or sidequests
                                    if (questData) {
                                        if (quests.find((r) => r.id === quest.id))
                                            ctx.userData.chapter.quests.push(
                                                Functions.pushQuest(questData),
                                            );
                                        else if (
                                            ctx.userData.daily.quests.find((r) => r.id === quest.id)
                                        )
                                            ctx.userData.daily.quests.push(
                                                Functions.pushQuest(questData),
                                            );
                                        else {
                                            for (const sideQuest of ctx.userData.sideQuests) {
                                                if (sideQuest.quests.find((r) => r.id === quest.id))
                                                    sideQuest.quests.push(
                                                        Functions.pushQuest(questData),
                                                    );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // while checker if userData xp greater than maxXp
                const queue: string[] = [];
                const oldLevel = ctx.userData.level;
                while (
                    ctx.userData.xp >= Functions.getMaxXp(ctx.userData.level) &&
                    (process.env.ENABLE_PRESTIGE
                        ? ctx.userData.level < Functions.getMaxPrestigeLevel(ctx.userData.prestige)
                        : true)
                ) {
                    ctx.userData.xp -= Functions.getMaxXp(ctx.userData.level);
                    ctx.userData.level++;
                    queue.push(`:up: | You just leveled up to level **${ctx.userData.level}**!`);
                }
                if (queue.length > 1) {
                    notifications.push(
                        `:up: | You leveled up: **${oldLevel}** ${ctx.client.localEmojis.arrowRight} **${ctx.userData.level}**!`,
                    );
                } else {
                    for (const item of queue) {
                        notifications.push(item);
                    }
                }
                if (new Date().getDay() === 0 && command.data.name !== "shop") {
                    if (!ctx.client.otherCache.get(`black_market:${ctx.user.id}`)) {
                        const data = await ctx.client.database.getJSONData(
                            Functions.getBlackMarketString(ctx.user.id),
                        );
                        ctx.client.otherCache.set(`black_market:${ctx.user.id}`, data);

                        if (!data) {
                            if (ctx.userData.settings.notifications.black_market)
                                notifications.push(
                                    `🃏 | The black market is open! Use the ${ctx.client.getSlashCommandMention(
                                        "shop",
                                    )} command to see what's available!\n-# You can disable this notification with the ${ctx.client.getSlashCommandMention(
                                        "settings notifications",
                                    )} command.`,
                                );
                        }
                    }
                }

                if (
                    Functions.getRawSkillPointsLeft(ctx.userData) > 0 &&
                    command.data.name !== "skill" &&
                    ctx.userData.settings.notifications.skill_points
                ) {
                    notifications.push(
                        `:arrow_up: | **${
                            ctx.user.username
                        }**, you have **${Functions.getRawSkillPointsLeft(
                            ctx.userData,
                        )}** skill points left! Use the ${ctx.client.getSlashCommandMention(
                            "skills invest",
                        )} command to invest them!`,
                    );
                }

                // if user datA STAMINA is lower than 50% of their Functions.getMaxStamina(ctx.userData), and they used the fight command, follow up telling them that they just started a fight with low stamina, which affects their atk damage since it is based on their stam
                if (
                    ctx.userData.stamina < Functions.getMaxStamina(ctx.userData) * 0.5 &&
                    (command.data.name === "fight" ||
                        command.data.name === "dungeon" ||
                        command.data.name === "assault") &&
                    ctx.userData.settings.notifications.low_health_or_stamina
                ) {
                    notifications.push(
                        `:warning: | You're low in stamina and you just started a fight. Your stamina affects your attack damage, so be careful!`,
                    );
                }

                if (
                    ctx.userData.level >= Functions.getMaxPrestigeLevel(ctx.userData.prestige) &&
                    process.env.ENABLE_PRESTIGE &&
                    ctx.userData.settings.notifications.reached_max_level &&
                    command.data.name !== "prestige"
                ) {
                    notifications.push(
                        `:star: | You reached the maximum level for your prestige level! Use the ${ctx.client.getSlashCommandMention(
                            "prestige",
                        )} command to prestige and start over...`,
                    );
                }

                if (
                    ctx.userData.daily.lastDailyQuestsReset !==
                    new Date().setUTCHours(0, 0, 0, 0) /*
                         ||
                    ctx.userData.daily.quests.find((r) =>
                        Functions.isFightNPCQuest(r) && Functions.findNPC(r.npc)
                            ? Functions.findNPC<FightableNPC>(r.npc, true).level >
                              ctx.userData.level
                            : false
                    ) */
                ) {
                    ctx.userData.daily.quests = Functions.generateDailyQuests(
                        Functions.getTrueLevel(ctx.userData),
                    );
                    ctx.userData.daily.lastDailyQuestsReset = new Date().setUTCHours(0, 0, 0, 0);
                    ctx.userData.daily.dailyQuestsReset = 0;
                    ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);
                    notifications.push(
                        `:scroll:${ctx.client.localEmojis.timerIcon} | **${
                            ctx.user.username
                        }**, you have new daily quests! Use the ${ctx.client.getSlashCommandMention(
                            "quests daily",
                        )} command to see them!`,
                    );
                }

                for (const [key, value] of Object.entries(ctx.userData.equippedItems)) {
                    const itemData = Functions.findItem(key);
                    if (!Functions.isEquipableItem(itemData)) continue;

                    if (!Functions.userMeetsRequirementsForItem(ctx.userData, itemData)) {
                        delete ctx.userData.equippedItems[key];
                        Functions.addItem(ctx.userData, key, 1, true);
                        notifications.push(
                            `:x: | **${ctx.user.username}**, you no longer meet the requirements for the ${itemData.emoji} \`${itemData.name}\` item, so it has been unequipped and put back in your inventory.`,
                        );
                    }
                }

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
