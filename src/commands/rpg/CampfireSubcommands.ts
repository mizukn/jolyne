import { RPGUserDataJSON, SlashCommandFile, Leaderboard, i18n_key } from "../../@types";
import {
    Message,
    InteractionResponse
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as SideQuests from "../../rpg/SideQuests";

const slashCommand: SlashCommandFile = {
    data: {
        name: "campfire",
        description: "Rest at the campfire, or leave it.",
        type: 1,
        options: [
            {
                name: "rest",
                description: "Rest at the campfire. (+1% health +1% stamina every 2 minutes)",
                type: 1,
                options: []
            },
            {
                name: "leave",
                description: "Leave the campfire.",
                type: 1,
                options: []
            }
        ]
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
            const restedDate = Number(ctx.userData.restingAtCampfire)
                ? new Date(Number(ctx.userData.restingAtCampfire))
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
            }

            return {
                health: healthWon,
                stamina: staminaWon,
                currentHealth: ctx.userData.health + healthWon,
                currentStamina: ctx.userData.stamina + staminaWon
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
                            )} command.`
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
                            )} command.`
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
                            )} to rest.`
                        });
                    } else {
                        ctx.userData.restingAtCampfire = 0;
                        ctx.userData.health += stats.health;
                        ctx.userData.stamina += stats.stamina;
                        ctx.makeMessage({
                            content: `🔥🪵 You've gained **${stats.health.toLocaleString(
                                "en-US"
                            )}** :heart: and **${stats.stamina.toLocaleString(
                                "en-US"
                            )}** :zap:. (${ctx.userData.health.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxHealth(ctx.userData).toLocaleString(
                                "en-US"
                            )} :heart:)[${ctx.userData.stamina.toLocaleString(
                                "en-US"
                            )}/${Functions.getMaxStamina(ctx.userData).toLocaleString(
                                "en-US"
                            )} :zap:]`
                        });
                        await ctx.client.database.saveUserData(ctx.userData);
                    }
                });
            }
        }
    }
};

export default slashCommand;
