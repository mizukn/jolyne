import { SlashCommandFile } from "../../@types";
import emailsCommand from "./EmailsSubcommands";

const slashCommand: SlashCommandFile = {
    data: {
        name: "mail",
        description: "View your mail",
        type: 1,
        options: [
            {
                name: "inbox",
                description: "Shows your inbox",
                type: 1,
            },
            {
                name: "archived",
                description: "Shows your archived mail",
                type: 1,
            },
        ],
    },
    execute: emailsCommand.execute,
};

export default slashCommand;
