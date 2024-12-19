import { FightableNPC, RPGUserQuest, SlashCommandFile, RPGUserDataJSON } from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "Starts a fight.",
        options: [
            {
                name: "npc",
                description: "Fight against an NPC from your chapter/side/daily quests ONLY",
                type: 1,
                options: [
                    {
                        name: "npc",
                        description: "The NPC that you want to fight against",
                        type: ApplicationCommandOptionType.String, // 3
                        autocomplete: true,
                        required: true,
                    },
                ],
            },
            /*
            {
                name: "player",
                description: "Fight against a real player",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "user",
                        type: ApplicationCommandOptionType.User // 6
                    }
                ]
            },
            {
                name: "global",
                description: "Fight against a random player. Ranked if the player matches your level, unranked otherwise.",
                type: 1
            },*/
            {
                name: "custom",
                description: "Starts a custom fight",
                type: 1,
            },
            {
                name: "train",
                description:
                    "Starts a custom fight against an NPC that you've selected. It's a friendly fight.",
                type: 1,
                options: [
                    {
                        name: "npc",
                        description: "The NPC that you want to fight against",
                        type: ApplicationCommandOptionType.String, // 3
                        autocomplete: true,
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext,
        message: Message<true>
    ): Promise<Message | void> => {
        try {
            await ctx.channel.sendTyping();
        } catch (e) {
            return void ctx.makeMessage({
                content: "I don't have permission to send messages in this channel.",
                embeds: [],
                components: [],
            });
        }

        if (ctx.client.maintenanceReason)
            return void ctx.sendTranslated("global:MAINTENANCE_MODE", {
                embeds: [],
            });
        if (ctx.interaction.options.getSubcommand() === "custom") {
            let teams: RPGUserDataJSON[][] = [[ctx.userData]];
            const endLimit = Date.now() + 30000;
            const joinTeamId = Functions.generateRandomId();
            const leaveButtonId = Functions.generateRandomId();
            const createTeamButtonId = Functions.generateRandomId();
            const joinTeamSelectMenu = () =>
                new StringSelectMenuBuilder()
                    .setCustomId(joinTeamId)
                    .setPlaceholder("Select a team to join")
                    .addOptions(
                        teams.map((team, idx) => {
                            return {
                                label: `Team ${idx + 1}`,
                                value: idx.toString(),
                            };
                        })
                    );
            const leaveButton = new ButtonBuilder()
                .setCustomId(leaveButtonId)
                .setLabel("Leave Team")
                .setStyle(ButtonStyle.Danger);
            const createTeamButton = new ButtonBuilder()
                .setCustomId(createTeamButtonId)
                .setLabel("Create Team")
                .setStyle(ButtonStyle.Primary);

            async function makeMessage(): Promise<void> {
                // check if there are no enough players (only one team or there is no player at all)
                if (teams.every((team) => team.length === 0)) {
                    collector.stop();
                    await ctx.makeMessage({
                        content:
                            "There are not enough players to start the fight. Fight cancelled.",
                        components: [],
                        embeds: [],
                    });
                    return;
                }
                const embed: APIEmbed = {
                    title: "⚔️ Custom Fight",
                    description: `This is a custom fight. No rewards will be credited to winners, nothing will change. This is a friendly fight.\n\n> \`Starts (auto)\`: ${Functions.generateDiscordTimestamp(
                        endLimit,
                        "FROM_NOW"
                    )}`,
                    fields: [],
                };

                for (let i = 0; i < teams.length; i++) {
                    embed.fields.push({
                        name: `Team ${i + 1}`,
                        value: teams[i]
                            .map((x) => {
                                return `- ${x.tag} (Health: ${Functions.getMaxHealth(
                                    x
                                )})) [LEVEL: ${x.level}]`;
                            })
                            .join("\n"),
                    });
                }

                await ctx.makeMessage({
                    embeds: [embed],
                    components: [
                        Functions.actionRow([createTeamButton, leaveButton]),
                        Functions.actionRow([joinTeamSelectMenu()]),
                    ],
                });
            }

            function removeUserFromTeam(user: RPGUserDataJSON["id"]): void {
                teams = teams.map((team) => team.filter((x) => x.id !== user));
                teams = teams.filter((team) => team.length > 0);
            }

            await makeMessage();
            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.customId === joinTeamId ||
                    i.customId === leaveButtonId ||
                    i.customId === createTeamButtonId,
                time: endLimit - Date.now(),
            });

            collector.on("end", async () => {
                // check if there are no enough players (only one team or there is no player at all)
                if (teams.length === 1 || teams.every((team) => team.length === 0)) {
                    collector.stop();
                    await ctx.makeMessage({
                        content:
                            "There are not enough players to start the fight. Fight cancelled.",
                        components: [],
                        embeds: [],
                    });
                    return;
                }
                const fightHandler = new FightHandler(ctx, teams, FightTypes.Friendly);

                fightHandler.on("end", async (winners) => {
                    await ctx.followUp({
                        content: `The fight has ended. The winners are: ${winners
                            .map((x) => x.name)
                            .join(", ")}`,
                    });
                });
                fightHandler.on("unexpectedEnd", async (reason) => {
                    await ctx.followUp({
                        content: `The fight has ended unexpectedly due to an error. Reason: ${reason}`,
                    });
                });
            });
            collector.on("collect", async (i: MessageComponentInteraction) => {
                const userData = await ctx.client.database.getRPGUserData(i.user.id);
                if (!userData) return;
                await i.deferUpdate().catch(() => {});

                switch (i.customId) {
                    case joinTeamId: {
                        removeUserFromTeam(userData.id);
                        teams[parseInt((i as StringSelectMenuInteraction).values[0])]?.push(
                            userData
                        );
                        await makeMessage();
                        break;
                    }
                    case leaveButtonId: {
                        removeUserFromTeam(userData.id);
                        await makeMessage();
                        break;
                    }
                    case createTeamButtonId: {
                        if (teams.find((team) => team.includes(userData))) break;
                        removeUserFromTeam(userData.id);
                        teams.push([userData]);
                        await makeMessage();
                        break;
                    }
                }
            });
            return;
        } /*else if (ctx.interaction.options.getSubcommand() === "global") {
            ctx.client.cluster.emit("matchmakingAdd", ctx);
            return;
        }*/
        if (!ctx.interaction.replied || !message) {
            await ctx.interaction
                .deferReply({
                    ephemeral: true,
                })
                .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
        }

        function startFight(
            questId: string,
            npcId: string,
            type: FightTypes.DailyQuest | FightTypes.ChapterQuest | FightTypes.SideQuest
        ) {
            if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
                return ctx.makeMessage({
                    content:
                        `You're too low on health to fight. Try to  ${ctx.client.getSlashCommandMention(
                            "heal"
                        )} yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                            "inventory use"
                        )} or ${ctx.client.getSlashCommandMention("shop")})` +
                        (!Functions.hasVotedRecenty(
                            ctx.userData,
                            ctx.client,
                            // 12 hours
                            43200000
                        )
                            ? `\n\nYou can also ${ctx.client.getSlashCommandMention(
                                  "vote"
                              )} to restore your health & stamina and get some rewards.`
                            : ""),
                    embeds: [],
                    components: [],
                });
            } else {
                if (!message) {
                    console.log("NO MESSAGE FOUND, ATTEMTPING TO DELETE");
                }
            }
            const npc = Functions.findNPC<FightableNPC>(npcId, true);

            // ctx.interaction.deleteReply();

            const fight = new FightHandler(ctx, [[ctx.userData], [npc]], type, message);
            ctx.interaction.fetchReply().then((r) => {
                ctx.client.database.setCooldown(
                    ctx.userData.id,
                    `You're currently in a fight. Lost your battle ? Click here --> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
                );
            });
            fight.on("unexpectedEnd", (message) => {
                ctx.client.database.deleteCooldown(ctx.userData.id);
                ctx.followUp({
                    content: `An error occured and your fight was ended. No changes were made towards your stats. \n\`\`\`${message}\`\`\``,
                });
            });

            fight.on("end", async (winners, losers, fightType) => {
                await ctx.client.database.deleteCooldown(ctx.userData.id);
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.userData.id); // IN CASE new daily quests

                if (losers[0].find((r) => r.id === ctx.userData.id)) {
                    const userDataFighter = losers[0].find((r) => r.id === ctx.userData.id);

                    ctx.userData.health = 0; // Security
                    ctx.userData.stamina = userDataFighter.stamina;

                    await ctx.followUp({
                        content: `:skull: You lost against ${
                            npc.name
                        }... Better luck next time or train yourself more.\n\nTIP: You can use ${ctx.client.getSlashCommandMention(
                            "fight train"
                        )} to fight this NPC without losing any health or stamina.`,
                    });
                } else {
                    const userDataFighter = winners.find((r) => r.id === ctx.userData.id);

                    ctx.userData.health = userDataFighter.health;
                    if (ctx.userData.stamina > userDataFighter.stamina)
                        ctx.userData.stamina = userDataFighter.stamina;

                    let quest: RPGUserQuest;

                    if (fightType === FightTypes.DailyQuest) {
                        quest = ctx.userData.daily.quests.find((r) => r.id === questId);
                    } else if (fightType === FightTypes.ChapterQuest) {
                        quest = ctx.userData.chapter.quests.find((r) => r.id === questId);
                    } else if (fightType === FightTypes.SideQuest) {
                        quest = Object.values(ctx.userData.sideQuests)
                            .find((r) => r.quests.find((r) => r.id === questId))
                            .quests.find((r) => r.id === questId);
                    }

                    if (quest.completed) {
                        return void fight.message.reply({
                            content: `This quest has already been completed...?`,
                        });
                    }

                    quest.completed = true;

                    const winContent: string[] = [];

                    if (npc.rewards.xp) {
                        const xp = Functions.addXp(
                            ctx.userData,
                            fightType === FightTypes.DailyQuest ||
                                fightType === FightTypes.SideQuest
                                ? Math.round(npc.rewards.xp / 2)
                                : npc.rewards.xp,
                            ctx.client
                        );
                        winContent.push(
                            `+${xp.toLocaleString("en-US")} ${ctx.client.localEmojis.xp}`
                        );
                    }

                    if (npc.rewards.coins) {
                        const coins = Functions.addCoins(
                            ctx.userData,
                            fightType === FightTypes.DailyQuest
                                ? Math.round(npc.rewards.coins / 2)
                                : npc.rewards.coins
                        );
                        winContent.push(
                            `+${coins.toLocaleString("en-US")} ${ctx.client.localEmojis.jocoins}`
                        );
                    }

                    if (npc.rewards.items) {
                        for (const item of npc.rewards.items) {
                            if (item.chance) {
                                if (!Functions.percent(item.chance)) continue;
                            }

                            const status = Functions.addItem(
                                ctx.userData,
                                Functions.findItem(item.item),
                                item.amount
                            );
                            winContent.push(
                                `${status ? "" : "~~"}${item.amount}x ${
                                    Functions.findItem(item.item).name
                                } ${Functions.findItem(item.item).emoji}${status ? "" : "~~"}`
                            );
                        }
                    }

                    if (quest.pushItemWhenCompleted) {
                        for (const item of quest.pushItemWhenCompleted) {
                            quest.pushItemWhenCompleted = undefined;
                            if (item.chance) {
                                if (!Functions.percent(item.chance)) continue;
                            }
                            Functions.addItem(
                                ctx.userData,
                                Functions.findItem(item.item),
                                item.amount
                            );
                            winContent.push(
                                `${item.amount}x ${Functions.findItem(item.item).name} ${
                                    Functions.findItem(item.item).emoji
                                }`
                            );
                        }
                    }

                    let command: string;
                    if (fightType === FightTypes.DailyQuest) {
                        command = ctx.client.getSlashCommandMention("daily quests");
                    } else if (fightType === FightTypes.ChapterQuest) {
                        command = ctx.client.getSlashCommandMention("chapter");
                    } else if (fightType === FightTypes.SideQuest) {
                        command = ctx.client.getSlashCommandMention("side quest view");
                    }

                    if (quest.pushQuestWhenCompleted) {
                        if (fightType === FightTypes.DailyQuest) {
                            ctx.userData.daily.quests.push(quest.pushQuestWhenCompleted);
                            command = ctx.client.getSlashCommandMention("daily quests");
                        } else if (fightType === FightTypes.ChapterQuest) {
                            command = ctx.client.getSlashCommandMention("chapter");
                            ctx.userData.chapter.quests.push(quest.pushQuestWhenCompleted);
                        } else if (fightType === FightTypes.SideQuest) {
                            command = ctx.client.getSlashCommandMention("side quest view");
                            Object.values(ctx.userData.sideQuests)
                                .find((r) => r.quests.find((r) => r.id === questId))
                                .quests.push(quest.pushQuestWhenCompleted);
                        }

                        winContent.push(`+:scroll: \`${quest.pushQuestWhenCompleted.id}\``);
                    }

                    /// to be continued
                    /*
                    if (quest.pushEmailWhenCompleted) {
                        Functions.addEmail(ctx.userData, quest.pushEmailWhenCompleted.email);
                        let winContentContent = `+:envelope: \`${quest.pushEmailWhenCompleted.email}\``;

                        if (quest.pushEmailWhenCompleted.mustRead) {
                            const EmailData = Functions.findEmail(
                                quest.pushEmailWhenCompleted.email
                            );
                            if (quest.pushEmailWhenCompleted.timeout) {
                                ctx.userData.chapter.quests.push(
                                    Functions.generateWaitQuest(
                                        quest.pushEmailWhenCompleted.timeout,
                                        EmailData.id
                                    )
                                );
                            } else {
                                ctx.userData.chapter.quests.push(
                                    Functions.generateMustReadEmailQuest(EmailData)
                                );
                            }
                            winContentContent += " (must read)";
                        }
                        winContent.push(winContentContent);
                    }*/

                    // todo: add rewards
                    // todo: check if quest has to add chapter quests and/or emails

                    await fight.message.reply({
                        content: `:crossed_swords: Congratulations on beating **${
                            npc.name
                        }**, you got the following rewards: \n${winContent.join(
                            " "
                        )}\n\n---> Use the ${command} command to see your progression.`,
                    });
                }

                const oldData = await ctx.client.database.getRPGUserData(ctx.userData.id);
                //await ctx.client.database.saveUserData(ctx.userData);
                const transaction = await ctx.client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: ctx.userData,
                        },
                    ],
                    `Fight: ${npc.name} [${questId}]`
                );

                const chapterQuestsNPC = ctx.userData.chapter.quests.filter(
                    (r) => Functions.isFightNPCQuest(r) && !r.completed
                );
                const dailyQuestsNPC = ctx.userData.daily.quests.filter(
                    (r) => Functions.isFightNPCQuest(r) && !r.completed
                );
                const notFormattedSideQuestsNPC = Object.values(ctx.userData.sideQuests)
                    .filter(
                        (r) =>
                            r.quests.filter((r) => Functions.isFightNPCQuest(r) && !r.completed)
                                .length !== 0
                    )
                    .map((x) => {
                        return x.quests.filter((r) => Functions.isFightNPCQuest(r) && !r.completed);
                    })
                    .map((x) => x);
                const sideQuestsNPC: RPGUserQuest[] = [];
                for (const quest of notFormattedSideQuestsNPC) {
                    for (const quest2 of quest) {
                        sideQuestsNPC.push(quest2);
                    }
                }

                const nextFightButton = new ButtonBuilder()
                    .setCustomId(ctx.interaction.id + "nfight")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(ctx.client.localEmojis.arrowRight);

                if (
                    (chapterQuestsNPC.length !== 0 ||
                        dailyQuestsNPC.length !== 0 ||
                        sideQuestsNPC.length !== 0) &&
                    ctx.userData.health > 10
                ) {
                    await fight.message.edit({
                        components: [Functions.actionRow([nextFightButton])],
                    });

                    const filter = (i: MessageComponentInteraction) =>
                        i.customId === ctx.interaction.id + "nfight" &&
                        i.user.id === ctx.interaction.user.id;

                    const collector = ctx.channel.createMessageComponentCollector({
                        filter,
                        time: 30000,
                    });

                    collector.on("collect", async (i) => {
                        collector.stop();
                        await i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                        if (await ctx.antiCheat(true)) {
                            return;
                        }
                        return ctx.client.commands.get("fight").execute(ctx, fight.message);
                    });
                }
            });
        }

        switch (ctx.interaction.options.getSubcommand()) {
            case "npc": {
                if (message || ctx.interaction.options.getString("npc").length < 6) {
                    const chapterQuestsNPC = ctx.userData.chapter.quests.filter(
                        (r) => Functions.isFightNPCQuest(r) && !r.completed
                    );
                    const dailyQuestsNPC = ctx.userData.daily.quests.filter(
                        (r) => Functions.isFightNPCQuest(r) && !r.completed
                    );
                    const notFormattedSideQuestsNPC = Object.values(ctx.userData.sideQuests)
                        .filter(
                            (r) =>
                                r.quests.filter((r) => Functions.isFightNPCQuest(r) && !r.completed)
                                    .length !== 0
                        )
                        .map((x) => {
                            return x.quests.filter(
                                (r) => Functions.isFightNPCQuest(r) && !r.completed
                            );
                        })
                        .map((x) => x);
                    const sideQuestsNPC: RPGUserQuest[] = [];
                    for (const quest of notFormattedSideQuestsNPC) {
                        for (const quest2 of quest) {
                            sideQuestsNPC.push(quest2);
                        }
                    }
                    if (
                        chapterQuestsNPC.length === 0 &&
                        dailyQuestsNPC.length === 0 &&
                        sideQuestsNPC.length === 0
                    ) {
                        await ctx.sendTranslated("fight:NOBODY_TO_FIGHT");
                        break;
                    }
                    let quest;
                    let type = FightTypes.ChapterQuest;

                    if (
                        chapterQuestsNPC.length === 0 &&
                        dailyQuestsNPC.length !== 0 &&
                        sideQuestsNPC.length === 0
                    ) {
                        quest = dailyQuestsNPC[0];
                        type = FightTypes.DailyQuest;
                    } else if (
                        chapterQuestsNPC.length !== 0 &&
                        dailyQuestsNPC.length === 0 &&
                        sideQuestsNPC.length === 0
                    ) {
                        quest = chapterQuestsNPC[0];
                        type = FightTypes.ChapterQuest;
                    } else if (
                        chapterQuestsNPC.length === 0 &&
                        dailyQuestsNPC.length === 0 &&
                        sideQuestsNPC.length !== 0
                    ) {
                        quest = sideQuestsNPC[0];
                        type = FightTypes.SideQuest;
                    } else {
                        chapterQuestsNPC.length = 12;
                        dailyQuestsNPC.length = 12; // max string menu select options length = 25
                        sideQuestsNPC.length = 12;
                        // maxOptions limit = 25, so check if there are more than 25 quests
                        if (
                            chapterQuestsNPC.length + dailyQuestsNPC.length + sideQuestsNPC.length >
                            25
                        ) {
                            // prioritize more side quests
                            if (sideQuestsNPC.length > 12) {
                                chapterQuestsNPC.length = Math.trunc((25 - 12) / 2);
                                dailyQuestsNPC.length = Math.trunc((25 - 12) / 2);
                                sideQuestsNPC.length = 12;
                            } else {
                                chapterQuestsNPC.length = Math.trunc(
                                    (25 - sideQuestsNPC.length) / 2
                                );
                                dailyQuestsNPC.length = Math.trunc((25 - sideQuestsNPC.length) / 2);
                            }
                        }

                        const selectMenu = new StringSelectMenuBuilder()
                            .setCustomId(ctx.interaction.id + "fight")
                            .setPlaceholder(ctx.translate("fight:PLACEHOLDER"))
                            .addOptions(
                                chapterQuestsNPC
                                    .map((r) => ({
                                        label: Functions.findNPC(r.npc, true).name,
                                        description: ctx.translate<string>("fight:FROM_CHAPTER"),
                                        value: r.id,
                                        emoji: Functions.findNPC(r.npc, true).emoji,
                                    }))
                                    .filter((r) => r)
                            )
                            .addOptions(
                                dailyQuestsNPC
                                    .map((r) => ({
                                        label: Functions.findNPC(r.npc, true).name,
                                        description: ctx.translate<string>("fight:FROM_DAILY"),
                                        value: r.id,
                                        emoji: Functions.findNPC(r.npc, true).emoji,
                                    }))
                                    .filter((r) => r)
                            )
                            .addOptions(
                                sideQuestsNPC
                                    .map((r) => ({
                                        label: Functions.findNPC(r.npc, true).name,
                                        description: ctx.translate<string>("fight:FROM_SIDE_QUEST"),
                                        value: r.id,
                                        emoji: Functions.findNPC(r.npc, true).emoji,
                                    }))
                                    .filter((r) => r)
                            )
                            .setMinValues(1)
                            .setMaxValues(1);
                        if (!message)
                            await ctx.makeMessage({
                                content: ctx.translate("fight:TOO_MANY_ENEMIES"),
                                components: [Functions.actionRow([selectMenu])],
                                embeds: [],
                            });
                        else
                            await message.edit({
                                content: ctx.translate("fight:TOO_MANY_ENEMIES"),
                                components: [Functions.actionRow([selectMenu])],
                                embeds: [],
                            });

                        const filter = (i: MessageComponentInteraction) =>
                            i.user.id === ctx.interaction.user.id &&
                            i.customId.startsWith(ctx.interaction.id);
                        const collector = ctx.channel.createMessageComponentCollector({
                            filter,
                            time: 60000,
                        });

                        collector.on("collect", async (i) => {
                            i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                            if (await ctx.antiCheat(true)) {
                                collector.stop();
                                return;
                            }

                            if (i.isStringSelectMenu()) {
                                const questId = i.values[0];
                                quest = ctx.userData.daily.quests.find((r) => r.id === questId);
                                if (quest) {
                                    type = FightTypes.DailyQuest;
                                } else {
                                    quest = ctx.userData.chapter.quests.find(
                                        (r) => r.id === questId
                                    );
                                    type = FightTypes.ChapterQuest;

                                    if (!quest) {
                                        quest = Object.values(ctx.userData.sideQuests)
                                            .find((r) => r.quests.find((r) => r.id === questId))
                                            .quests.find((r) => r.id === questId);
                                        type = FightTypes.SideQuest;
                                    }
                                }

                                collector.stop();
                                if (quest) await startFight(quest.id, quest.npc, type);
                            }
                        });
                    }

                    if (quest) await startFight(quest.id, quest.npc, type);
                } else {
                    const NPC = ctx.interaction.options.getString("npc");
                    let type:
                        | FightTypes.DailyQuest
                        | FightTypes.ChapterQuest
                        | FightTypes.SideQuest;
                    let realNPC;
                    if (ctx.userData.chapter.quests.find((x) => x.id === NPC)) {
                        realNPC = ctx.userData.chapter.quests.find((x) => x.id === NPC);
                        type = FightTypes.ChapterQuest;
                    } else if (ctx.userData.daily.quests.find((x) => x.id === NPC)) {
                        type = FightTypes.DailyQuest;
                        realNPC = ctx.userData.daily.quests.find((x) => x.id === NPC);
                    } else if (
                        ctx.userData.sideQuests
                            .find((x) => x.quests.find((c) => c.id === NPC))
                            ?.quests?.find((v) => v.id === NPC)
                    ) {
                        type = FightTypes.SideQuest;
                        realNPC = ctx.userData.sideQuests
                            .find((x) => x.quests.find((c) => c.id === NPC))
                            .quests.find((v) => v.id === NPC);
                    }

                    if (!realNPC) {
                        await ctx.makeMessage({
                            content:
                                "Could not find questId `" +
                                NPC +
                                "`\n\nIf this problem appears, just type `1` on the npc argument (example: `/fight npc npc:1`).\nThis is often due because you've not properly selected the choice (perhaps your wifi is slow).",
                        });
                        return;
                    }

                    await startFight(NPC, realNPC.npc, type);
                }

                break;
            }

            case "train": {
                if (Functions.userIsCommunityBanned(ctx.userData)) {
                    await ctx.makeMessage({
                        content: "You're community banned. 🖕 ",
                        ephemeral: true,
                    });
                    return;
                }

                const npc = ctx.interaction.options.getString("npc", true);
                const npcData = Functions.findNPC<FightableNPC>(npc, true);
                if (!npcData || typeof npcData.level !== "number") {
                    await ctx.sendTranslated("fight:INVALID_NPC");
                    return;
                }

                new FightHandler(ctx, [[ctx.userData], [npcData]], FightTypes.Friendly);
            }
        }
        return;
    },
    autoComplete: async (interaction, userData, currentInput) => {
        if (interaction.options.getSubcommand() === "npc") {
            const chapterQuestsNPC = userData.chapter.quests.filter(
                (r) => Functions.isFightNPCQuest(r) && !r.completed
            );
            const dailyQuestsNPC = userData.daily.quests.filter(
                (r) => Functions.isFightNPCQuest(r) && !r.completed
            );
            const notFormattedSideQuestsNPC = Object.values(userData.sideQuests)
                .filter(
                    (r) =>
                        r.quests.filter((r) => Functions.isFightNPCQuest(r) && !r.completed)
                            .length !== 0
                )
                .map((x) => {
                    return x.quests.filter((r) => Functions.isFightNPCQuest(r) && !r.completed);
                })
                .map((x) => x);
            const sideQuestsNPC: RPGUserQuest[] = [];
            for (const quest of notFormattedSideQuestsNPC) {
                for (const quest2 of quest) {
                    sideQuestsNPC.push(quest2);
                }
            }

            const NPCs = [...chapterQuestsNPC, ...dailyQuestsNPC, ...sideQuestsNPC];

            await interaction.respond(
                NPCs.filter((r) => Functions.findNPC(r.npc, true))
                    .filter((x) => x)
                    .map((r) => ({
                        value: r.id,
                        name:
                            Functions.findNPC(r.npc, true).name +
                            " [" +
                            (userData.chapter.quests.find((x) => x.id === r.id)
                                ? "FROM YOUR CHAPTER QUESTS"
                                : userData.daily.quests.find((x) => x.id === r.id)
                                ? "FROM YOUR DAILY QUESTS"
                                : `FROM YOUR SIDE QUEST: ${
                                      userData.sideQuests.find((xx) =>
                                          xx.quests.find((qq) => qq.id === r.id)
                                      ).id
                                  }`) +
                            "]",
                    }))
                    .filter(
                        (r) =>
                            r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                            r.value.toLowerCase().includes(currentInput.toLowerCase())
                    )
                    .slice(0, 25)
            );

            return;
        }
        const NPCs = Object.values(FightableNPCS);
        const filteredNPCs = NPCs.filter(
            (r) =>
                r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                r.id.toLowerCase().includes(currentInput.toLowerCase())
        );
        const options = filteredNPCs.map((r) => ({
            value: r.id,
            name: r.name,
        }));
        if (options.length > 25) options.length = 25;

        await interaction.respond(options);
    },
};

export default slashCommand;
