import {
    FightableNPC,
    type EventFile,
    type RPGUserDataJSON,
    type RPGUserQuest,
    type UseXCommandQuest,
} from "../@types";
import { Events, Interaction, InteractionReplyOptions, MessagePayload } from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "../utils/Functions";
import * as SideQuests from "../rpg/SideQuests";
import { cloneDeep, set } from "lodash";
import { commandLogsWebhook, specialLogsWebhook } from "../utils/Webhooks";
import { handlePumpkinAppeared, is2024HalloweenEvent } from "../rpg/Events/2024HalloweenEvent";
import { is2024ChristmasEventActive } from "../rpg/Events/2024ChristmasEvent";
import { handleInteraction } from "../rpg/Events/2025ChineseNewYear";
import { is3rdAnnivesaryEvent } from "../rpg/Events/3rdYearAnniversaryEvent";
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
            if (
                interaction.client.maintenanceReason &&
                !process.env.OWNER_IDS.split(",").includes(interaction.user.id)
            ) {
                console.log(
                    `${interaction.user.username} tried to use a command while in maintenance.`
                );
                return interaction.reply({
                    content: `The bot is currently in maintenance mode. Reason: \`${interaction.client.maintenanceReason}\``,
                    ephemeral: true,
                });
            }

            if (!interaction.client.allCommands) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;

            if (
                command.ownerOnly &&
                !process.env.OWNER_IDS.split(",").includes(interaction.user.id)
            )
                return interaction.reply({
                    content: interaction.client.localEmojis["jolyne"],
                });
            if (
                command.adminOnly &&
                !process.env.ADMIN_IDS.split(",").includes(interaction.user.id) &&
                !process.env.BETA
            ) {
                // if not process.env.BETA then tell no perms
                return interaction.reply({
                    content: "You don't have permission to use this command.",
                    ephemeral: true,
                });
            }
            if (!interaction.channel)
                return interaction.reply(
                    "This command is not available here. If you're on a thread, please make sure that I have the permissions to send/read messages in this thread."
                );

            // cooldown
            if (command.cooldown && !isNaN(command.cooldown)) {
                const cd = interaction.client.cooldowns.get(
                    `${interaction.user.id}:${command.data.name}`
                );
                if (cd) {
                    const timeLeft = cd - Date.now();
                    if (timeLeft > 0) {
                        return interaction.reply({
                            content: `You can use this command again in ${(timeLeft / 1000).toFixed(
                                2
                            )} seconds.`,
                            ephemeral: true,
                        });
                    } else
                        interaction.client.cooldowns.delete(
                            `${interaction.user.id}:${command.data.name}`
                        );
                } else
                    interaction.client.cooldowns.set(
                        `${interaction.user.id}:${command.data.name}`,
                        Date.now() + command.cooldown * 1000
                    );
            }
            let ctx: CommandInteractionContext;

            if (command.category === "rpg") {
                const userData = await interaction.client.database.getRPGUserData(
                    interaction.user.id
                );
                ctx = new CommandInteractionContext(interaction, userData);
                if (!ctx.userData) {
                    if (command.data.name === "adventure") {
                        if (interaction.options.getSubcommand() !== "start")
                            return ctx.sendTranslated("base:NO_ADVENTURE");
                    } else return ctx.sendTranslated("base:NO_ADVENTURE");
                }

                if (command.checkRPGCooldown) {
                    const cooldown = await interaction.client.database.getRPGCooldown(
                        ctx.user.id,
                        command.checkRPGCooldown
                    );
                    if (
                        cooldown &&
                        cooldown > Date.now() &&
                        !ctx.client.user.username.includes("Beta") &&
                        !ctx.client.user.username.includes("Alpha")
                    ) {
                        return ctx.makeMessage({
                            content: `You can use this RPG command again ${Functions.generateDiscordTimestamp(
                                cooldown,
                                "FROM_NOW"
                            )}`,
                        });
                    }
                }
            } else ctx = new CommandInteractionContext(interaction);

            if (command.category === "rpg" && ctx.userData) {
                handleInteraction(ctx);

                if (ctx.userData.inventory.candy_cane && ctx.userData.inventory.candy_cane < 0) {
                    return void ctx.makeMessage({
                        content: `:x: | **${ctx.user.username}**, You are banned. Please contact us at https://discord.gg/jolyne-support-923608916540145694-support-923608916540145694 to appeal (@mizukn).`,
                    });
                }
                if (
                    ctx.userData.level === 1 &&
                    Functions.getRawSkillPointsLeft(ctx.userData) === 4 &&
                    command.data.name === "fight"
                ) {
                    await ctx.makeMessage({
                        content: `:arrow_up: | **${
                            ctx.user.username
                        }**, you have **${Functions.getRawSkillPointsLeft(
                            ctx.userData
                        )}** skill points left! Use the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest them! It is crucial to invest your skill points to progress in the game, so please do it.`,
                    });
                    return;
                }
                const isONCD = await ctx.client.database.getCooldown(ctx.user.id);
                if (isONCD) {
                    let dox = false;
                    if (command.data.name === "trade") {
                        if (ctx.interaction.options.getSubcommand() !== "trade") {
                        } else dox = true;
                    } else dox = true;
                    if (dox) {
                        await ctx.interaction.reply({
                            content: isONCD,
                        });
                        if (
                            !(await ctx.client.database.redis.get(
                                `tempCache_cooldown:${ctx.user.id}_toldWarning`
                            ))
                        ) {
                            ctx.followUp({
                                content: `Reminder: If you can't find the command or someone deleted it, just wait a few minutes and your cooldown will be automatically deleted. If this problem still persists, please contact us at https://discord.gg/jolyne-support-923608916540145694`,
                                ephemeral: true,
                            });
                            await ctx.client.database.redis.set(
                                `tempCache_cooldown:${ctx.user.id}_toldWarning`,
                                "true"
                            );
                        }
                        return;
                    }
                }
                if (typeof ctx.userData.restingAtCampfire !== "number")
                    ctx.userData.restingAtCampfire = 0;

                /*
                if (ctx.client.patreons.find((r) => r.id === ctx.user.id)) {
                    // if user data lastSeen is more than 1 hour and 5 minutes, put them to campfire at lastSeen + 1 hour
                    if (
                        ctx.userData.lastSeen &&
                        new Date(ctx.userData.lastSeen).getTime() + 3900000 < Date.now()
                    ) {
                        ctx.userData.restingAtCampfire = new Date(ctx.userData.lastSeen).getTime();
                        const options = {
                            content: `🔥🪵 | Welcome back, **${
                                ctx.user.username
                            }**! You were resting at the campfire while you were offline. Use the ${ctx.client.getSlashCommandMention(
                                "campfire leave"
                            )} command to leave. [PATREON PASSIVE]`
                        };
                        if (command.data.name === "campfire") {
                            ctx.followUpQueue.push(options);
                        } else {
                            ctx.makeMessage(options);
                            ctx.client.database.saveUserData(ctx.userData);
                            return;
                        }
                    }
                } */
                if (Number(ctx.userData.restingAtCampfire) && command.data.name !== "campfire") {
                    ctx.makeMessage({
                        content: `🔥🪵 You're currently resting at the campfire. Use the ${ctx.client.getSlashCommandMention(
                            "campfire leave"
                        )} command to leave.`,
                    });
                    return;
                }
                let commandName = command.data.name;
                if (command.data.options?.filter((r) => r.type === 1)?.length !== 0) {
                    commandName += ` ${interaction.options.getSubcommand()}`;
                }

                interaction.client.log(
                    `${ctx.user.username} used ${commandName} with options: ${JSON.stringify(
                        interaction.options["data"]
                    )}`,
                    "command"
                );
                const notifications: string[] = [];
                // check if ctx.userData.health is lower than 10% of their Functions.getMaxHealth(ctx.userData) and/or for stamina
                if (
                    (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1 ||
                        ctx.userData.stamina < Functions.getMaxStamina(ctx.userData) * 0.1) &&
                    command.data.name !== "shop" &&
                    command.data.name !== "inventory" &&
                    command.data.name !== "campfire"
                ) {
                    if (ctx.userData.settings.notifications.low_health_or_stamina)
                        notifications.push(
                            `🩸 | You're low in health/stamina. You should  ${ctx.client.getSlashCommandMention(
                                "heal"
                            )} yourself. You can use the ${ctx.client.getSlashCommandMention(
                                "shop"
                            )} command to use consumables. If you don't want to waste your money/items, you can rest at the ${ctx.client.getSlashCommandMention(
                                "campfire rest"
                            )} (1% of your max health every 2 minutes)`
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
                            "emails view"
                        )} command to read them.`
                    );
                }
                ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
                    (x) => x && x.quests?.length > 0
                );

                for (const sideQuest of ctx.userData.sideQuests) {
                    sideQuest.quests = returnUniqueQuests(sideQuest.quests);
                }

                if (
                    Date.now() < 1707606000000 &&
                    !ctx.userData.emails.find((r) => r.id === "second_anniversary")
                ) {
                    ctx.followUpQueue.push({
                        content: `:tada: | **${ctx.user.username}**, thank you for playing Jolyne's RPG! You received a special email & quest for the 2nd anniversary of the bot!`,
                    });
                    Functions.addEmail(ctx.userData, "second_anniversary");
                }

                if (
                    is3rdAnnivesaryEvent() &&
                    !ctx.userData.emails.find((r) => r.id === "third_anniversary")
                ) {
                    ctx.followUpQueue.push({
                        content: `:tada: | **${ctx.user.username}**, thank you for playing Jolyne's RPG! You received a special email & quest for the 3rd anniversary of the bot!`,
                    });
                    Functions.addEmail(ctx.userData, "third_anniversary");
                }

                if (
                    is2024HalloweenEvent() &&
                    !ctx.userData.emails.find((r) => r.id === "halloween_2024")
                ) {
                    const hasAlreadyAdded = await ctx.client.database.getString(
                        `setHalloween2024:${ctx.user.id}`
                    );
                    if (!hasAlreadyAdded) {
                        await ctx.client.database.setString(
                            `setHalloween2024:${ctx.user.id}`,
                            "true"
                        );

                        ctx.followUpQueue.push({
                            content: `:jack_o_lantern: | **${ctx.user.username}**, Happy Halloween! You received a special email & quest for the 2024 Halloween event.`,
                        });
                        Functions.addEmail(ctx.userData, "halloween_2024");
                    }
                }
                if (
                    is2024ChristmasEventActive() &&
                    !ctx.userData.emails.find((r) => r.id === "christmas_2024")
                ) {
                    const hasAlreadyAdded = await ctx.client.database.getString(
                        `setChristmas2024:${ctx.user.id}`
                    );
                    if (!hasAlreadyAdded) {
                        await ctx.client.database.setString(
                            `setChristmas2024:${ctx.user.id}`,
                            "true"
                        );

                        ctx.followUpQueue.push({
                            content: `:christmas_tree: | **${ctx.user.username}**, You received a special email & quest for the 2024 Christmas event.`,
                        });
                        Functions.addEmail(ctx.userData, "christmas_2024");
                    }
                }

                if (ctx.client.patreons.find((r) => r.id === ctx.user.id)) {
                    if (
                        ctx.userData.lastPatreonReward !==
                        ctx.client.patreons.find((r) => r.id === ctx.user.id).lastPatreonCharge
                    ) {
                        const oldDataPatreon = cloneDeep(ctx.userData);
                        Functions.givePatreonRewards(
                            ctx.userData,
                            ctx.client.patreons.find((r) => r.id === ctx.user.id).level
                        );
                        notifications.push(
                            `:heart: <:patronbox:1056324158524502036> | You received your monthly Patreon rewards! You got these items:\n${Functions.getRewardsCompareData(
                                oldDataPatreon,
                                ctx.userData
                            ).join(", ")}`
                        );
                        ctx.userData.lastPatreonReward = ctx.client.patreons.find(
                            (r) => r.id === ctx.user.id
                        ).lastPatreonCharge;
                    }
                }
                for (const SideQuest of Object.values(SideQuests)) {
                    const status = Functions.getSideQuestRequirements(SideQuest, ctx);
                    if (status.status) {
                        if (!ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)) {
                            const fixedQuests = SideQuest.quests(ctx).map((v) =>
                                Functions.pushQuest(v)
                            );
                            ctx.userData.sideQuests.push({
                                id: SideQuest.id,
                                quests: fixedQuests,
                            });
                            notifications.push(
                                `${SideQuest.emoji} | You now have the **${
                                    SideQuest.title
                                }** SideQuest! (${ctx.client.getSlashCommandMention(
                                    "side quest view"
                                )})`
                            );
                        }
                    } else {
                        if (
                            (ctx.userData.sideQuests.find((r) => r.id === SideQuest.id) &&
                                SideQuest.cancelQuestIfRequirementsNotMetAnymore) ||
                            (ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)?.quests &&
                                ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)?.quests
                                    .length === 0)
                        ) {
                            if (
                                !ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)
                                    .claimedPrize
                            ) {
                                ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
                                    (r) => r.id !== SideQuest.id
                                );
                                notifications.push(
                                    `:x: | You no longer meet the requirements for the **${SideQuest.title}** sidequest, so it has been removed from your sidequests list. Sorry! All your progress on it has been lost.\n\n${status.notMeet}`
                                );
                            }
                        }
                    }
                }

                // check if in inventory it has something like { stand_arrow: null } and fix nulls
                ctx.userData.tag = ctx.user.username;
                for (const item in ctx.userData.inventory) {
                    if (ctx.userData.inventory[item] === null) {
                        delete ctx.userData.inventory[item];
                    }
                }

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests) {
                        if (quest.pushEmailWhenCompleted && quest.completed) {
                            const mailData = Functions.findEmail(
                                quest.pushEmailWhenCompleted.email
                            );
                            if (quest.pushEmailWhenCompleted.timeout) {
                                quests.push(
                                    Functions.generateWaitQuest(
                                        quest.pushEmailWhenCompleted.timeout,
                                        mailData.id,
                                        null,
                                        null,
                                        quest.pushEmailWhenCompleted.mustRead
                                    )
                                );
                            } else {
                                Functions.addEmail(
                                    ctx.userData,
                                    quest.pushEmailWhenCompleted.email
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
                                            `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest [${quest.type}:${quest.id}].`
                                        );
                                    }
                                } else {
                                    Functions.addItem(ctx.userData, item.item, item.amount);
                                    notifications.push(
                                        `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest [${quest.type}:${quest.id}].`
                                    );
                                }
                            }
                            quest.pushItemWhenCompleted = null;
                        }
                        if (Functions.isUseXCommandQuest(quest) && quest.command === commandName) {
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
                                                Functions.pushQuest(questData)
                                            );
                                        else if (
                                            ctx.userData.daily.quests.find((r) => r.id === quest.id)
                                        )
                                            ctx.userData.daily.quests.push(
                                                Functions.pushQuest(questData)
                                            );
                                        else {
                                            for (const sideQuest of ctx.userData.sideQuests) {
                                                if (sideQuest.quests.find((r) => r.id === quest.id))
                                                    sideQuest.quests.push(
                                                        Functions.pushQuest(questData)
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
                    queue.push(
                        `:up: | You just leveled up to level **${
                            ctx.userData.level
                        }**!\n\nUse the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest your skill points!`
                    );
                }
                if (queue.length > 5) {
                    notifications.push(
                        `:up: | You leveled up: **${oldLevel}** ${
                            ctx.client.localEmojis.arrowRight
                        } **${ctx.userData.level}**!\n\nUse the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest your skill points!`
                    );
                } else {
                    for (const item of queue) {
                        notifications.push(item);
                    }
                }
                if (new Date().getDay() === 0 && command.data.name !== "shop") {
                    if (!ctx.client.otherCache.get(`black_market:${ctx.user.id}`)) {
                        const data = await ctx.client.database.getJSONData(
                            Functions.getBlackMarketString(ctx.user.id)
                        );
                        ctx.client.otherCache.set(`black_market:${ctx.user.id}`, data);

                        if (!data) {
                            if (ctx.userData.settings.notifications.black_market)
                                notifications.push(
                                    `🃏 | The black market is open! Use the ${ctx.client.getSlashCommandMention(
                                        "shop"
                                    )} command to see what's available!\n\nYou can disable this notification with the ${ctx.client.getSlashCommandMention(
                                        "settings notifications"
                                    )} command.`
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
                            ctx.userData
                        )}** skill points left! Use the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest them!`
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
                        `:warning: | You're low in stamina and you just started a fight. Your stamina affects your attack damage, so be careful!`
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
                            "prestige"
                        )} command to prestige and start over...`
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
                        Functions.getTrueLevel(ctx.userData)
                    );
                    ctx.userData.daily.lastDailyQuestsReset = new Date().setUTCHours(0, 0, 0, 0);
                    ctx.userData.daily.dailyQuestsReset = 0;
                    ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);
                    notifications.push(
                        `:scroll:${ctx.client.localEmojis.timerIcon} | **${
                            ctx.user.username
                        }**, you have new daily quests! Use the ${ctx.client.getSlashCommandMention(
                            "daily quests"
                        )} command to see them!`
                    );
                }

                for (const [key, value] of Object.entries(ctx.userData.equippedItems)) {
                    const itemData = Functions.findItem(key);
                    if (!Functions.isEquipableItem(itemData)) continue;

                    if (!Functions.userMeetsRequirementsForItem(ctx.userData, itemData)) {
                        delete ctx.userData.equippedItems[key];
                        Functions.addItem(ctx.userData, key, 1, true);
                        notifications.push(
                            `:x: | **${ctx.user.username}**, you no longer meet the requirements for the ${itemData.emoji} \`${itemData.name}\` item, so it has been unequipped and put back in your inventory.`
                        );
                    }
                }

                if (notifications.length > 0) {
                    ctx.followUpQueue.push({
                        content: `${notifications.map((x) => `- ${x}`).join("\n")}\n-# <@${
                            ctx.user.id
                        }>`,
                    });
                }

                if (oldDataJSON !== JSON.stringify(ctx.userData))
                    ctx.client.database.saveUserData(ctx.userData);
            }

            try {
                await command.execute(ctx);
            } catch (error) {
                console.error(error);
                await interaction
                    .reply({
                        content: `There was an error while executing this command. Please try again later.\nError: ${
                            (error as Error)["message"]
                        }`,
                        ephemeral: true,
                    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .catch(() => {});
            }

            commandLogsWebhook.send(
                `🤖 | ${interaction.user.username} \`(${interaction.user.id})\` used \`/${
                    interaction.commandName
                }\` in guild ${interaction.guild.name} \`(${
                    interaction.guild.id
                })\` with options: \`\`\`${JSON.stringify(interaction.options["data"])}\`\`\` _ _`
            );

            if (command.category === "private") {
                specialLogsWebhook.send(
                    `:warning: | ${interaction.user.username} \`(${
                        interaction.user.id
                    })\` used \`/${interaction.commandName}\` in guild ${
                        interaction.guild.name
                    } \`(${interaction.guild.id})\` with options: \`\`\`${JSON.stringify(
                        interaction.options["data"]
                    )}\`\`\` _ _`
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
                interaction.options.getFocused().toString()
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
