import { ChatInputCommandInteraction, Message, type APIEmbed } from "discord.js";

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

export const disableComponents = (
    components: any[],
): any[] => {
    components.forEach((c) => {
        if (c.components) {
            c.components.forEach((innerC: any) => {
                if (innerC.data) innerC.data.disabled = true;
            });
        }
    });

    return components;
};

export const disableRows = (interaction: ChatInputCommandInteraction | Message): void => {
    if (interaction instanceof Message) {
        interaction.edit({
            components: disableComponents(interaction.components),
        });
    } else {
        interaction.fetchReply().then((x) => {
            if (!x) return;
            x.edit({
                components: disableComponents(x.components),
            });
        });
    }
};

const MAX_DESCRIPTION_LENGTH = 4096;

export const fixEmbeds = (embeds: APIEmbed[]): APIEmbed[] => {
    const resultEmbeds: APIEmbed[] = [];

    embeds.forEach((embed) => {
        const { description = "", footer, color } = embed;

        if (description.length <= MAX_DESCRIPTION_LENGTH) {
            resultEmbeds.push(embed);
        } else {
            const chunks = splitDescriptionNicely(description, MAX_DESCRIPTION_LENGTH);

            chunks.forEach((chunk, index) => {
                const newEmbed: APIEmbed = {
                    description: chunk,
                    color,
                };

                if (index === chunks.length - 1 && footer) {
                    newEmbed.footer = footer;
                }

                resultEmbeds.push(newEmbed);
            });
        }
    });

    if (embeds[0].title) resultEmbeds[0].title = embeds[0].title;
    if (embeds[0].author) resultEmbeds[0].author = embeds[0].author;
    if (embeds[0].footer) resultEmbeds[resultEmbeds.length - 1].footer = embeds[0].footer;

    return resultEmbeds;
};

const splitDescriptionNicely = (text: string, maxLength: number): string[] => {
    const result: string[] = [];
    let remainingText = text;

    while (remainingText.length > maxLength) {
        let chunk = remainingText.slice(0, maxLength);
        const lastNewlineIndex = chunk.lastIndexOf("\n");

        if (lastNewlineIndex !== -1) {
            chunk = remainingText.slice(0, lastNewlineIndex + 1);
        } else {
            const lastSpaceIndex = chunk.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
                chunk = remainingText.slice(0, lastSpaceIndex);
            }
        }

        result.push(chunk);
        remainingText = remainingText.slice(chunk.length).trim();
    }

    if (remainingText.length > 0) {
        result.push(remainingText);
    }

    return result;
};
