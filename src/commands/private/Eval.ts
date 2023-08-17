import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";

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
            "zh-TW": "計算JavaScript代碼",
            "es-ES": "Calcula el código JavaScript",
            "sv-SE": "Beräknar JavaScript-kod",
            th: "คำนวณโค้ด JavaScript",
            tr: "JavaScript kodunu hesaplar",
            uk: "Обчислює JavaScript-код",
            vi: "Tính toán mã JavaScript"
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
                    vi: "Mã để tính toán"
                },
                type: 3,
                required: true
            }
        ]
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const Functions = require("../../utils/Functions"); // eslint-disable-line @typescript-eslint/no-var-requires
        const { FightHandler } = require("../../structures/FightHandler"); // eslint-disable-line @typescript-eslint/no-var-requires
        const NPCs = require("../../rpg/NPCs/FightableNPCs"); // eslint-disable-line @typescript-eslint/no-var-requires
        await ctx.interaction.deferReply();
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

        const { client } = ctx;
        const content = ctx.options.getString("code", true);

        // prevent malicious code
        if (
            content.includes("rm -rf") ||
            content.toLowerCase().includes("flushdb") ||
            content.includes("--no-preserve-root") ||
            ((content.includes("child_process") ||
                    content.includes("token") ||
                    content.includes("process")) &&
                ctx.user.id !== process.env.OWNER_IDS.split(",")[0])
        ) {
            // alert every owners
            for (const id of (process.env.OWNER_IDS + "," + process.env.ADMIN_IDS).split(",")) {
                const owner = await client.users.fetch(id);
                await owner.send({
                    content: `:warning: [EMERGENCY ALERT]::: **${ctx.user.tag}** (${
                        ctx.user.id
                    }) tried to execute malicious code on **${ctx.guild.name}** (${
                        ctx.guild.id
                    })). Please, alert <@${process.env.OWNER_IDS.split(",")[0]}> and kick **${
                        ctx.user.tag
                    }** in the Support Server before it's too late !!!!! If you can, alert other admins.`
                });
            }
            // remove the owner from process.env on every clusters
            await client.cluster.broadcastEval(
                `process.env.OWNER_IDS = process.env.OWNER_IDS.replace("${ctx.user.id}", "x021x")`
            );
            // remove the owner from process.env.ADMIN_IDS
            await client.cluster.broadcastEval(
                `process.env.ADMIN_IDS = process.env.ADMIN_IDS.replace("${ctx.user.id}", "x021x")`
            );

            return ctx.makeMessage({
                content: "Nice try, but you can't do that."
            });
        }
        const result = new Promise((resolve) => resolve(eval(content)));

        return result
            .then((output) => {
                if (typeof output !== `string`) {
                    output = util.inspect(output, {
                        depth: 0
                    });
                }
                if ((output as string).includes(client.token)) {
                    output = (output as string).replace(
                        new RegExp(client.token, "gi"),
                        `T0K3N`
                    ) as string;
                }
                try {
                    if (!ctx.interaction.replied) ctx.makeMessage({
                        // eslint-disable-next-line no-useless-escape
                        content: `\`\`\`\js\n${output}\n\`\`\``
                    });
                } catch (_) {
                }
            })
            .catch((err) => {
                err = err.toString();
                if (err.includes(client.token)) {
                    err = err.replace(new RegExp(client.token, "gi"), `T0K3N`);
                }
                try {
                    ctx.makeMessage({
                        // eslint-disable-next-line no-useless-escape
                        content: `\`\`\`\js\n${err}\n\`\`\``
                    });
                } catch (e) {
                    console.error(e);
                }
            });
    }
};

export default slashCommand;
