import i18next, { TFunction } from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import fs from "fs/promises";

async function walkDirectory(
    dir: string = path.resolve(__dirname, "../../i18n/"),
    namespaces: string[] = [],
    folderName = ""
) {
    const files = await fs.readdir(dir);

    const languages = [];
    for (const file of files) {
        const stat = await fs.stat(path.join(dir, file));
        if (stat.isDirectory()) {
            const isLanguage = file.includes("-");
            if (isLanguage) languages.push(file);

            const folder = await walkDirectory(
                path.join(dir, file),
                namespaces,
                isLanguage ? "" : `${file}/`
            );

            namespaces = folder.namespaces;
        } else {
            namespaces.push(`${folderName}${file.slice(0, file.length - 5)}`);
        }
    }

    return { namespaces: [...new Set(namespaces)], languages };
}

export default async (): Promise<Map<string, TFunction>> => {
    const { namespaces, languages } = await walkDirectory(path.resolve(__dirname, "../../i18n/"));

    i18next.use(Backend);

    await i18next.init({
        backend: {
            loadPath: path.resolve(__dirname, "../../i18n/{{lng}}/{{ns}}.json"),
        },
        debug: false,
        fallbackLng: "en-US",
        initImmediate: false,
        interpolation: { escapeValue: false },
        load: "all",
        ns: namespaces,
        preload: languages,
    });

    return new Map(languages.map((item) => [item, i18next.getFixedT(item)]));
};
