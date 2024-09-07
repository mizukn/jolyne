import { SlashCommandFile } from "../../@types";
import { APIEmbed, ButtonBuilder, ButtonStyle, InteractionResponse, Message } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { Patron } from "../../structures/JolyneClient";
import { text } from "node:stream/consumers";
import color from "get-image-colors";

const tiers = {
    1: "Supporter",
    2: "Ascended Supporter",
    3: "Heaven Ascended Supporter",
    4: "Over Heaven Supporter",
    0: "Former Supporter",
};

const slashCommand: SlashCommandFile = {
    data: {
        name: "patreon",
        description: "Get the patreon link to support Jolyne and earn rewards",
        options: [
            {
                name: "public",
                description: "If the message should be public (everyone can see it)",
                type: 5,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext,
        user?: string
    ): Promise<InteractionResponse | Message | void> => {
        if (user) {
            ctx.interaction.user = await ctx.client.users.fetch(user);
        }

        const isInData = await ctx.client.database.getString(`patronData:${ctx.user.id}`);
        const isPublic = ctx.interaction.options.getBoolean("public");

        if (isInData) {
            const parsedData = JSON.parse(isInData) as Patron;
            const tier = ctx.client.patreons.find((p) => p.id === ctx.user.id)?.level ?? 0;

            const embed: APIEmbed = {
                author: {
                    name: ctx.user.username,
                    icon_url: ctx.user.displayAvatarURL(),
                },
                description:
                    parsedData.patron_status === "active_patron"
                        ? `${ctx.client.localEmojis.diamond_gif} Thank you for supporting Jolyne!`
                        : `Thanks for considering supporting Jolyne! :pray:`,
                color: 0x70926c,
                fields: [
                    {
                        name: "Tier",
                        value: String(tier) + " | " + tiers[tier],
                        inline: true,
                    },
                    {
                        name: "Total Contributions",
                        value:
                            parsedData.lifetime_support_cents / 100 + // euros
                            "€",
                        inline: true,
                    },
                    {
                        name: "Currently Entitled Amount",
                        value:
                            parsedData.currently_entitled_amount_cents / 100 + // euros
                            "€",
                        inline: true,
                    },
                    {
                        name: "Last Charge Date",
                        value:
                            Functions.generateDiscordTimestamp(
                                new Date(parsedData.last_charge_date),
                                "FULL_DATE"
                            ) +
                            ` (${Functions.generateDiscordTimestamp(
                                new Date(parsedData.last_charge_date),
                                "FROM_NOW"
                            )})`,
                        inline: true,
                    },
                    {
                        name: "Last Charge Status",
                        value: parsedData.last_charge_status,
                        inline: true,
                    },
                ],
                thumbnail: {
                    url: "https://media.jolyne.moe/xY6CEw/direct",
                },
            };

            await ctx.makeMessage({
                embeds: [embed],
                ephemeral: !isPublic,
            });
        } else {
            if (ctx.client.patreonTiers.length === 0) {
                await ctx.makeMessage({
                    content: "No patreon tiers found",
                    ephemeral: true,
                });
                return;
            }
            await ctx.interaction.deferReply();
            const embeds: APIEmbed[] = [];

            for await (const tier of ctx.client.patreonTiers) {
                const prominent = await Functions.getProminentColor(
                    tier.attributes.image_url,
                    5,
                    ctx.client
                );

                embeds.push({
                    title: tier.attributes.title + ` (${tier.attributes.amount_cents / 100}€)`,
                    description: tier.attributes.description,
                    url: `https://patreon.com${tier.attributes.url}`,
                    image: {
                        url: tier.attributes.image_url,
                    },
                    color: prominent,
                    footer: {
                        text: `Page ${embeds.length + 1}/${ctx.client.patreonTiers.length}`,
                    },
                });
            }

            let currentPage = 0;
            const maxPage = embeds.length - 1;

            const nextID = ctx.interaction.id + "next";
            const prevID = ctx.interaction.id + "prev";
            const nextBTN = () =>
                new ButtonBuilder()
                    .setCustomId(nextID)
                    .setDisabled(currentPage === maxPage)
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Secondary);
            const prevBTN = () =>
                new ButtonBuilder()
                    .setCustomId(prevID)
                    .setEmoji("⬅️")
                    .setDisabled(currentPage === 0)
                    .setStyle(ButtonStyle.Secondary);

            const makeMesage = () =>
                ctx.makeMessage({
                    embeds: [embeds[currentPage]],
                    components: [Functions.actionRow([prevBTN(), nextBTN()])],
                });

            await makeMesage();
            ctx.interaction.followUp({
                content: `Consider supporting Jolyne on Patreon to get rewards and help the bot grow!:pray: https://patreon.com/mizuki54`,
                ephemeral: true,
            });

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.user.id === ctx.user.id && i.customId.startsWith(ctx.interaction.id),
                time: 60000,
            });

            collector.on("collect", async (i) => {
                if (i.customId === nextID) {
                    currentPage++;
                    if (currentPage > maxPage) currentPage = 0;
                    await i.update({
                        embeds: [embeds[currentPage]],
                        components: [Functions.actionRow([prevBTN(), nextBTN()])],
                    });
                } else if (i.customId === prevID) {
                    currentPage--;
                    if (currentPage < 0) currentPage = maxPage;
                    await i.update({
                        embeds: [embeds[currentPage]],
                        components: [Functions.actionRow([prevBTN(), nextBTN()])],
                    });
                }
            });
        }
    },
};

export default slashCommand;
