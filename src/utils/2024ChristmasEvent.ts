import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "./Functions";
import { Ornament } from "../rpg/Items/Items";
import { APIEmbed, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { cloneDeep } from "lodash";
import { SlashCommand } from "../@types";

export const endOf2024ChristmasEvent = 1735772399000;
export const startOf2024ChristmasEvent = new Date(2024, 11, 1).getTime();
export const is2024ChristmasEventActive = (): boolean =>
    Date.now() > startOf2024ChristmasEvent && Date.now() < endOf2024ChristmasEvent;
export const is2024ChristmasEventEndingSoon = (): boolean => {
    // 4 days before the event ends
    if (!is2024ChristmasEventActive()) return false;
    return endOf2024ChristmasEvent - Date.now() < 4 * 24 * 60 * 60 * 1000;
};

export const trades = [
    {
        amount: 3,
        item: "box",
    },
    {
        amount: 10,
        item: "xp_box",
    },
    {
        amount: 3,
        item: "stand_arrow",
    },
    {
        amount: 3,
        item: "skill_points_reset_potion",
    },
    {
        amount: 9,
        item: "rare_stand_arrow",
    },
    {
        amount: 500,
        item: "requiem_arrow",
    },
    {
        amount: 50,
        item: "bloody_knife",
    },

    {
        amount: 150,
        item: "nix.$disc$",
    },
    {
        amount: 450 * 10,
        item: "excalibur",
    },
].sort((a, b) => a.amount - b.amount);

export const eventMessage = (ctx: CommandInteractionContext): string => {
    return `\`\`\`\nKrampus has been abducting children, leaving chaos in his wake! Defeat him to free the children and earn rewards\n\`\`\`

- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] command to check your progression
- - Defeat Krampus' Goons to get <:ornament:1311072010696396840> **Ornaments** (15%)
- You can trade your  <:ornament:1311072010696396840> **Ornaments** with <:jollypolpo:1311452026428723240> **Jolly Polpo** for items using by using the ${ctx.client.getSlashCommandMention(
        "event trade"
    )} command
- You can ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Pale Dark**, the event boss to get more <:ornament:1311072010696396840> **Ornaments** and other rewards
-# - The event ends on ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`;
};

export const Christmas2024EventCommandHandler: SlashCommand["execute"] = async (
    ctx: CommandInteractionContext
): Promise<void> => {
    if (!is2024ChristmasEventActive() && false) {
        await ctx.makeMessage({
            content: "There is no event currently running.",
        });
        return;
    }
    const subcommand = ctx.interaction.options.getSubcommand();
    if (subcommand === "info") {
        const embed: APIEmbed = {
            title: "<:ornament:1311072010696396840> **__2024 Halloween Event__**",
            description: eventMessage(ctx),
            color: 0xd8304a,
        };

        await ctx.makeMessage({ embeds: [embed] });
    } else if (subcommand === "trade") {
        if (!ctx.userData) {
            return;
        }
        const ornaments = () => ctx.userData.inventory[Ornament.id] || 0;
        if (ornaments() === 0) {
            await ctx.makeMessage({ content: "You don't have any ornaments." });
            return;
        }
        const formattedTrades = trades.map((trade) => ({
            item: Functions.findItem(trade.item),
            amount: trade.amount,
            hasEnough: () =>
                ornaments() >= trade.amount &&
                Functions.addItem(cloneDeep(ctx.userData), trade.item, 1),
        }));

        const getSelectMenuTrades = () =>
            formattedTrades
                .filter((trade) => trade.hasEnough())
                .map((trade) => ({
                    label: `${trade.item.name}`,
                    value: trade.item.name,
                    description: `${trade.amount.toLocaleString("en-US")} Ornaments`,
                    emoji: trade.item.emoji,
                }));

        const selectMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "trade")
                .setPlaceholder("Select a trade")
                .addOptions(
                    getSelectMenuTrades().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getSelectMenuTrades()
                )
                .setDisabled(formattedTrades.filter((trade) => trade.hasEnough()).length === 0);

        const getOptions = () =>
            Array.from({ length: 25 }, (_, i) => i + 1)
                .map((i) => ({
                    label: `x${i} (${
                        i *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount
                    } Ornaments)`,
                    value: i.toString(),
                }))
                .filter(
                    (i) =>
                        ornaments() >=
                            parseInt(i.value) *
                                formattedTrades.find(
                                    (trade) => trade.item.name === currentTrade.item
                                ).amount &&
                        Functions.addItem(
                            cloneDeep(ctx.userData),
                            currentTrade.item,
                            parseInt(i.value)
                        )
                );
        const selectAnAmountMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "amount")
                .setPlaceholder("Select an amount")
                .setDisabled(getOptions().length === 0)
                .addOptions(
                    getOptions().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getOptions()
                );
        let currentTrade: { item: string; amount: number } | null = null;

        const embed = (): APIEmbed => {
            return {
                author: {
                    name: `Jolly Polpo's Trades`,
                    icon_url: "https://media.jolyne.moe/Yxa0fy/direct",
                },
                color: 0xd8304a,
                description: `${
                    ctx.client.localEmojis.replyEnd
                } You have \`${ornaments().toLocaleString(
                    "en-US"
                )}\` ornaments <:ornament:1311072010696396840>`,
                fields: [
                    ...formattedTrades.map((trade) => ({
                        name: `${trade.item.emoji} ${trade.item.name}`,
                        value: `${ctx.client.localEmojis.replyEnd} \`x${trade.amount.toLocaleString(
                            "en-US"
                        )}\` <:ornament:1311072010696396840>`,
                        inline: true,
                    })),
                    {
                        // blank
                        name: "\u200b",
                        value: `-# You can only have x3 copies of the **EVENT_WEAPON**.`,
                    },
                ],
                /*thumbnail: {
                    url: "https://cdn.discordapp.com/emojis/1294731380017856715.webp?size=512",
                },*/
            };
        };

        const goBackButton = new ButtonBuilder()
            .setCustomId(ctx.interaction.id + "goBack")
            .setLabel("Go back")
            .setEmoji("🔙")
            .setStyle(ButtonStyle.Secondary);

        const components = () => Functions.actionRow([selectMenu()]);
        await ctx.makeMessage({ embeds: [embed()], components: [components()] });

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                (interaction.customId === ctx.interaction.id + "trade" ||
                    interaction.customId === ctx.interaction.id + "amount" ||
                    interaction.customId === ctx.interaction.id + "goBack") &&
                ctx.interaction.user.id === interaction.user.id,
        });

        const Timeouter = () =>
            setTimeout(() => {
                collector.stop();
            }, 60000);
        let timeouter: NodeJS.Timeout = Timeouter();

        collector.on("collect", async (interaction) => {
            clearTimeout(timeouter);
            timeouter = Timeouter();

            if (await ctx.antiCheat(true)) return;

            switch (interaction.customId) {
                case ctx.interaction.id + "trade": {
                    if (!interaction.isStringSelectMenu()) return;

                    const selectedItem = formattedTrades.find(
                        (trade) => trade.item.name === interaction.values[0]
                    );
                    if (!selectedItem) {
                        return;
                    }
                    currentTrade = {
                        item: interaction.values[0],
                        amount: null,
                    };
                    const selectAnAmountComponents = Functions.actionRow([selectAnAmountMenu()]);
                    const goBack = Functions.actionRow([goBackButton]);
                    ctx.makeMessage({
                        content: `${selectedItem.item.emoji} | You selected **${selectedItem.item.name}**.`,
                        components: [selectAnAmountComponents, goBack],
                    });
                    interaction.deferUpdate().catch(() => {});
                    break;
                }

                case ctx.interaction.id + "amount": {
                    if (!interaction.isStringSelectMenu()) return;
                    if (!currentTrade) {
                        return;
                    }
                    const selectedAmount = parseInt(interaction.values[0]); //currentTrade.amount = parseInt(interaction.values[0]);
                    const amountBought =
                        selectedAmount *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount;

                    if (ornaments() < selectedAmount) {
                        ctx.interaction.followUp({
                            content: "You don't have enough ornaments.",
                            ephemeral: true,
                        });
                        interaction.deferUpdate().catch(() => {});
                        return;
                    }
                    const status: boolean[] = [
                        Functions.addItem(ctx.userData, currentTrade.item, selectedAmount),
                        Functions.removeItem(ctx.userData, Ornament.id, amountBought),
                    ];
                    if (!status.every((s) => s)) {
                        ctx.interaction
                            .followUp({
                                content:
                                    "An error occurred. If you selected EVENT_WEAPON, please note that you can't have more than 3 copies of it.",
                                ephemeral: true,
                            })
                            .catch(() => {});
                        return;
                    }
                    ctx.client.database.saveUserData(ctx.userData);

                    ctx.interaction
                        .followUp({
                            content: `You traded ${amountBought} ornaments for ${selectedAmount}x ${currentTrade.item}.`,
                            ephemeral: true,
                        })
                        .catch(() => {});
                    ctx.makeMessage({
                        content: null,
                        embeds: [embed()],
                        components: [components()],
                    }).catch(() => {});
                    break;
                }

                case ctx.interaction.id + "goBack": {
                    ctx.makeMessage({
                        content: null,
                        components: [components()],
                        embeds: [embed()],
                    });
                    interaction.deferUpdate().catch(() => {});
                    return;
                }
            }
        });

        collector.on("end", () => {
            Functions.disableRows(ctx.interaction);
        });
    }
};

export const Christmas2024EventCommandData: SlashCommand["data"] = {
    name: "event",
    description: "Check the current event.",
    type: 1,
    options: [
        {
            name: "info",
            description: "Get information about the current event.",
            type: 1,
            options: [],
        },
        {
            name: "trade",
            description: "Trade your ornaments for items with jolly polpo.",
            type: 1,
            options: [],
        },
    ],
};
