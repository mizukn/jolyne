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
    MessageComponentInteraction
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
        description: "Start your bizarre adventure! Or change your settings.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "start",
                description: "Starts your bizarre adventure.",
                type: 1
            },
            {
                name: "language",
                description: "Changes your adventure language.",
                type: 1
            }
        ]
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const supportedLanguages = [
            {
                label: "English",
                value: "en-US",
                emoji: "🇺🇸"
            },
            {
                label: "German",
                value: "de-DE",
                emoji: "🇩🇪"
            },
            {
                label: "French",
                value: "fr-FR",
                emoji: "🇫🇷"
            },
            {
                label: "Spanish",
                value: "es-ES",
                emoji: "🇪🇸"
            },
            {
                label: "Russian",
                value: "ru-RU",
                emoji: "🇷🇺"
            }
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
                ctx.client.database.setCooldown(
                    ctx.user.id,
                    `You're currently starting your adventure!`
                );

                const acceptButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(ctx.translate("adventure:AGREE"))
                    .setCustomId(ctx.interaction.id + "accept");
                const declineButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(ctx.translate("adventure:DISAGREE"))
                    .setCustomId(ctx.interaction.id + "decline");

                await ctx
                    .sendTranslated("adventure:CONFIRM", {
                        components: [Functions.actionRow([acceptButton, declineButton])]
                    })
                    .catch(() => {
                        ctx.client.database.deleteCooldown(ctx.user.id);
                    });

                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === ctx.interaction.user.id;

                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000
                });

                collector.on("end", () => {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {
                    }); // eslint-disable-line @typescript-eslint/no-empty-function

                    switch (i.customId.slice(ctx.interaction.id.length)) {
                        case "decline":
                            ctx.interaction.deleteReply().catch(() => {
                            }); // eslint-disable-line @typescript-eslint/no-empty-function
                            ctx.client.database.deleteCooldown(ctx.user.id);
                            break;
                        case "accept":
                            ctx.sendTranslated("adventure:SELECT_LANGUAGE", {
                                components: [Functions.actionRow([languageMenu])]
                            });
                            break;
                        case "language":
                            ctx.RPGUserData = await ctx.client.database.createUserData(ctx.user.id);
                            ctx.userData.language = (i as StringSelectMenuInteraction)
                                .values[0] as i18n_key;

                            if (ctx.userData.language !== "en-US")
                                ctx.client.database.saveUserData(ctx.userData);

                            ctx.sendTranslated("adventure:ADVENTURE_COMPLETE", {
                                components: []
                            });
                            ctx.client.database.deleteCooldown(ctx.user.id);
                    }
                });
                break;
            }
            case "language": {
                await ctx.client.database.setCooldown(
                    ctx.user.id,
                    `You're currently editing your adventure language!`
                );

                ctx.sendTranslated("adventure:SELECT_LANGUAGE", {
                    components: [Functions.actionRow([languageMenu])]
                }).catch(() => {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                });

                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === ctx.interaction.user.id &&
                    i.customId.startsWith(ctx.interaction.id);

                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000
                });

                collector.on("end", () => {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {
                    }); // eslint-disable-line @typescript-eslint/no-empty-function
                    if (await ctx.antiCheat()) {
                        collector.stop();
                        return;
                    }

                    ctx.client.database.deleteCooldown(ctx.user.id);

                    ctx.userData.language = (i as StringSelectMenuInteraction)
                        .values[0] as i18n_key;

                    ctx.client.database.saveUserData(ctx.userData);
                    ctx.sendTranslated("adventure:LANGUAGE_CHANGED", {
                        components: []
                    });
                });

                break;
            }
        }
    }
};

export default slashCommand;
