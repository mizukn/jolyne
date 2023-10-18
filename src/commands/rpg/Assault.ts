import { FightableNPC, SlashCommandFile } from "../../@types";
import {
    Message,
    MessageComponentInteraction
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";

const slashCommand: SlashCommandFile = {
    data: {
        name: "assault",
        description: "Assaults a random NPC that matches your level.",
        options: []
    },
    checkRPGCooldown: "assault",
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
            await ctx.makeMessage({
                content: `You're too low on health to fight. Try to heal yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} or ${ctx.client.getSlashCommandMention("shop")})`,
                embeds: [],
                components: []
            });
            return;
        }

        const normalNPC = Functions.randomArray(
            Object.values(FightableNPCS).filter((r) => r.level <= ctx.userData.level)
        ) as FightableNPC;
        const highNPC = (Functions.randomArray(
            Object.values(FightableNPCS).filter((r) => r.level > ctx.userData.level)
        ) || Functions.randomArray(Object.values(FightableNPCS))) as FightableNPC;
        const randomNPC = Functions.randomArray(Object.values(FightableNPCS)) as FightableNPC;

        const normalNPCButton = new ButtonBuilder()
            .setCustomId("normal" + ctx.interaction.id)
            .setLabel(normalNPC.name)
            .setEmoji(normalNPC.emoji)
            .setStyle(ButtonStyle.Primary);
        const highNPCButton = new ButtonBuilder()
            .setCustomId("high" + ctx.interaction.id)
            .setLabel(highNPC.name)
            .setEmoji(highNPC.emoji)
            .setStyle(
                highNPC.level < ctx.userData.level ? ButtonStyle.Secondary : ButtonStyle.Danger
            );
        const randomNPCButton = new ButtonBuilder()
            .setCustomId("random" + ctx.interaction.id)
            .setLabel(randomNPC.name)
            .setEmoji(randomNPC.emoji)
            .setStyle(
                randomNPC.level < ctx.userData.level ? ButtonStyle.Secondary : ButtonStyle.Danger
            );

        await ctx.makeMessage({
            embeds: [
                {
                    author: {
                        name: ctx.user.username,
                        icon_url: ctx.user.displayAvatarURL()
                    },
                    description: `You're about to assault an NPC. Choose your target wisely.`,
                    color: 0x70926c
                }
            ],
            components: [Functions.actionRow([normalNPCButton, randomNPCButton, highNPCButton])]
        });
        await ctx.client.database.setRPGCooldown(ctx.user.id, "assault", 60000 * 5);
        await ctx.client.database.setCooldown(
            ctx.userData.id,
            `You're currently assaulting someone. Please make a selection!`
        );

        const filter = (i: MessageComponentInteraction) =>
            (i.user.id === ctx.user.id && i.customId === "normal" + ctx.interaction.id) ||
            (i.user.id === ctx.user.id && i.customId === "high" + ctx.interaction.id) ||
            (i.user.id === ctx.user.id && i.customId === "random" + ctx.interaction.id);
        const collector = ctx.channel.createMessageComponentCollector({
            filter,
            time: 30000
        });

        collector.on("end", async () => {
            if (
                (await ctx.client.database.getCooldown(ctx.userData.id)) ===
                `You're currently assaulting someone. Please make a selection!`
            ) {
                await ctx.client.database.deleteCooldown(ctx.userData.id);
                await ctx.followUp({
                    content: `You didn't select a target in time. Please try again next time`
                });
            }
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line
            await i.deferUpdate().catch(() => {
            });
            const npc =
                i.customId === "normal" + ctx.interaction.id ? normalNPC : i.customId === "high" + ctx.interaction.id ? highNPC : randomNPC;
            ctx.interaction.fetchReply().then((r) => {
                ctx.client.database.setCooldown(
                    ctx.userData.id,
                    `You're currently assaulting ${normalNPC.emoji} **${normalNPC.name}**. Lost your battle ? Click here --> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
                );
            });
            const fightHandler = new FightHandler(ctx, [[ctx.userData], [npc]], FightTypes.Assault);

            fightHandler.on("end", async (winners, losers) => {
                await ctx.client.database.deleteCooldown(ctx.userData.id);
                if (winners.find((r) => r.id === ctx.userData.id)) {
                    const xp = Functions.addXp(
                        ctx.userData,
                        npc.rewards?.xp / 5 ?? npc.level * 1000
                    );
                    const coins = Functions.addCoins(
                        ctx.userData,
                        npc.rewards?.coins / 15 ?? npc.level * 250
                    );
                    await ctx.followUp({
                        content: `You assaulted ${npc.name} and won! You got ${xp.toLocaleString(
                            "en-US"
                        )} ${ctx.client.localEmojis.xp} and ${coins.toLocaleString("en-US")} ${
                            ctx.client.localEmojis.jocoins
                        }.`
                    });
                } else {
                    ctx.userData.health = 0;
                    ctx.userData.stamina = 0;

                    await ctx.followUp({
                        content: `You assaulted ${npc.name} and lost! You lost all your health and stamina. Better luck next time or train yourself more.`
                    });
                }
                await ctx.client.database.saveUserData(ctx.userData);
            });
            collector.stop("ok");
        });
    }
};

export default slashCommand;
