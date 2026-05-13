// Image helpers — stand-card rendering and dominant-color extraction.
// Kept out of `Functions.ts` so the canvas + get-image-colors dependencies
// stay scoped to callers that actually render images.

import Canvas from "canvas";
import color from "get-image-colors";
import type { Stand } from "../@types";
import type Jolyne from "../structures/JolyneClient";

const bufferCache: { [key: string]: Buffer } = {};

const RARITY_CARDS: Record<string, { color: string; link: string }> = {
    S: { color: "#2b82ab", link: "https://media.jolyne.moe/tpf4FN/direct" },
    A: { color: "#3b8c4b", link: "https://media.jolyne.moe/R95qjY/direct" },
    B: { color: "#786d23", link: "https://media.jolyne.moe/Od4M64/direct" },
    C: { color: "#181818", link: "https://media.jolyne.moe/ukfhrG/direct" },
    T: { color: "#3131ac", link: "https://media.jolyne.moe/J0FEBN/direct" },
};
const DEFAULT_CARD = { color: "#ff0000", link: "https://media.jolyne.moe/h2bJqC/direct" };

export const generateStandCart = async (stand: Stand): Promise<Buffer> => {
    if (bufferCache[stand.name]) return bufferCache[stand.name];

    const canvas = Canvas.createCanvas(230, 345);
    const ctx = canvas.getContext("2d");
    const image = await Canvas.loadImage(stand.image);
    const card = RARITY_CARDS[stand.rarity] ?? DEFAULT_CARD;

    const cardImage = await Canvas.loadImage(card.link);
    const RM = 90;
    ctx.drawImage(image, 40, 50, 230 - RM + 15, 345 - RM + 20);
    ctx.drawImage(cardImage, 0, 0, 230, 345);
    ctx.fillStyle = "white";

    const maxWidth = 180;
    const minFontSize = 16;
    const maxFontSize = 30;
    let fontSize = maxFontSize;
    ctx.font = `${fontSize}px Arial`;

    const content = stand.name;
    let textWidth = ctx.measureText(content).width;

    while (textWidth > maxWidth && fontSize > minFontSize) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
        textWidth = ctx.measureText(content).width;
    }

    const xPos = 115 - textWidth / 2;
    const yPos = 42;

    ctx.fillText(content, xPos, yPos);

    bufferCache[stand.name] = canvas.toBuffer();
    return bufferCache[stand.name];
};

const hexToNumber = (hex: string): number => parseInt(hex.replace("#", ""), 16);

export const getProminentColor = async (
    url: string,
    intensity: number,
    client?: Jolyne,
): Promise<number> => {
    if (client) {
        const cache = await client.database.getString(`color.${intensity}:${url}`);
        if (cache) return parseInt(cache);
    }

    const colors = await color(url, { count: intensity });
    const hex = colors.map((c) => c.hex());
    const prominent = hex.map(hexToNumber).reduce((a, b) => (a > b ? a : b));

    if (client) client.database.setString(`color.${intensity}:${url}`, prominent.toString());

    return prominent;
};
