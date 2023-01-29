import { SlashCommandFile, FightableNPC } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import {
    InteractionResponse,
    Message,
    userMention,
    ApplicationCommandOptionType,
} from "discord.js";
import { Fighter } from "../../structures/FightHandler";
import * as Functions from "../../utils/Functions";

const slashCommand: SlashCommandFile = {
    data: {
        name: "generate-npc",
        description: "gxenerates an npc and shows its profile",
        options: [
            {
                name: "level",
                description: "level of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "strength",
                description: "strength of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "defense",
                description: "defense of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "perception",
                description: "perception of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "speed",
                description: "speed of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "stamina",
                description: "stamina of the npc",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "stand",
                description: "stand of the npc",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const npc: FightableNPC = {
            id: "npc",
            emoji: "👾",
            name: "NPC",
            level: ctx.options.getNumber("level", true),
            skillPoints: {
                strength: ctx.options.getNumber("strength", true),
                defense: ctx.options.getNumber("defense", true),
                perception: ctx.options.getNumber("perception", true),
                speed: ctx.options.getNumber("speed", true),
                stamina: ctx.options.getNumber("stamina", true),
            },
            stand: ctx.options.getString("stand", false) || undefined,
        };
        const fighter: Fighter = new Fighter(npc);

        ctx.makeMessage({
            embeds: [
                {
                    author: {
                        name: "NPC Profile",
                    },
                    fields: [
                        {
                            name: "Level",
                            value: fighter.level.toLocaleString("en-US"),
                            inline: true,
                        },
                        {
                            name: "Attack DMG",
                            value: Functions["getAttackDamages"](fighter).toLocaleString("en-US"),
                            inline: true,
                        },
                        {
                            name: "Health",
                            value: fighter.maxHealth.toLocaleString("en-US"),
                            inline: true,
                        },
                        {
                            name: "Stamina",
                            value: fighter.maxStamina.toLocaleString("en-US"),
                            inline: true,
                        },
                        {
                            name: "Stand",
                            value: fighter.stand
                                ? fighter.stand.emoji + " " + fighter.stand.name
                                : "None or invalid stand",
                        },
                    ],
                },
            ],
        });
    },
};

export default slashCommand;
