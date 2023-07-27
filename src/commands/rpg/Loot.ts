import { FightableNPC, Item, RPGUserDataJSON, RPGUserQuest, SlashCommandFile } from "../../@types";
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
import Items from "../../rpg/Items";

interface Loot {
    pr: string;
    name: string;
    emoji: string;
    loots: {
        percent: number;
        loot: Item | number;
    }[];
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "loot",
        description: "F",
        options: [],
    },
    rpgCooldown: {
        base: 1000 * 60 * 2,
    },
    checkRPGCooldown: "loot",
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        await ctx.client.database.setRPGCooldown(ctx.user.id, "loot", 60000 * 10);

        const rng: Loot[] = [
            {
                pr: "in a",
                name: "wallet",
                emoji: "👛",
                loots: [
                    {
                        percent: 90,
                        loot: Functions.randomNumber(1, 1000),
                    },
                    {
                        percent: 100,
                        loot: Items.Candy,
                    },
                ],
            },
            {
                pr: "in the",
                name: "train",
                emoji: "🚂",
                loots: [
                    {
                        percent: 3,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 10,
                        loot: Items.MoneyBox,
                    },
                    {
                        percent: 20,
                        loot: Items.Box,
                    },
                    {
                        percent: 60,
                        loot: Items.Burger,
                    },
                ],
            },
            {
                pr: "in the",
                name: "sewer",
                emoji: "🕳️",
                loots: [
                    {
                        percent: 4,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 10,
                        loot: Items.MoneyBox,
                    },
                    {
                        percent: 20,
                        loot: Items.Box,
                    },
                    {
                        percent: 30,
                        loot: Items.DeadRat,
                    },
                    {
                        percent: 40,
                        loot: Items.Slice_Of_Pizza,
                    },
                ],
            },
            {
                pr: "in an",
                name: "urn",
                emoji: "⚱️",
                loots: [
                    {
                        percent: 95,
                        loot: Functions.randomNumber(1, 1000),
                    },
                    {
                        percent: 100,
                        loot: Items.Pizza,
                    },
                ],
            },
            {
                pr: "in the",
                name: "park",
                emoji: "🏞️",
                loots: [
                    {
                        percent: 3,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 20,
                        loot: Items.AncientScroll,
                    },
                    {
                        percent: 30,
                        loot: Items.Diamond,
                    },
                    {
                        percent: 100,
                        loot: Items.Coconut,
                    },
                ],
            },
            {
                pr: "behind a",
                name: "tree",
                emoji: "🌲",
                loots: [
                    {
                        percent: 3,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 20,
                        loot: Items.AncientScroll,
                    },
                ],
            },
            {
                pr: "behind a",
                name: "store",
                emoji: "🏪",
                loots: [
                    {
                        percent: 3,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 20,
                        loot: Items.AncientScroll,
                    },
                ],
            },
            {
                pr: "in a",
                name: "trash can",
                emoji: "🗑️",
                loots: [
                    {
                        percent: 3,
                        loot: Items.StandArrow,
                    },
                    {
                        percent: 20,
                        loot: Items.AncientScroll,
                    },
                    {
                        percent: 30,
                        loot: Items.Box,
                    },
                    {
                        percent: 40,
                        loot: Items.DeadRat,
                    },
                ],
            },
        ];

        const shuffledLoots: Loot[] = Functions.shuffle(rng);
        const choice1ID = Functions.generateRandomId();
        const choice2ID = Functions.generateRandomId();
        const choice3ID = Functions.generateRandomId();
        const choice1BTN = new ButtonBuilder()
            .setLabel(Functions.capitalize(shuffledLoots[0].name))
            .setCustomId(choice1ID)
            .setEmoji(shuffledLoots[0].emoji)
            .setStyle(ButtonStyle.Secondary);
        const choice2BTN = new ButtonBuilder()
            .setLabel(Functions.capitalize(shuffledLoots[1].name))
            .setCustomId(choice2ID)
            .setEmoji(shuffledLoots[1].emoji)
            .setStyle(ButtonStyle.Secondary);
        const choice3BTN = new ButtonBuilder()
            .setLabel(Functions.capitalize(shuffledLoots[2].name))
            .setCustomId(choice3ID)
            .setEmoji(shuffledLoots[2].emoji)
            .setStyle(ButtonStyle.Secondary);
        await ctx.makeMessage({
            embeds: [
                {
                    author: { name: ctx.user.username, icon_url: ctx.user.displayAvatarURL() },
                    description: `Where do you want to search ?`,
                    color: 0x2f3136,
                },
            ],
            components: [Functions.actionRow([choice1BTN, choice2BTN, choice3BTN])],
        });

        const filter = (i: MessageComponentInteraction) => {
            i.deferUpdate().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
            return (
                i.user.id === ctx.userData.id &&
                (i.customId === choice1ID || i.customId === choice2ID || i.customId === choice3ID)
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000,
        });
        collector.on("collect", async (i: MessageComponentInteraction) => {
            collector.stop();
            if (!i.isButton()) return;
            // Anti-cheat
            if (await ctx.antiCheat(true)) return;

            const choosedLoot = shuffledLoots.find(
                (loot) => loot.name === i.component.label.toLowerCase()
            );
            await ctx.makeMessage({
                components: [],
                embeds: [
                    {
                        author: { name: ctx.user.tag, icon_url: ctx.user.displayAvatarURL() },
                        description: `${
                            ctx.client.localEmojis.magnifyingGlass
                        } You are currently searching ${choosedLoot.pr} ${Functions.capitalize(
                            choosedLoot.name
                        )}`,
                        color: 0x2f3136,
                    },
                ],
            });
            await ctx.client.database.setCooldown(
                ctx.userData.id,
                "You are currently looting, please be patient."
            );

            const timeout = Functions.randomNumber(2, 6) * 1000;
            await Functions.sleep(timeout);
            setTimeout(() => {
                ctx.client.database.deleteCooldown(ctx.userData.id);
            }, timeout);

            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

            const luck = Functions.randomNumber(1, 10000);
            const loot = choosedLoot.loots
                .filter((l) => l.percent * 100 >= luck)
                .sort((a, b) => a.percent - b.percent)[0];
            let infos: {
                emoji: string;
                prize: string;
            };

            if (!loot) {
                infos = {
                    emoji: "❌",
                    prize: "nothing",
                };
            } else if (typeof loot.loot !== "number") {
                Functions.addItem(ctx.userData, loot.loot.id, 1);
                infos = {
                    emoji: loot.loot.emoji,
                    prize: Functions.capitalize(loot.loot.name),
                };
            } else {
                const coins = Functions.addCoins(ctx.userData, loot.loot);

                infos = {
                    emoji: ctx.client.localEmojis.jocoins,
                    prize: String(coins),
                };
            }
            ctx.client.database.saveUserData(ctx.userData);

            ctx.makeMessage({
                components: [],
                embeds: [
                    {
                        color: 0x2f3136,
                        description: `${choosedLoot.emoji} You searched ${
                            choosedLoot.pr
                        } ${Functions.capitalize(choosedLoot.name)} and found: ${infos.emoji} **${
                            infos.prize
                        }**`,
                        author: { name: ctx.user.tag, icon_url: ctx.user.displayAvatarURL() },
                    },
                ],
            });
        });
    },
};

export default slashCommand;
