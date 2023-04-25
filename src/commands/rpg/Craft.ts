import {
    FightableNPC,
    Item,
    RPGUserDataJSON,
    RPGUserQuest,
    SlashCommandFile,
    itemRewards,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
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
import * as Bosses from "../../rpg/Raids";
import * as Items from "../../rpg/Items";
const craftableItems = Object.values(Items.default).filter((r) => r.craft);

function fetchCraftableItems(inventory: RPGUserDataJSON["inventory"]): Item[] {
    const items: Item[] = [];

    for (const item of craftableItems) {
        for (const xitem of item.craft) {
            if (inventory[xitem.item] === undefined) {
                inventory[xitem.item] = 0;
            }
            if (inventory[xitem.item as keyof typeof inventory] < xitem.amount) {
                continue;
            }
            inventory[xitem.item as keyof typeof inventory] -= xitem.amount;
            items.push(item);
        }
    }

    return items;
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "craft",
        description: "neeeega",
        options: [
            {
                name: "make",
                description: "Make an item",
                type: 1,
            },
            {
                name: "recipes",
                description: "View all recipes you can craft",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "npc",
                        type: ApplicationCommandOptionType.String, // 3
                        autocomplete: true,
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        if (ctx.interaction.options.getSubcommand() === "recipes") {
            const itemChosen = ctx.options.getString("item", true);
            const item = Functions.findItem(itemChosen);
            if (!item) {
                ctx.makeMessage({
                    content: "This item is uhhh... not a thing?",
                });
                return;
            }
            let hasLearnedItem = true;
            if (!ctx.userData.learnedItems.includes(item.id)) {
                hasLearnedItem = false;
            }

            const youGiveContent: string[] = [];
            let meetAllRequirements = true;
            for (const xitem of Object.values(item.craft)) {
                const xitemData = Functions.findItem(xitem.item);
                if (!xitemData) {
                    await ctx.makeMessage({
                        content:
                            "An error occured... You can't craft this item, please contact us on our support server to possibly get a refund (https://discord.gg/jolyne)",
                    });
                    break;
                }
                youGiveContent.push(`- \`${xitem.amount}x ${xitemData.name}\` ${xitemData.emoji}`);
                if (
                    ctx.userData.inventory[xitem.item] === undefined ||
                    ctx.userData.inventory[xitem.item] < xitem.amount
                ) {
                    meetAllRequirements = false;
                    youGiveContent[youGiveContent.length - 1] += ` (you need ${
                        xitem.amount - (ctx.userData.inventory[xitem.item] ?? 0)
                    } more)`;
                }
            }
            if (ctx.interaction.replied) return;
            ctx.makeMessage({
                embeds: [
                    {
                        fields: [
                            {
                                name: `${item.emoji} ${item.name} recipe:${
                                    hasLearnedItem ? "" : " (not learned)"
                                }`,
                                value: `${youGiveContent.join("\n")}`,
                            },
                        ],
                        color: 0x964b00,
                    },
                ],
            });
        } else {
            const itemsPut: itemRewards = [];
        }
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const items = craftableItems.filter(
            (r) =>
                r.name.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.id.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                r.id.toLowerCase().includes(currentInput.toLowerCase())
        );

        interaction.respond(
            items.map((x) => {
                return {
                    name: x.name + (userData.learnedItems.includes(x.id) ? "" : " (not learned)"),
                    value: x.id,
                };
            })
        );
    },
};

export default slashCommand;
