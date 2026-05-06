import { SlashCommandFile } from "../../@types";
import infosCommand from "./Infos";

const slashCommand: SlashCommandFile = {
    data: {
        ...infosCommand.data,
        name: "about",
        description: "Display information about the bot",
    },
    execute: infosCommand.execute,
};

export default slashCommand;
