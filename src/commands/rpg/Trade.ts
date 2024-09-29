import { SlashCommandFile, RPGUserDataJSON } from "../../@types";
import {
    Message,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    MessageComponentInteraction,
    AttachmentBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { tradeWebhook } from "../../utils/Webhooks";
import { createCanvas, loadImage } from "canvas";

const slashCommand: SlashCommandFile = {
    data: {
        name: "trade",
        description: "trade with a user",
        options: [
            {
                name: "start",
                description: "Starts a trade with a user",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "The user you want to trade with",
                        type: 6,
                        required: true,
                    },
                ],
            },
            {
                name: "add",
                description: "Adds an item to the trade",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to add to the trade",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "The amount of the item you want to add to the trade",
                        type: 4,
                        required: true,
                    },
                ],
            },
            {
                name: "remove",
                description: "Removes an item from the trade",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to remove from the trade",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "The amount of the item you want to remove from the trade",
                        type: 4,
                        required: true,
                    },
                ],
            },
            {
                name: "view",
                description: "Shows information about a trade",
                type: 1,
                options: [
                    {
                        name: "id",
                        description: "ID of the trade you want to view",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        if (!ctx.client.database.postgresql) {
            return void ctx.makeMessage({
                content:
                    "This command is disabled because the PostgreSQL database is currently having issues. For security reasons, this command is disabled until the issue is resolved.",
            });
        }

        if (Functions.userIsCommunityBanned(ctx.userData)) {
            return void ctx.makeMessage({
                content: "🖕 ",
                ephemeral: true,
            });
        }

        if (ctx.interaction.options.getSubcommand() === "start") {
            const target = ctx.options.getUser("user") || ctx.user;
            const targetData = await ctx.client.database.getRPGUserData(target.id);
            const tradeID = Functions.generateRandomId();

            if (
                (await ctx.client.database.getCooldown(target.id)) ||
                !targetData ||
                targetData.restingAtCampfire
            ) {
                await ctx.makeMessage({
                    content: `**${target.tag}** is currently on cooldown or haven't started their adventure yet!`,
                });
                return;
            }

            if (Functions.userIsCommunityBanned(targetData)) {
                return void ctx.makeMessage({
                    content: "This user is community banned...",
                    ephemeral: true,
                });
            }

            const targetOffer: RPGUserDataJSON["inventory"] = {};
            const userOffer: RPGUserDataJSON["inventory"] = {};

            let stage = 0; // 1 = trade started

            function makeMessage(): void {
                ctx.makeMessage({
                    content: "Trade in progress...",
                    components: [Functions.actionRow([acceptBTN, cancelBTN])],
                    embeds: [
                        {
                            title: `Trade | ${tradeID}`,
                            color: 0x70926c,
                            description: `- If you want to add an item to the trade, use the ${ctx.client.getSlashCommandMention(
                                "trade add"
                            )} command. (arguments: \`item\`, \`amount\`)\n- If you want to remove an item from the trade, use the ${ctx.client.getSlashCommandMention(
                                "trade remove"
                            )} command. (arguments: \`item\`, \`amount\`)\n- Trade ends automatically ${Functions.generateDiscordTimestamp(
                                time,
                                "FROM_NOW"
                            )}`,
                            fields: [
                                {
                                    name: `${ctx.user.tag}'s offers`,
                                    value: Object.entries(userOffer)
                                        .map(
                                            ([item, amount]) =>
                                                `${Functions.findItem(item).emoji} ${amount}x ${
                                                    Functions.findItem(item).name
                                                }`
                                        )
                                        .join("\n"),
                                },
                                {
                                    name: `${target.tag}'s offers`,
                                    value: Object.entries(targetOffer)
                                        .map(
                                            ([item, amount]) =>
                                                `${Functions.findItem(item).emoji} ${amount}x ${
                                                    Functions.findItem(item).name
                                                }`
                                        )
                                        .join("\n"),
                                },
                            ],
                        },
                    ],
                });
            }

            const acceptID = Functions.generateRandomId();
            const cancelID = Functions.generateRandomId();
            const acceptBTN = new ButtonBuilder()
                .setCustomId(acceptID)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success);
            const rejectBTN = new ButtonBuilder()
                .setCustomId(cancelID)
                .setLabel("Reject")
                .setStyle(ButtonStyle.Danger);
            const cancelBTN = new ButtonBuilder()
                .setCustomId(cancelID)
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger);
            const time = Date.now() + 60000 * 5;

            ctx.makeMessage({
                content: `<@${target.id}> | **${
                    ctx.user.username
                }** wants to trade with you (trade ends automatically ${Functions.generateDiscordTimestamp(
                    time,
                    "FROM_NOW"
                )})`,
                components: [Functions.actionRow([acceptBTN, rejectBTN])],
            });

            const filter = (i: MessageComponentInteraction): boolean => {
                return (
                    (i.user.id === target.id || i.user.id === ctx.user.id) &&
                    (i.customId === acceptID || i.customId === cancelID)
                );
            };

            const collector = ctx.channel.createMessageComponentCollector({
                filter,
                time: time - Date.now(),
            });

            collector.on("end", async () => {
                ctx.client.database.deleteCooldown(target.id);
                ctx.client.database.deleteCooldown(ctx.user.id);
            });

            let accepted: string[] = [];
            const callback = (item: string, amount: number) => {
                accepted = [];
                if (Functions.hasExceedStandLimit(ctx) && item.includes("$disc$")) {
                    ctx.interaction.followUp({
                        content: `<@${ctx.user.id}> has exceeded the stand disc limit. Please add another item.`,
                    });
                    return;
                }

                if (targetOffer[item]) {
                    targetOffer[item] += amount;
                } else {
                    targetOffer[item] = amount;
                }

                if (targetOffer[item] > (targetData.inventory[item] ?? 0)) {
                    targetOffer[item] = targetData.inventory[item] ?? 0;
                }

                if (targetOffer[item] <= 0) delete targetOffer[item];

                makeMessage();
            };
            const callback2 = (item: string, amount: number) => {
                if (Functions.hasExceedStandLimit(ctx, targetData) && item.includes("$disc$")) {
                    ctx.interaction.followUp({
                        content: `<@${target.id}> has exceeded the stand disc limit. Please add another item.`,
                    });
                    return;
                }

                accepted = [];
                if (userOffer[item]) {
                    userOffer[item] += amount;
                } else {
                    userOffer[item] = amount;
                }

                if (userOffer[item] > (ctx.userData.inventory[item] ?? 0)) {
                    userOffer[item] = ctx.userData.inventory[item] ?? 0;
                }

                if (userOffer[item] <= 0) delete userOffer[item];

                makeMessage();
            };

            collector.on("collect", async (i: ButtonInteraction) => {
                i.deferUpdate().catch(() => {});
                switch (i.customId) {
                    case acceptID: {
                        if (stage === 0 && i.user.id === target.id) {
                            stage = 1;
                            if (
                                (await ctx.client.database.getCooldown(target.id)) ||
                                (await ctx.client.database.getCooldown(ctx.user.id))
                            ) {
                                ctx.makeMessage({
                                    content: `:warning: Trade cancelled:: one of the users is on cooldown. This is weird and we think you are trying to find a glitch to duplicate items. If this is the case, please note that trying to find glitches or cheat by any means is against the ToS of the RPG.`,
                                    components: [],
                                });
                                collector.stop();
                                break;
                            }

                            ctx.interaction
                                .fetchReply()
                                .then((m) => {
                                    const link = Functions.generateMessageLink(m);
                                    const message = `You are currently trading. Can't find the message? ---> ${link}`;
                                    ctx.client.database.setCooldown(target.id, message);
                                    ctx.client.database.setCooldown(ctx.user.id, message);
                                })
                                .catch(() => {
                                    collector.stop();
                                    ctx.client.database.deleteCooldown(target.id);
                                    ctx.client.database.deleteCooldown(ctx.user.id);
                                    return;
                                });
                            ctx.client.cluster.on(`trade_${ctx.user.id}`, callback2);
                            ctx.client.cluster.on(`trade_${target.id}`, callback);

                            makeMessage();
                        } else {
                            if (
                                accepted.find((r) => r === i.user.id) ||
                                Object.entries(userOffer).length === 0 ||
                                Object.entries(targetOffer).length === 0
                            )
                                break;
                            accepted.push(i.user.id);
                            if (accepted.length === 2) {
                                ctx.makeMessage({
                                    content: `:white_check_mark: Trade completed! (ID: \`${tradeID}\`)`,
                                    components: [],
                                });
                                collector.stop();
                                ctx.client.cluster.off(`trade_${ctx.user.id}`, callback2);
                                ctx.client.cluster.off(`trade_${target.id}`, callback);
                                const userData = await ctx.client.database.getRPGUserData(
                                    ctx.user.id
                                );
                                const targetData = await ctx.client.database.getRPGUserData(
                                    target.id
                                );

                                const results: boolean[] = [];
                                for (const [item, amount] of Object.entries(userOffer)) {
                                    results.push(Functions.removeItem(userData, item, amount));
                                    results.push(Functions.addItem(targetData, item, amount, true));
                                }
                                for (const [item, amount] of Object.entries(targetOffer)) {
                                    results.push(Functions.removeItem(targetData, item, amount));
                                    results.push(Functions.addItem(userData, item, amount, true));
                                }

                                if (results.includes(false)) {
                                    await ctx.makeMessage({
                                        content: `:x: Something went wrong while trading.`,
                                        embeds: [],
                                    });
                                    Functions.disableRows(ctx.interaction);
                                    return;
                                }
                                await ctx.client.database.saveUserData(userData);
                                await ctx.client.database.saveUserData(targetData);
                                ctx.client.database.deleteCooldown(target.id);
                                ctx.client.database.deleteCooldown(ctx.user.id);

                                const canvas = createCanvas(1024, 512);
                                const ctx2 = canvas.getContext("2d");

                                const image1 = await loadImage(
                                    ctx.user.displayAvatarURL({ size: 512, extension: "png" })
                                );
                                const image2 = await loadImage(
                                    target.displayAvatarURL({ size: 512, extension: "png" })
                                );

                                ctx2.drawImage(image1, 0, 0, 512, 512);
                                ctx2.drawImage(image2, 512, 0, 512, 512);

                                const attachment = new AttachmentBuilder(canvas.toBuffer(), {
                                    name: "trade.png",
                                });

                                tradeWebhook.send({
                                    embeds: [
                                        {
                                            title: `Trade #${tradeID}`,
                                            description: `- User1: **${ctx.user.username}** (<@${ctx.user.id}>)\n- User2: **${target.username}** (<@${target.id}>)\n- Guild: **${ctx.guild.name}** (${ctx.guild.id})`,
                                            fields: [
                                                {
                                                    name: `${ctx.user.username}'s offer`,
                                                    value: Object.entries(userOffer)
                                                        .map(
                                                            ([item, amount]) =>
                                                                `${
                                                                    Functions.findItem(item).emoji
                                                                } ${amount}x ${
                                                                    Functions.findItem(item).name
                                                                }`
                                                        )
                                                        .join("\n"),
                                                },
                                                {
                                                    name: `${target.username}'s offer`,
                                                    value: Object.entries(targetOffer)

                                                        .map(
                                                            ([item, amount]) =>
                                                                `${
                                                                    Functions.findItem(item).emoji
                                                                } ${amount}x ${
                                                                    Functions.findItem(item).name
                                                                }`
                                                        )
                                                        .join("\n"),
                                                },
                                            ],
                                            color: 0x70926c,
                                            image: {
                                                url: "attachment://trade.png",
                                            },
                                            timestamp: new Date().toISOString(),
                                        },
                                    ],
                                    files: [attachment],
                                });

                                ctx.client.database.postgresql.query(
                                    `INSERT INTO trades (id, user_id, target_id, server_id, user_offers, target_offers, date)
                                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                    [
                                        tradeID,
                                        ctx.user.id,
                                        target.id,
                                        ctx.guild.id,
                                        JSON.stringify(userOffer),
                                        JSON.stringify(targetOffer),
                                        Date.now(),
                                    ]
                                );
                            } else
                                ctx.makeMessage({
                                    content: `:white_check_mark: <@${i.user.id}> accepted the trade...`,
                                });
                        }
                        break;
                    }
                    case cancelID: {
                        ctx.makeMessage({
                            content: `:x: Trade cancelled.`,
                            embeds: [],
                            components: [],
                        });
                        collector.stop();
                        if (stage !== 0) {
                            ctx.client.cluster.off(`trade_${ctx.user.id}`, callback2);
                            ctx.client.cluster.off(`trade_${target.id}`, callback);
                            ctx.client.database.deleteCooldown(target.id);
                            ctx.client.database.deleteCooldown(ctx.user.id);
                        }
                        break;
                    }
                }
            });
        } else if (ctx.interaction.options.getSubcommand() === "add") {
            const msg = await ctx.client.database.getCooldown(ctx.user.id);
            if (!msg || !msg.includes("trading")) {
                ctx.makeMessage({
                    content: `:x: You are not trading.`,
                });
                return;
            }
            const itemString = ctx.interaction.options.getString("item", true);
            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                ctx.makeMessage({
                    content: `:x: Item not found.`,
                });
                return;
            }
            const amount = ctx.interaction.options.getInteger("amount", true);
            if (amount <= 0) {
                ctx.makeMessage({
                    content: `:x: Invalid amount.`,
                });
                return;
            }
            if (amount > ctx.userData.inventory[itemData.id]) {
                ctx.makeMessage({
                    content: `:x: You don't have enough of this item (you have only ${
                        ctx.userData.inventory[itemData.id]
                    }).`,
                });
                return;
            }
            if (!itemData.tradable) {
                ctx.makeMessage({
                    content: `:x: This item is not tradable.`,
                });
                return;
            }
            ctx.client.cluster.emit(`trade_${ctx.user.id}`, itemData.id, amount);
            ctx.makeMessage({
                content: `:white_check_mark:`,
                ephemeral: true,
            });
        } else if (ctx.interaction.options.getSubcommand() === "remove") {
            const msg = await ctx.client.database.getCooldown(ctx.user.id);
            if (!msg || !msg.includes("trading")) {
                ctx.makeMessage({
                    content: `:x: You are not trading.`,
                });
                return;
            }
            const itemString = ctx.interaction.options.getString("item", true);
            const itemData = Functions.findItem(itemString);
            if (!itemData) {
                ctx.makeMessage({
                    content: `:x: Item not found.`,
                });
                return;
            }
            const amount = ctx.interaction.options.getInteger("amount", true);
            if (amount <= 0) {
                ctx.makeMessage({
                    content: `:x: Invalid amount.`,
                });
                return;
            }
            ctx.client.cluster.emit(`trade_${ctx.user.id}`, itemData.id, -amount);
            ctx.makeMessage({
                content: `:white_check_mark:`,
                ephemeral: true,
            });
        } else if (ctx.interaction.options.getSubcommand() === "view") {
            const tradeId = ctx.interaction.options.getString("id", true);
            const rows = await ctx.client.database.postgresql.query(
                `SELECT *
                 FROM trades
                 WHERE id = $1`,
                [tradeId]
            );
            const trade = rows.rows[0];
            if (!trade) {
                await ctx.makeMessage({
                    content: `:x: Trade not found.`,
                });
                return;
            }
            const userData = (await ctx.client.database.getRPGUserData(trade.user_id)) || {
                tag: "Deleted User",
                id: trade.user_id,
            };
            const targetData = (await ctx.client.database.getRPGUserData(trade.target_id)) || {
                tag: "Deleted User",
                id: trade.target_id,
            };

            ctx.makeMessage({
                embeds: [
                    {
                        title: `Trade #${trade.id}`,
                        description: `Trade completed ${Functions.generateDiscordTimestamp(
                            Number(trade.date),
                            "FULL_DATE"
                        )} in server ${
                            ctx.client.guilds.cache.get(trade.server_id)?.name ?? trade.server_id
                        }`,
                        fields: [
                            {
                                name: `${userData.tag}'s offers`,
                                value: Object.entries(trade.user_offers)
                                    .map(
                                        ([item, amount]) =>
                                            `${Functions.findItem(item).emoji} ${amount}x ${
                                                Functions.findItem(item).name
                                            }`
                                    )
                                    .join("\n"),
                            },
                            {
                                name: `${targetData.tag}'s offers`,
                                value: Object.entries(trade.target_offers)
                                    .map(
                                        ([item, amount]) =>
                                            `${Functions.findItem(item).emoji} ${amount}x ${
                                                Functions.findItem(item).name
                                            }`
                                    )
                                    .join("\n"),
                            },
                        ],
                    },
                ],
            });
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        if (!interaction.client.database.postgresql) return;
        if (Functions.userIsCommunityBanned(userData)) return;
        if (interaction.options.getSubcommand() === "view") {
            const rows = await interaction.client.database.postgresql.query(
                `SELECT *
                 FROM trades
                 WHERE user_id = $1
                    OR target_id = $1`,
                [interaction.user.id]
            );
            const trades = rows.rows;
            const trade = trades
                .filter(
                    (t) =>
                        t.id.toLowerCase().startsWith(currentInput) ||
                        t.id.toLowerCase().includes(currentInput) ||
                        t.id.toLowerCase().endsWith(currentInput) ||
                        t.user_id.toLowerCase().startsWith(currentInput) ||
                        t.user_id.toLowerCase().includes(currentInput) ||
                        t.user_id.toLowerCase().endsWith(currentInput) ||
                        t.target_id.toLowerCase().startsWith(currentInput) ||
                        t.target_id.toLowerCase().includes(currentInput) ||
                        t.target_id.toLowerCase().endsWith(currentInput) ||
                        t.server_id.toLowerCase().startsWith(currentInput) ||
                        t.server_id.toLowerCase().includes(currentInput) ||
                        t.server_id.toLowerCase().endsWith(currentInput)
                )
                .sort((a, b) => Number(b.date) - Number(a.date));
            if (!trade) return;
            const choices: { name: string; value: string }[] = [];
            for (const trade of trades) {
                const otherTrader =
                    trade.user_id === interaction.user.id ? trade.target_id : trade.user_id;
                const otherTraderData = (await interaction.client.database.getRPGUserData(
                    otherTrader
                )) || {
                    tag: "Deleted User",
                    id: otherTrader,
                };

                choices.push({
                    name: `${trade.id} |  ${otherTraderData.tag} (${
                        otherTraderData.id
                    }) at ${new Date(Number(trade.date)).toLocaleString()}`,
                    value: trade.id,
                });
            }
            interaction.respond(choices);
            return;
        }
        const msg = await interaction.client.database.getCooldown(interaction.user.id);
        if (!msg || !msg.includes("trading")) {
            interaction.respond([]);
        }
        const userItems = Object.keys(userData.inventory).map((v) => {
            const item = Functions.findItem(v);
            if (!item) return;
            if (userData.inventory[v] === 0) return;
            if (!item.tradable) return;

            return {
                name: item.name,
                amount: userData.inventory[v],
                id: v,
            };
        });

        interaction.respond(
            userItems
                .filter((r) => r)
                .map((i) => {
                    return {
                        value: i.id,
                        name: `${i.name} (x${i.amount} left)`,
                        description: i,
                    };
                })
                .filter(
                    (item) =>
                        item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                        item.value.toLowerCase().includes(currentInput.toLowerCase())
                )
                .slice(0, 25)
        );
    },
};

export default slashCommand;
