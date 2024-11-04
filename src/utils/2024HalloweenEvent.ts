import * as Functions from "./Functions";
import { Pumpkin } from "../rpg/Items/ConsumableItems";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import { APIEmbed, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { cloneDeep, get, method } from "lodash";
import { SideQuest, SlashCommand } from "../@types";
import { it } from "node:test";
import { halloweenClaimsWebhook } from "./Webhooks";

const currentDayMonthHourMinute = () => {
    const date = new Date();
    return (
        String(date.getDate()) +
        String(date.getMonth()) +
        String(date.getHours()) +
        String(date.getMinutes())
    );
};

const cooldowns: Map<string, number> = new Map<string, number>();

// /!\ the following code is obfuscated to prevent cheating /!\
const __ts241tbtiviwtjj46gmbzt = {
    ["__cehi6sdfsdfc6rasdfsdfwm9ptmxisfdfdoh"]: [
        {
            method: "assign",
            callableByUser: false,
            number: 3295023989530289,
        },
    ],
    ["__um18f9jfhlcs6pcz5zkjm"]: [
        {
            method: "random",
            callableByUser: false,
            number: 124124512512673,
        },
    ],
    ["__sxvay21975y0o8xlj9bp"]: [
        {
            method: "floor",
            callableByUser: false,
            number: 209 - 9295353788923,
        },
    ],
    antiSpam: {
        maximumCommands: 5,
        maxumumCommandsInterval: 5000,
        maximumPumpkins: 5,
        whatToDOIfAbuse: () => {
            return {
                type: "communityBan",
                duration: 1000 * 60 * 60 * 24 * 1, // 1 days
            };
        },
    },
};
const __cehi6fc6rawm9ptmxidoh = [
    {},
    Object.assign({}, __ts241tbtiviwtjj46gmbzt.__cehi6sdfsdfc6rasdfsdfwm9ptmxisfdfdoh[0]),
    Object.assign({}, __ts241tbtiviwtjj46gmbzt.__sxvay21975y0o8xlj9bp[0].method),
];
const __um18f9jfhlcs6pcz5zkjm = [
    Math.random,
    () => 10,
    0,
    1,
    null,
    Math.floor,
    [__cehi6fc6rawm9ptmxidoh[5]],
];
const __sxvay21975y0o8xlj9bp = () =>
    (__um18f9jfhlcs6pcz5zkjm[5] as Math["floor"])(
        (__um18f9jfhlcs6pcz5zkjm[0] as Math["random"])() * 100
    ) <
    (
        __um18f9jfhlcs6pcz5zkjm[1] as () => // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        3.141592653589793238462643383279502884197169399375105820974944592307816406286
    )() *
        (2 - 1);

export const endOf2024HalloweenEvent = 1730700000000;
export const is2024HalloweenEvent = (): boolean => Date.now() < endOf2024HalloweenEvent;
export const is2024HalloweenEventEndingSoon = (): boolean => // 3 days before the end
    Date.now() > endOf2024HalloweenEvent - 1000 * 60 * 60 * 24 * 3 && is2024HalloweenEvent();

export const handlePumpkinAppeared = async (ctx: CommandInteractionContext): Promise<boolean> => {
    if (Functions.userIsCommunityBanned(ctx.userData)) {
        return false;
    }
    if (!is2024HalloweenEvent()) {
        return false;
    }

    const pumpkinsLeft = ctx.userData.inventory[Pumpkin.id] || 0;
    if (is2024HalloweenEventEndingSoon() && pumpkinsLeft > 150 && Functions.percent(30)) {
        ctx.interaction.followUp({
            content: `${
                Pumpkin.emoji
            } | The halloween event is ending soon! You currently have **${pumpkinsLeft}** pumpkins. You should ${ctx.client.getSlashCommandMention(
                "event trade"
            )} them with Polpo before the event ends.`,
            ephemeral: true,
        });
    }

    const cooldownId =
        ctx.interaction.commandName + ctx.interaction.user.id + currentDayMonthHourMinute();
    const currentCooldown = cooldowns.get(cooldownId);
    // increment the cooldown
    cooldowns.set(cooldownId, (currentCooldown || 0) + 1);

    if (
        currentCooldown &&
        currentCooldown >= 14 &&
        !Functions.userIsCommunityBanned(ctx.userData)
    ) {
        ctx.userData.communityBans.push({
            reason: "[Anti-Spam] Spamming the pumpkin event.",
            bannedAt: Date.now(),
            until: Date.now() + __ts241tbtiviwtjj46gmbzt.antiSpam.whatToDOIfAbuse().duration,
        });
        ctx.client.database.saveUserData(ctx.userData);
        ctx.interaction.followUp({
            content: ":warning: You have been community banned for spamming.",
        });
        return false;
    }
    if (currentCooldown && currentCooldown >= 7) {
        ctx.interaction.followUp({
            content:
                "You are spamming too much. If you continue spamming, you will automatically be banned from the community (trade, events, etc.)\n\nYou should stop using commands for a moment.",
        });
        return false;
    }

    if (!__sxvay21975y0o8xlj9bp())
        return (
            __um18f9jfhlcs6pcz5zkjm[2] !== __um18f9jfhlcs6pcz5zkjm[4] &&
            typeof __ts241tbtiviwtjj46gmbzt.antiSpam.whatToDOIfAbuse().type ===
                typeof process.env.AES_KEY &&
            process.env.AES_KEY.length !==
                String(__ts241tbtiviwtjj46gmbzt.antiSpam.whatToDOIfAbuse().duration).length
        );
    if (ctx.interaction.deferred) return false;
    // todo: add 1 min cooldown for channels
    const channelId = ctx.interaction.channel.id;
    if (!(await ctx.client.database.canUseRPGCommand(channelId, "pumpkin"))) return false;
    ctx.client.database.setRPGCooldown(channelId, "pumpkin", 60000);

    const claimID = ctx.interaction.id + `claim`;
    const amount = Functions.randomNumber(2, 4);
    const item = Functions.percent(0.5)
        ? {
              item: Functions.findItem("nix"),
              amount: 1,
              color: Functions.findStand("nix").color,
          }
        : {
              item: Pumpkin,
              amount: amount,
              color: 0xffa500,
          };
    const claimButton = new ButtonBuilder()
        .setCustomId(claimID)
        .setLabel(`Claim ${item.amount}x ${item.item.name}`)
        .setEmoji(item.item.emoji)
        .setStyle(ButtonStyle.Primary);

    const embed: APIEmbed = {
        title: `${item.item.emoji} ${item.amount}x ${item.item.name} appeared!`,
        description: "Anyone can claim it by clicking the button below.",
        // orange
        color: item.color,
    };
    const components = Functions.actionRow([claimButton]);

    await Functions.sleep(1000);
    const reply = await ctx.followUp({
        embeds: [embed],
        components: [components],
        fetchReply: true,
    });
    let claimed = false; // Prevent multiple claims

    const collector = ctx.interaction.channel.createMessageComponentCollector({
        time: 60000,
        filter: (interaction) => interaction.customId === claimID && !claimed,
    });

    collector.on("collect", async (interaction) => {
        // extra check
        const userData = await ctx.client.database.getRPGUserData(interaction.user.id);
        if (!userData || claimed) {
            return;
        }
        const status = Functions.addItem(userData, item.item.id, item.amount);
        if (!status) {
            return;
        }
        if (claimed) return; // extra check
        claimed = true;
        collector.stop();
        Functions.disableRows(reply);
        ctx.client.database.saveUserData(userData);

        reply.edit({
            content: `Claimed by <@${interaction.user.id}>.`,
        });

        halloweenClaimsWebhook.send({
            embeds: [
                {
                    title: `${item.item.emoji} ${item.amount}x ${item.item.name} appeared!`,
                    description: `Claimed by <@${interaction.user.id}> (${interaction.user.id})`,
                    color: item.color,
                    fields: [
                        {
                            name: "Guild",
                            value: `${ctx.interaction.guild.name} (${ctx.interaction.guild.id})`,
                            inline: true,
                        },
                        {
                            name: "Channel",
                            value: `<#${ctx.interaction.channel.id}>`,
                            inline: true,
                        },
                    ],
                    thumbnail: {
                        url: interaction.user.displayAvatarURL(),
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        });

        interaction.reply({
            content: `You claimed ${item.amount}x ${item.item.name}.`,
            ephemeral: true,
        });
    });

    return true;
};

export const eventCommandData: SlashCommand["data"] = {
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
            description: "Trade your pumpkins for items with polpo.",
            type: 1,
            options: [],
        },
    ],
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
    return `\`\`\`
The enemies you have defeated until now are coming back on Halloween, wanting revenge. Blame Justice (Enya Geil) for all of it!
\`\`\`

- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`HalloweenEvent2024\`] command to check your progression
- - Defeat NPCs from this side quest to get :jack_o_lantern: **Pumpkins** (15%)
- Each time you use a command, there’s a chance that :jack_o_lantern: \`x[2-5]\` **Pumpkins** will appear in the chat! (Anyone can claim them by clicking the button.)
- - There is also a **.5%** chance for the event stand to appear
- You can trade your  :jack_o_lantern: **Pumpkins** with <:spooky_polpo:1294731380017856715> **Spooky Polpo** for items using by using the ${ctx.client.getSlashCommandMention(
        "event trade"
    )} command
- You can ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Pale Dark**, the event boss to get more :jack_o_lantern: **Pumpkins** and other rewards
-# - The event ends on ${Functions.generateDiscordTimestamp(
        endOf2024HalloweenEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024HalloweenEvent, "FROM_NOW")})`;
};

export const eventCommandHandler: SlashCommand["execute"] = async (
    ctx: CommandInteractionContext
): Promise<void> => {
    if (!is2024HalloweenEvent()) {
        await ctx.makeMessage({
            content: "There is no event currently running.",
        });
        return;
    }
    const subcommand = ctx.interaction.options.getSubcommand();
    if (subcommand === "info") {
        const embed: APIEmbed = {
            title: ":jack_o_lantern: **__2024 Halloween Event__**",
            description: eventMessage(ctx),
            color: 0xffa500,
        };

        await ctx.makeMessage({ embeds: [embed] });
    } else if (subcommand === "trade") {
        if (!ctx.userData) {
            return;
        }
        const pumpkins = () => ctx.userData.inventory[Pumpkin.id] || 0;
        if (pumpkins() === 0) {
            await ctx.makeMessage({ content: "You don't have any pumpkins." });
            return;
        }
        const formattedTrades = trades.map((trade) => ({
            item: Functions.findItem(trade.item),
            amount: trade.amount,
            hasEnough: () =>
                pumpkins() >= trade.amount &&
                Functions.addItem(cloneDeep(ctx.userData), trade.item, 1),
        }));

        const getSelectMenuTrades = () =>
            formattedTrades
                .filter((trade) => trade.hasEnough())
                .map((trade) => ({
                    label: `${trade.item.name}`,
                    value: trade.item.name,
                    description: `${trade.amount.toLocaleString("en-US")} Pumpkins`,
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
                    } Pumpkins)`,
                    value: i.toString(),
                }))
                .filter(
                    (i) =>
                        pumpkins() >=
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
                } You have \`${pumpkins().toLocaleString("en-US")}\` pumpkins 🎃`,
                fields: [
                    ...formattedTrades.map((trade) => ({
                        name: `${trade.item.emoji} ${trade.item.name}`,
                        value: `${ctx.client.localEmojis.replyEnd} \`x${trade.amount.toLocaleString(
                            "en-US"
                        )}\` 🎃`,
                        inline: true,
                    })),
                    {
                        // blank
                        name: "\u200b",
                        value: `-# You can only have x3 copies of the **Nix Stand Disc**.`,
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

                    if (pumpkins() < selectedAmount) {
                        ctx.interaction.followUp({
                            content: "You don't have enough pumpkins.",
                            ephemeral: true,
                        });
                        interaction.deferUpdate().catch(() => {});
                        return;
                    }
                    const status: boolean[] = [
                        Functions.addItem(ctx.userData, currentTrade.item, selectedAmount),
                        Functions.removeItem(ctx.userData, Pumpkin.id, amountBought),
                    ];
                    if (!status.every((s) => s)) {
                        ctx.interaction
                            .followUp({
                                content:
                                    "An error occurred. If you selected Nix Stand Disc, please note that you can't have more than 3 copies of it.",
                                ephemeral: true,
                            })
                            .catch(() => {});
                        return;
                    }
                    ctx.client.database.saveUserData(ctx.userData);

                    ctx.interaction
                        .followUp({
                            content: `You traded ${amountBought} pumpkins for ${selectedAmount}x ${currentTrade.item}.`,
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
