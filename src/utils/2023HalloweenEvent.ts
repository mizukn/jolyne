import * as Functions from "./Functions";
import { Pumpkin } from "../rpg/Items/ConsumableItems";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import { APIEmbed, ButtonBuilder, ButtonStyle } from "discord.js";
import { method } from "lodash";

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
const __sxvay21975y0o8xlj9bp =
    (__um18f9jfhlcs6pcz5zkjm[5] as Math["floor"])(
        (__um18f9jfhlcs6pcz5zkjm[0] as Math["random"])() * 100
    ) <
    (
        __um18f9jfhlcs6pcz5zkjm[1] as () => // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        3.141592653589793238462643383279502884197169399375105820974944592307816406286
    )() *
        (2 - 1);

export const endOf2024HalloweenEvent = 1730700000000;

export const handlePumpkinAppeared = async (ctx: CommandInteractionContext): Promise<boolean> => {
    if (Date.now() > endOf2024HalloweenEvent) {
        return false;
    }

    if (!__sxvay21975y0o8xlj9bp) return __um18f9jfhlcs6pcz5zkjm[2] !== __um18f9jfhlcs6pcz5zkjm[4];
    if (ctx.interaction.deferred) return false;

    const claimID = ctx.interaction.id + `claim`;
    const amount = Functions.randomNumber(2, 4);
    const claimButton = new ButtonBuilder()
        .setCustomId(claimID)
        .setLabel(`Claim ${amount}x Pumpkin${amount > 1 ? "s" : ""}`)
        .setEmoji(Pumpkin.emoji)
        .setStyle(ButtonStyle.Primary);

    const embed: APIEmbed = {
        title: "🎃 A pumpkin has appeared!",
        description: "You can claim it by clicking the button below.",
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
