import { FightableNPC, RPGUserDataJSON, RPGUserQuest, SlashCommandFile } from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { Harry_Lester } from "../../rpg/NPCs/NPCs";
import { RemoveFleshbudToKakyoin } from "../../rpg/Quests/ActionQuests";
import { StandArrow } from "../../rpg/Items/SpecialItems";
import { InteractionType } from "discord.js";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Bosses from "../../rpg/Raids";

const slashCommand: SlashCommandFile = {
    data: {
        name: "assault",
        description: "Assaults a random NPC that matches your level.",
        options: [],
    },
    checkRPGCooldown: "raid",
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
            ctx.makeMessage({
                content: `You're too low on health to fight. Try to heal yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} or ${ctx.client.getSlashCommandMention("shop")})`,
                embeds: [],
                components: [],
            });
            return;
        }

        const NPC = Functions.randomArray(
            Object.values(FightableNPCS).filter((r) => r.level <= ctx.userData.level)
        ) as FightableNPC;
    },
};

export default slashCommand;
