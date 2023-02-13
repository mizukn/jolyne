import { SlashCommandFile } from "../../@types";
import { Message, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import { StandArrow } from "../../rpg/Items/Special";

const slashCommand: SlashCommandFile = {
    data: {
        name: "fight",
        description: "neeeega",
        options: [
            /*{
                name: "npc",
                description: "npc",
                type: 1,
            },*/
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const cheesie = await ctx.client.database.createUserData("884838876303228928");
        const ff = await ctx.client.database.createUserData("767797194107387904");
        cheesie.stand = "The Hand";
        ff.stand = "magician's red";
        Kakyoin.stand = "Hierophant Green";

        ctx.userData.stand = "The World";

        const fight = new FightHandler(
            ctx,
            [
                [ctx.userData, cheesie],
                [Kakyoin, ff],
            ],
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
