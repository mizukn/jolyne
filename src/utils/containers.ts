import {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder,
    ThumbnailBuilder,
    MessageFlags,
} from "discord.js";
import EMOJIS_JSON from "../emojis.json";

export const COLORS = {
    primary: 0x70926c, // Jolyne Green
    accent: 0x4b0082,  // Indigo/Purple
    soft: 0x98fb98,    // Pale Green
    success: 0x5cb85c,
    error: 0xff0000,
    warning: 0xffcc00,
    info: 0x3498db,
    muted: 0xa9a9a9,   // Dark Gray
} as const;

export const EMOJIS = {
    success: EMOJIS_JSON.yes || "✅",
    error: EMOJIS_JSON.no || "❌",
    warning: "⚠️",
    info: "ℹ️",
    loading: EMOJIS_JSON.loading || "⏳",
    jocoins: EMOJIS_JSON.jocoins || "🪙",
    xp: EMOJIS_JSON.xp || "✨",
} as const;

export interface SectionData {
    text: string;
    accessory?: ButtonBuilder | ThumbnailBuilder;
}

export interface ContainerOptions {
    title?: string;
    description?: string;
    color?: number;
    footer?: string;
    thumbnail?: string;
    fields?: { name: string; value: string }[];
    sections?: SectionData[];
}

export interface V2Reply {
    components: ContainerBuilder[];
    flags: number;
}

function build(opts: ContainerOptions): ContainerBuilder {
    const c = new ContainerBuilder().setAccentColor(opts.color ?? COLORS.primary);

    if (opts.title) {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${opts.title}`));
    }

    const hasContentAfterTitle =
        !!opts.description || !!opts.fields?.length || !!opts.sections?.length;
    if (opts.title && hasContentAfterTitle) {
        c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
        );
    }

    if (opts.description) {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(opts.description));
    }

    if (opts.fields?.length) {
        if (opts.description) {
            c.addSeparatorComponents(
                new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
            );
        }
        for (const f of opts.fields) {
            c.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`),
            );
        }
    }

    if (opts.sections?.length) {
        for (const sec of opts.sections) {
            if (sec.accessory) {
                const section = new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(sec.text),
                );
                if (sec.accessory instanceof ButtonBuilder) {
                    section.setButtonAccessory(sec.accessory);
                } else {
                    section.setThumbnailAccessory(sec.accessory);
                }
                c.addSectionComponents(section);
            } else {
                // If there's no accessory, just use a TextDisplay to avoid validation errors
                c.addTextDisplayComponents(new TextDisplayBuilder().setContent(sec.text));
            }
        }
    }

    if (opts.footer) {
        c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
        );
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${opts.footer}`));
    }

    return c;
}

export const containers = {
    primary: (opts: ContainerOptions): V2Reply => ({
        components: [build({ ...opts, color: opts.color ?? COLORS.primary })],
        flags: MessageFlags.IsComponentsV2,
    }),

    success: (description: string, footer?: string): V2Reply => ({
        components: [
            build({
                description: `${EMOJIS.success} ${description}`,
                color: COLORS.success,
                footer,
            }),
        ],
        flags: MessageFlags.IsComponentsV2,
    }),

    error: (description: string, footer?: string): V2Reply => ({
        components: [
            build({
                description: `${EMOJIS.error} ${description}`,
                color: COLORS.error,
                footer,
            }),
        ],
        flags: MessageFlags.IsComponentsV2,
    }),

    warning: (description: string, footer?: string): V2Reply => ({
        components: [
            build({
                description: `${EMOJIS.warning} ${description}`,
                color: COLORS.warning,
                footer,
            }),
        ],
        flags: MessageFlags.IsComponentsV2,
    }),
};
