import "dotenv/config";
import { Client, Message, GatewayIntentBits } from "discord.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on("ready", () => {
    console.log("ready");
});

client.on("debug", (info) => {
    console.log(info);
});

client.login("OTQyNzc4NjU1Mzg0NDA4MTI0.GbarSm.10u_iS6eOcLEQbiBcnDGTM2hSXcV87NAOFzz7s");
