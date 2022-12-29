import { GatewayIntentBits } from 'discord.js';

const Intents = [
    GatewayIntentBits.Guilds,   
    GatewayIntentBits.GuildMembers
];

if (process.env.DEV_MODE === "true") Intents.push(GatewayIntentBits.GuildMessages);

