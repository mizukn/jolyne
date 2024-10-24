export const endOf2024ChristmasEvent = 1735772399000;
export const startOf2024ChristmasEvent = new Date(2024, 11, 1).getTime();
export const is2024ChristmasEventActive = (): boolean =>
    Date.now() > startOf2024ChristmasEvent && Date.now() < endOf2024ChristmasEvent;
export const is2024ChristmasEventEndingSoon = (): boolean => {
    // 4 days before the event ends
    if (!is2024ChristmasEventActive()) return false;
    return endOf2024ChristmasEvent - Date.now() < 4 * 24 * 60 * 60 * 1000;
};
