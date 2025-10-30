import * as Functions from "../../utils/Functions";

// start = 31 oct 2025
// end = 7 nov 2025
export const start2025HalloweenEvent = new Date(Date.UTC(2025, 9, 31, 0, 0, 0)); // Months are 0-indexed
export const end2025HalloweenEvent = new Date(Date.UTC(2025, 10, 7, 23, 59, 59));

export function is2025HalloweenEventActive(currentDate: Date = new Date()): boolean {
    return currentDate >= start2025HalloweenEvent && currentDate <= end2025HalloweenEvent;
}
