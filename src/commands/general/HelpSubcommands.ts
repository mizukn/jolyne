import { SlashCommand, SlashCommandFile } from "../../@types";
import {
    ActionRowBuilder,
    ComponentType,
    ContainerBuilder,
    InteractionResponse,
    Message,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextDisplayBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { COLORS } from "../../utils/containers";

const HELP_TIMEOUT_MS = 5 * 60 * 1000;

const CATEGORY_LABELS: Record<string, string> = {
    rpg: "RPG",
    utils: "Utility",
};

interface HelpView {
    category: string | null;
    command: string | null;
}

interface PublicCommand {
    name: string;
    description: string;
    category: SlashCommand["category"];
    options?: { name: string; description: string; required?: boolean }[];
    cooldown?: number;
}

function publicCommands(ctx: CommandInteractionContext): PublicCommand[] {
    return ctx.client.allCommands.filter((c) => c.category !== "admin") as PublicCommand[];
}

function buildContainer(ctx: CommandInteractionContext, view: HelpView): ContainerBuilder {
    const all = publicCommands(ctx);
    const c = new ContainerBuilder().setAccentColor(COLORS.primary);
    const sep = () =>
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);

    if (view.command) {
        const cmd = all.find((x) => x.name === view.command);
        if (!cmd) {
            return buildContainer(ctx, { category: view.category, command: null });
        }
        const mention = ctx.client.getSlashCommandMention(cmd.name);
        const usageArgs =
            cmd.options
                ?.slice()
                .sort((a, b) => Number(!!b.required) - Number(!!a.required))
                .map((o) => (o.required ? `\`<${o.name}>\`` : `\`[${o.name}]\``))
                .join(" ") ?? "";

        c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Viewing /${cmd.name} Command`)
        );
        c.addSeparatorComponents(sep());
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(cmd.description));
        c.addSeparatorComponents(sep());
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent("### Usage"));
        c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(usageArgs ? `${mention} ${usageArgs}` : mention)
        );

        if (cmd.options?.length) {
            c.addSeparatorComponents(sep());
            c.addTextDisplayComponents(new TextDisplayBuilder().setContent("### Options"));
            c.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    cmd.options
                        .slice()
                        .sort((a, b) => Number(!!b.required) - Number(!!a.required))
                        .map(
                            (o) =>
                                `\`${o.name}\` ${o.required ? "*(required)*" : "*(optional)*"} — ${o.description}`
                        )
                        .join("\n")
                )
            );
        }

        c.addSeparatorComponents(sep());
        c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# Category: ${CATEGORY_LABELS[cmd.category] ?? cmd.category}${
                    cmd.cooldown ? ` · Cooldown: ${cmd.cooldown}s` : ""
                }`
            )
        );
        return c;
    }

    if (view.category) {
        const cmds = all.filter((x) => x.category === view.category);
        c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## Viewing ${CATEGORY_LABELS[view.category] ?? view.category} Category`
            )
        );
        c.addSeparatorComponents(sep());
        c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                cmds
                    .map(
                        (cmd) =>
                            `${ctx.client.getSlashCommandMention(cmd.name)} — ${cmd.description}`
                    )
                    .join("\n")
                    .slice(0, 4000)
            )
        );
        return c;
    }

    // Main menu
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent("## Jolyne Help"));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `Jolyne has a total of **${all.length}** commands.\nUse the dropdowns below to browse, or invoke ${ctx.client.getSlashCommandMention(
                "help"
            )} \`command:<name>\` to jump straight to a specific command.\n\nNeed help with something else? Join the [support server](https://discord.gg/jolyne-support-923608916540145694).`
        )
    );
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent("### Categories"));
    const categories = Array.from(new Set(all.map((cmd) => cmd.category)));
    c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            categories
                .map((cat) => {
                    const count = all.filter((x) => x.category === cat).length;
                    return `- **${CATEGORY_LABELS[cat] ?? cat}** · **${count}** commands`;
                })
                .join("\n")
        )
    );
    return c;
}

function buildActionRows(
    ctx: CommandInteractionContext,
    view: HelpView
): ActionRowBuilder<StringSelectMenuBuilder>[] {
    const all = publicCommands(ctx);
    const userId = ctx.user.id;
    const categories = Array.from(new Set(all.map((cmd) => cmd.category)));
    const rows: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

    const categorySelect = new StringSelectMenuBuilder()
        .setCustomId(`help:${userId}:category`)
        .setPlaceholder("Select a category")
        .addOptions([
            {
                label: "Main Menu",
                value: "_main",
                default: !view.category,
            },
            ...categories.map((cat) => {
                const cmdNames = all
                    .filter((x) => x.category === cat)
                    .map((x) => x.name)
                    .join(", ");
                return {
                    label: CATEGORY_LABELS[cat] ?? cat,
                    value: cat,
                    description:
                        cmdNames.length > 100 ? cmdNames.slice(0, 97) + "..." : cmdNames,
                    default: view.category === cat,
                };
            }),
        ]);
    rows.push(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(categorySelect)
    );

    if (view.category) {
        const cmds = all.filter((x) => x.category === view.category);
        for (let i = 0, page = 0; i < cmds.length; i += 25, page++) {
            const chunk = cmds.slice(i, i + 25);
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`help:${userId}:command:${page}`)
                .setPlaceholder(
                    chunk.length === cmds.length
                        ? "Select a command"
                        : `Select a command (page ${page + 1})`
                )
                .addOptions(
                    chunk.map((cmd) => ({
                        label: cmd.name.slice(0, 100),
                        value: cmd.name,
                        description:
                            cmd.description.length > 100
                                ? cmd.description.slice(0, 97) + "..."
                                : cmd.description,
                        default: view.command === cmd.name,
                    }))
                );
            rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu));
            if (rows.length >= 5) break; // Discord caps at 5 action rows
        }
    }

    return rows;
}

interface HelpPayload {
    components: (ContainerBuilder | ActionRowBuilder<StringSelectMenuBuilder>)[];
    flags: number;
}

function buildHelpPayload(ctx: CommandInteractionContext, view: HelpView): HelpPayload {
    return {
        components: [buildContainer(ctx, view), ...buildActionRows(ctx, view)],
        flags: MessageFlags.IsComponentsV2,
    };
}

const slashCommand: SlashCommandFile = {
    data: {
        name: "help",
        description: "Shows the help menu",
        options: [
            {
                name: "command",
                description: "The command to get help for",
                type: 3,
                autocomplete: true,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<InteractionResponse | Message | void> => {
        const all = publicCommands(ctx);
        const requested = ctx.interaction.options.getString("command");

        let view: HelpView = { category: null, command: null };
        if (requested) {
            const cmd = all.find((c) => c.name === requested);
            if (cmd) view = { category: cmd.category, command: cmd.name };
            else {
                return ctx.makeMessage({ content: `Command not found: ${requested}` });
            }
        }

        await ctx.makeMessage(buildHelpPayload(ctx, view));
        const message = await ctx.interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === ctx.user.id && i.customId.startsWith(`help:${ctx.user.id}:`),
            componentType: ComponentType.StringSelect,
            time: HELP_TIMEOUT_MS,
        });

        collector.on("collect", async (i: StringSelectMenuInteraction) => {
            const parts = i.customId.split(":");
            const kind = parts[2];
            const value = i.values[0];

            if (kind === "category") {
                view = value === "_main" ? { category: null, command: null } : { category: value, command: null };
            } else if (kind === "command") {
                view = { ...view, command: value };
            }

            try {
                await i.update(buildHelpPayload(ctx, view));
            } catch (e) {
                ctx.client.log(`help update failed: ${(e as Error).message}`, "warn");
            }
        });
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const commands = interaction.client.allCommands.filter(
            (x) =>
                x.category !== "admin" &&
                (x.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                    x.description.toLowerCase().includes(currentInput.toLowerCase()))
        );

        await interaction.respond(
            commands
                .map((x) => ({
                    name: x.name,
                    value: x.name,
                }))
                .slice(0, 24)
        );
    },
};

// keep `Functions` referenced so dead-import linters don't strip a future use
void Functions;

export default slashCommand;
