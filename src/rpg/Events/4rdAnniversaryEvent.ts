import { SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";

export const startOf4rdAnnivesaryEvent = new Date("2026-03-06");
export const endOf4rdAnnivesaryEvent = new Date("2026-03-30");
export const is4rdAnnivesaryEvent = (): boolean =>
    new Date() >= startOf4rdAnnivesaryEvent && new Date() <= endOf4rdAnnivesaryEvent;
