import { EvolutionStand, RPGUserDataJSON, SlashCommandFile, Stand } from "../../@types";
import {
    Message,
    MessageComponentInteraction,
    EmbedBuilder,
    AttachmentBuilder,
    APIEmbed,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { NPCs } from "../../rpg/NPCs";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Stands from "../../rpg/Stands/Stands";
import * as EvolvableStands from "../../rpg/Stands/EvolutionStands";

import { fixFields, isEvolvableStand } from "../../utils/Functions";
import { parse } from "dotenv";
import { cloneDeep } from "lodash";

const regularStandList = Object.values(Stands);
const evolvableStandList = Object.values(EvolvableStands);

const slashCommand: SlashCommandFile = {
    data: {
        name: "stand",
        description: "Display, erase or store your stand",
        options: [
            {
                type: 1,
                name: "display",
                description: "🔱 Display information about your current stand",
                options: [
                    {
                        name: "stand",
                        description: "The stand to display",
                        type: 3,
                        required: false,
                        autocomplete: true,
                    },
                ],
            },
            {
                type: 1,
                name: "delete",
                description: "❌ Deletes your stand.",
                options: [],
            },
            {
                type: 1,
                name: "store",
                description: "💿 Stores your stand's disk...",
                options: [],
            },
            {
                type: 1,
                name: "list",
                description: "📜 List all the stands available in the RPG",
                options: [],
            },
            {
                type: 1,
                name: "set-evolution",
                description:
                    "If you previously evolved your stand, you can go back to the base stand at any time",
                options: [
                    {
                        name: "evolution",
                        description: "The evolution to set",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
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
            case "list": {
                const SSstands = [
                    ...regularStandList.filter((w) => w.rarity === "SS"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "SS")
                        .map((w) => w.evolutions[0]),
                ];
                const Sstands = [
                    ...regularStandList.filter((w) => w.rarity === "S"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "S")
                        .map((w) => w.evolutions[0]),
                ];
                const Astands = [
                    ...regularStandList.filter((w) => w.rarity === "A"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "A")
                        .map((w) => w.evolutions[0]),
                ];
                const Bstands = [
                    ...regularStandList.filter((w) => w.rarity === "B"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "B")
                        .map((w) => w.evolutions[0]),
                ];
                const Cstands = [
                    ...regularStandList.filter((w) => w.rarity === "C"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "C")
                        .map((w) => w.evolutions[0]),
                ];
                const Tstands = [
                    ...regularStandList.filter((w) => w.rarity === "T"),
                    ...evolvableStandList
                        .filter((w) => w.evolutions[0].rarity === "T")
                        .map((w) => w.evolutions[0]),
                ];
                const evolvableStands = evolvableStandList.map((w) => {
                    // return everything except for the first evolution (which is the base stand)
                    return w.evolutions.slice(1);
                });

                const embed: APIEmbed = {
                    title: "Stands",
                    description:
                        "Please note that this list is sorted by rarity & alphabetically, so for example if Star Platinum is above The World, it doesn't mean that Star Platinum is better than The World.",
                    fields: fixFields([
                        {
                            name: `T Stands (event/limited) [${Tstands.length}]:`,
                            value: Tstands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `SS Stands [${SSstands.length}]:`,
                            value: SSstands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `S Stands [${Sstands.length}]:`,
                            value: Sstands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `A Stands [${Astands.length}]:`,
                            value: Astands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `B Stands [${Bstands.length}]:`,
                            value: Bstands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `C Stands [${Cstands.length}]:`,
                            value: Cstands.map((w) => `- ${w.emoji} ${w.name}`).join("\n"),
                        },
                        {
                            name: `Evolvable Stands [${evolvableStands.flat().length}] [S/SS]:`,
                            /*value: evolvableStands
                                .flat()
                                .map((w) => {
                                    // FIND BASE STAND
                                    const baseStand = Object.values(EvolvableStands)
                                        .filter((k) => {
                                            return k.evolutions.find((m) => m.name === w.name);
                                        })
                                        .filter((k) => k)[0].evolutions[0];
                                    return `- ${baseStand.emoji} ${baseStand.name} ${ctx.client.localEmojis.arrowRight} ${w.emoji} ${w.name}`;
                                })
                                .join("\n"),*/
                            // this is bad because it will do something like:
                            /*
                                :echoes_1: Echoes Act 1 :arrowRight: :echoes_2: Echoes Act 2
:echoes_1: Echoes Act 1 :arrowRight: :echoes_3: Echoes Act 3*/
                            // instead of:
                            /*
:echoes_1: Echoes Act 1 :arrowRight: :echoes_2: Echoes Act 2
:echoes_2: Echoes Act 2 :arrowRight: :echoes_3: Echoes Act 3
*/
                            value: evolvableStands
                                .flat()
                                .map((w) => {
                                    const baseStand = Object.values(EvolvableStands)
                                        .filter((k) => {
                                            return k.evolutions.find((m) => m.name === w.name);
                                        })
                                        .filter((k) => k)[0];
                                    const currentStand = baseStand.evolutions.find(
                                        (k) => k.name === w.name
                                    );
                                    const previous = baseStand.evolutions.indexOf(currentStand) - 1;

                                    return `- ${baseStand.evolutions[previous].emoji} ${baseStand.evolutions[previous].name} ${ctx.client.localEmojis.arrowRight} ${w.emoji} ${w.name}`;
                                })
                                .join("\n"),
                        },
                    ]),
                    color: 0x70926c,
                };

                await ctx.makeMessage({
                    embeds: [embed],
                });
                break;
            }
            case "display": {
                const choice = ctx.interaction.options.getString("stand");
                const stand = choice
                    ? Functions.findStand(
                          choice.split("\\")[0],
                          choice.includes("\\") ? parseInt(choice.split("\\")[1]) : null
                      )
                    : Functions.getCurrentStand(ctx.userData);
                if (!stand) {
                    ctx.sendTranslated("base:NO_STAND");
                    return;
                }
                const standCartBuffer = await Functions.generateStandCart(
                    choice
                        ? Functions.findStand(
                              choice.split("\\")[0],
                              choice.includes("\\") ? parseInt(choice.split("\\")[1]) : null
                          )
                        : Functions.getCurrentStand(ctx.userData)
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
                const stand = Functions.getCurrentStand(ctx.userData);
                if (!stand) {
                    ctx.sendTranslated("base:NO_STAND");
                    return;
                }

                const limit = Functions.calcStandDiscLimit(ctx);

                if (Functions.hasExceedStandLimit(ctx, undefined, false)) {
                    ctx.makeMessage({
                        content: `Unfortunately, you can't store more than **${limit}** stand discs in your inventory. This limit may increase the more S tier stands we add to the game. [Patreon members](https://patreon.com/mizuki54) have a higher limit btw.`,
                    });
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
                    if (await ctx.antiCheat(true)) {
                        collector.stop();
                        return;
                    }
                    const oldData = cloneDeep(ctx.userData);
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
                        const status = Functions.addItem(
                            ctx.userData,
                            Functions.findItem(stand.id + ".$disc$"),
                            1,
                            true,
                            ctx
                        );
                        const transaction = await ctx.client.database.handleTransaction(
                            [
                                {
                                    oldData,
                                    newData: ctx.userData,
                                },
                            ],
                            `Stored stand: ${stand.name}`,
                            [status]
                        );
                        if (!transaction) {
                            return void ctx.makeMessage({
                                content: `An error occurred while storing your stand's disc. Perhaps this stand is limited and you exceeded the limit?\n\nIf the stand you are trying to store is a limited stand, you'll be able to store it once the event ends. If that's not the case, please [contact us](https://discord.gg/jolyne-support-923608916540145694)\nAlternatively, if you don't care about your current stand, consider using the ${ctx.client.getSlashCommandMention(
                                    "stand delete"
                                )} command instead.`,
                                components: [],
                                embeds: [],
                            });
                        }
                        //ctx.client.database.saveUserData(ctx.userData);
                        ctx.sendTranslated("base:YOUR_STAND_DISC_HAS_BEEN_STORED", {
                            components: [],
                            stand: stand,
                            //command: ctx.client.getSlashCommandMention("inventory use"),
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
                const stand = Functions.getCurrentStand(ctx.userData);
                const price = 1000;

                await ctx.makeMessage({
                    content: `${Functions.makeNPCString(
                        NPCs.Pucci,
                        `It'll cost you **${price.toLocaleString()}** ${
                            ctx.client.localEmojis.jocoins
                        } to reset your stand (${stand.name}). Are you sure?`
                    )}`,
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
                    if (await ctx.antiCheat(true)) {
                        collector.stop();
                        return;
                    }
                    if (i.customId === confirmID) {
                        collector.stop("DONT_DISABLE_COMPONENTS");
                        if (ctx.userData.coins < price) {
                            ctx.sendTranslated("base:NOT_ENOUGH_COINS", {
                                components: [],
                            });
                            return;
                        }
                        Functions.addCoins(ctx.userData, -price);
                        ctx.sendTranslated("base:YOUR_STAND_HAS_BEEN_RESET", {
                            components: [],
                            stand: stand,
                        });

                        ctx.userData.stand = null;
                        ctx.client.database.saveUserData(ctx.userData);
                    } else collector.stop();
                });
                break;
            }
            case "set-evolution": {
                const evolution = ctx.interaction.options.getString("evolution", true)
                    ? parseInt(ctx.interaction.options.getString("evolution", true))
                    : 0;
                if (isNaN(evolution) || evolution < 0 || evolution === undefined) {
                    ctx.makeMessage({
                        content: `:interrobang: Please provide a valid evolution number!`,
                    });
                    return;
                }
                const stand = Object.values(EvolvableStands).find(
                    (v) => v.id === ctx.userData.stand
                );
                if (!stand) {
                    ctx.makeMessage({
                        content: `:interrobang: Your stand isn't even evolvable...\n\nThe only stands that can be evolved are the following:\n${Object.values(
                            EvolvableStands
                        )
                            .map(
                                (v, i) =>
                                    `${i + 1}. ${v.evolutions[0].emoji} **${v.evolutions[0].name}**`
                            )
                            .join("\n")}`,
                    });
                    return;
                }
                if (stand.evolutions.length < evolution) {
                    ctx.makeMessage({
                        content: Functions.makeNPCString(
                            NPCs.Pucci,
                            `You can't set your stand to an evolution that doesn't exist!`
                        ),
                    });
                    return;
                }

                if (
                    evolution > (ctx.userData.standsEvolved[ctx.userData.stand] ?? 0) ||
                    evolution < 0
                ) {
                    ctx.makeMessage({
                        content: Functions.makeNPCString(
                            NPCs.Pucci,
                            `You can't set your stand to an evolution you haven't unlocked yet!`
                        ),
                    });
                    return;
                }
                if (evolution === ctx.userData.standsEvolved[ctx.userData.stand]) {
                    delete ctx.userData.customStandsEvolved[ctx.userData.stand];
                } else {
                    ctx.userData.customStandsEvolved[ctx.userData.stand] = {
                        active: true,
                        evolution: evolution,
                    };
                }
                const currentStand = Functions.getCurrentStand(ctx.userData);
                ctx.client.database.saveUserData(ctx.userData);

                ctx.makeMessage({
                    content: `${currentStand.emoji} | You have successfully set your stand to **${currentStand.name}**!`,
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
                    value: `**\`Damages:\`** ${
                        damage === 0
                            ? ability.trueDamage
                                ? Math.round(
                                      Functions.getAttackDamages(userData) *
                                          (1 + ability.trueDamage / 100)
                                  )
                                : "???"
                            : damage
                    }
**\`Stamina Cost:\`** ${ability.stamina}
**\`Cooldown:\`** ${ability.cooldown} turns
**\`Dodge score:\`** ${
                        !ability.dodgeScore
                            ? ability.trueDodgeScore ?? "not dodgeable"
                            : ability.dodgeScore
                    }
                            
*${ability.description.replace(/{standName}/gi, stand.name)}*
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
                embeds: [Functions.standAbilitiesEmbed(userData, null, stand)],
                files: [],
                components: [Functions.actionRow([switchBTN])],
            });
            return;
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: {
            name: string;
            value: string;
        }[] = [];

        if (interaction.options.getSubcommand() === "set-evolution") {
            const loop = userData.standsEvolved[userData.stand]
                ? userData.standsEvolved[userData.stand]
                : 0;
            if (loop !== 0)
                for (let i = 0; i <= loop; i++) {
                    console.log(i);
                    const stand = Functions.findStand(userData.stand, i);
                    if (!stand) continue;
                    if (stand.name.toLowerCase().includes(currentInput.toLowerCase())) {
                        toRespond.push({
                            name: stand.name,
                            value: String(i),
                        });
                    }
                }
        } else {
            const totalStands: Stand[] = Object.values(Stands);
            for (const stand of Object.values(EvolvableStands)) {
                const baseStand = stand.evolutions[0];
                const rest = stand.evolutions.slice(1);

                totalStands.push({ ...baseStand, id: stand.id });

                for (let i = 0; i < rest.length; i++) {
                    const evolution = rest[i];
                    totalStands.push({ ...evolution, id: stand.id + `\\${i + 1}` });
                }
            }

            for (const stand of totalStands) {
                if (stand.name.toLowerCase().includes(currentInput.toLowerCase())) {
                    toRespond.push({
                        name: stand.name,
                        value: stand.id,
                    });
                }
            }
        }

        toRespond.length = Math.min(toRespond.length, 25);

        interaction.respond(toRespond);
    },
};

export default slashCommand;
