import { contextLinesIntegration } from "@sentry/node";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import e from "express";
import { SlashCommand } from "../../@types";
import { APIEmbed, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { SpookyZombieBrain } from "../Items/Items";
import { cloneDeep } from "lodash";

// start = 31 oct 2025
// end = 14 nov 2025
export const startOf2025HalloweenEvent = new Date(Date.UTC(2025, 9, 31, 0, 0, 0)); // Months are 0-indexed
export const endOf2025HalloweenEvent = new Date(Date.UTC(2025, 10, 14, 23, 59, 59));

export function is2025HalloweenEventActive(currentDate: Date = new Date()): boolean {
    return currentDate >= startOf2025HalloweenEvent && currentDate <= endOf2025HalloweenEvent;
}
// zombie apocalypse event message
export const halloween2025EventMessage = (ctx: CommandInteractionContext): string => {
    return `\`\`\`\nThe dead are rising again!\nDefeat the zombies and their master, 「Rotten King」, to earn rewards.\`\`\`
  
- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`HalloweenEvent2025\`] command to check your progression
- - Defeat NPCs from this side quest to get :brain: **Spooky Zombie Brains**
- You can trade your :brain: **Spooky Zombie Brains** with <:spooky_polpo:1294731380017856715> **Spooky Polpo** for items using by using the ${ctx.client.getSlashCommandMention(
        "event trade"
    )} command
- You can ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Rotten King**, the event boss to get more :brain: **Spooky Zombie Brains** and other rewards
- The event ends on ${Functions.generateDiscordTimestamp(
        endOf2025HalloweenEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2025HalloweenEvent, "FROM_NOW")})`;
};

export const trades = [
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
        amount: 80,
        item: "rotten_hat",
    },
    {
        amount: 100,
        item: "rotten_crown",
    },

    {
        amount: 150,
        item: "dead_revival.$disc$",
    },
    {
        amount: 1000 * 10,
        item: "excalibur",
    },
].sort((a, b) => a.amount - b.amount);

export const Halloween2025EventCommandData: SlashCommand["data"] = {
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
            description: "Trade your brains for items with polpo.",
            type: 1,
            options: [],
        },
    ],
};

export const Halloween2025EventCommandHandler: SlashCommand["execute"] = async (
    ctx: CommandInteractionContext
): Promise<void> => {
    if (!is2025HalloweenEventActive()) {
        await ctx.makeMessage({
            content: "There is no event currently running.",
        });
        return;
    }
    const subcommand = ctx.interaction.options.getSubcommand();
    if (subcommand === "info") {
        const embed: APIEmbed = {
            title: ":jack_o_lantern: **__2025 Halloween Event__**",
            description: halloween2025EventMessage(ctx),
            color: 0xffa500,
        };

        await ctx.makeMessage({ embeds: [embed] });
    } else if (subcommand === "trade") {
        if (!ctx.userData) {
            return;
        }
        const brains = () => ctx.userData.inventory[SpookyZombieBrain.id] || 0;
        if (brains() === 0) {
            await ctx.makeMessage({ content: "You don't have any brains." });
            return;
        }
        const formattedTrades = trades.map((trade) => ({
            item: Functions.findItem(trade.item),
            amount: trade.amount,
            hasEnough: () =>
                brains() >= trade.amount &&
                Functions.addItem(cloneDeep(ctx.userData), trade.item, 1),
        }));
        console.log(formattedTrades);

        const getSelectMenuTrades = () =>
            formattedTrades
                .filter((trade) => trade.hasEnough())
                .map((trade) => ({
                    label: `${trade.item.name}`,
                    value: trade.item.name,
                    description: `${trade.amount.toLocaleString()} brains`,
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
                    } brains)`,
                    value: i.toString(),
                }))
                .filter(
                    (i) =>
                        brains() >=
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
                    name: `Spooky Polpo's Trades`,
                    icon_url: "https://media.jolyne.moe/KUQjZ3/direct",
                },
                color: 0x800080,
                description: `${
                    ctx.client.localEmojis.replyEnd
                } You have \`${brains().toLocaleString()}\` brains :brain:`,
                fields: [
                    ...formattedTrades.map((trade) => ({
                        name: `${trade.item.emoji} ${trade.item.name}`,
                        value: `${ctx.client.localEmojis.replyEnd} \`x${trade.amount.toLocaleString(
                            "en-US"
                        )}\` :brain:`,
                        inline: true,
                    })),
                    {
                        // blank
                        name: "\u200b",
                        value: `-# You can only have x3 copies of the **Dead Revival Disc**.`,
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

                    if (brains() < selectedAmount) {
                        ctx.interaction.followUp({
                            content: "You don't have enough brains.",
                            ephemeral: true,
                        });
                        interaction.deferUpdate().catch(() => {});
                        return;
                    }
                    const status: boolean[] = [
                        Functions.addItem(ctx.userData, currentTrade.item, selectedAmount),
                        Functions.removeItem(ctx.userData, SpookyZombieBrain.id, amountBought),
                    ];
                    if (!status.every((s) => s)) {
                        ctx.interaction
                            .followUp({
                                content:
                                    "An error occurred. If you selected Dead Revival Disc, please note that you can't have more than 3 copies of it.",
                                ephemeral: true,
                            })
                            .catch(() => {});
                        return;
                    }
                    ctx.client.database.saveUserData(ctx.userData);

                    ctx.interaction
                        .followUp({
                            content: `You traded ${amountBought} brains for ${selectedAmount}x ${currentTrade.item}.`,
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
