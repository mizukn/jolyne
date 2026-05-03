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
        name: "test",
        description: "test",
        options: [],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        const oldData = cloneDeep(ctx.userData);
        ctx.userData.coins += 1000000;
        const newCoins = ctx.userData.coins;
        const results = [
            Functions.addItem(ctx.userData, "pizza"),
            Functions.addItem(ctx.userData, "nix", 1),
        ];

        const id = await ctx.client.database.handleTransaction(
            [
                {
                    oldData,
                    newData: ctx.userData,
                },
            ],
            "from test",
            results
        );

        ctx.makeMessage({
            content: `Transaction ID: ${id}`,
        });
    },
};

export default slashCommand;
