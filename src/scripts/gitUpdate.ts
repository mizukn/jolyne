import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const rootDir = "/home/mizuki/jolyne/jolyne-rework/"; // set the root directory here
const commitMessage = "Update files in folder";

const emojis = ["✨", "🔥", "🎉", "🎊", "🚀", "🌟", "🎈", "🎀"];

function addFolders(dir: string) {
    const folders = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    folders.forEach((folder) => {
        if (
            folder === ".git" ||
            folder === "scripts" ||
            folder === ".vscode" ||
            folder === "dist" ||
            folder === "node_modules"
        )
            return;
        const folderPath = path.join(dir, folder);
        execSync(`git add ${folderPath}`);
        console.log(`Added ${folderPath} to Git`);
        try {
            execSync(
                `git commit -m "${
                    emojis[Math.floor(Math.random() * emojis.length)]
                } Update ${folder} files."`
            );
        } catch (err) {
            console.log(`No changes in ${folder}`);
        }
        addFolders(folderPath);
    });
}

addFolders(rootDir);
execSync("git push");
console.log("Pushed changes to remote repository");
