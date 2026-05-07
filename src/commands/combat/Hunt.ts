import { SlashCommandFile } from "../../@types";
import assaultCommand from "./Assault";

const slashCommand: SlashCommandFile = {
    data: {
        name: "hunt",
        description: "Find and fight a random NPC that matches your level.",
        type: 1,
        options: [],
    },
    checkRPGCooldown: assaultCommand.checkRPGCooldown,
    execute: assaultCommand.execute,
};

export default slashCommand;
