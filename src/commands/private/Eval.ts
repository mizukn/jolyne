import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";

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
    execute: async (ctx: CommandInteractionContext): Promise<void> => {
        const content = ctx.options.getString("query", true);
        const result = new Promise((resolve) => resolve(eval(content)));
        const { client } = ctx;

        return result
            .then((output) => {
                if (typeof output !== `string`) {
                    output = util.inspect(output, {
                        depth: 0,
                    });
                }
                if ((output as string).includes(client.token)) {
                    output = (output as string).replace(
                        new RegExp(client.token, "gi"),
                        `T0K3N`
                    ) as string;
                }
                try {
                    ctx.makeMessage({
                        // eslint-disable-next-line no-useless-escape
                        content: `\`\`\`\js\n${output}\n\`\`\``,
                    });
                } catch (e) {
                    console.error(e);
                }
            })
            .catch((err) => {
                console.error(err);
                err = err.toString();
                if (err.includes(client.token)) {
                    err = err.replace(new RegExp(client.token, "gi"), `T0K3N`);
                }
                try {
                    ctx.makeMessage({
                        // eslint-disable-next-line no-useless-escape
                        content: `\`\`\`\js\n${err}\n\`\`\``,
                    });
                } catch (e) {
                    console.error(e);
                }
            });
    },
};

export default slashCommand;
