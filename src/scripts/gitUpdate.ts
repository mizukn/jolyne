import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const rootDir = "/home/mizuki/jolyne/jolyne-rework/src"; // set the root directory here
const commitMessage = "Update files in folder";

function addFolders(dir: string) {
    const folders = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    folders.forEach((folder) => {
        if (folder === ".git") return;
        const folderPath = path.join(dir, folder);
        execSync(`git add ${folderPath}`);
        console.log(`Added ${folderPath} to Git`);
        addFolders(folderPath);
    });
}

addFolders(rootDir);
execSync(`git commit -m "${commitMessage}"`);
console.log(`Committed changes with message: ${commitMessage}`);
execSync("git push");
console.log("Pushed changes to remote repository");
