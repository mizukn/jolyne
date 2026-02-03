import { SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";

export const startOf4thAnnivesaryEvent = new Date("2026-03-06");
export const endOf4thAnnivesaryEvent = new Date("2026-03-30");
export const is4thAnnivesaryEvent = (): boolean =>
    new Date() >= startOf4thAnnivesaryEvent && new Date() <= endOf4thAnnivesaryEvent;
