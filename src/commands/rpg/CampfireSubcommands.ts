import { RPGUserDataJSON, SlashCommandFile, Leaderboard, i18n_key } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionCollector,
    ButtonInteraction,
    CacheType,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    InteractionResponse,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { Heaven_Ascended_Dio, Jotaro, Kakyoin } from "../../rpg/NPCs/FightableNPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import * as SideQuests from "../../rpg/SideQuests";
import { getQuestsStats } from "./Chapter";

const sideQuestsArr = Object.values(SideQuests);

const slashCommand: SlashCommandFile = {
    data: {
        name: "campfire",
        description: "[...]",
        type: 1,
        options: [
            {
                name: "rest",
                description: "Rest at the campfire. (+1% health +1% stamina every 2 minutes)",
                type: 1,
                options: [],
            },
            {
                name: "leave",
                description: "Leave the campfire.",
                type: 1,
                options: [],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        async function getStats(): Promise<{
            health: number;
            stamina: number;
            currentHealth: number;
            currentStamina: number;
        }> {
            const restedDate = ctx.userData.restingAtCampfire
                ? new Date(ctx.userData.restingAtCampfire)
                : undefined;
            let healthWon;
            let staminaWon;
            if (restedDate) {
                healthWon = 0;
                staminaWon = 0;
                // every 2 minutes, give 1% of Functions.getMaxHealth(ctx.userData) and Functions.getMaxStamina(ctx.userData)
                let msElapsed = Date.now() - restedDate.getTime();
                while (msElapsed >= 120000) {
                    healthWon += Functions.getMaxHealth(ctx.userData) / 100;
                    staminaWon += Functions.getMaxStamina(ctx.userData) / 100;
                    msElapsed -= 120000;
                }
                if (healthWon !== 0) {
                    healthWon = Math.round(ctx.userData.health - healthWon);
                    if (healthWon > Functions.getMaxHealth(ctx.userData))
                        healthWon = Functions.getMaxHealth(ctx.userData);
                }
                if (staminaWon !== 0) {
                    staminaWon = Math.round(ctx.userData.stamina - staminaWon);
                    if (staminaWon > Functions.getMaxStamina(ctx.userData))
                        staminaWon = Functions.getMaxStamina(ctx.userData);
                }
            }

            return {
                health: healthWon,
                stamina: staminaWon,
                currentHealth: ctx.userData.health + healthWon,
                currentStamina: ctx.userData.stamina + staminaWon,
            };
        }
        switch (ctx.interaction.options.getSubcommand()) {
            case "rest": {
                getStats().then(async (stats) => {
                    if (stats.health === undefined) {
                        ctx.userData.restingAtCampfire = Date.now();
                        ctx.makeMessage({
                            content: `🔥🪵 You're now resting at the campfire. Use this command again to see what you've gained. You can leave the campfire with ${ctx.client.getSlashCommandMention(
                                "campfire leave"
                            )} command.`,
                        });
                        ctx.client.database.saveUserData(ctx.userData);
                    } else {
                        ctx.makeMessage({
                            content: `🔥🪵 You've gained **${stats.health.toLocaleString(
                                "en-US"
                            )}** :heart: and **${stats.stamina.toLocaleString(
                                "en-US"
                            )}** :zap: (${stats.currentHealth.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxHealth(ctx.userData).toLocaleString(
                                "en-US"
                            )} :heart:)[${stats.currentHealth.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxStamina(ctx.userData).toLocaleString(
                                "en-US"
                            )} :zap:].\n You can leave the campfire with ${ctx.client.getSlashCommandMention(
                                "campfire leave"
                            )} command.`,
                        });
                    }
                });
                break;
            }
            case "leave": {
                getStats().then(async (stats) => {
                    if (stats.health === undefined) {
                        ctx.makeMessage({
                            content: `You're not resting at the campfire. Use ${ctx.client.getSlashCommandMention(
                                "campfire rest"
                            )} to rest.`,
                        });
                    } else {
                        ctx.userData.restingAtCampfire = 0;
                        ctx.makeMessage({
                            content: `🔥🪵 You've gained **${stats.health.toLocaleString(
                                "en-US"
                            )}** :heart: and **${stats.stamina.toLocaleString(
                                "en-US"
                            )}** :zap:. (${stats.currentHealth.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxHealth(ctx.userData).toLocaleString(
                                "en-US"
                            )} :heart:)[${stats.currentHealth.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxStamina(ctx.userData).toLocaleString(
                                "en-US"
                            )} :zap:].\n You can leave the campfire with ${ctx.client.getSlashCommandMention(
                                "campfire leave"
                            )} command.`,
                        });
                        ctx.userData.health = stats.currentHealth;
                        ctx.userData.stamina = stats.currentStamina;
                        await ctx.client.database.saveUserData(ctx.userData);
                    }
                });
            }
        }
    },
};

export default slashCommand;
