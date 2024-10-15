import * as Functions from "./Functions";
import { Pumpkin } from "../rpg/Items/ConsumableItems";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import { APIEmbed, ButtonBuilder, ButtonStyle } from "discord.js";
import { method } from "lodash";
import { SideQuest, SlashCommand } from "../@types";
import { it } from "node:test";

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

export const handlePumpkinAppeared = async (ctx: CommandInteractionContext): Promise<boolean> => {
    if (Functions.userIsCommunityBanned(ctx.userData)) {
        return false;
    }
    if (!is2024HalloweenEvent()) {
        return false;
    }

    const cooldownId =
        ctx.interaction.commandName + ctx.interaction.user.id + currentDayMonthHourMinute();
    const currentCooldown = cooldowns.get(cooldownId);
    // increment the cooldown
    cooldowns.set(cooldownId, (currentCooldown || 0) + 1);

    if (
        currentCooldown &&
        currentCooldown >= 11 &&
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
    const claimButton = new ButtonBuilder()
        .setCustomId(claimID)
        .setLabel(`Claim ${amount}x Pumpkin${amount > 1 ? "s" : ""}`)
        .setEmoji(Pumpkin.emoji)
        .setStyle(ButtonStyle.Primary);

    const embed: APIEmbed = {
        title: "🎃 A pumpkin has appeared!",
        description: "Anyone can claim it by clicking the button below.",
        // orange
        color: 0xffa500,
    };
    const components = Functions.actionRow([claimButton]);

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
        claimed = true;
        collector.stop();
        Functions.disableRows(reply);
        Functions.addItem(userData, Pumpkin.id, amount);
        ctx.client.database.saveUserData(userData);

        reply.edit({
            content: `Claimed by <@${interaction.user.id}>.`,
        });

        interaction.reply({
            content: `You have claimed ${amount}x Pumpkin${amount > 1 ? "s" : ""}.`,
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
        amount: 1,
        item: "health_potion",
    },
    {
        amount: 5,
        item: "stand_arrow",
    },
    {
        amount: 10,
        item: "rare_stand_arrow",
    },
    {
        amount: 50,
        item: "requiem_arrow",
    },
].sort((a, b) => a.amount - b.amount);

export const eventCommandHandler: SlashCommand["execute"] = async (
    ctx: CommandInteractionContext
): Promise<void> => {
    const subcommand = ctx.interaction.options.getSubcommand();
    if (subcommand === "info") {
        const embed: APIEmbed = {
            title: "2024 Halloween Event",
            description: "🎃 A pumpkin has appeared! Claim it by clicking the button below.",
            color: 0xffa500,
        };
    } else if (subcommand === "trade") {
        const userData = await ctx.client.database.getRPGUserData(ctx.interaction.user.id);
        if (!userData) {
            return;
        }
        const pumpkins = () => ctx.userData.inventory[Pumpkin.id] || 0;
        if (pumpkins() === 0) {
            await ctx.makeMessage({ content: "You don't have any pumpkins." });
            return;
        }
        const embed: APIEmbed = {
            title: "Polpo's Trades",
            description: "Trade your pumpkins for items with Polpo.",
            color: 0xffa500,
            fields: trades.map((trade) => ({
                name: `${trade.amount}x Pumpkin${trade.amount > 1 ? "s" : ""}`,
                value: `➡️ ${trade.item}`,
                inline: true,
            })),
        };
        await ctx.makeMessage({
            embeds: [embed],
        });
    }
};
