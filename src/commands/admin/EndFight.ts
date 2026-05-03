import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "endfight",
        description: "Ends intantly a fight",
        options: [
            {
                name: "id",
                description: "whcih fight to end",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const id = ctx.options.getString("id", true);
        if (id === "all") {
            await ctx.interaction.deferReply();
            for (const fight of ctx.client.fightHandlers.map((x) => x)) {
                const status = ctx.client.cluster.emit(`fightEnd_${fight.id}`);
                if (!status) {
                    ctx.followUpQueue.push({
                        content: `Fight ${fight.id} not found`,
                    });
                } else {
                    ctx.followUpQueue.push({
                        content: `Fight \`${fight.id}\` | ${
                            fight.infos?.type
                        }: ${fight.fighters.map((x) => x.name)}`,
                    });
                }
            }

            if (ctx.followUpQueue.length < 1) {
                return void ctx.makeMessage({
                    content: "No fights found",
                });
            } else {
                for (const message of ctx.followUpQueue) {
                    ctx.followUp(message);
                }
                return void ctx.makeMessage({
                    content: "All fights ended",
                });
            }
        }
        const status = ctx.client.cluster.emit(`fightEnd_${id}`);
        if (!status) {
            return void ctx.makeMessage({
                content: "Fight not found",
            });
        }

        return void ctx.makeMessage({
            content: "Fight ended",
        });
    },

    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: {
            name: string;
            value: string;
        }[] = [];
        const activeFights = interaction.client.fightHandlers.map((x) => x);
        const input = currentInput.toLowerCase();

        for (const fight of activeFights) {
            console.log(fight.fighters);
            if (fight.id.toLowerCase().includes(input)) {
                toRespond.push({
                    name: `${fight.id} | ${fight.infos?.type}: ${fight.fighters
                        .map((x) => x.name)
                        .join(", ")}`.substring(0, 150),
                    value: fight.id,
                });
            }
        }
        interaction.respond(toRespond.slice(0, 25));
    },
};

export default slashCommand;
