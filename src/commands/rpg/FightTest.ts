import { SlashCommandFile } from "../../@types";
import { Message, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "neeeega",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const sopow = await ctx.client.database.createUserData("835273012147126272");

        const fight = new FightHandler(
            ctx,
            [[FightableNPCS.Dio, Jotaro, Heaven_Ascended_Dio], [ctx.userData]],
            FightTypes.Boss
        );

        fight.on("unexpectedEnd", (message) => {
            ctx.followUp({
                content: `An error occured and your fight was ended. No changes were made towards your stats. \n\`\`\`${message}\`\`\``,
            });
        });
        fight.on("end", (winners, losers) => {
            ctx.followUp({
                content: `The fight has ended. Winners: ${winners
                    .map((w) => w.name)
                    .join(", ")}\nLosers: ${losers.map((l) => l.map((f) => f.name)).join(", ")}`,
            });
        });
    },
};

export default slashCommand;
