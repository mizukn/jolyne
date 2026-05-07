import { GatewayIntentBits, Options, Partials } from "discord.js";
import { getInfo } from "discord-hybrid-sharding";
import JolyneClient from "../structures/JolyneClient";

export const createClient = (): JolyneClient => {
    const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
    const partials = [];

    if (process.env.INTENTS) {
        intents.push(GatewayIntentBits.MessageContent);
        intents.push(GatewayIntentBits.GuildMessages);
        partials.push(Partials.Message);
    }

    return new JolyneClient({
        shards: getInfo().SHARD_LIST,
        shardCount: getInfo().TOTAL_SHARDS,
        intents,
        partials,
        makeCache: Options.cacheWithLimits({
            GuildBanManager: 0,
            GuildEmojiManager: 0,
            PresenceManager: 0,
            VoiceStateManager: 0,
            ThreadManager: 0,
            ThreadMemberManager: 0,
            ReactionManager: 0,
            ReactionUserManager: 0,
            StageInstanceManager: 0,
            BaseGuildEmojiManager: 0,
            GuildScheduledEventManager: 0,
            GuildStickerManager: 0,
            GuildInviteManager: 0,
            MessageManager: 0,
        }),
    });
};
