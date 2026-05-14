import type { possibleModifiers as PossibleModifierId } from "../../@types";
import * as Functions from "../../utils/Functions";
import { containers, COLORS, SectionData, V2Reply } from "../../utils/containers";
import {
    getTotalDropIncrease,
    getTotalXpIncrease,
    possibleModifiers,
} from "./dungeon_config";

const KARS = { emoji: "<:kars:1057261454421676092>", name: "Kars" } as const;

export const karsLine = (text: string): string =>
    `${KARS.emoji} **${KARS.name}:** ${text}`;

export const renderDungeonLobby = (
    hostTag: string,
    playerCount: number,
    selectedModifiers: PossibleModifierId[],
): V2Reply => {
    const sections: SectionData[] = [];
    if (selectedModifiers.length > 0) {
        const lines = selectedModifiers
            .map((id) => {
                const modifier = possibleModifiers.find((current) => current.id === id);
                return `> ${modifier?.emoji} **${Functions.capitalize(
                    id.replace(/_/g, " "),
                )}:** ${modifier?.description}`;
            })
            .join("\n");
        sections.push({ text: `### 🎲 Active Modifiers\n${lines}` });
    } else {
        sections.push({ text: `### 🎲 Active Modifiers\n> *None selected.*` });
    }
    sections.push({
        text:
            `### 📈 Bonuses\n` +
            `> **XP multiplier:** x${getTotalXpIncrease(selectedModifiers)}\n` +
            `> **Drop multiplier:** x${getTotalDropIncrease(selectedModifiers)}`,
    });

    return containers.primary({
        title: "# 🗝️ Dungeon Lobby",
        description: karsLine(
            `${hostTag} is hosting a dungeon. Party size **${playerCount}/2** — pick your modifiers and start when you're ready.`,
        ),
        descriptionDivider: true,
        sections,
        sectionDividers: true,
        color: COLORS.primary,
    });
};
