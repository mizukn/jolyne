import { SlashCommandFile, i18n_key } from "../../@types";
import {
    Message,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionResponse,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
    MessageActionRowComponentBuilder
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { containers, COLORS, V2Reply } from "../../utils/containers";

const SUPPORTED_LANGUAGES = [
    { label: "English", value: "en-US", emoji: "🇺🇸" },
    { label: "German", value: "de-DE", emoji: "🇩🇪" },
    { label: "French", value: "fr-FR", emoji: "🇫🇷" },
    { label: "Spanish", value: "es-ES", emoji: "🇪🇸" },
    { label: "Russian", value: "ru-RU", emoji: "🇷🇺" },
    { label: "Portuguese (BR)", value: "pt-BR", emoji: "🇧🇷" },
    { label: "Portuguese (PT)", value: "pt-PT", emoji: "🇵🇹" },
    { label: "Japanese", value: "ja-JP", emoji: "🇯🇵" },
    { label: "Vietnamese", value: "vi-VN", emoji: "🇻🇳" }
];

const slashCommand: SlashCommandFile = {
    hidden: true,
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
        ctx: CommandInteractionContext,
        overrideSubcommand?: string
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const subcommand = overrideSubcommand ||
            (ctx.interaction.commandName === "start" ? "start" : ctx.interaction.options.getSubcommand());
        const sessionId = `${ctx.user.id}${Date.now()}`;

        const buildLanguageUI = (isStart = false): V2Reply => {
            const languageMenu = new StringSelectMenuBuilder()
                .setCustomId(`adventure:${sessionId}:lang_select:${isStart ? "1" : "0"}`)
                .setPlaceholder("Select your preferred language")
                .addOptions(SUPPORTED_LANGUAGES)
                .setMinValues(1)
                .setMaxValues(1);

            const reply = containers.primary({
                title: "🌐 Language Selection",
                description: ctx.translate("adventure:SELECT_LANGUAGE"),
                descriptionDivider: true,
                color: COLORS.info,
            });
            reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(languageMenu));
            return reply;
        };

        switch (subcommand) {
            case "start": {
                if (ctx.userData) {
                    return ctx.makeMessage(containers.error(ctx.translate("base:ALREADY_ADVENTURE")));
                }

                await ctx.client.database.setCooldown(
                    ctx.user.id,
                    `You're currently starting your adventure!`
                );

                const buildAgreementUI = (): V2Reply => {
                    const acceptButton = new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setLabel(ctx.translate("adventure:AGREE"))
                        .setCustomId(`adventure:${sessionId}:accept`);
                    const declineButton = new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setLabel(ctx.translate("adventure:DISAGREE"))
                        .setCustomId(`adventure:${sessionId}:decline`);

                    const reply = containers.primary({
                        title: "⚔️ Start Your Adventure",
                        description: ctx.translate("adventure:CONFIRM"),
                        descriptionDivider: true,
                    });
                    reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(acceptButton, declineButton));
                    return reply;
                };

                await ctx.makeMessage(buildAgreementUI());
                const message = await ctx.interaction.fetchReply();

                const collector = message.createMessageComponentCollector({
                    filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(`adventure:${sessionId}:`),
                    time: 120000
                });

                collector.on("end", () => {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                });

                collector.on("collect", async (i) => {
                    if (i.customId === `adventure:${sessionId}:decline`) {
                        await i.update(containers.error("Adventure start cancelled. You can try again whenever you're ready!", "Use /start to begin."));
                        collector.stop();
                        return;
                    }

                    if (i.customId === `adventure:${sessionId}:accept`) {
                        await i.update(buildLanguageUI(true));
                        return;
                    }

                    if (i.customId.startsWith(`adventure:${sessionId}:lang_select:`)) {
                        const isStart = i.customId.endsWith(":1");
                        const selectedLang = (i as StringSelectMenuInteraction).values[0] as i18n_key;

                        if (isStart) {
                            ctx.RPGUserData = await ctx.client.database.createUserData(ctx.user.id);
                        }

                        ctx.userData.language = selectedLang;
                        await ctx.client.database.saveUserData(ctx.userData);

                        await i.update(containers.primary({
                            title: "✨ Adventure Started!",
                            description: ctx.translate("adventure:ADVENTURE_COMPLETE"),
                            color: COLORS.success,
                        }));
                        collector.stop();
                    }
                });
                break;
            }
            case "language": {
                if (!ctx.userData) {
                    return ctx.makeMessage(containers.error("You haven't started your adventure yet! Use `/start` to begin."));
                }

                await ctx.client.database.setCooldown(
                    ctx.user.id,
                    `You're currently editing your adventure language!`
                );

                await ctx.makeMessage(buildLanguageUI(false));
                const message = await ctx.interaction.fetchReply();

                const collector = message.createMessageComponentCollector({
                    filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(`adventure:${sessionId}:`),
                    time: 60000
                });

                collector.on("end", () => {
                    ctx.client.database.deleteCooldown(ctx.user.id);
                });

                collector.on("collect", async (i) => {
                    if (await ctx.antiCheat()) {
                        collector.stop();
                        return;
                    }

                    if (i.customId.startsWith(`adventure:${sessionId}:lang_select:`)) {
                        const selectedLang = (i as StringSelectMenuInteraction).values[0] as i18n_key;

                        ctx.userData.language = selectedLang;
                        await ctx.client.database.saveUserData(ctx.userData);
                        
                        await i.update(containers.success(
                            ctx.translate("adventure:LANGUAGE_CHANGED"),
                            `New language: ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLang)?.label}`
                        ));
                        collector.stop();
                    }
                });

                break;
            }
        }
    }
};

export default slashCommand;
