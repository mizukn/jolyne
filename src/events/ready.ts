import type { EventFile, RPGUserDataJSON } from "../@types";
import * as Functions from "../utils/Functions";
import { Events, ActivityType, ActivityOptions } from "discord.js";
import * as Stands from "../rpg/Stands/Stands";
import Jolyne from "../structures/JolyneClient";
import { CronJob } from "cron";

const Event: EventFile = {
    name: Events.ClientReady,
    once: true,
    execute: async (client: Jolyne): Promise<void> => {
        client.user.setActivity({
            type: ActivityType.Watching,
            name: "bugs...",
        });
        fetchPatreonsFromCache();

        async function resetDailyQuests() {
            const RPGUsers = (await client.database.postgresql
                .query(`SELECT * FROM "RPGUsers"`)
                .then((r) => r.rows)) as RPGUserDataJSON[];

            for (const RPGUser of RPGUsers) {
                console.log(RPGUser.id, "reset daily");
                RPGUser.daily.quests = Functions.generateDailyQuests(RPGUser.level);
                client.database.saveUserData(RPGUser);

                // removing claimed daily quests from cache
                client.database.redis.del(`daily-quests-${RPGUser.id}`);
            }
        }

        // prettier-ignore
        if (parseInt(process.env.CLUSTER + 1) === parseInt(process.env.CLUSTER_COUNT)) {
            
			const lastCommands = await client.database.getString(
				`jolyne_${client.user.id}:commands`
			);
			const lastPrivateCommands = await client.database.getString(
				`jolyne_${client.user.id}:private_commands`
			);
			const commandsData = client.commands
				.filter((v) => !(v.ownerOnly || v.adminOnly))
				.map((v) => v.data);
			const privateCommandsData = client.commands
				.filter((v) => v.ownerOnly || v.adminOnly)
				.map((v) => v.data);
			//if (JSON.stringify(commandsData) !== lastCommands) {
				await client.postSlashCommands(commandsData);
				await client.database.setString(
					`jolyne_${client.user.id}:commands`,
					JSON.stringify(commandsData)
				);
				client.log("Updated slash commands");
			//} else client.log("Slash commands are up to date");

			if (JSON.stringify(privateCommandsData) !== lastPrivateCommands) {
				await client.postSlashCommands(
					privateCommandsData,
					process.env.PRIVATE_GUILD_ID
				);
				await client.database.setString(
					`jolyne_${client.user.id}:private_commands`,
					JSON.stringify(privateCommandsData)
				);
				client.log("Updated private slash commands");
			}

    
            const dailyQuestsJob = new CronJob("0 0 * * *", resetDailyQuests, null, true, "UTC");
            // dailyQuestsJob.start();
    
    
            // client.log("Started daily quests cron job", "ready");
    
		}
        client._cachedCommands = await client.application.commands.fetch();

        // end
        client.user.setActivity({
            type: ActivityType.Watching,
            name: "the beginning...",
        });
        client.cluster.on("updatePatreons", async () => {
            client.patreons = [];
            await fetchPatreons();
        });

        setInterval(() => {
            const activies: ActivityOptions[] = [
                {
                    type: ActivityType.Watching,
                    name: "The World",
                },
                {
                    type: ActivityType.Watching,
                    name: "The Way To Heaven",
                },
                {
                    type: ActivityType.Playing,
                    name: "with " + Functions.randomArray(Object.values(Stands).map((v) => v.name)),
                },
                {
                    type: ActivityType.Watching,
                    name: "JoJo's Bizarre Adventure",
                },
            ];
            client.user.setActivity(Functions.randomArray(activies));
        }, 1000 * 60 * 1);
        const allCommandsV1 = client.commands
            .filter((r) => r.category !== "private")
            .map((v) => {
                if (
                    v.data?.options?.length !== 0 &&
                    v.data.options instanceof Array &&
                    v.data.options
                        .filter((r) => !r.choices)
                        .filter((r) => r.type !== 3)
                        .filter((r) => r.type !== 6)
                        .filter((r) => r.type !== 4).length !== 0
                ) {
                    return v.data.options.map((c) => {
                        return {
                            cooldown: v.cooldown,
                            category: v.category,
                            options: v.data?.options?.filter((r) => r.name === c.name)[0]?.options,
                            name: `${v.data.name} ${c.name}`,
                            description: removeEmoji(c.description),
                        };
                    });
                } else
                    return {
                        cooldown: v.cooldown,
                        category: v.category,
                        options: v.data?.options?.filter(
                            (r) => r.type === 3 || r.type === 6 || r.type === 4
                        ),
                        name: v.data.name,
                        description: removeEmoji(v.data.description),
                    };
            })
            .map((v) => {
                if (v instanceof Array) {
                    return v.map((v) => {
                        return {
                            cooldown: v.cooldown,
                            category: v.category,
                            options: v.options,
                            name: v.name,
                            description: v.description,
                        };
                    });
                } else
                    return {
                        cooldown: v.cooldown,
                        category: v.category,
                        options: v.options,
                        name: v.name,
                        description: v.description,
                    };
            });
        const commandsV2 = [];
        for (const command of allCommandsV1) {
            if (command instanceof Array) {
                for (const commandx of command) {
                    commandsV2.push(commandx);
                }
            } else commandsV2.push(command);
        }
        const commandsV3 = [];
        for (const commands of commandsV2) {
            if (commands.options?.find((x) => x.type === 1)) {
                for (const command of commands.options) {
                    commandsV3.push({
                        cooldown: commands.cooldown,
                        category: commands.category,
                        options: command.options,
                        name: `${commands.name} ${command.name}`,
                        description: command.description,
                    });
                }
            } else commandsV3.push(commands);
        }
        client.allCommands = commandsV3;

        client.log(`Logged in as ${client.user?.tag}`, "ready");

        async function fetchPatreonsFromCache() {
            const patrons = await client.database.redis.keys("patron:*");
            for (const patron of patrons) {
                const tier = await client.database.redis.get(patron);
                client.patreons.push({
                    id: patron.split(":")[1],
                    level: parseInt(tier),
                });
            }
        }

        async function fetchPatreons() {
            // fetching patrons, second priority to not make the bot laod slower
            // prettier-ignore
            if (parseInt(process.env.CLUSTER + 1) === parseInt(process.env.CLUSTER_COUNT)) {
            const patrons = await client.fetchPatrons();
    
            client.log("Clearing old patrons", "ready");
    
            const keys = await client.database.redis.keys("patron:*");
            const oldPatrons = await Promise.all(keys.map(async (v) => {
                return {
                    id: v.split(":")[1],
                    level: parseInt(await client.database.redis.get(v)),
                };
            }));
            for (const key of keys) client.database.redis.del(key);
            client.patreons = [];
    
            for (const patron of patrons) {
                if (new Date(patron.last_charge_date).getTime() + 1000 * 60 * 60 * 24 * 31 < Date.now() || patron.currently_entitled_amount_cents === 0)
                    {
                        continue;
                    }
                let tier;
    
                if (patron.currently_entitled_amount_cents >= 1600) tier = 4; // OVER HEAVEN SUPPORTER
                else if (patron.currently_entitled_amount_cents >= 1000) tier = 3; // HEAVEN ASCENDED SUPPORTER
                else if (patron.currently_entitled_amount_cents >= 450) tier = 2; // ASCENDED SUPPORTER
                else tier = 1; // SUPPORTER

                if (patron.discord_id) client.database.redis.set(`patronCache_${patron.full_name}`, patron.discord_id);
                if (!patron.discord_id) {
                    patron.discord_id = await client.database.redis.get(`patronCache_${patron.full_name}`);
                }
    
                client.log(`Fetched patron ${patron.full_name} is tier ${tier}, currently_entitled_amount_cents: ${patron.currently_entitled_amount_cents} (discordID: ${patron.discord_id})`);
                client.database.redis.set(`patron:${patron.discord_id}`, String(tier));
                client.patreons.push({
                    id: patron.discord_id,
                    level: tier,
                });
                if (oldPatrons.find((v) => v.id === patron.discord_id)?.level !== tier) {
                    // give rewards here
                }
            }
            console.log(client.patreons, oldPatrons);
        } else {
            setTimeout(fetchPatreonsFromCache, 1000 * 15);
        }
        }

        if (process.env.IGNORE_PATREONS !== "true") {
            const fetchPatreonsJob = new CronJob(
                "0 0 * * *",
                fetchPatreons,
                null,
                true,
                "Europe/Paris"
            );
            fetchPatreonsJob.start();
            fetchPatreons();
        }
    },
};
export default Event;

function removeEmoji(string: string) {
    return string
        .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
            ""
        )
        .replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "")
        .replace(
            /[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g,
            ""
        )
        .replace(/🪙/gi, "")
        .replace(/🔎/gi, "")
        .replace(/📧/gi, "")
        .replace(/⭐/gi, "")
        .trim();
}
