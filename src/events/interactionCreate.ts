import type { EventFile, RPGUserDataJSON, RPGUserQuest, UseXCommandQuest } from "../@types";
import { Events, Interaction } from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "../utils/Functions";

const Event: EventFile = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction & { client: JolyneClient }) {
        if (interaction.isCommand() && interaction.isChatInputCommand()) {
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
                !process.env.ADMIN_IDS.split(",").includes(interaction.user.id)
            )
                return interaction.reply({
                    content: interaction.client.localEmojis["jolyne"],
                });

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

            if (command.category === "rpg" || command.ownerOnly || command.adminOnly) {
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

                // eslint-disable-next-line
                if (false) {
                    //(command.checkRPGCooldown) {
                    const cooldown = await interaction.client.database.getRPGCooldown(
                        ctx.user.id,
                        command.checkRPGCooldown
                    );
                    if (cooldown && cooldown > Date.now()) {
                        return ctx.makeMessage({
                            content: `You can use this command again ${Functions.generateDiscordTimestamp(
                                cooldown,
                                "FROM_NOW"
                            )}`,
                        });
                    }
                }
            } else ctx = new CommandInteractionContext(interaction);

            if (command.category === "rpg" && ctx.userData) {
                const isONCD = await ctx.client.database.getCooldown(ctx.user.id);
                if (isONCD) {
                    await ctx.interaction.reply({
                        content: isONCD,
                    });
                    if (
                        !(await ctx.client.database.redis.get(
                            `tempCache_cooldown:${ctx.user.id}_toldWarning`
                        ))
                    ) {
                        ctx.followUp({
                            content: `Reminder: If you can't find the command or someone deleted it, just wait a few minutes and your cooldown will be automatically deleted. If this problem still persists, please contact us at https://discord.gg/jolyne`,
                            ephemeral: true,
                        });
                        await ctx.client.database.redis.set(
                            `tempCache_cooldown:${ctx.user.id}_toldWarning`,
                            "true"
                        );
                    }
                    return;
                }
                let commandName = command.data.name;
                if (command.data.options.filter((r) => r.type === 1).length !== 0) {
                    commandName += ` ${interaction.options.getSubcommand()}`;
                }
                const oldDataJSON = JSON.stringify(ctx.userData);

                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests) {
                        if (quest.pushEmailWhenCompleted) {
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
                        }

                        if (quest.pushQuestWhenCompleted) quests.push(quest.pushQuestWhenCompleted);
                        if (quest.pushItemWhenCompleted) {
                            for (const item of quest.pushItemWhenCompleted) {
                                const itemData = Functions.findItem(item.item);
                                if (itemData) continue;
                                if (item.chance)
                                    if (Functions.RNG(0, item.chance)) {
                                        Functions.addItem(ctx.userData, item.item, item.amount);
                                        ctx.followUpQueue.push({
                                            content: `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest.`,
                                        });
                                    } else {
                                        Functions.addItem(ctx.userData, item.item, item.amount);
                                        ctx.followUpQueue.push({
                                            content: `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest.`,
                                        });
                                    }
                            }
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
                if (ctx.userData.xp >= Functions.getMaxXp(ctx.userData.level)) {
                    ctx.userData.xp -= Functions.getMaxXp(ctx.userData.level);
                    ctx.userData.level++;
                    ctx.followUpQueue.push({
                        content: `:up: | **${ctx.user.username}** leveled up to level **${
                            ctx.userData.level
                        }**!\n\nUse the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest your skill points!`,
                    });
                }

                if (
                    ctx.userData.daily.lastDailyQuestsReset !== new Date().setUTCHours(0, 0, 0, 0)
                ) {
                    ctx.userData.daily.quests = Functions.generateDailyQuests(ctx.userData.level);
                    ctx.userData.daily.lastDailyQuestsReset = new Date().setUTCHours(0, 0, 0, 0);
                    ctx.client.database.redis.del(`daily-quests-${ctx.userData.id}`);
                    ctx.followUpQueue.push({
                        content: `:scroll:${ctx.client.localEmojis.timerIcon} | **${
                            ctx.user.username
                        }**, you have new daily quests! Use the ${ctx.client.getSlashCommandMention(
                            "daily quests"
                        )} command to see them!`,
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
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !interaction.guild) return;

            const userData = await interaction.client.database.getRPGUserData(interaction.user.id);
            if (!userData) {
                interaction.respond([]);
                return;
            }
            if (await interaction.client.database.getCooldown(userData.id)) {
                interaction.respond([]);
                return;
            }

            command.autoComplete(
                interaction,
                userData,
                interaction.options.getFocused().toString()
            );
        }
    },
};

export default Event;
