import { EvolutionStand, RPGUserDataJSON, SlashCommandFile, Stand } from "../../@types";
import {
    Message,
    MessageComponentInteraction,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    MessageActionRowComponentBuilder
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { NPCs } from "../../rpg/NPCs";
import { ButtonBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import * as Stands from "../../rpg/Stands/Stands";
import * as EvolvableStands from "../../rpg/Stands/EvolutionStands";

import { isEvolvableStand } from "../../utils/Functions";
import { cloneDeep } from "lodash";
import { containers, COLORS, SectionData } from "../../utils/containers";

const regularStandList = Object.values(Stands);
const evolvableStandList = Object.values(EvolvableStands);

const slashCommand: SlashCommandFile = {
    hiddenCommandNames: ["stand display", "stand delete", "stand set-evolution"],
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
                name: "view",
                description: "🔱 View information about your current stand",
                options: [
                    {
                        name: "stand",
                        description: "The stand to view",
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
                name: "erase",
                description: "❌ Erases your stand.",
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
            {
                type: 1,
                name: "evolve",
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
                const evolvableStands = evolvableStandList.map((w) => w.evolutions.slice(1));

                const sections: SectionData[] = [
                    { text: `### 🌟 T Stands (event/limited) [${Tstands.length}]\n${Tstands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { text: `### 🔴 SS Stands [${SSstands.length}]\n${SSstands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { text: `### 🔵 S Stands [${Sstands.length}]\n${Sstands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { text: `### 🟢 A Stands [${Astands.length}]\n${Astands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { text: `### 🟡 B Stands [${Bstands.length}]\n${Bstands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { text: `### ⚪ C Stands [${Cstands.length}]\n${Cstands.map((w) => `> ${w.emoji} ${w.name}`).join("\n")}` },
                    { 
                        text: `### ✨ Evolvable Stands [${evolvableStands.flat().length}] [S/SS]\n${evolvableStands.flat().map((w) => {
                            const baseStand = Object.values(EvolvableStands)
                                .filter((k) => k.evolutions.find((m) => m.name === w.name))[0];
                            const currentStand = baseStand.evolutions.find((k) => k.name === w.name)!;
                            const previous = baseStand.evolutions.indexOf(currentStand) - 1;
                            return `> ${baseStand.evolutions[previous].emoji} ${baseStand.evolutions[previous].name} ${ctx.client.localEmojis.arrowRight} ${w.emoji} ${w.name}`;
                        }).join("\n")}`
                    }
                ];

                await ctx.makeMessage(containers.primary({
                    title: "📜 Stands List",
                    description: "Sorted by rarity and alphabetically. A stand appearing higher doesn't necessarily mean it is better.",
                    descriptionDivider: true,
                    sections,
                    sectionDividers: true,
                    color: 0x70926c
                }));
                break;
            }
            case "view":
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
                const standCartBuffer = await Functions.generateStandCart(stand);
                const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });

                let color: number;
                switch (stand.rarity) {
                    case "SS": color = 0xff0000; break;
                    case "S": color = 0x2b82ab; break;
                    case "A": color = 0x3b8c4b; break;
                    case "B": color = 0x786d23; break;
                    default: color = stand.color || COLORS.primary;
                }

                function getStandReply(showCard: boolean) {
                    if (showCard) {
                        const reply = containers.primary({
                            title: `${stand.emoji} ${stand.name}`,
                            description: `**Rarity:** ${stand.rarity}\n${stand.description}`,
                            color
                        });
                        reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(switchBTN));
                        return { ...reply, files: [file] };
                    }

                    const sections: SectionData[] = [];
                    for (const ability of stand.abilities) {
                        const damage = Functions.getAbilityDamage(ctx.userData, ability);
                        const displayDamage = damage === 0
                            ? (ability.trueDamage ? Math.round(Functions.getAttackDamages(ctx.userData) * (1 + ability.trueDamage / 100)) : "???")
                            : damage.toLocaleString();
                        
                        const dodge = ability.dodgeScore ?? ability.trueDodgeScore ?? "not dodgeable";

                        sections.push({
                            text: `### ${ability.special ? "⭐ " : ""}${ability.name}\n> *${ability.description.replace(/{standName}/gi, stand.name)}*\n> 💥 **Damages:** ${displayDamage}\n> 🔋 **Stamina Cost:** ${ability.stamina}\n> ⏳ **Cooldown:** ${ability.cooldown} turns\n> 🍃 **Dodge Score:** ${dodge}`
                        });
                    }

                    const totalSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);
                    if (totalSkillPoints > 0) {
                        const spText = Object.entries(stand.skillPoints).map(([k, v]) => `> • +${v} ${k}`).join("\n");
                        sections.push({ text: `### 📈 Bonuses (+${totalSkillPoints} Skill-Points)\n${spText}` });
                    }

                    const reply = containers.primary({
                        title: `# ${stand.emoji} ${stand.name}`,
                        description: stand.description,
                        descriptionDivider: true,
                        sections,
                        sectionDividers: true,
                        color: showCard ? color : stand.color,
                        image: stand.image,
                        footer: `Rarity: ${stand.rarity}`
                    });
                    reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(switchBTN));
                    return { ...reply, files: [] }; // Don't send file on abilities page to save bandwidth
                }

                await ctx.makeMessage(getStandReply(false));
                const msg = await ctx.interaction.fetchReply();

                const filter = (i: MessageComponentInteraction) => i.customId === switchID && i.user.id === ctx.user.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 120000 });
                let status = 1;
                
                collector.on("collect", async (i) => {
                    await i.update(getStandReply(status % 2 === 0));
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
                    await ctx.makeMessage(containers.error(`You can't store more than **${limit}** stand discs in your inventory.\n[Patreon members](https://patreon.com/mizuki54) have a higher limit.`));
                    return;
                }

                const cost = Functions.standPrices[stand.rarity];
                await ctx.makeMessage({
                    ...containers.warning(`${Functions.makeNPCString(NPCs.Pucci, `So you want to store your stand's disc... Since its rarity is **${stand.rarity}**, it will cost you **${cost.toLocaleString("en-US")}** ${ctx.client.localEmojis.jocoins}. Are you sure?`)}`),
                    components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(confirmBTN, cancelBTN)]
                });
                
                const msg = await ctx.interaction.fetchReply();
                const filter = (i: MessageComponentInteraction) => (i.customId === confirmID || i.customId === cancelID) && i.user.id === ctx.user.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on("collect", async (i) => {
                    if (await ctx.antiCheat(true)) {
                        collector.stop();
                        return;
                    }
                    if (i.customId === cancelID) {
                        await i.update({ ...containers.error("Action cancelled."), components: [] });
                        collector.stop();
                        return;
                    }

                    const oldData = cloneDeep(ctx.userData);
                    if (ctx.userData.coins < cost) {
                        await i.update({ ...containers.error(ctx.translate("base:NOT_ENOUGH_COINS")), components: [] });
                        collector.stop();
                        return;
                    }
                    
                    Functions.addCoins(ctx.userData, -cost);
                    ctx.userData.stand = null;
                    const status = Functions.addItem(ctx.userData, Functions.findItem(stand.id + ".$disc$"), 1, true, ctx);
                    
                    const transaction = await ctx.client.database.handleTransaction([{ oldData, newData: ctx.userData }], `Stored stand: ${stand.name}`, [status]);
                    if (!transaction) {
                        await i.update({ ...containers.error("An error occurred while storing your stand's disc. The limit may have been exceeded."), components: [] });
                    } else {
                        await i.update({ ...containers.success(`Your stand's disc (**${stand.name}**) has been successfully stored in your inventory.`), components: [] });
                    }
                    collector.stop();
                });
                break;
            }
            case "erase":
            case "delete": {
                if (ctx.userData.chapter.id === 1) {
                    await ctx.makeMessage(containers.error("You can't do that right now. Complete Chapter I first."));
                    return;
                }

                const stand = Functions.getCurrentStand(ctx.userData);
                if (!stand) {
                    ctx.sendTranslated("base:NO_STAND");
                    return;
                }
                const price = 1000;

                await ctx.makeMessage({
                    ...containers.warning(`${Functions.makeNPCString(NPCs.Pucci, `It will cost you **${price.toLocaleString()}** ${ctx.client.localEmojis.jocoins} to reset your stand (${stand.name}). Are you sure?`)}`),
                    components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(confirmBTN, cancelBTN)]
                });

                const msg = await ctx.interaction.fetchReply();
                const filter = (i: MessageComponentInteraction) => (i.customId === confirmID || i.customId === cancelID) && i.user.id === ctx.user.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on("collect", async (i) => {
                    if (await ctx.antiCheat(true)) {
                        collector.stop();
                        return;
                    }
                    if (i.customId === cancelID) {
                        await i.update({ ...containers.error("Action cancelled."), components: [] });
                        collector.stop();
                        return;
                    }

                    const oldData = cloneDeep(ctx.userData);
                    if (ctx.userData.coins < price) {
                        await i.update({ ...containers.error(ctx.translate("base:NOT_ENOUGH_COINS")), components: [] });
                        collector.stop();
                        return;
                    }
                    
                    Functions.addCoins(ctx.userData, -price);
                    ctx.userData.stand = null;
                    
                    const transaction = await ctx.client.database.handleTransaction([{ oldData, newData: ctx.userData }], `Reset stand: ${stand.name}`);
                    if (!transaction) {
                        await i.update({ ...containers.error("An error occurred while resetting your stand."), components: [] });
                    } else {
                        await i.update({ ...containers.success(`Your stand (**${stand.name}**) has been successfully erased.`), components: [] });
                    }
                    collector.stop();
                });
                break;
            }
            case "evolve":
            case "set-evolution": {
                const evolutionStr = ctx.interaction.options.getString("evolution", true);
                const evolution = evolutionStr ? parseInt(evolutionStr) : 0;
                
                if (isNaN(evolution) || evolution < 0) {
                    await ctx.makeMessage(containers.error("Please provide a valid evolution number!"));
                    return;
                }
                
                const stand = Object.values(EvolvableStands).find((v) => v.id === ctx.userData.stand);
                if (!stand) {
                    await ctx.makeMessage(containers.error(`Your stand isn't evolvable. Only the following can be evolved:\n${Object.values(EvolvableStands).map((v, i) => `${i + 1}. ${v.evolutions[0].emoji} **${v.evolutions[0].name}**`).join("\n")}`));
                    return;
                }
                
                if (stand.evolutions.length <= evolution) { // evolution is 0-indexed in array but user sees it as 1-based? Actually, 0 is base stand.
                    await ctx.makeMessage(containers.error(Functions.makeNPCString(NPCs.Pucci, "You can't set your stand to an evolution that doesn't exist!")));
                    return;
                }

                if (evolution > (ctx.userData.standsEvolved[ctx.userData.stand] ?? 0)) {
                    await ctx.makeMessage(containers.error(Functions.makeNPCString(NPCs.Pucci, "You haven't unlocked this evolution yet!")));
                    return;
                }

                const oldData = cloneDeep(ctx.userData);
                if (evolution === ctx.userData.standsEvolved[ctx.userData.stand]) {
                    delete ctx.userData.customStandsEvolved[ctx.userData.stand];
                } else {
                    ctx.userData.customStandsEvolved[ctx.userData.stand] = { active: true, evolution };
                }
                
                const currentStand = Functions.getCurrentStand(ctx.userData);
                const transaction = await ctx.client.database.handleTransaction([{ oldData, newData: ctx.userData }], `Set stand evolution: ${currentStand.name}`);
                
                if (!transaction) {
                    await ctx.makeMessage(containers.error("Failed to set evolution."));
                } else {
                    await ctx.makeMessage(containers.success(`You have successfully set your stand to **${currentStand.name}**!`));
                }
                break;
            }
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: { name: string; value: string; }[] = [];

        if (interaction.options.getSubcommand() === "set-evolution" || interaction.options.getSubcommand() === "evolve") {
            const loop = userData.standsEvolved[userData.stand] || 0;
            if (loop !== 0) {
                for (let i = 0; i <= loop; i++) {
                    const stand = Functions.findStand(userData.stand, i);
                    if (!stand) continue;
                    if (stand.name.toLowerCase().includes(currentInput.toLowerCase())) {
                        toRespond.push({ name: stand.name, value: String(i) });
                    }
                }
            }
        } else {
            const totalStands: Stand[] = Object.values(Stands);
            for (const stand of Object.values(EvolvableStands)) {
                totalStands.push({ ...stand.evolutions[0], id: stand.id });
                for (let i = 0; i < stand.evolutions.slice(1).length; i++) {
                    totalStands.push({ ...stand.evolutions.slice(1)[i], id: stand.id + `\\${i + 1}` });
                }
            }

            for (const stand of totalStands) {
                if (stand.name.toLowerCase().includes(currentInput.toLowerCase())) {
                    toRespond.push({ name: stand.name, value: stand.id });
                }
            }
        }

        toRespond.length = Math.min(toRespond.length, 25);
        interaction.respond(toRespond);
    },
};

export default slashCommand;
