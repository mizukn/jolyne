import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { Item, SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";
import * as Stands from "../../rpg/Stands";

const totalStands = [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => {
        return {
            ...x.evolutions[0],
            id: x.id,
        };
    }),
];

const slashCommand: SlashCommandFile = {
    data: {
        name: "bumpstand",
        description: "instant give stand",
        options: [
            {
                name: "stand",
                description: "stand to give",
                type: 3,
                required: true,
                autocomplete: true,
            },
            {
                name: "user",
                description: "User to give",
                type: 6,
                required: false,
            },
            {
                name: "give-disc",
                description: "Give the current stand to the user",
                type: 5,
                required: false,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        // return COMMAND disabled because too easy to win money
        /* return void ctx.makeMessage({
            content: `This command is disabled because it is too easy to win money. Please use the slot machine instead. This command may or may not be re-enabled in the future.`,
        });*/
        const userOption = ctx.options.getUser("user", false);
        const stand = ctx.options.getString("stand", true);
        const standData = Functions.findStand(stand);
        const giveDisc = ctx.options.getBoolean("give-disc", false);
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(
            userOption ? userOption.id : ctx.user.id
        );
        if (!ctx.userData) {
            return void ctx.makeMessage({
                content: "User not found",
            });
        }

        let item: Item;

        if (giveDisc && ctx.userData.stand) {
            const disc = `${ctx.userData.stand}.$disc$`;
            item = Functions.findItem(disc);
            if (!item) {
                return void ctx.makeMessage({
                    content: `Disc not found`,
                });
            }

            Functions.addItem(ctx.userData, disc, 1, true);
        }
        ctx.userData.stand = standData.id;
        await ctx.client.database.saveUserData(ctx.userData);

        return void ctx.makeMessage({
            content: `${standData.emoji} | Stand **${standData.name}** has been OVERWRITTEN to ${
                userOption ? userOption.username : ctx.user.username
            }${giveDisc ? ` and **${item.name}** has been given` : ""}`,
        });
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: {
            name: string;
            value: string;
        }[] = [];

        const input = currentInput.toLowerCase();
        for (const stand of totalStands) {
            if (stand.name.toLowerCase().includes(input)) {
                toRespond.push({
                    name: stand.name,
                    value: stand.id,
                });
            }
        }

        interaction.respond(toRespond.slice(0, 25));
    },
};

export default slashCommand;
