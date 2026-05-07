import { SlashCommandFile } from "../../@types";
import patreonCommand from "./Patreon";

const slashCommand: SlashCommandFile = {
    data: {
        ...patreonCommand.data,
        name: "premium",
        description: "View premium support rewards.",
    },
    execute: patreonCommand.execute,
};

export default slashCommand;
