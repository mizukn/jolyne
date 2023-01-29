import { SlashCommandFile } from "../../@types";
import { Message, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "neeeega",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const sopow = await ctx.client.database.createUserData("221756292862050314");
        sopow.stand = "The World";
        ctx.userData.stand = "magicians_red";

        const fight = new FightHandler(
            ctx,
            [[ctx.userData], [FightableNPCS.Harry_Lester, Kakyoin]],
            FightTypes.Friendly
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
