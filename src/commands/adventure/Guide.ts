import { SlashCommandFile } from "../../@types";
import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { containers, COLORS, V2Reply, SectionData } from "../../utils/containers";

const slashCommand: SlashCommandFile = {
    data: {
        name: "guide",
        description: "A comprehensive guide to Jolyne RPG.",
        options: [],
    },
    execute: async (ctx: CommandInteractionContext): Promise<void> => {
        const sessionId = `${ctx.user.id}:${Date.now()}`;
        let currentPage = 0;

        const pages: { title: string, description: string, sections: SectionData[] }[] = [
            {
                title: "🌟 Welcome to Jolyne RPG",
                description: `Welcome! You are about to embark on a bizarre adventure. In this RPG, you will obtain mysterious powers, fight iconic enemies, and become the strongest.`,
                sections: [
                    {
                        text: `### 🔰 **Getting Started**\n> • To begin your journey, simply use the ${ctx.client.getSlashCommandMention("start")} command!\n> • Once started, you can navigate your main quest line using the ${ctx.client.getSlashCommandMention("story")} command.\n> • Your primary goal is to complete quests, win battles, and level up your character!`
                    },
                    {
                        text: `### 💬 **Need Help?**\n> If you ever feel lost, you can ask for help in our [support server](https://discord.gg/jolyne-support-923608916540145694).`
                    }
                ]
            },
            {
                title: "✨ Stands & Weapons",
                description: `The most exciting part of your adventure is obtaining your **Stand**—a powerful physical manifestation of your life energy!`,
                sections: [
                    {
                        text: `### 🏹 **Unleashing your potential**\n> • **How to get a Stand:** You should have received a **Stand Arrow** when you started. Use it by typing ${ctx.client.getSlashCommandMention("item use")} and selecting the arrow!`
                    },
                    {
                        text: `### 🃏 **Rarities & Abilities**\n> • Stands come in different rarities (from common **C**-tiers to legendary **SS**-tiers).\n> • Every Stand has completely unique attacks, cooldowns, and ultimate moves!`
                    },
                    {
                        text: `### ⚔️ **Weapons**\n> • You can also equip powerful Weapons to fight alongside your Stand, or use them on their own if you prefer! Use ${ctx.client.getSlashCommandMention("inventory")} to manage them.`
                    },
                    {
                        text: `### 📖 **View your power**\n> • Use ${ctx.client.getSlashCommandMention("stand view")} to see a beautiful card displaying your Stand's artwork and detailed abilities!`
                    }
                ]
            },
            {
                title: "⚔️ How to Fight",
                description: `Fights in Jolyne are highly strategic turn-based battles. Understanding your stats is key to victory.`,
                sections: [
                    {
                        text: `### ❤️ **Health (HP)**\n> If this drops to 0, you are defeated in battle! Watch your HP bar closely.`
                    },
                    {
                        text: `### 🔋 **Stamina (STA)**\n> Every attack and special ability costs Stamina. Managing your energy is the absolute key to winning long fights.`
                    },
                    {
                        text: `### 🛡️ **Defense (DEF)**\n> Defense acts as a shield, absorbing incoming damage to keep your HP safe.`
                    },
                    {
                        text: `### 🩹 **Healing**\n> If you lose HP or STA during your travels, eat a Pizza or drink a Cola from your inventory (${ctx.client.getSlashCommandMention("item use")}), or relax at the campfire (${ctx.client.getSlashCommandMention("rest start")}).`
                    }
                ]
            },
            {
                title: "🗺️ Quests & Activities",
                description: `There are multiple ways to progress and earn rewards in the game.`,
                sections: [
                    {
                        text: `### 🔱 **The Story**\n> • Use ${ctx.client.getSlashCommandMention("story")} to view your current Chapter and your active quests.\n> • When you complete a Chapter 100%, you will earn massive rewards and unlock a "Next" button to progress!`
                    },
                    {
                        text: `### 📆 **Daily Quests**\n> • Found in ${ctx.client.getSlashCommandMention("quests daily")}, these missions refresh every 24 hours. Keep up a daily streak to earn bonus Stand Arrows!`
                    },
                    {
                        text: `### 📜 **Side & Action Quests**\n> • **Side Quests** (${ctx.client.getSlashCommandMention("quests side view")}) are unique, sometimes repeatable tasks for special rewards.\n> • **Action Quests** (${ctx.client.getSlashCommandMention("quests action")}) are specific interactive tasks required for certain events.`
                    }
                ]
            },
            {
                title: "📈 Leveling & Skill Points",
                description: `Whenever you fight or finish quests, you earn XP. Leveling up grants you **Skill Points**!`,
                sections: [
                    {
                        text: `### 📊 **Building your Stats**\n> Use ${ctx.client.getSlashCommandMention("skills invest")} to build your character:\n> \n> • 💪 **Strength:** Boosts the raw damage of your attacks.\n> • ❤️ **Defense:** Increases your max HP and your damage resistance.\n> • 🔋 **Stamina:** Increases your max Stamina pool.\n> • 🍃 **Perception:** Increases your chance to completely dodge enemy attacks!\n> • 💨 **Speed:** Can allow you to attack twice in a row, and lowers enemy dodge chances!`
                    },
                    {
                        text: `### ⭐ **The Prestige System**\n> Once you reach the absolute max level and finish all available chapters, you can **Prestige** (${ctx.client.getSlashCommandMention("prestige")})!\n> • Resets your level, but keeps 85% of your total XP to quickly climb back.\n> • Grants **Prestige Shards** for an exclusive shop, raises your level cap, and gives permanent Skill Points!`
                    }
                ]
            },
            {
                title: "💰 Economy & Trading",
                description: `Manage your wealth, buy items, and trade with other players.`,
                sections: [
                    {
                        text: `### 🎒 **Inventory**\n> • Check your loot with ${ctx.client.getSlashCommandMention("inventory")}.\n> • Manage items using ${ctx.client.getSlashCommandMention("item info")}, ${ctx.client.getSlashCommandMention("item use")}, ${ctx.client.getSlashCommandMention("item sell")}, or ${ctx.client.getSlashCommandMention("item discard")}.`
                    },
                    {
                        text: `### 🏪 **The Shop**\n> • Use ${ctx.client.getSlashCommandMention("shop")} to buy consumables (like Pizzas) or rare items.\n> • **Black Market:** Only opens on weekends! It offers incredibly rare deals like high-tier Stands.`
                    },
                    {
                        text: `### 🤝 **Trading**\n> • Trade items safely with other players using ${ctx.client.getSlashCommandMention("trade request")}.`
                    }
                ]
            },
            {
                title: "🎰 Leisure & Support",
                description: `Take a break from saving the world, and support the project!`,
                sections: [
                    {
                        text: `### 🎲 **The Casino**\n> • Feeling lucky? Risk your coins with ${ctx.client.getSlashCommandMention("blackjack")} or ${ctx.client.getSlashCommandMention("slots play")}.`
                    },
                    {
                        text: `### 🎁 **Events & Voting**\n> • Support the bot using ${ctx.client.getSlashCommandMention("vote")} daily to earn free Stand Arrows and Dungeon Keys!\n> • Keep an eye out for special seasonal events using ${ctx.client.getSlashCommandMention("event info")}!`
                    },
                    {
                        text: `### 💖 **Patreon**\n> • Enjoying Jolyne? Consider supporting the development through our Patreon! Use ${ctx.client.getSlashCommandMention("patreon")} to see the amazing perks you can get, such as exclusive boxes, huge discounts in the shop, and an increased inventory limit!`
                    }
                ]
            }
        ];

        const buildReply = (): V2Reply => {
            const page = pages[currentPage];
            const totalPages = pages.length;

            const reply = containers.primary({
                title: page.title,
                description: page.description,
                descriptionDivider: true,
                sections: page.sections,
                sectionDividers: true,
                color: COLORS.primary,
                footer: `Page ${currentPage + 1}/${totalPages} • Use the buttons below to navigate.`,
            });

            const navigationRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`guide:${sessionId}:prev`)
                    .setLabel("Previous")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId(`guide:${sessionId}:page`)
                    .setLabel(`${currentPage + 1} / ${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`guide:${sessionId}:next`)
                    .setLabel("Next")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages - 1),
            );

            reply.components.push(navigationRow);
            return reply;
        };

        await ctx.makeMessage(buildReply());

        const collector = ctx.channel.createMessageComponentCollector({
            filter: (i: MessageComponentInteraction) => i.user.id === ctx.user.id && i.customId.startsWith(`guide:${sessionId}:`),
            time: 300000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            if (i.customId === `guide:${sessionId}:prev`) {
                currentPage = Math.max(0, currentPage - 1);
            } else if (i.customId === `guide:${sessionId}:next`) {
                currentPage = Math.min(pages.length - 1, currentPage + 1);
            }

            await i.update(buildReply());
        });
    },
};

export default slashCommand;