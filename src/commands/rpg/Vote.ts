import { SlashCommandFile, Leaderboard } from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";

const slashCommand: SlashCommandFile = {
    data: {
        name: "vote",
        description: "View your profile (or someone else's)",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

export default slashCommand;
