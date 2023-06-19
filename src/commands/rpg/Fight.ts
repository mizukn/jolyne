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
import { FightHandler, FightTypes, Fighter } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { InteractionType } from "discord.js";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";

function getTeamIdx(fighter: RPGUserDataJSON, teams: RPGUserDataJSON[][]): number {
    return teams.findIndex((team) => team.includes(fighter));
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "l",
        options: [
            {
                name: "npc",
                description: "Fight against an NPC from your chapter/side/daily quests ONLY",
                type: 1,
            },
            {
                name: "player",
                description: "Fight against a real player",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "user",
                        type: ApplicationCommandOptionType.User, // 6
                    },
                ],
            },
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
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
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

            // eslint-disable-next-line
            function makeMessage(): void {
                // check if there are no enough players (only one team or there is no player at all)
                if (teams.every((team) => team.length === 0)) {
                    collector.stop();
                    ctx.makeMessage({
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

                ctx.makeMessage({
                    embeds: [embed],
                    components: [
                        Functions.actionRow([createTeamButton, leaveButton]),
                        Functions.actionRow([joinTeamSelectMenu()]),
                    ],
                });
            }
            // eslint-disable-next-line
            function removeUserFromTeam(user: RPGUserDataJSON["id"]): void {
                teams = teams.map((team) => team.filter((x) => x.id !== user));
                teams = teams.filter((team) => team.length > 0);
            }

            makeMessage();
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
                    console.log(teams);
                    collector.stop();
                    ctx.makeMessage({
                        content:
                            "There are not enough players to start the fight. Fight cancelled.",
                        components: [],
                        embeds: [],
                    });
                    return;
                }
                const fightHandler = new FightHandler(ctx, teams, FightTypes.Friendly);

                fightHandler.on("end", async (winners) => {
                    ctx.followUp({
                        content: `The fight has ended. The winners are: ${winners
                            .map((x) => x.name)
                            .join(", ")}`,
                    });
                });
                fightHandler.on("unexpectedEnd", (reason) => {
                    ctx.followUp({
                        content: `The fight has ended unexpectedly due to an error. Reason: ${reason}`,
                    });
                });
            });
            collector.on("collect", async (i: MessageComponentInteraction) => {
                const userData = await ctx.client.database.getRPGUserData(i.user.id);
                if (!userData) return;
                i.deferUpdate().catch(() => {}); // eslint-disable-line

                switch (i.customId) {
                    case joinTeamId: {
                        console.log((i as StringSelectMenuInteraction).values[0]);
                        removeUserFromTeam(userData.id);
                        teams[parseInt((i as StringSelectMenuInteraction).values[0])].push(
                            userData
                        );
                        makeMessage();
                        break;
                    }
                    case leaveButtonId: {
                        removeUserFromTeam(userData.id);
                        makeMessage();
                        break;
                    }
                    case createTeamButtonId: {
                        if (teams.find((team) => team.includes(userData))) break;
                        removeUserFromTeam(userData.id);
                        teams.push([userData]);
                        makeMessage();
                        break;
                    }
                }
            });
            return;
        }
        // todo: ADD FightTypes.SideQuest and support for it
        function startFight(
            questId: string,
            npcId: string,
            type: FightTypes.DailyQuest | FightTypes.ChapterQuest | FightTypes.SideQuest
        ) {
            if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
                return ctx.makeMessage({
                    content: `You're too low on health to fight. Try to heal yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                        "inventory use"
                    )} or ${ctx.client.getSlashCommandMention("shop")})`,
                    embeds: [],
                    components: [],
                });
            }
            const npc = Functions.findNPC<FightableNPC>(npcId, true);

            const fight = new FightHandler(ctx, [[ctx.userData], [npc]], type);
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
                ctx.client.database.deleteCooldown(ctx.userData.id);
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.userData.id); // IN CASE new daily quests

                if (losers[0].find((r) => r.id === ctx.userData.id)) {
                    const userDataFighter = losers[0].find((r) => r.id === ctx.userData.id);

                    ctx.userData.health = 0; // Security
                    ctx.userData.stamina = userDataFighter.stamina;

                    ctx.followUp({
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

                    quest.completed = true;

                    const winContent: string[] = [];

                    if (npc.rewards.xp) {
                        const xp = Functions.addXp(
                            ctx.userData,
                            fightType === FightTypes.DailyQuest
                                ? Math.round(npc.rewards.xp / 55)
                                : npc.rewards.xp
                        );
                        winContent.push(
                            `+${xp.toLocaleString("en-US")} ${ctx.client.localEmojis.xp}`
                        );
                    }

                    if (npc.rewards.coins) {
                        const coins = Functions.addCoins(
                            ctx.userData,
                            fightType === FightTypes.DailyQuest
                                ? Math.round(npc.rewards.coins / 350)
                                : npc.rewards.coins
                        );
                        winContent.push(
                            `+${coins.toLocaleString("en-US")} ${ctx.client.localEmojis.jocoins}`
                        );
                    }

                    if (quest.pushItemWhenCompleted)
                        for (const item of quest.pushItemWhenCompleted) {
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

                    if (quest.pushQuestWhenCompleted) {
                        ctx.userData.chapter.quests.push(quest.pushQuestWhenCompleted);
                        winContent.push(
                            `+:scroll: \`${
                                quest.pushQuestWhenCompleted.id
                            }\` (use the ${ctx.client.getSlashCommandMention("chapter")} command)`
                        );
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

                    ctx.followUp({
                        content: `:crossed_swords: Congratulations on beating **${
                            npc.name
                        }**, you got the following rewards: \n${winContent.join(" ")}`,
                    });
                }
                ctx.client.database.saveUserData(ctx.userData);

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
                    ctx.makeMessage({
                        components: [Functions.actionRow([nextFightButton])],
                    });

                    const filter = (i: MessageComponentInteraction) =>
                        i.customId === ctx.interaction.id + "nfight" &&
                        i.user.id === ctx.interaction.user.id;

                    const collector = ctx.channel.createMessageComponentCollector({
                        filter,
                        time: 15000,
                    });

                    collector.on("collect", async (i) => {
                        await i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                        if (await ctx.antiCheat(true)) {
                            collector.stop();
                            return;
                        }
                        return ctx.client.commands.get("fight").execute(ctx);
                    });
                }
            });
        }
        switch (ctx.interaction.options.getSubcommand()) {
            case "npc": {
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
                if (
                    chapterQuestsNPC.length === 0 &&
                    dailyQuestsNPC.length === 0 &&
                    sideQuestsNPC.length === 0
                ) {
                    ctx.sendTranslated("fight:NOBODY_TO_FIGHT");
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
                            chapterQuestsNPC.length = Math.trunc((25 - sideQuestsNPC.length) / 2);
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
                                    description: ctx.translate("fight:FROM_CHAPTER"),
                                    value: r.id,
                                    emoji: Functions.findNPC(r.npc, true).emoji,
                                }))
                                .filter((r) => r)
                        )
                        .addOptions(
                            dailyQuestsNPC
                                .map((r) => ({
                                    label: Functions.findNPC(r.npc, true).name,
                                    description: ctx.translate("fight:FROM_DAILY"),
                                    value: r.id,
                                    emoji: Functions.findNPC(r.npc, true).emoji,
                                }))
                                .filter((r) => r)
                        )
                        .addOptions(
                            sideQuestsNPC
                                .map((r) => ({
                                    label: Functions.findNPC(r.npc, true).name,
                                    description: ctx.translate("fight:FROM_SIDE_QUEST"),
                                    value: r.id,
                                    emoji: Functions.findNPC(r.npc, true).emoji,
                                }))
                                .filter((r) => r)
                        )
                        .setMinValues(1)
                        .setMaxValues(1);
                    ctx.makeMessage({
                        content: ctx.translate("fight:TOO_MANY_ENEMIES"),
                        components: [Functions.actionRow([selectMenu])],
                        embeds: [],
                    });

                    const filter = (i: MessageComponentInteraction) =>
                        i.user.id === ctx.interaction.user.id &&
                        i.customId.startsWith(ctx.interaction.id);
                    const collector = ctx.channel.createMessageComponentCollector({
                        filter,
                        time: 15000,
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
                                quest = ctx.userData.chapter.quests.find((r) => r.id === questId);
                                type = FightTypes.ChapterQuest;
                            }

                            if (quest) startFight(quest.id, quest.npc, type);
                            collector.stop();
                        }
                    });
                }

                if (quest) startFight(quest.id, quest.npc, type);
                break;
            }

            case "train": {
                const npc = ctx.interaction.options.getString("npc", true);
                const npcData = Functions.findNPC<FightableNPC>(npc, true);
                if (!npcData || typeof npcData.level !== "number") {
                    console.log(npcData, npc);
                    ctx.sendTranslated("fight:INVALID_NPC");
                    return;
                }

                new FightHandler(ctx, [[ctx.userData], [npcData]], FightTypes.Friendly);
            }
        }
        return;
    },
    autoComplete: async (interaction, userData, currentInput) => {
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

        interaction.respond(options);
    },
};

export default slashCommand;
