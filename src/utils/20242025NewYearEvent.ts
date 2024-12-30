export const startOf20242025NewYearEvent = new Date("2024-12-31");
export const endOf20242025NewYearEvent = new Date("2025-01-07");
export const is20242025NewYearEvent = (): boolean =>
    new Date() >= startOf20242025NewYearEvent && new Date() <= endOf20242025NewYearEvent;
export const is20242025NewYearEventEndingSoon = (): boolean => {
    if (!is20242025NewYearEvent()) return false;

    return endOf20242025NewYearEvent.getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;
};
