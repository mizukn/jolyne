import JolyneClient from "../structures/JolyneClient";
import log from "../utils/Logger";

const closeDatabaseConnections = (client: JolyneClient): void => {
    client.database.postgresql?.end();
    client.database.redis.quit();
};

export const registerProcessHandlers = (client: JolyneClient): void => {
    process.on("SIGINT", () => {
        closeDatabaseConnections(client);
        process.exit(0);
    });

    process.on("SIGTERM", () => {
        closeDatabaseConnections(client);
        process.exit(0);
    });

    process.on("exit", () => {
        log("Exiting...", "event");
        closeDatabaseConnections(client);
    });

    process.on("unhandledRejection", (error: Error) => {
        log(`Unhandled promise rejection: ${error.stack ?? error.message}`, "error");
    });

    process.on("uncaughtException", (error) => {
        log(
            `Uncaught exception: ${
                error instanceof Error ? error.stack ?? error.message : String(error)
            }`,
            "error",
        );
    });
};
