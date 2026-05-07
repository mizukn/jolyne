import { SlashCommandFile } from "../../@types";
import adventureCommand from "./AdventureSubcommands";

const slashCommand: SlashCommandFile = {
    data: {
        name: "start",
        description: "Start your bizarre adventure.",
        type: 1,
        options: [],
    },
    execute: adventureCommand.execute,
};

export default slashCommand;
