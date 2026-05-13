// Tiny Discord.js helpers that are pure UI plumbing — no game logic.

import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";

export const actionRow = (
    components: (ButtonBuilder | StringSelectMenuBuilder)[],
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> =>
    new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>().addComponents(...components);
