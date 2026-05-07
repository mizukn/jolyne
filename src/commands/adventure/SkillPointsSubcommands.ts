import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    InteractionResponse,
    Message,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { SlashCommandFile } from "../../@types";
import * as Functions from "../../utils/Functions";
import { NPCs } from "../../rpg/NPCs";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { containers, SectionData, V2Reply } from "../../utils/containers";
import { cloneDeep } from "lodash";

const SKILLS = [
    {
        key: "stamina",
        emoji: "⚡",
        label: "Stamina",
        desc: "Increases your agility [stamina/energy]",
        miscFunc: Functions.getMaxStamina,
        miscName: "Max Stamina",
    },
    {
        key: "defense",
        emoji: "❤️",
        label: "Defense",
        desc: "Increases your health and your resistance",
        miscFunc: Functions.getMaxHealth,
        miscName: "Max Health",
    },
    {
        key: "strength",
        emoji: "💪",
        label: "Strength",
        desc: "Increases your damages & your stand's damage",
        miscFunc: Functions.getAttackDamages,
        miscName: "ATK Damage",
    },
    {
        key: "perception",
        emoji: "🍃",
        label: "Perception",
        desc: "Increases your dodges %",
        miscFunc: Functions.getDodgeScore,
        miscName: "Dodge Score",
    },
    {
        key: "speed",
        emoji: "💨",
        label: "Speed",
        desc: "Decreases your opponent's perception and you may be able to attack 2 times in a row...",
        miscFunc: Functions.getSpeedScore,
        miscName: "Speed Score",
    },
] as const;

const skillButtonId = (sessionId: string, skill: (typeof SKILLS)[number]["key"]): string =>
    `skill:${sessionId}:${skill}`;

function buildUI(ctx: CommandInteractionContext, sessionId: string): V2Reply {
    const pointsLeft = Functions.getRawSkillPointsLeft(ctx.userData);
    const sections: SectionData[] = [];

    for (const skill of SKILLS) {
        const value =
            ctx.userData.skillPoints[skill.key as keyof typeof ctx.userData.skillPoints] ?? 0;
        sections.push({
            text: `### ${skill.emoji} **${skill.label}:** ${value.toLocaleString()} points\n> -# ${skill.desc}\n**${skill.miscName}:** ${skill.miscFunc(ctx.userData).toLocaleString()}`,
            accessory: new ButtonBuilder()
                .setCustomId(skillButtonId(sessionId, skill.key))
                .setLabel(`Upgrade ${skill.label}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(skill.emoji)
                .setDisabled(pointsLeft <= 0),
        });
    }

    return containers.primary({
        title: "# 📊 Skill Points",
        sections,
        sectionDividers: true,
        footer: `${ctx.client.localEmojis.arrowRight} ${pointsLeft.toLocaleString()} points left to invest.`,
    });
}

const slashCommand: SlashCommandFile = {
    hidden: true,
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
        ctx: CommandInteractionContext,
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const subcommand = ctx.options.getSubcommand();
        const sessionId = `${ctx.user.id}:${Date.now()}`;

        if (subcommand === "invest") {
            const strength = ctx.options.getInteger("strength") ?? 0;
            const defense = ctx.options.getInteger("defense") ?? 0;
            const speed = ctx.options.getInteger("speed") ?? 0;
            const perception = ctx.options.getInteger("perception") ?? 0;
            const stamina = ctx.options.getInteger("stamina") ?? 0;

            if (strength || defense || speed || perception || stamina) {
                const totalAmount = strength + defense + speed + perception + stamina;

                if (strength < 0 || defense < 0 || speed < 0 || perception < 0 || stamina < 0) {
                    return await ctx.makeMessage(
                        containers.error(
                            Functions.makeNPCString(
                                NPCs.Dio,
                                "You can't invest less than 0 points... smh",
                                ctx.client.localEmojis.dioangry,
                            ),
                        ),
                    );
                }

                const pointsLeft = Functions.getRawSkillPointsLeft(ctx.userData);
                if (totalAmount > pointsLeft) {
                    return await ctx.makeMessage(
                        containers.error(
                            Functions.makeNPCString(
                                NPCs.Dio,
                                `Maths don't work like that, ${
                                    ctx.user.username
                                }... You can only invest **${pointsLeft.toLocaleString()}** points... WRYY`,
                                ctx.client.localEmojis.dioangry,
                            ),
                        ),
                    );
                }

                const oldData = cloneDeep(ctx.userData);
                const updates: string[] = [];

                if (strength) {
                    ctx.userData.skillPoints.strength += strength;
                    updates.push(`+${strength.toLocaleString()} Strength`);
                }
                if (defense) {
                    ctx.userData.skillPoints.defense += defense;
                    updates.push(`+${defense.toLocaleString()} Defense`);
                }
                if (speed) {
                    ctx.userData.skillPoints.speed += speed;
                    updates.push(`+${speed.toLocaleString()} Speed`);
                }
                if (perception) {
                    ctx.userData.skillPoints.perception += perception;
                    updates.push(`+${perception.toLocaleString()} Perception`);
                }
                if (stamina) {
                    ctx.userData.skillPoints.stamina += stamina;
                    updates.push(`+${stamina.toLocaleString()} Stamina`);
                }

                const transaction = await ctx.client.database.handleTransaction(
                    [{ oldData, newData: ctx.userData }],
                    `Skill Investment: ${updates.join(", ")}`,
                );

                if (!transaction) {
                    ctx.RPGUserData = oldData;
                    return await ctx.makeMessage(
                        containers.error("Transaction failed. Your points were not invested."),
                    );
                }
            }
        }

        await ctx.makeMessage(buildUI(ctx, sessionId));

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(`skill:${sessionId}:`),
            time: 120000,
        });

        collector.on("collect", async (i) => {
            const customIdParts = i.customId.split(":");
            const skillKey = customIdParts[customIdParts.length - 1];
            const skill = SKILLS.find((s) => s.key === skillKey);
            if (!skill) return;

            const pointsLeft = Functions.getRawSkillPointsLeft(ctx.userData);
            if (pointsLeft <= 0) {
                return i.reply({
                    ...containers.error("You don't have any skill points left!"),
                    ephemeral: true,
                });
            }

            const modalId = `skill:${sessionId}:modal:${skill.key}`;
            const modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle(`Invest in ${skill.label}`)
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId("amount")
                            .setLabel(`Amount (Max: ${pointsLeft})`)
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("Enter the amount of points to invest")
                            .setRequired(true),
                    ),
                );

            await i.showModal(modal);

            const submission = await i
                .awaitModalSubmit({
                    filter: (sub) => sub.user.id === ctx.user.id && sub.customId === modalId,
                    time: 60000,
                })
                .catch(() => null);

            if (!submission) return;

            const amount = Number.parseInt(submission.fields.getTextInputValue("amount"), 10);
            if (isNaN(amount) || amount < 1) {
                return submission.reply({
                    ...containers.error("Please enter a valid amount greater than 0."),
                    ephemeral: true,
                });
            }

            // Refresh user data to be sure
            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
            const freshPointsLeft = Functions.getRawSkillPointsLeft(ctx.userData);

            if (amount > freshPointsLeft) {
                return submission.reply({
                    ...containers.error(`You only have **${freshPointsLeft.toLocaleString()}** points left!`),
                    ephemeral: true,
                });
            }

            const oldData = cloneDeep(ctx.userData);
            ctx.userData.skillPoints[skill.key as keyof typeof ctx.userData.skillPoints] += amount;

            const transaction = await ctx.client.database.handleTransaction(
                [{ oldData, newData: ctx.userData }],
                `Skill Investment: ${skill.key} +${amount}`,
            );

            if (!transaction) {
                ctx.RPGUserData = oldData;
                return submission.reply({
                    ...containers.error("Transaction failed. Your points were not invested."),
                    ephemeral: true,
                });
            }

            await submission.deferUpdate();
            await ctx.makeMessage(buildUI(ctx, sessionId));
        });
    },
};

export default slashCommand;
