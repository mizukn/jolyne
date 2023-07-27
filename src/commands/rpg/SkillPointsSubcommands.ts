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
        description: "[...]",
        type: 1,
        options: [
            {
                name: "points",
                description: "eeeeeeeeeee.",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "invest",
                        description: "eeeeeeeeeee.",
                        type: 1,
                        options: [
                            {
                                name: "to",
                                description: "d",
                                type: 3,
                                required: true,
                                choices: [
                                    {
                                        name: "Strength",
                                        value: "strength",
                                    },
                                    {
                                        name: "Speed",
                                        value: "speed",
                                    },
                                    {
                                        name: "Defense",
                                        value: "defense",
                                    },
                                    {
                                        name: "Perception",
                                        value: "perception",
                                    },
                                    {
                                        name: "Stamina",
                                        value: "stamina",
                                    },
                                ],
                            },
                            {
                                name: "amount",
                                description: "d",
                                type: 4,
                                required: true,
                            },
                            {
                                name: "to2",
                                description: "d",
                                type: 3,
                                choices: [
                                    {
                                        name: "Strength",
                                        value: "strength",
                                    },
                                    {
                                        name: "Speed",
                                        value: "speed",
                                    },
                                    {
                                        name: "Defense",
                                        value: "defense",
                                    },
                                    {
                                        name: "Perception",
                                        value: "perception",
                                    },
                                    {
                                        name: "Stamina",
                                        value: "stamina",
                                    },
                                ],
                            },
                            {
                                name: "amount2",
                                description: "d",
                                type: 4,
                            },
                        ],
                    },
                    {
                        name: "view",
                        description: "eeeeeeeeeee.",
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
            const amount = ctx.options.getInteger("amount");
            if (amount < 1)
                return ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        "You can't invest less than 1 point... smh",
                        ctx.client.localEmojis.dioangry
                    ),
                });
            if (amount > Functions.calculeSkillPointsLeft(ctx.userData))
                return ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Dio,
                        `Maths don't work like that, ${
                            ctx.user.username
                        }... You can only invest **${Functions.calculeSkillPointsLeft(
                            ctx.userData
                        )}** points... WRYY`,
                        ctx.client.localEmojis.dioangry
                    ),
                });

            ctx.userData.skillPoints[
                ctx.options.getString("to") as keyof typeof ctx.userData.skillPoints
            ] += ctx.options.getInteger("amount");

            if (ctx.options.getString("to2") || ctx.options.getInteger("amount2")) {
                if (!ctx.options.getInteger("amount2") || !ctx.options.getString("to2"))
                    ctx.followUpQueue.push({
                        content: Functions.makeNPCString(
                            NPCs.Dio,
                            `Hey, if you want to invest in another skill, you need to specify the skill and the amount of points you want to invest in it...`,
                            ctx.client.localEmojis.dioangry
                        ),
                    });
                else {
                    const amount2 = ctx.options.getInteger("amount2");
                    if (amount2 < 1)
                        return ctx.makeMessage({
                            content: Functions.makeNPCString(
                                NPCs.Dio,
                                "You can't invest less than 1 point... smh",
                                ctx.client.localEmojis.dioangry
                            ),
                        });
                    if (amount2 > Functions.calculeSkillPointsLeft(ctx.userData))
                        return ctx.makeMessage({
                            content: Functions.makeNPCString(
                                NPCs.Dio,
                                `Maths don't work like that [to2, amount2], ${
                                    ctx.user.username
                                }... You can only invest **${Functions.calculeSkillPointsLeft(
                                    ctx.userData
                                )}** points... WRYY`,
                                ctx.client.localEmojis.dioangry
                            ),
                        });

                    ctx.userData.skillPoints[
                        ctx.options.getString("to2") as keyof typeof ctx.userData.skillPoints
                    ] += ctx.options.getInteger("amount2");
                    ctx.followUpQueue.push({
                        content: Functions.makeNPCString(
                            NPCs.Dio,
                            `You invested ${amount2} points in ${
                                ctx.options.getString(
                                    "to2"
                                ) as keyof typeof ctx.userData.skillPoints
                            }`
                        ),
                    });
                }
            }

            //setTimeout(() => {
            ctx.followUpQueue.push({
                content: Functions.makeNPCString(
                    NPCs.Dio,
                    `You invested ${amount} points in ${
                        ctx.options.getString("to") as keyof typeof ctx.userData.skillPoints
                    }`
                ),
            });
            //}, 2000);
            await ctx.client.database.saveUserData(ctx.userData);
        }

        ctx.sendTranslated("skill-points:BASE_MESSAGE", {
            userData: ctx.userData,
            atkDMG: Functions.getAttackDamages(ctx.userData),
            dodgeScore: Functions.getDodgeScore(ctx.userData),
            speedScore: Functions.getSpeedScore(ctx.userData),
            components: [
                Functions.actionRow([
                    new ButtonBuilder()
                        .setCustomId("ff" + Date.now())
                        .setLabel(`${Functions.calculeSkillPointsLeft(ctx.userData)} points left`)
                        .setEmoji("925416226547707924")
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary),
                ]),
            ],
        });
    },
};

export default slashCommand;
