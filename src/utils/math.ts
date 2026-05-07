export const calculateArrayValues = (array: number[]): number => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
};

export const getDiffPercent = (a: number, b: number): number => {
    return Math.abs((a - b) / ((a + b) / 2)) * 100;
};

export const plusOrMinus = (num: number, num2: number): string => {
    if (num2 > num) return "+";
    if (num2 < num) return "-";
    return "=~";
};
