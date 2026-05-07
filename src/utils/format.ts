import type { Message } from "discord.js";

export const localeNumber = (num: number): string => num?.toLocaleString();

export const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const romanize = (num: number): string => {
    if (isNaN(num)) return "NaN";
    const digits = String(+num).split("");
    const key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
    ];
    let roman = "";
    let i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
};

export const msToString = (ms: number): string => {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const dayStr = days ? `${days} day${days > 1 ? "s" : ""}` : "";
    const hourStr = hours ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
    const minuteStr = minutes ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";
    const secondStr = seconds ? `${seconds} second${seconds > 1 ? "s" : ""}` : "";

    return `${dayStr} ${hourStr} ${minuteStr} ${secondStr}`;
};

export const s = (num: number): string => (num === 1 ? "" : "s");

export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const generateMessageLink = (message: Message<boolean>): string =>
    `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

export const getBlackMarketString = (id: string): string => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `black_market:${id}_(${day < 10 ? "0" + day : day}/${
        month < 10 ? "0" + month : month
    }/${year})`;
};

export const getTodayString = (): string => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}/${year}`;
};
