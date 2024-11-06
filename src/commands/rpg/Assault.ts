import { FightableNPC, RPGUserDataJSON, SlashCommandFile } from "../../@types";
import { Message, MessageComponentInteraction } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";

function generateHighNPC(userData: RPGUserDataJSON): FightableNPC {
    const stand = Functions.getCurrentStand(userData);
    const generatedStand = Functions.getRandomStand(["SS", "S"]);
    const highNPC = Functions.randomArray(
        Object.values(FightableNPCS)
            .sort((a, b) => b.level - a.level)
            .slice(0, 10)
    );
    const generatedNPC: FightableNPC = {
        id: "high_npc",
        name: `You`,
        emoji: stand?.emoji ?? generatedStand.stand.emoji,
        level: Math.round(userData.level * 1),
        skillPoints: userData.skillPoints,
        equippedItems: userData.equippedItems,
        standsEvolved: userData.standsEvolved,
        stand: stand ? stand.id : generatedStand.stand.id,
    };
    if (!stand) {
        generatedNPC.standsEvolved[generatedStand.stand.id] = generatedStand.evolution;
    }

    Functions.generateSkillPoints(generatedNPC);
    Functions.fixNpcRewards(generatedNPC);

    return Functions.randomArray([highNPC, generatedNPC]);
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "assault",
        description: "Assaults a random NPC that matches your level.",
        options: [],
    },
    checkRPGCooldown: "assault",
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.userData.health < Functions.getMaxHealth(ctx.userData) * 0.1) {
            await ctx.makeMessage({
                content: `You're too low on health to fight. Try to  ${ctx.client.getSlashCommandMention(
                    "heal"
                )} yourself first by using some consumables (${ctx.client.getSlashCommandMention(
                    "inventory use"
                )} or ${ctx.client.getSlashCommandMention("shop")})`,
                embeds: [],
                components: [],
            });
            return;
        }

        const normalNPC = Functions.randomArray(
            Object.values(FightableNPCS).filter(
                (r) =>
                    r.level <= ctx.userData.level &&
                    r.stand !== "admin_stand" &&
                    (r.stand ? Functions.findStand(r.stand).rarity !== "T" : true)
            )
        ) as FightableNPC;
        const highNPC =
            Functions.randomArray(
                Object.values(FightableNPCS).filter(
                    (r) =>
                        r.level > ctx.userData.level &&
                        r.stand !== "admin_stand" &&
                        (r.stand ? Functions.findStand(r.stand).rarity !== "T" : true)
                )
            ) || generateHighNPC(ctx.userData);
        const randomNPC = Functions.randomArray(Object.values(FightableNPCS)) as FightableNPC;

        const normalNPCButton = new ButtonBuilder()
            .setCustomId("normal" + ctx.interaction.id)
            .setLabel(`[LVL ${normalNPC.level.toLocaleString("en-US")}] ` + normalNPC.name)
            .setEmoji(normalNPC.emoji)
            .setStyle(ButtonStyle.Primary);
        const highNPCButton = new ButtonBuilder()
            .setCustomId("high" + ctx.interaction.id)
            .setLabel(`[LVL ${highNPC.level.toLocaleString("en-US")}] ` + highNPC.name)
            .setEmoji(highNPC.emoji)
            .setStyle(
                highNPC.level < ctx.userData.level ? ButtonStyle.Secondary : ButtonStyle.Danger
            );
        const randomNPCButton = new ButtonBuilder()
            .setCustomId("random" + ctx.interaction.id)
            .setLabel(`[LVL ${randomNPC.level.toLocaleString("en-US")}] ` + randomNPC.name)
            .setEmoji(randomNPC.emoji)
            .setStyle(
                randomNPC.level < ctx.userData.level ? ButtonStyle.Secondary : ButtonStyle.Danger
            );

        await ctx.makeMessage({
            embeds: [
                {
                    author: {
                        name: ctx.user.username,
                        icon_url: ctx.user.displayAvatarURL(),
                    },
                    description: `You're about to assault an NPC. Choose your target wisely.`,
                    color: 0x70926c,
                },
            ],
            components: [Functions.actionRow([normalNPCButton, randomNPCButton, highNPCButton])],
        });

        let cooldown = 60000 * 5;
        if (Functions.hasVotedRecenty(ctx.userData, ctx.client)) {
            console.log("Voted recently, so cooldown is 45 seconds");
            cooldown = 45000;
        }

        await ctx.client.database.setRPGCooldown(ctx.user.id, "assault", cooldown);
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
            time: 60000,
            max: 1,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            await i.deferUpdate().catch(() => {});
            const npc =
                i.customId === "normal" + ctx.interaction.id
                    ? normalNPC
                    : i.customId === "high" + ctx.interaction.id
                    ? highNPC
                    : randomNPC;
            ctx.interaction.fetchReply().then((r) => {
                ctx.client.database.setCooldown(
                    ctx.userData.id,
                    `You're currently assaulting ${normalNPC.emoji} **${normalNPC.name}**. Lost your battle ? Click here --> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
                );
            });
            const fightHandler = new FightHandler(ctx, [[ctx.userData], [npc]], FightTypes.Assault);

            fightHandler.on("end", async (winners, losers) => {
                await ctx.client.database.deleteCooldown(ctx.userData.id);
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
                if (winners.find((r) => r.id === ctx.userData.id)) {
                    const xp = Functions.addXp(
                        ctx.userData,
                        npc.rewards?.xp ?? 0 ?? npc.level * 1000,
                        ctx.client
                    );
                    const coins = Functions.addCoins(
                        ctx.userData,
                        npc.rewards?.coins ?? 0 / 5 ?? npc.level * 250
                    );
                    ctx.userData.health = winners[0].health;
                    ctx.userData.stamina = winners[0].stamina;
                    await ctx.followUp({
                        content: `${npc.emoji} | You assaulted \`${
                            npc.name
                        }\` and won! You got **${xp.toLocaleString("en-US")}** ${
                            ctx.client.localEmojis.xp
                        } and **${coins.toLocaleString("en-US")} ${
                            ctx.client.localEmojis.jocoins
                        }**.`,
                    });
                } else {
                    ctx.userData.health = 0;
                    ctx.userData.stamina = 0;

                    await ctx.followUp({
                        content: `${npc.emoji} | You assaulted \`${npc.name}\` and lost! You lost all your health. Better luck next time or train yourself more.`,
                    });
                }
                //await ctx.client.database.saveUserData(ctx.userData);
                const oldData = await ctx.client.database.getRPGUserData(ctx.user.id);
                const transaction = await ctx.client.database.handleTransaction(
                    [
                        {
                            oldData,
                            newData: ctx.userData,
                        },
                    ],
                    `Assaulted ${npc.name}`
                );
            });
            collector.stop("ok");
        });
    },
};

export default slashCommand;
