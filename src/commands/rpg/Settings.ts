import {
    RPGUserDataJSON,
    SlashCommandFile,
    Leaderboard,
    Item,
    RPGUserSettings,
    Consumable,
} from "../../@types";
import { Message, APIEmbed, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import * as Emojis from "../../emojis.json";

function booleanToEmoji(bool: boolean | unknown): string {
    return bool ? Emojis.yes : Emojis.no;
}

const separator = `-------------------------------------------`;

function itemsFoundInStringArr(str: string[]): Consumable[] {
    return str
        .map((id) => Functions.findItem<Consumable>(id))
        .filter((x) => Functions.isConsumable(x));
}

function getItems(str: string): {
    results: Item[];
    notFound: string[];
} {
    const arr = str.split(",");
    const results = itemsFoundInStringArr(arr);
    const notFound: string[] = [];
    arr.forEach((id, i) => {
        if (!results[i]) notFound.push(arr[i]);
    });

    return { results, notFound };
}

function getExcludedItems(str: RPGUserSettings["auto_heal"]["excluded_items"]): Consumable[] {
    return str
        .map((id) => Functions.findItem<Consumable>(id))
        .filter((item) => Functions.isConsumable(item));
}

function generateFightField(user: RPGUserDataJSON, commands?: string[]): APIEmbed["fields"][0] {
    return {
        //"Fight",
        name: `🗡️ Fight`,
        value:
            (commands
                ? `${separator}\n${commands
                      .map((x) => `${Emojis.arrowRight} ${x}`)
                      .join("\n")}\n${separator}\n`
                : "") +
            descriptions.fight.map((x) => {
                const value = user.settings.fight[x.id];
                return `- ${x.emoji} **${x.name}:** ${
                    x.format ? x.format(value) : booleanToEmoji(value)
                }\n- - ${x.description}`;
            }),
    };
}

type SettingDescriptions<T> = {
    [K in keyof T]: {
        id: keyof T[K]; // Reference each key in the subcategories
        name: string;
        emoji: string;
        description: string;
        format?: (value: T[K][keyof T[K]]) => string;
    }[];
};

const descriptions: SettingDescriptions<RPGUserSettings> = {
    fight: [
        {
            id: "auto_target_lock",
            name: "Auto Target Lock",
            emoji: "🎯",
            description: "Automatically locks onto the lowest target in fights.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
    ],
    notifications: [
        {
            id: "email",
            name: "Email",
            emoji: "📧",
            description: "Receive email notifications for important updates.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
        {
            id: "skill_points",
            name: "Skill Points",
            emoji: "➕",
            description: "Receive notifications when you have unused skill points.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
        {
            id: "black_market",
            name: "Black Market",
            emoji: "🃏",
            description: "Get notified about black market deals.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
        {
            id: "daily_quests",
            name: "Daily Quests",
            emoji: "📜",
            description: "Reminders for your daily quests.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
        {
            id: "low_health_or_stamina",
            name: "Low Health/Stamina",
            emoji: "🩹",
            description: "Get notified when your health or stamina is low.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
    ],
    auto_heal: [
        {
            id: "sort_by_strongest",
            name: "Sort by Strongest",
            emoji: "💪",
            description: "Sort healing items by strongest effect first.",
            format: (value: unknown | string) => booleanToEmoji(value as boolean),
        },
        {
            id: "excluded_items",
            name: "Excluded Items",
            emoji: "🚫",
            description:
                "Items that should not be used for auto healing. All T-tier items are excluded",
            format: (value: unknown | string[]) => {
                const result = getExcludedItems(value as string[])
                    .map((x) => `${x.emoji} \`${x.name}\``)
                    .join(", ");
                return result || "None";
            },
        },
    ],
};

function generateNotificationsField(
    user: RPGUserDataJSON,
    commands?: string[]
): APIEmbed["fields"][0] {
    return {
        name: `🔔 Notifications`,
        value:
            (commands
                ? `${separator}\n${commands
                      .map((x) => `${Emojis.arrowRight} ${x}`)
                      .join("\n")}\n${separator}\n`
                : "") +
            descriptions.notifications
                .map((x) => {
                    const value = user.settings.notifications[x.id];
                    return `- ${x.emoji} **${x.name}:** ${
                        x.format ? x.format(value) : booleanToEmoji(value)
                    }\n- - ${x.description}`;
                })
                .join("\n"),
    };
}

function generateAutoHealField(user: RPGUserDataJSON, commands?: string[]): APIEmbed["fields"][0] {
    return {
        //"❤️‍🩹 Auto-Heal",
        name: `❤️‍🩹 Auto-Heal`,
        value:
            (commands
                ? `${separator}\n${commands
                      .map((x) => `${Emojis.arrowRight} ${x}`)
                      .join("\n")}\n${separator}\n`
                : "") +
            descriptions.auto_heal
                .map((x) => {
                    const value = user.settings.auto_heal[x.id];
                    return `- ${x.emoji} **${x.name}:** ${
                        x.format ? x.format(value) : `${value}`
                    }\n- - ${x.description}`;
                })
                .join("\n"),
    };
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "settings",
        description: "Shows the leaderboard",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "view",
                description: "Shows your settings",
                type: 1,
            },
            {
                name: "auto-heal",
                description: "Change your auto-heal settings",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "sort-by-strongest",
                        description: "Enable auto-heal",
                        type: 1,
                        options: [
                            {
                                name: "mode",
                                description:
                                    "Should we sort your items that give the most effective healing?",
                                type: ApplicationCommandOptionType.Boolean,
                                required: true,
                            },
                        ],
                    },
                    // exclude-items option
                    {
                        name: "exclude-items",
                        description: "Exclude items from auto-heal",
                        type: 1,
                        options: [
                            {
                                name: "add",
                                description: "The items to exclude separated by commas",
                                type: ApplicationCommandOptionType.String,
                                required: false,
                                autocomplete: false,
                            },
                            {
                                name: "remove",
                                description:
                                    "The items to remove from the exclusion list separated by commas",
                                type: ApplicationCommandOptionType.String,
                                required: false,
                            },
                        ],
                    },
                ],
            },
            {
                name: "notifications",
                description: "Change your notification settings",
                type: 1,
                // there will be a select string menu
            },
            {
                name: "fight",
                description: "Change your fight settings",
                type: 1,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const subcommand = ctx.options.getSubcommand();

        if (subcommand === "view") {
            const user = ctx.userData;
            const embed: APIEmbed = {
                /*description: `- To change your notifications settings, use the ${ctx.client.getSlashCommandMention(
                    "settings notifications"
                )} command\n- To change your auto-heal settings, use the ${ctx.client.getSlashCommandMention(
                    "settings auto-heal sort-by-strongest"
                )} or ${ctx.client.getSlashCommandMention("settings auto-heal exclude-items")} 
                } command\n- To change your fight settings, use the ${ctx.client.getSlashCommandMention(
                    "settings fight"
                )} command`,*/
                fields: [
                    generateNotificationsField(user, [
                        ctx.client.getSlashCommandMention("settings notifications"),
                    ]),
                    generateAutoHealField(user, [
                        ctx.client.getSlashCommandMention("settings auto-heal sort-by-strongest"),
                        ctx.client.getSlashCommandMention("settings auto-heal exclude-items"),
                        ctx.client.getSlashCommandMention("heal"),
                    ]),
                    generateFightField(user, [ctx.client.getSlashCommandMention("settings fight")]),
                ],
                color: 0x70926c,
                author: {
                    name: "Settings",
                    icon_url: ctx.user.displayAvatarURL(),
                },
            };

            return void ctx.makeMessage({ embeds: [embed] });
        } else if (subcommand === "notifications" || subcommand === "fight") {
            const type = (subcommand === "notifications" ? "notifications" : "fight") as
                | "notifications"
                | "fight";
            const strigSelectMenu = () =>
                new StringSelectMenuBuilder()
                    .setCustomId(ctx.interaction.id + type)
                    .setPlaceholder("Select an option to toggle")
                    .setMinValues(1)
                    .setMaxValues(descriptions[type].length)
                    .addOptions(
                        /*Object.entries(ctx.userData.settings.notifications).map(([key, value]) => ({
                            label:
                                descriptions.notifications.find((x) => x.id === key)?.name ??
                                key
                                    .replace(/_/g, " ")
                                    .split(" ")
                                    .map((x) => x[0].toUpperCase() + x.slice(1))
                                    .join(" "),
                            value: key,
                            emoji:
                                descriptions.notifications.find((x) => x.id === key)?.emoji ??
                                booleanToEmoji(value),
                            description:
                                descriptions.notifications.find((x) => x.id === key)?.description ??
                                "Placeholder",
                        }))
                    )*/
                        Object.values(descriptions[type]).map((value) => {
                            const id = value.id;
                            const inValue =
                                ctx.userData.settings[type][
                                    id as keyof RPGUserSettings[typeof type]
                                ];
                            if (inValue === undefined) return;

                            return {
                                value: id,
                                emoji: booleanToEmoji(inValue),
                                description: value.description,
                                label: value.name,
                            };
                        })
                    );

            ctx.makeMessage({
                embeds: [
                    {
                        description: "Select an option to toggle",
                        color: 0x70926c,
                        fields: [
                            type === "notifications"
                                ? generateNotificationsField(ctx.userData)
                                : generateFightField(ctx.userData),
                        ],
                    },
                ],

                components: [Functions.actionRow([strigSelectMenu()])],
            });

            const collector = ctx.channel.createMessageComponentCollector({
                filter: (i) =>
                    i.user.id === ctx.user.id && i.customId === ctx.interaction.id + type,
                time: 60000,
            });

            collector.on("collect", async (i) => {
                if (!i.isStringSelectMenu()) return;
                if (await ctx.antiCheat(true)) return;

                for (let x = 0; x < i.values.length; x++) {
                    const key = i.values[x] as keyof RPGUserSettings["notifications" | "fight"];
                    if (ctx.userData.settings[type][key] === undefined) return;

                    // @ts-expect-error - I know what I'm doing
                    ctx.userData.settings[type][key] = !ctx.userData.settings[type][key] as boolean;
                }

                if (i.values.length > 0) {
                    ctx.client.database.saveUserData(ctx.userData);

                    ctx.makeMessage({
                        embeds: [
                            {
                                description: `Set the notification${
                                    i.values.length > 1 ? "s" : ""
                                } to: ${i.values
                                    .map((x) => {
                                        const key = x as keyof RPGUserSettings[
                                            | "notifications"
                                            | "fight"];
                                        return (
                                            `\`${x}:\` ` +
                                            booleanToEmoji(ctx.userData.settings[type][key])
                                        );
                                    })
                                    .join(", ")}`,
                                color: 0x70926c,
                                fields: [
                                    type === "notifications"
                                        ? generateNotificationsField(ctx.userData)
                                        : generateFightField(ctx.userData),
                                ],
                            },
                        ],
                        components: [Functions.actionRow([strigSelectMenu()])],
                    });

                    i.deferUpdate();
                }
            });

            collector.on("end", () => {
                Functions.disableRows(ctx.interaction);
            });
        } else if (subcommand === "exclude-items") {
            /*const subcommandGroup = ctx.options.getSubcommand();
            if (subcommandGroup === "add") {
                const items = ctx.options.getString("add", false);
                if (!items) {
                    return void ctx.makeMessage({
                        content: "You didn't provide any items to exclude.",
                    });
                }

                const { results, notFound } = getItems(items);
                if (notFound.length) {
                    return void ctx.makeMessage({
                        content: `The following items were not found: ${notFound.join(", ")}`,
                    });
                }

                const excludedItems = ctx.userData.settings.auto_heal.excluded_items;
                const newItems = results.map((x) => x.id);
                ctx.userData.settings.auto_heal.excluded_items = [...excludedItems, ...newItems];
                ctx.client.database.saveUserData(ctx.userData);

                return void ctx.makeMessage({
                    content: `Added the following items to the exclusion list: ${results
                        .map((x) => x.name)
                        .join(", ")}`,
                });
            } else if (subcommandGroup === "remove") {
                const items = ctx.options.getString("remove", false);
                if (!items) {
                    return void ctx.makeMessage({
                        content: "You didn't provide any items to remove.",
                    });
                }

                const { results, notFound } = getItems(items);
                if (notFound.length) {
                    return void ctx.makeMessage({
                        content: `The following items were not found: ${notFound.join(", ")}`,
                    });
                }

                const excludedItems = ctx.userData.settings.auto_heal.excluded_items;
                const newItems = results.map((x) => x.id);

                ctx.userData.settings.auto_heal.excluded_items = excludedItems.filter(
                    (x) => !newItems.includes(x)
                );

                ctx.client.database.saveUserData(ctx.userData);

                return void ctx.makeMessage({
                    content: `Removed the following items from the exclusion list: ${results
                        .map((x) => x.name)
                        .join(", ")}`,
                });
           }*/
            const toExclude = ctx.options.getString("add", false);
            const toRemove = ctx.options.getString("remove", false);

            const msg = []; // we will push the messages here
            // example: "Added the following items to the exclusion list: item1, item2"

            if (toExclude) {
                const { results, notFound } = getItems(toExclude);
                if (notFound.length) {
                    msg.push(
                        `${msg.length + 1}. The following items were not found: ${notFound
                            .map((x) => `\`${x}\``)
                            .join(", ")} \`[type=add]\``
                    );
                }

                const excludedItems = ctx.userData.settings.auto_heal.excluded_items;
                const newItems = results.filter((x) => !excludedItems.includes(x.id));
                ctx.userData.settings.auto_heal.excluded_items = [
                    ...excludedItems,
                    ...newItems.map((x) => x.id),
                ];

                if (newItems.length) {
                    msg.push(
                        `${
                            msg.length + 1
                        }. Added the following items to the exclusion list: ${newItems
                            .map((x) => `${x.emoji} **${x.name}**`)
                            .join(", ")}`
                    );
                }
            }

            if (toRemove) {
                const { results, notFound } = getItems(toRemove);
                if (notFound.length) {
                    msg.push(
                        `${msg.length + 1}. The following items were not found: ${notFound
                            .map((x) => `\`${x}\``)
                            .join(", ")} \`[type=remove]\``
                    );
                }

                const excludedItems = ctx.userData.settings.auto_heal.excluded_items;
                const newItems = results.map((x) => x.id);

                const oldLength = excludedItems.length;
                ctx.userData.settings.auto_heal.excluded_items = excludedItems.filter(
                    (x) => !newItems.includes(x)
                );

                if (oldLength !== ctx.userData.settings.auto_heal.excluded_items.length)
                    msg.push(
                        `${
                            msg.length + 1
                        }. Removed the following items from the exclusion list: ${results
                            .map((x) => `${x.emoji} **${x.name}**`)
                            .join(", ")}`
                    );
            }

            if (msg.length) {
                ctx.client.database.saveUserData(ctx.userData);

                return void ctx.makeMessage({
                    content: msg.join("\n"),
                });
            } else {
                return void ctx.makeMessage({
                    content: "You didn't provide any items to exclude or remove.",
                });
            }
        } else if (subcommand === "sort-by-strongest") {
            const mode = ctx.options.getBoolean("mode", true);
            if (mode === undefined) {
                return void ctx.makeMessage({
                    content: "You didn't provide a mode.",
                });
            }
            if (ctx.userData.settings.auto_heal.sort_by_strongest === mode) {
                return void ctx.makeMessage({
                    content: `The auto-heal mode is already set to: ${booleanToEmoji(mode)}`,
                });
            }

            ctx.userData.settings.auto_heal.sort_by_strongest = mode;
            ctx.client.database.saveUserData(ctx.userData);

            return void ctx.makeMessage({
                content: `Set the auto-heal mode to: ${booleanToEmoji(mode)}`,
            });
        }
    },
};

export default slashCommand;
