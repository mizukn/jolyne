import type { EventFile, RPGUserDataJSON, RPGUserQuest, UseXCommandQuest } from "../@types";
import { ButtonBuilder, ButtonStyle, Events, Interaction } from "discord.js";
import JolyneClient from "../structures/JolyneClient";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "../utils/Functions";
import * as SideQuests from "../rpg/SideQuests";
import { cloneDeep } from "lodash";

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
            if (!interaction.client.allCommands) {
                return interaction.reply({
                    content: "I'm still loading, please wait a few seconds.",
                    ephemeral: true,
                });
            }

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

            if (command.category === "rpg") {
                const userData = await interaction.client.database.getRPGUserData(
                    interaction.user.id
                );
                ctx = new CommandInteractionContext(interaction, userData);
                console.log(ctx.userData.emails);
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
                    if (cooldown && cooldown > Date.now()) {
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
                if (
                    ctx.userData.level === 1 &&
                    Functions.calculeSkillPointsLeft(ctx.userData) === 4 &&
                    command.data.name === "fight"
                ) {
                    await ctx.makeMessage({
                        content: `:arrow_up: | **${
                            ctx.user.username
                        }**, you have **${Functions.calculeSkillPointsLeft(
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
                }
                if (typeof ctx.userData.restingAtCampfire !== "number")
                    ctx.userData.restingAtCampfire = 0;

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
                            )} command to leave. [PATREON PASSIVE]`,
                        };
                        if (command.data.name === "campfire") {
                            ctx.followUpQueue.push(options);
                        } else {
                            ctx.makeMessage(options);
                            ctx.client.database.saveUserData(ctx.userData);
                            return;
                        }
                    }
                }
                if (Number(ctx.userData.restingAtCampfire) && command.data.name !== "campfire") {
                    ctx.makeMessage({
                        content: `🔥🪵 You're currently resting at the campfire. Use the ${ctx.client.getSlashCommandMention(
                            "campfire leave"
                        )} command to leave.`,
                    });
                    return;
                }
                let commandName = command.data.name;
                if (command.data.options.filter((r) => r.type === 1).length !== 0) {
                    commandName += ` ${interaction.options.getSubcommand()}`;
                }

                interaction.client.log(
                    `${ctx.user.username} used ${commandName} with options: ${JSON.stringify(
                        interaction.options["data"]
                    )}`,
                    "command"
                );
                // check if ctx.userData.health is lower than 10% of their Functions.getMaxHealth(ctx.userData) and/or for stamina
                if (
                    (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1 ||
                        ctx.userData.stamina < Functions.getMaxStamina(ctx.userData) * 0.1) &&
                    command.data.name !== "shop" &&
                    command.data.name !== "inventory" &&
                    command.data.name !== "campfire"
                ) {
                    ctx.followUpQueue.push({
                        content: `🩸 | You're low in health/stamina. You should heal yourself. You can use the ${ctx.client.getSlashCommandMention(
                            "shop"
                        )} command to use consumables. If you already have consumables in your inventory, use the ${ctx.client.getSlashCommandMention(
                            "inventory use"
                        )} command. If you don't want to waste your money/items, you can rest at the ${ctx.client.getSlashCommandMention(
                            "campfire rest"
                        )} (1% of your max health every 2 minutes)`,
                    });
                }
                const oldDataJSON = JSON.stringify(ctx.userData);
                // quests must be unique;
                ctx.userData.chapter.quests = returnUniqueQuests(ctx.userData.chapter.quests);
                ctx.userData.daily.quests = returnUniqueQuests(ctx.userData.daily.quests);

                const tempDate = await ctx.client.database.redis.get(
                    `tempCache_:halloween${ctx.guild.id}`
                );
                if (
                    (!tempDate || Number(tempDate) + 120000 < Date.now()) &&
                    Date.now() < 1701385140000
                ) {
                    if (Functions.percent(100)) {
                        const ID = Functions.generateRandomId();
                        const claimButton = new ButtonBuilder()
                            .setCustomId("tclaim" + ID)
                            .setLabel("Claim")
                            .setEmoji(ctx.client.localEmojis.spooky_soul)
                            .setStyle(ButtonStyle.Primary);
                        const mult = Functions.randomNumber(1, 4);

                        ctx.followUpQueue.push({
                            content: `${mult}x **Spooky Soul** has appeared! Claim it before someone else does!`,
                            components: [
                                {
                                    type: 1,
                                    components: [claimButton],
                                },
                            ],
                        });

                        await ctx.client.database.redis.set(
                            `tempCache_:halloween${ctx.guild.id}`,
                            Date.now()
                        );

                        const collector = ctx.channel.createMessageComponentCollector({
                            time: 30000,
                            max: 1,
                            filter: (i) => i.customId === "tclaim" + ID,
                        });

                        collector.on("collect", async (interaction) => {
                            const RPGUserData = await ctx.client.database.getRPGUserData(
                                interaction.user.id
                            );
                            if (!RPGUserData) return;

                            interaction
                                .reply({
                                    content: `<@${interaction.user.id}> has claimed ${mult}x Spooky Soul!`,
                                })
                                .catch(() => {
                                    interaction.channel
                                        .send({
                                            content: `<@${interaction.user.id}> has claimed ${mult}x Spooky Soul!`,
                                        })
                                        .catch(() => {});
                                });
                            Functions.addItem(
                                ctx.userData,
                                Functions.findItem("spooky_soul").id,
                                mult
                            );
                            ctx.client.database.saveUserData(ctx.userData);
                        });
                    }
                }
                for (const sideQuest of ctx.userData.sideQuests) {
                    sideQuest.quests = returnUniqueQuests(sideQuest.quests);
                }

                if (
                    Date.now() <= 1701385140000 &&
                    !ctx.userData.emails.find((r) => r.id === "halloween_2023")
                ) {
                    Functions.addEmail(ctx.userData, Functions.findEmail("halloween_2023").id);
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
                        ctx.followUpQueue.push({
                            content: `:heart:<:patronbox:1056324158524502036> | **${
                                ctx.user.username
                            }**, you received your monthly Patreon rewards! You got the following rewards:\n${Functions.getRewardsCompareData(
                                oldDataPatreon,
                                ctx.userData
                            ).join(", ")}`,
                        });
                        ctx.userData.lastPatreonReward = ctx.client.patreons.find(
                            (r) => r.id === ctx.user.id
                        ).lastPatreonCharge;
                    }
                }
                for (const SideQuest of Object.values(SideQuests)) {
                    if (await SideQuest.requirements(ctx)) {
                        if (!ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)) {
                            const fixedQuests = SideQuest.quests(ctx).map((v) =>
                                Functions.pushQuest(v)
                            );
                            ctx.userData.sideQuests.push({
                                id: SideQuest.id,
                                quests: fixedQuests,
                            });
                            ctx.followUpQueue.push({
                                content: `${SideQuest.emoji} | **${
                                    ctx.user.username
                                }**, you now have the **${
                                    SideQuest.title
                                }** SideQuest! (${ctx.client.getSlashCommandMention(
                                    "side quest view"
                                )})`,
                            });
                        }
                    } else {
                        if (
                            (ctx.userData.sideQuests.find((r) => r.id === SideQuest.id) &&
                                SideQuest.cancelQuestIfRequirementsNotMetAnymore) ||
                            (ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)?.quests &&
                                ctx.userData.sideQuests.find((r) => r.id === SideQuest.id)?.quests
                                    .length === 0)
                        ) {
                            ctx.userData.sideQuests = ctx.userData.sideQuests.filter(
                                (r) => r.id !== SideQuest.id
                            );
                            ctx.followUpQueue.push({
                                content: `:x: | **${ctx.user.username}**, you no longer meet the requirements for the **${SideQuest.title}** sidequest, so it has been removed from your sidequests list. Sorry! All your progress on it has been lost.`,
                            });
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
                                    if (Functions.RNG(0, item.chance)) {
                                        Functions.addItem(ctx.userData, item.item, item.amount);
                                        ctx.followUpQueue.push({
                                            content: `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest.`,
                                        });
                                    }
                                } else {
                                    Functions.addItem(ctx.userData, item.item, item.amount);
                                    ctx.followUpQueue.push({
                                        content: `You got ${itemData.emoji} \`${item.amount}x ${itemData.name}\` from a quest.`,
                                    });
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
                while (ctx.userData.xp >= Functions.getMaxXp(ctx.userData.level)) {
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
                if (new Date().getDay() === 0 && command.data.name !== "shop") {
                    if (!ctx.client.otherCache.get(`black_market:${ctx.user.id}`)) {
                        const data = await ctx.client.database.getJSONData(
                            Functions.getBlackMarketString(ctx.user.id)
                        );
                        ctx.client.otherCache.set(`black_market:${ctx.user.id}`, data);

                        if (!data) {
                            ctx.followUpQueue.push({
                                content: `🃏 | **${
                                    ctx.user.username
                                }**, the black market is open! Use the ${ctx.client.getSlashCommandMention(
                                    "shop"
                                )} command to see what's available! [$$]`,
                            });
                        }
                    }
                }

                if (
                    Functions.calculeSkillPointsLeft(ctx.userData) > 0 &&
                    command.data.name !== "skill"
                ) {
                    ctx.followUpQueue.push({
                        content: `:arrow_up: | **${
                            ctx.user.username
                        }**, you have **${Functions.calculeSkillPointsLeft(
                            ctx.userData
                        )}** skill points left! Use the ${ctx.client.getSlashCommandMention(
                            "skill points invest"
                        )} command to invest them!`,
                    });
                }

                // if user datA STAMINA is lower than 50% of their Functions.getMaxStamina(ctx.userData), and they used the fight command, follow up telling them that they just started a fight with low stamina, which affects their atk damage since it is based on their stam
                if (
                    ctx.userData.stamina < Functions.getMaxStamina(ctx.userData) * 0.5 &&
                    command.data.name === "fight"
                ) {
                    if (ctx.interaction.options.getSubcommand() !== "train")
                        ctx.followUpQueue.push({
                            content: `:warning: | <@${ctx.user.id}>, you're low in stamina and you just started a fight. Your stamina affects your attack damage, so be careful!`,
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
            console.log(
                `[AUTOCOMPLETE] ${interaction.user.username} used ${
                    interaction.commandName
                } with options: ${JSON.stringify(interaction.options["data"])} (${command})`
            );

            command.autoComplete(
                interaction,
                userData,
                interaction.options.getFocused().toString()
            );
        }
    },
};

export default Event;
