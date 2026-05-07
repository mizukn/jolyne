import { ClusterClient } from "discord-hybrid-sharding";
import * as Sentry from "@sentry/node";
import { FightHandler } from "./structures/FightHandler";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { createClient } from "./bootstrap/createClient";
import { finalizeNPCRegistry } from "./rpg/NPCs/NPCRegistryFinalizer";
import { loadApplication } from "./bootstrap/loadApplication";
import { registerProcessHandlers } from "./bootstrap/processHandlers";
import { runRegistryValidation } from "./bootstrap/validate";
import { registerSeasonalEventNPCs } from "./services/EventNPCGenerator";
import { registerStandDiscs } from "./rpg/Items/StandDiscFactory";
import { registerStandUserNPCs } from "./rpg/NPCs/StandUserNPCFactory";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    profilesSampleRate: 1.0,
    integrations: [nodeProfilingIntegration()],
});

registerSeasonalEventNPCs();
registerStandDiscs();
registerStandUserNPCs();
finalizeNPCRegistry();

const client = createClient();
registerProcessHandlers(client);

client.cluster = new ClusterClient(client);
client.cluster.on("fightStart", (fight: FightHandler) => {
    client.fightHandlers.set(fight.id, fight);
});
client.cluster.on("fightEnd", (fight: FightHandler) => {
    client.fightHandlers.delete(fight.id);
});

runRegistryValidation();
loadApplication(client);

client.login(process.env.CLIENT_TOKEN);
