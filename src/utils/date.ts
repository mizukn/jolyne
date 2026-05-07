import type CommandInteractionContext from "../structures/CommandInteractionContext";
import { getTodayString } from "./format";

export function getCurrentDate(date?: Date): `${number}-${number}-${number}` {
    const currentDate = date ? new Date(date) : new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    return formattedDate as `${number}-${number}-${number}`;
}

export function isTimeNext15(date: Date): boolean {
    const minutes = date.getMinutes();
    return minutes === 15 || minutes === 30 || minutes === 45 || minutes === 0;
}

export function roundToNext15Minutes(date: Date): Date {
    const roundedDate = new Date(date);
    const currentMinutes = roundedDate.getMinutes();
    const remainingMinutes = 15 - (currentMinutes % 15);

    roundedDate.setMinutes(currentMinutes + remainingMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);

    return roundedDate;
}

export async function hasDone4DungeonsToday(
    ctx: CommandInteractionContext,
    id: string,
): Promise<boolean> {
    const dungeonDoneToday = await ctx.client.database.getString(
        `dungeonDone:${id}:${getTodayString()}`,
    );
    const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;

    return dungeonDoneTodayCount >= 4;
}
