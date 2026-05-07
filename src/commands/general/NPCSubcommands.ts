import { SlashCommandFile } from "../../@types";
import npcInfoCommand from "./NPCInfo";

const slashCommand: SlashCommandFile = {
    data: {
        name: "npc",
        description: "View NPC information.",
        type: 1,
        options: [
            {
                name: "info",
                description: npcInfoCommand.data.description,
                type: 1,
                options: npcInfoCommand.data.options,
            },
        ],
    },
    execute: npcInfoCommand.execute,
    autoComplete: npcInfoCommand.autoComplete,
};

export default slashCommand;
