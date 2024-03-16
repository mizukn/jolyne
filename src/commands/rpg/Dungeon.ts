import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
} from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import DungeonHandler from "../../structures/DungeonHandler";

const slashCommand: SlashCommandFile = {
    data: {
        name: "dungeon",
        description: "issou",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const dungeon = new DungeonHandler(ctx, [ctx.userData]);
    },
};

export default slashCommand;
