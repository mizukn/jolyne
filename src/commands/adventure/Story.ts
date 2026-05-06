import { SlashCommandFile } from "../../@types";
import chapterCommand from "./Chapter";

const slashCommand: SlashCommandFile = {
    data: {
        ...chapterCommand.data,
        name: "story",
        description: "Show your current story progress",
    },
    execute: chapterCommand.execute,
};

export default slashCommand;
