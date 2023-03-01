import { RPGUserDataJSON, SlashCommandFile, Leaderboard, i18n_key } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionCollector,
    ButtonInteraction,
    CacheType,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    InteractionResponse,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

const slashCommand: SlashCommandFile = {
    data: {
        name: "adventure",
        description: "[...]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "start",
                description: "Starts your bizarre adventure.",
                type: 1,
            },
            {
                name: "reset",
                description: "Resets all your data from our database.",
                type: 1,
            },
            {
                name: "language",
                description: "Changes your adventure language.",
                type: 1,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const supportedLanguages = [
            {
                label: "English",
                value: "en-US",
                emoji: "🇺🇸",
            },
            {
                label: "German",
                value: "de-DE",
                emoji: "🇩🇪",
            },
            {
                label: "French",
                value: "fr-FR",
                emoji: "🇫🇷",
            },
            {
                label: "Spanish",
                value: "es-ES",
                emoji: "🇪🇸",
            },
            {
                label: "Russian",
                value: "ru-RU",
                emoji: "🇷🇺",
            },
        ];

        const languageMenu = new StringSelectMenuBuilder()
            .setCustomId(ctx.interaction.id + "language")
            .setPlaceholder("Select a language")
            .addOptions(supportedLanguages)
            .setMinValues(1)
            .setMaxValues(1);

        switch (ctx.interaction.options.getSubcommand()) {
            case "start": {
                if (ctx.userData) return ctx.sendTranslated("base:ALREADY_ADVENTURE");
                const acceptButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(ctx.translate("adventure:AGREE"))
                    .setCustomId(ctx.interaction.id + "accept");
                const declineButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(ctx.translate("adventure:DISAGREE"))
                    .setCustomId(ctx.interaction.id + "decline");

                await ctx.sendTranslated("adventure:CONFIRM", {
                    components: [Functions.actionRow([acceptButton, declineButton])],
                });

                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === ctx.interaction.user.id;

                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    switch (i.customId.slice(ctx.interaction.id.length)) {
                        case "decline":
                            ctx.interaction.deleteReply().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                            break;
                        case "accept":
                            ctx.sendTranslated("adventure:SELECT_LANGUAGE", {
                                components: [Functions.actionRow([languageMenu])],
                            });
                            break;
                        case "language":
                            ctx.RPGUserData = await ctx.client.database.createUserData(ctx.user.id);
                            ctx.userData.language = (i as StringSelectMenuInteraction)
                                .values[0] as i18n_key;

                            if (ctx.userData.language !== "en-US")
                                ctx.client.database.saveUserData(ctx.userData);

                            ctx.sendTranslated("adventure:ADVENTURE_COMPLETE", {
                                components: [],
                            });
                    }
                });
                break;
            }
            case "reset": {
                if (await ctx.client.database.redis.get(`adventure:${ctx.user.id}`))
                    return ctx.makeMessage({
                        content: ctx.client.localEmojis.jolyne,
                    });
                const yesButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(ctx.translate("base:YES"))
                    .setCustomId(ctx.interaction.id + "yes");
                const noButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(ctx.translate("base:NO"))
                    .setCustomId(ctx.interaction.id + "no");

                await ctx.sendTranslated("adventure:ADVENTURE_RESET_BITE", {
                    components: [Functions.actionRow([yesButton, noButton])],
                });

                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === ctx.interaction.user.id &&
                    i.customId.startsWith(ctx.interaction.id);

                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    switch (i.customId.slice(ctx.interaction.id.length)) {
                        case "yes":
                            await ctx.client.database.deleteUserData(ctx.user.id);
                            await ctx.sendTranslated("adventure:ADVENTURE_RESET_MESSAGE", {
                                components: [],
                            });
                            await ctx.client.database.redis.set(
                                `adventure:${ctx.user.id}`,
                                "alreadyresetindeed"
                            );
                            break;
                        case "no":
                            ctx.interaction.deleteReply().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                            break;
                    }
                });
                break;
            }
            case "language": {
                ctx.sendTranslated("adventure:SELECT_LANGUAGE", {
                    components: [Functions.actionRow([languageMenu])],
                });

                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === ctx.interaction.user.id &&
                    i.customId.startsWith(ctx.interaction.id);

                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

                    ctx.userData.language = (i as StringSelectMenuInteraction)
                        .values[0] as i18n_key;

                    ctx.client.database.saveUserData(ctx.userData);
                    ctx.sendTranslated("adventure:LANGUAGE_CHANGED", {
                        components: [],
                    });
                });

                break;
            }
        }
    },
};

export default slashCommand;
