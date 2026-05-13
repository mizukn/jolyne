import {
    RPGUserDataJSON,
    SlashCommandFile,
    RPGUserSettings,
    Consumable,
    Item,
} from "../../@types";
import {
    Message,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    InteractionResponse,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import * as Emojis from "../../emojis.json";
import { containers, SectionData, V2Reply } from "../../utils/containers";
import adventureCommand from "../adventure/AdventureSubcommands";
import { cloneDeep } from "lodash";

/**
 * Helper to convert boolean settings to emojis.
 */
function booleanToEmoji(bool: boolean | unknown): string {
    return bool ? Emojis.yes : Emojis.no;
}

/**
 * Metadata for all user settings.
 */
const SETTINGS_METADATA = {
    notifications: {
        title: "Notifications",
        emoji: "🔔",
        description: "Manage where and when you receive pings and emails.",
        items: [
            { id: "email", name: "Email", emoji: "📧", description: "Receive email notifications for important updates." },
            { id: "skill_points", name: "Skill Points", emoji: "➕", description: "Receive notifications when you have unused skill points." },
            { id: "black_market", name: "Black Market", emoji: "🃏", description: "Get notified about black market deals." },
            { id: "daily_quests", name: "Daily Quests", emoji: "📜", description: "Reminders for your daily quests." },
            { id: "low_health_or_stamina", name: "Low Health/Stamina", emoji: "🩹", description: "Get notified when your health or stamina is low." },
            { id: "reached_max_level", name: "Reached Max Level", emoji: "<:a_:927885909976834078>", description: "Get notified when you reach the maximum level for your current prestige lvl." },
        ] as const,
    },
    fight: {
        title: "Fight",
        emoji: "🗡️",
        description: "Configure combat behavior and target locking preferences.",
        items: [
            { id: "auto_target_lock", name: "Auto Target Lock", emoji: "🎯", description: "Automatically locks onto the lowest target in fights." },
        ] as const,
    },
    auto_heal: {
        title: "Auto-Heal",
        emoji: "❤️‍🩹",
        description: "Customize how your items are used automatically when low on health.",
        items: [
            { id: "sort_by_strongest", name: "Sort by Strongest", emoji: "💪", description: "Sort healing items by strongest effect first." },
        ] as const,
    },
} as const;

type SettingCategory = keyof typeof SETTINGS_METADATA;

/**
 * Builds the main settings summary UI.
 */
function buildMainUI(ctx: CommandInteractionContext, sessionId: string): V2Reply {
    const sections: SectionData[] = [];

    for (const [key, cat] of Object.entries(SETTINGS_METADATA)) {
        const category = key as SettingCategory;
        const count = cat.items.length;
        const activeCount = cat.items.filter(item => (ctx.userData.settings[category] as any)?.[item.id]).length;

        sections.push({
            text: `### ${cat.emoji} **${cat.title}**\n> ${cat.description}\n**Status:** ${activeCount}/${count} enabled`,
            accessory: new ButtonBuilder()
                .setCustomId(`settings:${sessionId}:jump:${category}`)
                .setLabel(`Edit ${cat.title}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(cat.emoji)
        });
    }

    // Add Language section separately as it's a redirect
    sections.push({
        text: `### 🌐 **Language**\n> Change your adventure language.\n**Current:** \`${ctx.userData.language || "en-US"}\``,
        accessory: new ButtonBuilder()
            .setCustomId(`settings:${sessionId}:jump:language`)
            .setLabel("Change Language")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🌐")
    });

    return containers.primary({
        title: "⚙️ Settings",
        description: "Manage your adventure preferences and notifications.",
        descriptionDivider: true,
        sections,
        sectionDividers: true,
    });
}

/**
 * Builds the UI for a specific settings category.
 */
function buildCategoryUI(ctx: CommandInteractionContext, sessionId: string, category: SettingCategory): V2Reply {
    const meta = SETTINGS_METADATA[category];
    const sections: SectionData[] = [];

    for (const item of meta.items) {
        const value = (ctx.userData.settings[category] as any)?.[item.id];
        sections.push({
            text: `### ${item.emoji} **${item.name}**\n> ${item.description}\n**Status:** ${booleanToEmoji(value)}`,
            accessory: new ButtonBuilder()
                .setCustomId(`settings:${sessionId}:toggle:${category}:${item.id}`)
                .setLabel(value ? "Enabled" : "Disabled")
                .setStyle(value ? ButtonStyle.Success : ButtonStyle.Danger)
        });
    }

    if (category === "auto_heal") {
        const excludedCount = ctx.userData.settings.auto_heal?.excluded_items?.length || 0;
        const excludedItemsStr = (ctx.userData.settings.auto_heal?.excluded_items || [])
            .map(id => Functions.findItem(id))
            .filter(Boolean)
            .map(item => `${item.emoji}`)
            .join(" ") || "None";

        sections.push({
            text: `### 🚫 **Excluded Items**\n> Items that should not be used for auto-healing.\n**Excluded (${excludedCount}):** ${excludedItemsStr}`,
            accessory: new ButtonBuilder()
                .setCustomId(`settings:${sessionId}:jump:exclusions`)
                .setLabel("Manage Exclusions")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🚫")
        });
    }

    const reply = containers.primary({
        title: `${meta.emoji} ${meta.title} Settings`,
        description: meta.description,
        descriptionDivider: true,
        sections,
        sectionDividers: true,
    });

    const backButton = new ButtonBuilder()
        .setCustomId(`settings:${sessionId}:back`)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️");

    reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(backButton));

    return reply;
}

/**
 * Builds the UI for managing auto-heal exclusions.
 */
function buildExclusionsUI(ctx: CommandInteractionContext, sessionId: string): V2Reply {
    const excluded = (ctx.userData.settings.auto_heal?.excluded_items || [])
        .map(id => Functions.findItem(id))
        .filter(Boolean);

    const sections: SectionData[] = excluded.slice(0, 10).map(item => ({
        text: `${item.emoji} **${item.name}**`,
        accessory: new ButtonBuilder()
            .setCustomId(`settings:${sessionId}:remove_exclusion:${item.id}`)
            .setLabel("Remove")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")
    }));

    const reply = containers.primary({
        title: "🚫 Auto-Heal Exclusions",
        description: excluded.length 
            ? "Remove items from the exclusion list below. To add items, use `/settings auto-heal exclusions add`."
            : "No items are currently excluded. Use `/settings auto-heal exclusions add` to exclude specific items.",
        descriptionDivider: true,
        sections: sections,
        sectionDividers: true,
        footer: excluded.length > 10 ? `Showing 10 of ${excluded.length} items. Use the command to manage all.` : undefined,
    });

    const backButton = new ButtonBuilder()
        .setCustomId(`settings:${sessionId}:jump:auto_heal`)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️");

    reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(backButton));

    return reply;
}

const slashCommand: SlashCommandFile = {
    hiddenCommandNames: [
        "settings auto-heal sort-by-strongest",
        "settings auto-heal exclude-items",
    ],
    data: {
        name: "settings",
        description: "Manage your adventure settings and preferences.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "view",
                description: "Shows all your settings",
                type: 1,
            },
            {
                name: "notifications",
                description: "Change your notification settings",
                type: 1,
            },
            {
                name: "fight",
                description: "Change your fight settings",
                type: 1,
            },
            {
                name: "auto-heal",
                description: "Manage auto-heal preferences",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "view",
                        description: "View auto-heal settings",
                        type: 1,
                    },
                    {
                        name: "sort",
                        description: "Toggle sorting by strongest effect",
                        type: 1,
                        options: [
                            {
                                name: "mode",
                                description: "Should we sort your items by effectiveness?",
                                type: ApplicationCommandOptionType.Boolean,
                                required: true,
                            },
                        ],
                    },
                    {
                        name: "exclusions",
                        description: "Manage items excluded from auto-heal",
                        type: 1,
                        options: [
                            {
                                name: "add",
                                description: "The items to exclude separated by commas",
                                type: ApplicationCommandOptionType.String,
                                required: false,
                            },
                            {
                                name: "remove",
                                description: "The items to remove from exclusion separated by commas",
                                type: ApplicationCommandOptionType.String,
                                required: false,
                            },
                        ],
                    },
                ],
            },
            {
                name: "language",
                description: "Change your adventure language.",
                type: 1,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        const subcommand = ctx.options.getSubcommand();
        const group = ctx.options.getSubcommandGroup(false);

        if (subcommand === "language") {
            return adventureCommand.execute(ctx);
        }

        // Quick Apply for sort/exclusions if options are provided
        if (subcommand === "sort" && group === "auto-heal") {
            const mode = ctx.options.getBoolean("mode", true);
            const oldData = cloneDeep(ctx.userData);
            if (!ctx.userData.settings.auto_heal) ctx.userData.settings.auto_heal = {};
            ctx.userData.settings.auto_heal.sort_by_strongest = mode;
            await ctx.client.database.handleTransaction([{ oldData, newData: ctx.userData }], "Update Auto-Heal Sort");
            return ctx.makeMessage(containers.success(`Auto-heal sort by strongest set to: ${booleanToEmoji(mode)}`));
        }

        if (subcommand === "exclusions" && group === "auto-heal") {
            const toAdd = ctx.options.getString("add");
            const toRemove = ctx.options.getString("remove");
            
            if (toAdd || toRemove) {
                const oldData = cloneDeep(ctx.userData);
                const updates: string[] = [];
                if (!ctx.userData.settings.auto_heal) ctx.userData.settings.auto_heal = { excluded_items: [] };
                if (!ctx.userData.settings.auto_heal.excluded_items) ctx.userData.settings.auto_heal.excluded_items = [];
                
                if (toAdd) {
                    const ids = toAdd.split(",").map(s => s.trim().toLowerCase());
                    for (const id of ids) {
                        const item = Functions.findItem(id);
                        if (item && !ctx.userData.settings.auto_heal.excluded_items.includes(item.id)) {
                            ctx.userData.settings.auto_heal.excluded_items.push(item.id);
                            updates.push(`+ ${item.emoji} ${item.name}`);
                        }
                    }
                }
                
                if (toRemove) {
                    const ids = toRemove.split(",").map(s => s.trim().toLowerCase());
                    for (const id of ids) {
                        const item = Functions.findItem(id);
                        if (item) {
                            ctx.userData.settings.auto_heal.excluded_items = ctx.userData.settings.auto_heal.excluded_items.filter(x => x !== item.id);
                            updates.push(`- ${item.emoji} ${item.name}`);
                        }
                    }
                }

                if (updates.length > 0) {
                    await ctx.client.database.handleTransaction([{ oldData, newData: ctx.userData }], "Update Auto-Heal Exclusions");
                    return ctx.makeMessage(containers.success(`Updated exclusions:\n${updates.join("\n")}`));
                }
            }
        }

        const sessionId = `${ctx.user.id}${Date.now()}`;
        
        let initialView: "main" | SettingCategory | "exclusions" = "main";
        if (subcommand === "notifications") initialView = "notifications";
        else if (subcommand === "fight") initialView = "fight";
        else if (group === "auto-heal") initialView = subcommand === "exclusions" ? "exclusions" : "auto_heal";

        async function getReply(view: "main" | SettingCategory | "exclusions"): Promise<V2Reply> {
            if (view === "main") return buildMainUI(ctx, sessionId);
            if (view === "exclusions") return buildExclusionsUI(ctx, sessionId);
            return buildCategoryUI(ctx, sessionId, view);
        }

        await ctx.makeMessage(await getReply(initialView));
        const message = await ctx.interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id && i.customId.startsWith(`settings:${sessionId}:`),
            time: 300000, // 5 minutes
        });

        collector.on("collect", async (i) => {
            const parts = i.customId.split(":");
            const action = parts[2];

            if (action === "back") {
                return i.update(await getReply("main"));
            }

            if (action === "jump") {
                const target = parts[3] as any;
                if (target === "language") {
                    collector.stop();
                    await i.deferUpdate().catch(() => {});
                    return adventureCommand.execute(ctx, "language");
                }
                return i.update(await getReply(target));
            }

            if (action === "toggle" || action === "remove_exclusion") {
                const oldData = cloneDeep(ctx.userData);
                
                if (action === "toggle") {
                    const category = parts[3] as SettingCategory;
                    const settingId = parts[4];
                    
                    if (!ctx.userData.settings[category]) (ctx.userData.settings as any)[category] = {};
                    (ctx.userData.settings[category] as any)[settingId] = !(ctx.userData.settings[category] as any)[settingId];
                } else {
                    const itemId = parts[3];
                    if (ctx.userData.settings.auto_heal?.excluded_items) {
                        ctx.userData.settings.auto_heal.excluded_items = ctx.userData.settings.auto_heal.excluded_items.filter(x => x !== itemId);
                    }
                }

                await ctx.client.database.handleTransaction(
                    [{ oldData, newData: ctx.userData }],
                    `Update Setting: ${i.customId}`
                );

                const currentView = action === "toggle" ? parts[3] as any : "exclusions";
                return i.update(await getReply(currentView));
            }
        });
    },
};

export default slashCommand;
