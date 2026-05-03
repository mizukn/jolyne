import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message } from "discord.js";

const slashCommand: SlashCommandFile = {
    data: {
        name: "eval",
        description: "Evaluates a JavaScript code",
        description_localizations: {
            id: "Menghitung kode JavaScript",
            bg: "Изчислява JavaScript код",
            hr: "Izračunava JavaScript kod",
            cs: "Vypočítává JavaScriptový kód",
            da: "Udregner JavaScript-kode",
            nl: "Berekent JavaScript-code",
            fi: "Laskee JavaScript-koodin",
            fr: "Calcule le code JavaScript",
            de: "Berechnet JavaScript-Code",
            el: "Υπολογίζει τον κώδικα JavaScript",
            hi: "JavaScript कोड का गणना करता है",
            hu: "JavaScript kód kiszámítása",
            it: "Calcola il codice JavaScript",
            ja: "JavaScriptコードを計算します",
            ko: "JavaScript 코드 계산",
            lt: "Skaičiuoja JavaScript kodą",
            no: "Regner ut JavaScript-kode",
            pl: "Oblicza kod JavaScript",
            "pt-BR": "Calcula o código JavaScript",
            ro: "Calculează codul JavaScript",
            ru: "Вычисляет JavaScript-код",
            "zh-CN": "计算JavaScript代码",
            "zh-TW": "计算JavaScript代码",
            "es-ES": "Calcula el código JavaScript",
            "sv-SE": "Beräknar JavaScript-kod",
            th: "คำนวณโค้ด JavaScript",
            tr: "JavaScript kodunu hesaplar",
            uk: "Обчислює JavaScript-код",
            vi: "Tính toán mã JavaScript",
        },
        options: [
            {
                name: "code",
                description: "The code to evaluate",
                description_localizations: {
                    id: "Kode yang akan dihitung",
                    bg: "Кода за изчисляване",
                    hr: "Kod za izračunavanje",
                    cs: "Kód k výpočtu",
                    da: "Koden der skal udregnes",
                    nl: "De code om te berekenen",
                    fi: "Koodi laskemiseen",
                    fr: "Le code à calculer",
                    de: "Der Code zum Berechnen",
                    el: "Ο κώδικας για υπολογισμό",
                    hi: "गणना करने के लिए कोड",
                    hu: "A kód kiszámításához",
                    it: "Il codice da calcolare",
                    ja: "計算するコード",
                    ko: "계산할 코드",
                    lt: "Kodas skaičiavimui",
                    no: "Koden som skal regnes ut",
                    pl: "Kod do obliczenia",
                    "pt-BR": "O código a ser calculado",
                    ro: "Codul de calculat",
                    ru: "Код для вычисления",
                    "zh-CN": "要计算的代码",
                    "zh-TW": "要計算的代碼",
                    "es-ES": "El código a calcular",
                    "sv-SE": "Koden som ska beräknas",
                    th: "โค้ดที่จะคำนวณ",
                    tr: "Hesaplanacak kod",
                    uk: "Код для обчислення",
                    vi: "Mã để tính toán",
                },
                type: 3,
                required: true,
            },
        ],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const Functions = require("../../utils/Functions");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { FightHandler } = require("../../structures/FightHandler");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const NPCs = require("../../rpg/NPCs/FightableNPCs");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const SpecialItems = require("../../rpg/Items/SpecialItems");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const Aes = require("../../utils/Aes").default;

        await ctx.interaction.deferReply();
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

        const { client } = ctx;
        const content = ctx.options.getString("code", true);

        // Security check
        const owners = process.env.OWNER_IDS?.split(",") ?? [];
        const isPrimaryOwner = ctx.user.id === owners[0];

        if (!isPrimaryOwner) {
            const blacklist = ["rm ", "flushdb", "process", "token", "child_process", "exec"];
            if (blacklist.some((word) => content.toLowerCase().includes(word))) {
                // Alert owners
                const alertIds = [...owners, ...(process.env.ADMIN_IDS?.split(",") ?? [])];
                for (const id of alertIds) {
                    if (!id || id === "x021x") continue;
                    try {
                        const user = await client.users.fetch(id);
                        await user.send({
                            content: `:warning: [SECURITY ALERT] **${ctx.user.tag}** (${ctx.user.id}) tried to use restricted keywords in eval on **${ctx.guild?.name}**.`,
                        });
                    } catch (e) {
                        console.error(`Failed to send alert to ${id}:`, e);
                    }
                }

                // Temporary de-authorize
                await client.cluster.broadcastEval(
                    (c, { userId }) => {
                        process.env.OWNER_IDS = process.env.OWNER_IDS?.replace(userId, "x021x");
                        process.env.ADMIN_IDS = process.env.ADMIN_IDS?.replace(userId, "x021x");
                    },
                    { context: { userId: ctx.user.id } }
                );

                return ctx.makeMessage({
                    content: "Restricted keywords detected. Your access has been temporarily revoked.",
                });
            }
        }

        try {
            // eslint-disable-next-line no-eval
            let output = await eval(content);

            if (typeof output !== "string") {
                output = util.inspect(output, { depth: 0 });
            }

            if (output.includes(client.token!)) {
                output = output.replace(new RegExp(client.token!, "gi"), "T0K3N");
            }

            return ctx.makeMessage({
                content: `\`\`\`js\n${output.slice(0, 1900)}\n\`\`\``,
            });
        } catch (err: any) {
            let errorMsg = err.toString();
            if (errorMsg.includes(client.token!)) {
                errorMsg = errorMsg.replace(new RegExp(client.token!, "gi"), "T0K3N");
            }
            return ctx.makeMessage({
                content: `\`\`\`js\n${errorMsg.slice(0, 1900)}\n\`\`\``,
            });
        }
    },
};

export default slashCommand;
