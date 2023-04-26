import { FightableNPC, RPGUserDataJSON, RPGUserQuest, SlashCommandFile, Stand } from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
    EmbedBuilder,
    AttachmentBuilder,
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

const slashCommand: SlashCommandFile = {
    data: {
        name: "stand",
        description: "neeeega",
        options: [
            {
                type: 1,
                name: "display",
                description: "🔱 Display informations about your current stand",
                options: [],
            },
            {
                type: 1,
                name: "delete",
                description: "❌ Deletes your stand",
                options: [],
            },
            {
                type: 1,
                name: "store",
                description: "💿 Stores your stand's disk...",
                options: [],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (!Functions.findStand(ctx.userData.stand)) {
            ctx.sendTranslated("base:NO_STAND");
            return;
        }
        const switchID = Functions.generateRandomId();
        const confirmID = Functions.generateRandomId();
        const cancelID = Functions.generateRandomId();

        const confirmBTN = new ButtonBuilder()
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success)
            .setCustomId(confirmID);
        const cancelBTN = new ButtonBuilder()
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(cancelID);
        const switchBTN = new ButtonBuilder()
            .setEmoji("🎴")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(switchID);

        switch (ctx.interaction.options.getSubcommand()) {
            case "display": {
                const stand = Functions.findStand(ctx.userData.stand);
                const standCartBuffer = await Functions.generateStandCart(
                    Functions.findStand(ctx.userData.stand)
                );
                const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });

                let color: number;

                switch (stand.rarity) {
                    case "SS":
                        color = 0xff0000;
                        break;
                    case "S":
                        color = 0x2b82ab;
                        break;
                    case "A":
                        color = 0x3b8c4b;
                        break;
                    case "B":
                        color = 0x786d23;
                        break;
                    default:
                        color = stand.color;
                }

                const embed: EmbedBuilder = new EmbedBuilder()
                    .setTitle(stand.name)
                    .setImage("attachment://stand.png")
                    .setColor(color).setDescription(`**Rarity:** ${stand.rarity}
            **Abilities [${stand.abilities.length}]:** ${stand.abilities
                    .map((v) => v.name)
                    .join(", ")}
            **Skill-Points:** +${Functions.calculateArrayValues(
                Object.keys(stand.skillPoints).map(
                    (v) => stand.skillPoints[v as keyof typeof stand.skillPoints]
                )
            )}:
            ${Object.keys(stand.skillPoints)
                .map(
                    (v) =>
                        "  • +" + stand.skillPoints[v as keyof typeof stand.skillPoints] + " " + v
                )
                .join("\n")}
            `);
                sendStandPage(stand, ctx.userData);
                const filter = (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    return i.customId === switchID && i.user.id === ctx.user.id;
                };
                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                });
                let status = 0;
                collector.on("collect", (i: MessageComponentInteraction) => {
                    if (status % 2 === 0) {
                        ctx.makeMessage({
                            files: [file],
                            embeds: [embed],
                        });
                    } else {
                        sendStandPage(stand, ctx.userData);
                    }
                    status++;
                });
                break;
            }
            case "store": {
                const stand = Functions.findStand(ctx.userData.stand);
                if (!stand) {
                    ctx.sendTranslated("base:NO_STAND");
                    return;
                }

                /* -- FUTURE UPD
                if (userData.items.filter(i => i.includes('disk')).length >= Util.getStandDiscLimit(ctx)) {
                    if (ctx.client.patreons.find(v => v.id === ctx.author.id)) {
                        return ctx.sendT('base:STAND_DISK_LIMIT_PATREON', {
                            limit: Util.getStandDiscLimit(ctx)
                        });
                    } else return ctx.sendT('base:STAND_DISK_LIMIT', {
                        limit: Util.getStandDiscLimit(ctx)
                    });
                }*/

                await ctx.makeMessage({
                    content: `<:Pucci:929295630885593148> **Pucci:** So you want to remove your stand's disc and store it into your inventory... Since your stand's rarity is **${
                        stand.rarity
                    }**, it'll cost you **${Functions.standPrices[stand.rarity].toLocaleString(
                        "en-US"
                    )}** <:jocoins:927974784187392061>. Are you sure ? `,
                    components: [Functions.actionRow([confirmBTN, cancelBTN])],
                });
                const filter = (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    return (
                        (i.customId === confirmID || i.customId === cancelID) &&
                        i.user.id === ctx.user.id
                    );
                };
                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                });
                collector.on("collect", async (i: MessageComponentInteraction) => {
                    if (await ctx.antiCheat(true)) return;
                    if (i.customId === confirmID) {
                        collector.stop("DONT_DISABLE_COMPONENTS");
                        if (ctx.userData.coins < Functions.standPrices[stand.rarity]) {
                            ctx.sendTranslated("base:NOT_ENOUGH_COINS", {
                                components: [],
                            });
                            return;
                        }
                        Functions.addCoins(ctx.userData, -Functions.standPrices[stand.rarity]);
                        ctx.userData.stand = null;
                        Functions.addItem(ctx.userData, Functions.findItem(stand.name), 1);
                        ctx.client.database.saveUserData(ctx.userData);
                        ctx.sendTranslated("base:YOUR_STAND_DISC_HAS_BEEN_STORED", {
                            components: [],
                        });
                    } else collector.stop();
                });
                break;
            }
            case "delete": {
                if (ctx.userData.chapter.id === 1) {
                    ctx.interaction.reply({
                        content:
                            "You can't do that right now. Use that command once you complete the Chapter I (`/chapter`)",
                    });
                    return;
                }

                if (!ctx.userData.stand) {
                    ctx.sendTranslated("base:NO_STAND");
                    return;
                }
                const stand = Functions.findStand(ctx.userData.stand);
                const price = 1000;

                await ctx.makeMessage({
                    content: `${Functions.makeNPCString(
                        NPCs.Pucci
                    )}: It'll cost you **${price.toLocaleString("en-US")}** ${
                        ctx.client.localEmojis.jocoins
                    } to reset your stand (${stand.name}). Are you sure?`,
                    components: [Functions.actionRow([confirmBTN, cancelBTN])],
                });
                const filter = (i: MessageComponentInteraction) => {
                    i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
                    return (
                        (i.customId === confirmID || i.customId === cancelID) &&
                        i.user.id === ctx.user.id
                    );
                };
                const collector = ctx.interaction.channel.createMessageComponentCollector({
                    filter,
                });
                collector.on("collect", async (i: MessageComponentInteraction) => {
                    if (await ctx.antiCheat(true)) return;
                    if (i.customId === confirmID) {
                        collector.stop("DONT_DISABLE_COMPONENTS");
                        if (ctx.userData.coins < price) {
                            ctx.sendTranslated("base:NOT_ENOUGH_COINS", {
                                components: [],
                            });
                            return;
                        }
                        Functions.addCoins(ctx.userData, -price);
                        ctx.userData.stand = null;
                        ctx.client.database.saveUserData(ctx.userData);
                        ctx.sendTranslated("base:YOUR_STAND_HAS_BEEN_RESET", {
                            components: [],
                        });
                    } else collector.stop();
                });
                break;
            }
        }

        function sendStandPage(stand: Stand, userData: RPGUserDataJSON): Promise<Message<boolean>> {
            const fields: Array<{
                name: string;
                value: string;
                inline?: boolean;
            }> = [];

            for (const ability of stand.abilities) {
                const damage: number = Functions.getAbilityDamage(userData, ability);
                fields.push({
                    name: `${ability.special ? "⭐" : ""}${ability.name}`,
                    inline: ability.special ? false : true,
                    value: `**\`Damages:\`** ${damage}
    **\`Stamina Cost:\`** ${ability.stamina}
    **\`Cooldown:\`** ${ability.cooldown} turns
                            
    *${ability.description}*
    ${ability.special ? "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬" : "▬▬▬▬▬▬▬▬▬"}`,
                });
            }
            const embed = new EmbedBuilder()
                .setAuthor({ name: stand.name, iconURL: stand.image })
                .addFields(fields)
                .setDescription(
                    stand.description +
                        "\n" +
                        `
    **BONUSES:** +${Object.keys(stand.skillPoints)
        .map((v) => stand.skillPoints[v as keyof typeof stand.skillPoints])
        .reduce((a, b) => a + b, 0)} Skill-Points:
    ${Object.keys(stand.skillPoints)
        .map((r) => `  • +${stand.skillPoints[r as keyof typeof stand.skillPoints]} ${r}`)
        .join("\n")}
    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        `
                )
                .setFooter({ text: `Rarity: ${stand.rarity}` })
                .setColor(stand.color)
                .setThumbnail(stand.image);
            ctx.makeMessage({
                embeds: [embed],
                files: [],
                components: [Functions.actionRow([switchBTN])],
            });
            return;
        }
    },
};

export default slashCommand;
