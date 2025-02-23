export const startOf3rdAnnivesaryEvent = new Date("2025-02-22");
export const endOf3rdAnnivesaryEvent = new Date("2025-03-03");
export const is3rdAnnivesaryEvent = (): boolean =>
    new Date() >= startOf3rdAnnivesaryEvent && new Date() <= endOf3rdAnnivesaryEvent;
export const is3rdAnnivesaryEventEndingSoon = (): boolean => {
    if (!is3rdAnnivesaryEvent()) return false;

    return endOf3rdAnnivesaryEvent.getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;
};
