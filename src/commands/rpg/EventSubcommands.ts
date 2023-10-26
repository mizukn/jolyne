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
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { NPCs } from "../../rpg/NPCs";

const slashCommand: SlashCommandFile = {
    data: {
        name: "event",
        description: "Trade your souls for items or get information about the event.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "trade",
                description: "Trade your souls for items.",
                type: 1
            },
            {
                name: "info",
                description: "Displays information about the event.",
                type: 1
            }
        ]
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        if (ctx.options.getSubcommand() === "info") {
            /**
             * Context: Happy Halloween! Skeletons, zombies and lots more scary creatures have invaded Morioh City. Kill them all for souls!
             * The player has to help the speedwagons foundation by giving them souls, the speedwagon foundation will give the player items in return.
             * Every players got a side quest.
             */
            const embed: APIEmbed = {
                title: "Halloween Event 2023",
                color: // orange
                    0xffa500,
                description: `- Use the ${ctx.client.getSlashCommandMention("side quest view")} command to complete the event side quest.\n- You can gain ${ctx.client.localEmojis.spooky_soul} **Spooky Souls** by killing event NPCs and by completing the event side quest.\n- You can trade your ${ctx.client.localEmojis.spooky_soul} **Spooky Souls** by using the ${ctx.client.getSlashCommandMention("event trade")} command.\n\n${ctx.client.localEmojis.timerIcon} The event ends ${Functions.generateDiscordTimestamp(1701385140000, "FROM_NOW")} (${Functions.generateDiscordTimestamp(1701385140000, "DATE")})`
            };

            return void ctx.makeMessage({
                content: Functions.makeNPCString(NPCs.SPEEDWAGON_FOUNDATION, "Zombies and skeletons have invaded Morioh City. Please help us by giving us souls, we will give you items in return."),
                embeds: [embed]
            });
        } else {
            const trades = [
                {
                    amount: 5,
                    item: Functions.findItem("box")
                },
                {
                    amount: 10,
                    item: Functions.findItem("stand_arrow")
                },
                {
                    amount: 30,
                    item: Functions.findItem("rare_stand_arrow")
                },
                {
                    amount: 100,
                    item: Functions.findItem("spooky_arrow_2023")
                },
                {
                    amount: 2500,
                    item: Functions.findItem("requiem_arrow")
                }
            ];

            const soulsLeft = () => ctx.userData.inventory[Functions.findItem("spooky_soul").id] || 0;

            const embed: APIEmbed = {
                title: "Halloween Event 2023",
                color: // orange
                    0xffa500,
                description: `You currently have ${soulsLeft()} ${ctx.client.localEmojis.spooky_soul} **Spooky Souls**.\n\n${trades
                    .map(
                        (t) =>
                            `- x${t.amount} ${ctx.client.localEmojis.spooky_soul} **Spooky Souls** for ${
                                t.item.emoji
                            } ${t.item.name}`
                    )
                    .join("\n")}`
            };

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("event_trade" + ctx.interaction.id)
                .setPlaceholder("Select an item to trade for")
                .addOptions(
                    trades.map((t) => {
                            return {
                                label: `${t.item.name}`,
                                value: t.item.id,
                                emoji: t.item.emoji
                            };
                        }
                    )
                )
                .setMinValues(1)
                .setMaxValues(1);

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === ctx.user.id && i.customId === "event_trade" + ctx.interaction.id,
                time: 60000
            });

            const makeMessage = () => ctx.makeMessage({
                content: Functions.makeNPCString(NPCs.SPEEDWAGON_FOUNDATION, "Zombies and skeletons have invaded Morioh City. Please help us by giving us souls, we will give you items in return."),
                embeds: [embed],
                components: [Functions.actionRow([selectMenu])]
            });
            makeMessage();

            collector.on("collect", async (i: StringSelectMenuInteraction) => {
                if (await ctx.antiCheat(true)) return;

                const item = trades.find((t) => t.item.id === i.values[0]);
                if (!item) return;
                if (soulsLeft() < item.amount) {
                    await i.reply({
                        content: `You don't have enough souls to trade for this item.`
                    });
                    return;
                }

                await i.deferUpdate();
                await i.followUp({
                    content: `You traded ${item.amount} ${ctx.client.localEmojis.spooky_soul} **Spooky Souls** for ${item.item.emoji} ${item.item.name}`
                });
                Functions.removeItem(ctx.userData, Functions.findItem("spooky_soul"), item.amount);
                Functions.addItem(ctx.userData, item.item, 1);
                makeMessage();
            });

        }

    }
};

export default slashCommand;
