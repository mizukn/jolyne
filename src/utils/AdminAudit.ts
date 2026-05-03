import { RPGUserDataJSON } from "../@types";
import CommandInteractionContext from "../structures/CommandInteractionContext";
import { transactionLogsWebhook } from "./Webhooks";
import { EmbedBuilder } from "discord.js";

export async function auditedAdminAction(
    ctx: CommandInteractionContext,
    targetId: string,
    before: Partial<RPGUserDataJSON>,
    after: Partial<RPGUserDataJSON>,
    action: string
) {
    const embed = new EmbedBuilder()
        .setTitle(`Admin Action: ${action}`)
        .setColor(0xff0000)
        .addFields(
            { name: "Admin", value: `${ctx.user.tag} (${ctx.user.id})`, inline: true },
            { name: "Target", value: `<@${targetId}> (${targetId})`, inline: true },
            { name: "Guild", value: `${ctx.guild?.name} (${ctx.guild?.id})`, inline: false }
        )
        .setTimestamp();

    const changes: string[] = [];
    for (const key in after) {
        const valBefore = (before as any)[key];
        const valAfter = (after as any)[key];
        if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
            changes.push(`**${key}**: \`${JSON.stringify(valBefore)}\` ➔ \`${JSON.stringify(valAfter)}\``);
        }
    }

    if (changes.length > 0) {
        embed.setDescription(changes.join("\n"));
    } else {
        embed.setDescription("No changes detected (or complex diff).");
    }

    try {
        await transactionLogsWebhook.send({ embeds: [embed] });
    } catch (e) {
        console.error("Failed to send audit log:", e);
    }
}
