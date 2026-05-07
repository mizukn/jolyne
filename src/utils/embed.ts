import type { APIEmbed } from "discord.js";

export const fixFields = function fixFields(
    fields: { name: string; value: string; inline?: boolean }[],
): { name: string; value: string; inline?: boolean }[] {
    for (const field of fields) {
        if (field.value.length > 1024) {
            const content: string[] = [];
            for (const line of field.value.split("\n").reverse()) {
                if (content.join("\n").length + line.length > 1024) break;
                content.push(line);
            }

            field.value = content.reverse().join("\n").substring(0, 1024);
        }
    }

    return fields;
};

export function splitEmbedIfExceedsLimit(embed: APIEmbed): APIEmbed[] {
    const embeds: APIEmbed[] = [];
    const MAX_EMBED_SIZE = 5000;
    const EMBED_HEADER_SIZE = 24;
    const color = embed.color;

    let currentEmbed: APIEmbed = {};
    let currentLength = EMBED_HEADER_SIZE;

    function pushCurrentEmbed() {
        if (embeds.length === 0) embeds.push(currentEmbed);
        else {
            for (const embed of splitEmbedIfExceedsLimit(currentEmbed)) {
                embeds.push(embed);
            }
        }
        currentEmbed = { color };
        currentLength = EMBED_HEADER_SIZE;
    }

    function canAddContent(content: string) {
        return currentLength + content.length <= MAX_EMBED_SIZE;
    }

    function copyFields(fields: APIEmbed["fields"]) {
        const remainingFields = fields;
        while (remainingFields.length > 0) {
            const nextField = remainingFields.shift();
            if (!nextField) break;

            if (canAddContent(nextField.name) && canAddContent(nextField.value)) {
                if (!currentEmbed.fields) currentEmbed.fields = [];
                currentEmbed.fields.push(nextField);
                currentLength += nextField.name.length + nextField.value.length;
            } else {
                pushCurrentEmbed();
                copyFields([nextField, ...remainingFields]);
                return;
            }
        }
    }

    function copyProperties(properties: (keyof APIEmbed)[]) {
        properties.forEach((prop) => {
            if (embed[prop] !== undefined) {
                Object.assign(currentEmbed, { [prop]: embed[prop] });
                currentLength += JSON.stringify(embed[prop]).length;
            }
        });
    }

    copyProperties([
        "title",
        "type",
        "description",
        "url",
        "timestamp",
        "color",
        "footer",
        "image",
        "thumbnail",
        "video",
        "provider",
        "author",
    ]);
    if (embed.fields && embed.fields.length > 0) {
        copyFields(embed.fields);
    }

    if (Object.keys(currentEmbed).length > 0) {
        pushCurrentEmbed();
    }

    return embeds;
}
