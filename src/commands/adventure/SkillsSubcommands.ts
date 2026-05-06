import { SlashCommandFile } from "../../@types";
import skillCommand from "./SkillPointsSubcommands";

const slashCommand: SlashCommandFile = {
    data: {
        name: "skills",
        description: "Invest your skill points or view them",
        type: 1,
        options: [
            {
                name: "invest",
                description: "Invest your skill points",
                type: 1,
                options: [
                    {
                        name: "strength",
                        type: 4,
                        description: "The amount of points you want to invest in strength",
                    },
                    {
                        name: "defense",
                        type: 4,
                        description: "The amount of points you want to invest in defense",
                    },
                    {
                        name: "speed",
                        type: 4,
                        description: "The amount of points you want to invest in speed",
                    },
                    {
                        name: "perception",
                        type: 4,
                        description: "The amount of points you want to invest in perception",
                    },
                    {
                        name: "stamina",
                        type: 4,
                        description: "The amount of points you want to invest in stamina",
                    },
                ],
            },
            {
                name: "view",
                description: "View your skill points without investing them",
                type: 1,
            },
        ],
    },
    execute: skillCommand.execute,
};

export default slashCommand;
