import { FightableNPC, RPGUserQuest, SlashCommandFile } from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { InteractionType } from "discord.js";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "neeeega",
        options: [
            {
                name: "npc",
                description: "npc",
                type: 1,
            },
            {
                name: "player",
                description: "player",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "user",
                        type: ApplicationCommandOptionType.User, // 6
                    },
                ],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        // todo: ADD FightTypes.SideQuest and support for it
        function startFight(
            questId: string,
            npcId: string,
            type: FightTypes.DailyQuest | FightTypes.ChapterQuest
        ) {
            const npc = Functions.findNPC<FightableNPC>(npcId, true);
            ctx.userData.stand = "the_world"; // temp

            const fight = new FightHandler(ctx, [[ctx.userData], [npc]], type);

            fight.on("unexpectedEnd", (message) => {
                ctx.followUp({
                    content: `An error occured and your fight was ended. No changes were made towards your stats. \n\`\`\`${message}\`\`\``,
                });
            });

            fight.on("end", async (winners, losers, fightType) => {
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.userData.id); // IN CASE new daily quests

                if (losers[0].find((r) => r.id === ctx.userData.id)) {
                    const userDataFighter = losers[0].find((r) => r.id === ctx.userData.id);

                    ctx.userData.health = 0; // Security
                    ctx.userData.stamina = userDataFighter.stamina;

                    ctx.followUp({
                        content: `:skull: You lost against ${npc.name}... Better luck next time or train yourself more.`,
                    });
                } else {
                    const userDataFighter = winners.find((r) => r.id === ctx.userData.id);

                    ctx.userData.health = userDataFighter.health;
                    ctx.userData.stamina = userDataFighter.stamina;

                    let quest: RPGUserQuest;

                    if (fightType === FightTypes.DailyQuest) {
                        quest = ctx.userData.daily.quests.find((r) => r.id === questId);
                    } else {
                        quest = ctx.userData.chapter.quests.find((r) => r.id === questId);
                    }

                    quest.completed = true;

                    const winContent: string[] = [];

                    if (npc.rewards.xp) {
                        Functions.addXp(ctx.userData, npc.rewards.xp);
                        winContent.push(`+${npc.rewards.xp} ${ctx.client.localEmojis.xp}`);
                    }

                    if (npc.rewards.coins) {
                        Functions.addCoins(ctx.userData, npc.rewards.coins);
                        winContent.push(`+${npc.rewards.coins} ${ctx.client.localEmojis.jocoins}`);
                    }

                    if (quest.pushItemWhenCompleted)
                        for (const item of quest.pushItemWhenCompleted) {
                            Functions.addItem(
                                ctx.userData,
                                Functions.findItem(item.item),
                                item.amount
                            );
                            winContent.push(
                                `+${item.amount} ${Functions.findItem(item.item).name} ${
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
                    }

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

                const nextFightButton = new ButtonBuilder()
                    .setCustomId(ctx.interaction.id + "nfight")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(ctx.client.localEmojis.arrowRight);

                if (chapterQuestsNPC.length !== 0 || dailyQuestsNPC.length !== 0) {
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
                        const oldData = ctx.userData;
                        ctx.RPGUserData = await ctx.client.database.getRPGUserData(
                            ctx.interaction.user.id
                        );

                        if (JSON.stringify(oldData) !== JSON.stringify(ctx.userData)) {
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

                if (chapterQuestsNPC.length === 0 && dailyQuestsNPC.length === 0) {
                    ctx.sendTranslated("fight:NOBODY_TO_FIGHT");
                    break;
                }
                let quest;
                let type = FightTypes.ChapterQuest;

                if (chapterQuestsNPC.length === 0 && dailyQuestsNPC.length !== 0) {
                    quest = dailyQuestsNPC[0];
                    type = FightTypes.DailyQuest;
                } else if (chapterQuestsNPC.length !== 0 && dailyQuestsNPC.length === 0) {
                    quest = chapterQuestsNPC[0];
                    type = FightTypes.ChapterQuest;
                } else {
                    chapterQuestsNPC.length = 12;
                    dailyQuestsNPC.length = 12; // max string menu select options length = 25

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
                        const oldData = ctx.userData;
                        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.userData.id); // anti cheat

                        if (JSON.stringify(oldData) !== JSON.stringify(ctx.userData)) {
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
            }
        }
        return;
        const brazil = await ctx.client.database.getRPGUserData("802620164058775583");
        const aelepe = await ctx.client.database.getRPGUserData("435153814375366666");
        const leaf = await ctx.client.database.getRPGUserData("813381014977118208");

        const fight = new FightHandler(
            ctx,
            [[ctx.userData], [brazil], [leaf], [aelepe], [Kakyoin]],
            FightTypes.Boss
        );

        fight.on("unexpectedEnd", (message) => {
            ctx.followUp({
                content: `An error occured and your fight was ended. No changes were made towards your stats. \n\`\`\`${message}\`\`\``,
            });
        });
        fight.on("end", (winners, losers) => {
            ctx.followUp({
                content: `The fight has ended. Winners: ${winners
                    .map((w) => w.name)
                    .join(", ")}\nLosers: ${losers.map((l) => l.map((f) => f.name)).join(", ")}`,
            });
        });
    },
};

export default slashCommand;
