import {
    SlashCommandFile,
    possibleModifiers as PossibleModifierId,
} from "../../@types";
import {
    Message,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { possibleModifiers } from "./dungeon_config";
import { containers } from "../../utils/containers";
import { handleDungeonLobbyInteraction } from "./dungeon_flow";
import { karsLine, renderDungeonLobby } from "./dungeon_lobby";

const slashCommand: SlashCommandFile = {
    data: {
        name: "dungeon",
        description: "Start a dungeon.",
        options: [],
    },
    checkRPGCooldown: "dungeon",
    execute: async (
        ctx: CommandInteractionContext,
        stage?: number
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const dungeonDoneToday = await ctx.client.database.getString(
            `dungeonDone:${ctx.userData.id}:${Functions.getTodayString()}`
        );
        const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
        const dateAtMidnight = new Date().setHours(0, 0, 0, 0);
        const nextDate = dateAtMidnight + 86400000;
        if (ctx.userData.health <= 0) {
            return ctx.makeMessage(
                containers.error(karsLine("You're dead, you can't do that.")),
            );
        }

        if (
            dungeonDoneTodayCount >= 4 &&
            !ctx.client.user.username.includes("Beta") &&
            !ctx.client.user.username.includes("Alpha")
        ) {
            const timeLeft = nextDate - Date.now();
            return ctx.makeMessage(
                containers.error(
                    karsLine(
                        `You've already done 4 dungeons today. Come back ${Functions.generateDiscordTimestamp(
                            Date.now() + timeLeft,
                            "FROM_NOW",
                        )}.`,
                    ),
                ),
            );
        }
        if (await ctx.client.database.getString(`tempCache_${ctx.userData.id}:dungeon`)) {
            return ctx.makeMessage(
                containers.error(karsLine("Are you trying to scam me?")),
            );
        }
        try {
            await ctx.channel.sendTyping();
        } catch (e) {
            return void ctx.makeMessage(
                containers.error("I don't have permission to send messages in this channel."),
            );
        }
        if ((ctx.userData.inventory["dungeon_key"] ?? 0) < 1) {
            return ctx.makeMessage(
                containers.error(
                    karsLine("HA! Where's your key? You can't enter without it!"),
                ),
            );
        }

        const joinButton = new ButtonBuilder()
            .setCustomId("join_dungeon" + ctx.interaction.id)
            .setLabel("Join")
            .setStyle(ButtonStyle.Primary);
        const startButton = new ButtonBuilder()
            .setCustomId("start_dungeon" + ctx.interaction.id)
            .setLabel("Start")
            .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel_dungeon" + ctx.interaction.id)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const totalPlayers = [ctx.userData];
        const modifiersStringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("dungeon_modifiers" + ctx.interaction.id)
            .setPlaceholder("Select modifiers to apply to the dungeon.")
            .addOptions(
                possibleModifiers.map((x) => {
                    return {
                        label: Functions.capitalize(x.id.replace(/_/g, " ")),
                        value: x.id,
                        description: x.description.slice(0, 100),
                        emoji: x.emoji,
                    };
                })
            )
            .setMinValues(0)
            .setMaxValues(possibleModifiers.length);

        const selectedModifiers: PossibleModifierId[] = [];
        ctx.client.database.setCooldown(ctx.user.id, `You are in a dungeon.`);

        const sendLobby = async (
            buttons: ButtonBuilder[],
        ): Promise<Message<boolean> | InteractionResponse<boolean>> => {
            const reply = renderDungeonLobby(
                ctx.userData.tag,
                totalPlayers.length,
                selectedModifiers,
            );
            reply.components.push(
                Functions.actionRow(buttons),
                Functions.actionRow([modifiersStringSelectMenu]),
            );
            return ctx.makeMessage(reply);
        };

        await sendLobby([joinButton, startButton, cancelButton]);
        const collector = ctx.channel.createMessageComponentCollector({
            time: 60000,
            filter: (i) =>
                i.customId.includes(ctx.interaction.id) &&
                (i.customId.includes("join_dungeon") ? true : i.user.id === ctx.userData.id),
        });

        collector.on("collect", async (i) => {
            await handleDungeonLobbyInteraction({
                ctx,
                interaction: i,
                totalPlayers,
                selectedModifiers,
                stage,
                joinButton,
                startButton,
                cancelButton,
                sendLobby,
                stopCollector: (reason) => collector.stop(reason),
            });
        });
    },
};

export default slashCommand;
