import { SlashCommandFile } from "../../@types";
import campfireCommand from "./CampfireSubcommands";

const slashCommand: SlashCommandFile = {
    data: {
        name: "rest",
        description: "Rest or stop resting.",
        type: 1,
        options: [
            {
                name: "start",
                description: "Start resting. (+1% health +1% stamina every 2 minutes)",
                type: 1,
                options: [],
            },
            {
                name: "leave",
                description: "Stop resting and collect recovered health and stamina.",
                type: 1,
                options: [],
            },
        ],
    },
    execute: campfireCommand.execute,
};

export default slashCommand;
