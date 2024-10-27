import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserDataJSON,
    Consumable,
    numOrPerc,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as ActionQuestsL from "../../rpg/Quests/ActionQuests";
import { getQuestsStats } from "./Chapter";
import { cloneDeep } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "prestige",
        description: "Prestige your character",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (!process.env.ENABLE_PRESTIGE) {
            ctx.followUpQueue.push({
                ephemeral: true,
                content:
                    "Please note that the `PRESTIGE_WORKER` is disabled in this version of Jolyne. This is just a preview of the prestige system. More infos will be shared in our [support server](https://discord.gg/jolyne-support-923608916540145694).",
            });
        }

        const status = getQuestsStats(ctx.userData.chapter.quests, ctx);
        /*if (status.percent < 100)
            return void ctx.makeMessage({
                content: `You need to complete all chapter quests to prestige. Progress: **${status.percent}%**`,
            });*/
        /*if (ctx.userData.level < Functions.getMaxPrestigeLevel(ctx.userData.prestige))
            return void ctx.makeMessage({
                content: `You need to be level ${Functions.getMaxPrestigeLevel(
                    ctx.userData.prestige
                )} to prestige.`,
            });*/
        const meetRequirements =
            ctx.userData.level >= Functions.getMaxPrestigeLevel(ctx.userData.prestige) &&
            status.percent >= 100;
        const prestigeId = Functions.generateRandomId();
        const prestigeButton = new ButtonBuilder()
            .setCustomId(prestigeId)
            .setLabel("Prestige")
            .setDisabled(!meetRequirements)
            .setEmoji("927885909976834078")
            .setStyle(ButtonStyle.Primary);

        const totalXp = Functions.getTotalXp(ctx.userData);
        const newTotalXp = Math.round(totalXp * 0.85);
        const cobaye = cloneDeep(ctx.userData);
        while (Functions.prestigeUser(cobaye)) {
            continue;
        }

        const embed: APIEmbed = {
            title: `${ctx.client.localEmojis.a_} Prestige`,
            description: `- Your level will drop by a certain amount\n- - \`Level → Level - (50 + 200 + 350 + 500 + ... + 500 + n)\`, with a max level cap of 500 \`∀P>2\`\n- The extra ${ctx.client.localEmojis.xp} you have allows you to level up within the limits of your new prestige level.

Prestige therefore allows you to continue progressing while resetting your level in exchange for rewards`,
            fields: [
                {
                    name: "Max Level",
                    value: [0, 1, 2, 3, Infinity]
                        .map((n) => {
                            return `- \`P${n == Infinity ? "→" : "="}${n.toLocaleString(
                                "en-US"
                            )}:\` ${Functions.getMaxPrestigeLevel(n)}`;
                        })
                        .join("\n"),
                    inline: true,
                },
                {
                    name: "Status",
                    value: `- Current level: **${
                        ctx.userData.level
                    }/${Functions.getMaxPrestigeLevel(ctx.userData.prestige)}**\n- Prestige: **${
                        ctx.userData.prestige
                    }**\n- Chapter progress: **${status.percent}%**`,
                    inline: true,
                },
                {
                    name: "Changes if you prestige",
                    value: !meetRequirements
                        ? ":x: You cannot prestige at the moment."
                        : `${ctx.client.localEmojis.arrowRight} You will be level **${
                              cobaye.level
                          }/${Functions.getMaxPrestigeLevel(
                              cobaye.prestige
                          )}** with **${cobaye.xp.toLocaleString("en-US")}** ${
                              ctx.client.localEmojis.xp
                          } (total prestige: **${cobaye.prestige}**)`,
                },
            ],
            color: 0x70926c,
        };
        await ctx.makeMessage({
            embeds: [embed],
            components: meetRequirements ? [Functions.actionRow([prestigeButton])] : [],
        });

        const collector = ctx.channel.createMessageComponentCollector({
            time: 30000,
            filter: (i) => i.customId === prestigeId && i.user.id === ctx.userData.id,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            await handlePrestige(ctx, i);
            collector.stop();
        });
    },
};

async function handlePrestige(
    ctx: CommandInteractionContext,
    i: MessageComponentInteraction
): Promise<void> {
    if (!process.env.ENABLE_PRESTIGE) {
        const reply = await ctx.interaction.fetchReply();
        if (!reply) return;
        return void (await ctx.interaction.editReply({
            content:
                ":x: | The `PRESTIGE_WORKER` is disabled in this version of Jolyne. You will be able to prestige at the V4 of Jolyne.",
            embeds: Functions.makeEmbedReds(reply.embeds),
            components: Functions.disableComponents(reply.components),
        }));
    }
    if (await ctx.antiCheat(true)) return;
    await i.deferUpdate();
    const prestigeStatus = Functions.prestigeUser(ctx.userData);
    while (Functions.prestigeUser(ctx.userData)) {
        continue;
    }
    if (!prestigeStatus)
        return void ctx.makeMessage({
            content: "An error occurred while prestiging.",
            components: [],
        });

    await ctx.client.database.saveUserData(ctx.userData);

    await ctx.makeMessage({
        content: `You have prestiged! You are now level **${
            ctx.userData.level
        }** with **${ctx.userData.xp.toLocaleString("en-US")}** xp (total prestige: **${
            ctx.userData.prestige
        }**).`,
        components: [],
    });
}

export default slashCommand;
