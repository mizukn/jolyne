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

const slashCommand: SlashCommandFile = {
    data: {
        name: "skill",
        description: "Invest your skill points or view them",
        type: 1,
        options: [
            {
                name: "points",
                description: "Invest your skill points or view them",
                type: ApplicationCommandOptionType.SubcommandGroup,
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
                                description:
                                    "The amount of points you want to invest in perception",
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
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const subcommand = ctx.options.getSubcommand();

        if (subcommand === "invest") {
            const strength = ctx.options.getInteger("strength") ?? 0;
            const defense = ctx.options.getInteger("defense") ?? 0;
            const speed = ctx.options.getInteger("speed") ?? 0;
            const perception = ctx.options.getInteger("perception") ?? 0;
            const stamina = ctx.options.getInteger("stamina") ?? 0;

            if (!strength && !defense && !speed && !perception && !stamina) {
                return ctx.makeMessage({
                    content: `Hey, what do you want to upgrade, uh? https://imgur.com/a/yVgD5AL`,
                });
            }

            const totalAmount = strength + defense + speed + perception + stamina;
            // check if any options is < 1
            if (
                (strength && strength < 1) ||
                (defense && defense < 1) ||
                (speed && speed < 1) ||
                (perception && perception < 1) ||
                (stamina && stamina < 1)
            )
                return await ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        "You can't invest less than 1 point... smh",
                        ctx.client.localEmojis.dioangry
                    ),
                });

            if (totalAmount > Functions.getRawSkillPointsLeft(ctx.userData))
                return await ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        `Maths don't work like that, ${
                            ctx.user.username
                        }... You can only invest **${Functions.getRawSkillPointsLeft(
                            ctx.userData
                        )}** points... WRYY`,
                        ctx.client.localEmojis.dioangry
                    ),
                });

            //}, 2000);
            await ctx.client.database.saveUserData(ctx.userData);
            const messages = [];
            for (const key of Object.keys(ctx.userData.skillPoints).filter((key) =>
                ctx.options.getInteger(key)
            )) {
                ctx.userData.skillPoints[key as keyof typeof ctx.userData.skillPoints] +=
                    ctx.options.getInteger(key);
                /*ctx.followUpQueue.push({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        `You've invested **${ctx.options.getInteger(key)}** points in **${key}**!`)
                });*/
                messages.push(
                    `You've invested **${ctx.options.getInteger(key)}** points in **${key}**.`
                );
            }

            if (messages.length) {
                ctx.followUpQueue.push({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        "\n\n" + messages.map((x, i) => `${i + 1}. ${x}`).join("\n")
                    ),
                });
            }
            await ctx.client.database.saveUserData(ctx.userData);
        }

        await ctx.sendTranslated("skill-points:BASE_MESSAGE", {
            userData: ctx.userData,
            atkDMG: Functions.getAttackDamages(ctx.userData).toLocaleString("en-US"),
            dodgeScore: Functions.getDodgeScore(ctx.userData).toLocaleString("en-US"),
            speedScore: Functions.getSpeedScore(ctx.userData).toLocaleString("en-US"),
            maxHealth: Functions.getMaxHealth(ctx.userData).toLocaleString("en-US"),
            maxStamina: Functions.getMaxStamina(ctx.userData).toLocaleString("en-US"),
            components: [
                Functions.actionRow([
                    new ButtonBuilder()
                        .setCustomId("ff" + Date.now())
                        .setLabel(`${Functions.getRawSkillPointsLeft(ctx.userData)} points left`)
                        .setEmoji("925416226547707924")
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary),
                ]),
            ],
        });
    },
};

export default slashCommand;
