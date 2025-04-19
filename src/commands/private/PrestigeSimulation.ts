import { Message, ButtonBuilder, ButtonStyle } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";
import { cloneDeep } from "lodash";
import * as Items from "../../rpg/Items";
const totalItems = Object.values(Items.default).filter(
    (x) => Functions.isConsumable(x) || Functions.isSpecial(x)
);

const slashCommand: SlashCommandFile = {
    data: {
        name: "prestigesimulate",
        description: "Sim",
        options: [
            {
                name: "target",
                description: "Target",
                type: 6,
                required: false,
            },
        ],
    },
    adminOnly: true,

    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        const data = await ctx.client.database.getRPGUserData(
            ctx.interaction.options.getUser("target", false)?.id || ctx.interaction.user.id
        );

        if (!data) {
            return void ctx.makeMessage({
                content: "User not found",
            });
        }

        const oldData = cloneDeep(data);

        while (Functions.prestigeUser(data)) {
            console.log(data.level);
            continue;
        }

        ctx.makeMessage({
            content: `Since ${
                ctx.interaction.options.getUser("target", false)?.username ||
                ctx.interaction.user.username
            } is currently level \`${oldData.level.toLocaleString(
                "en-US"
            )}\`, if they prestiged, they would now be level **${
                data.level
            }** with **${data.xp.toLocaleString()}** xp (total prestige: **${data.prestige}**)`,
        });
    },
};

export default slashCommand;
