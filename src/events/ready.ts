import type { EventFile } from "../@types";
import * as Functions from "../utils/Functions";
import { Events, ActivityType, ActivityOptions } from "discord.js";
import * as Stands from "../rpg/Stands/Stands";
import Jolyne from "../structures/JolyneClient";
import { CronJob } from "cron";
import TopGG from "../utils/TopGG";
import { FightHandler } from "../structures/FightHandler";
import { cli } from "winston/lib/winston/config";

async function fetchSupportMembers(client: Jolyne): Promise<void> {
    const members = await client.guilds.cache
        .get("923608916540145694")
        .members.fetch()
        .then((r) => r.map((x) => x));
    const betaTesters = members.filter((v) => v.roles.cache.has("978041345245597818"));
    const contributors = members.filter((v) => v.roles.cache.has("926829876990844989"));
    const staff = members.filter((v) => v.roles.cache.has("926829641518424064"));
    const boosters = members.filter((v) => v.roles.cache.has("938432687386005585"));
    const betaTournamentParticipants = members.filter((v) =>
        v.roles.cache.has("1129091839023120415")
    );
    const hugeContributors = members.filter((v) => v.roles.cache.has("926829876990844989"));

    for (const member of betaTesters) {
        client.database.redis.set(`jolyneRole_beta_tester_${member.id}`, "true");
    }
    for (const member of contributors) {
        client.database.redis.set(`jolyneRole_contributor_${member.id}`, "true");
    }
    for (const member of staff) {
        client.database.redis.set(`jolyneRole_staff_${member.id}`, "true");
    }
    for (const member of boosters) {
        client.database.redis.set(`jolyneRole_booster_${member.id}`, "true");
        client.boosters.push(member.id);
    }

    for (const member of betaTournamentParticipants) {
        client.database.redis.set(`jolyneRole_beta_tournament_participant_${member.id}`, "true");
    }

    for (const member of hugeContributors) {
        client.database.redis.set(`jolyneRole_huge_contributor_${member.id}`, "true");
    }

    // remove jolyne_beta_tester_ jolyne_contributor_ jolyne_staff_ from people that are not in the server anymore or dont have the role anymore
    const keys = await client.database.redis.keys("jolyneRole_*");
    for (const key of keys) {
        const id = key.split("_")[2];
        const role = key.split("_")[1];
        if (role === "beta_tester" && !betaTesters.find((v) => v.id === id)) {
            client.database.redis.del(key);
        } else if (role === "contributor" && !contributors.find((v) => v.id === id)) {
            client.database.redis.del(key);
        } else if (role === "staff" && !staff.find((v) => v.id === id)) {
            client.database.redis.del(key);
        } else if (role === "booster" && !boosters.find((v) => v.id === id)) {
            client.database.redis.del(key);
            client.boosters = client.boosters.filter((v) => v !== id);
        } else if (
            role === "beta_tournament_participant" &&
            !betaTournamentParticipants.find((v) => v.id === id)
        ) {
            client.database.redis.del(key);
        } else if (role === "huge_contributor" && !hugeContributors.find((v) => v.id === id)) {
            client.database.redis.del(key);
        }
    }
}

const Event: EventFile = {
    name: Events.ClientReady,
    once: true,
    execute: async (client: Jolyne): Promise<void> => {
        client.log("Green flag biven by discord, processing...", "ready");
        client.user.setActivity({
            type: ActivityType.Watching,
            name: "bugs...",
        });
        fetchPatreonsFromCache();
        client.log("Successfully fetched patreons from cache.", "ready");

        if (client.guilds.cache.get("923608916540145694")) {
            // Jolyne Support Server
            fetchSupportMembers(client);
            setInterval(async () => {
                fetchSupportMembers(client);
            }, 1000 * 60 * 5);
            client.log("Successfully fetched support members.", "ready");
        }

        // prettier-ignore
        if (parseInt(process.env.CLUSTER + 1) === parseInt(process.env.CLUSTER_COUNT)) {
            if (!process.env.IGNORE_TOPGG) TopGG(client);
            //Matchmaking(client);

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
            client.log("Updating slash commands...", "command");
            await client.postSlashCommands(commandsData);
            await client.database.setString(
                `jolyne_${client.user.id}:commands`,
                JSON.stringify(commandsData)
            );
            client.log("Updated slash commands", "command");
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
                client.log("Updated private slash commands", "command");
            }

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
        }, 1000 * 60);

        async function fetchPatreonsFromCache() {
            const patrons = await client.database.redis.keys("patron:*");
            for (const patron of patrons) {
                const data = await client.database.redis.get(patron);
                const patreonData = await client.database.redis.get(
                    `patronData:${patron.split(":")[1]}`
                );
                client.patreons.push({
                    id: patron.split(":")[1],
                    level: parseInt(data.split(":")[0]) as 1 | 2 | 3 | 4,
                    lastPatreonCharge: parseInt(data.split(":")[1]),
                    data: JSON.parse(patreonData) as typeof client.fetchPatrons extends Promise<
                        infer U
                    >
                        ? U
                        : never,
                });
            }
        }

        async function fetchPatreons() {
            console.log(parseInt(process.env.CLUSTER) + 1, parseInt(process.env.CLUSTER_COUNT));
            // fetching patrons, second priority to not make the bot laod slower
            // prettier-ignore
            if (parseInt(process.env.CLUSTER ) + 1 === parseInt(process.env.CLUSTER_COUNT)) {
                const patrons = await client.fetchPatrons();

                client.log("Clearing old patrons", "ready");

                const keys = await client.database.redis.keys("patron:*");
                const oldPatrons = await Promise.all(keys.map(async (v) => {
                    return {
                        id: v.split(":")[1],
                        level: parseInt(await client.database.redis.get(v))
                    };
                }));
                for (const key of keys) client.database.redis.del(key);
                client.patreons = [];

                for (const patron of patrons) {

                    if (patron.discord_id) client.database.redis.set(`patronCache_${patron.full_name}`, patron.discord_id);
                    client.database.redis.set(`patronData:${patron.discord_id}`, JSON.stringify(patron));

                    if (new Date(patron.last_charge_date).getTime() + 1000 * 60 * 60 * 24 * 31 < Date.now() || patron.currently_entitled_amount_cents === 0) {
                        continue;
                    }
                    let tier: 1 | 2 | 3 | 4;

                    if (patron.currently_entitled_amount_cents >= 1600) tier = 4; // OVER HEAVEN SUPPORTER
                    else if (patron.currently_entitled_amount_cents >= 1000) tier = 3; // HEAVEN ASCENDED SUPPORTER
                    else if (patron.currently_entitled_amount_cents >= 450) tier = 2; // ASCENDED SUPPORTER
                    else tier = 1; // SUPPORTER

                    if (!patron.discord_id) {
                        patron.discord_id = await client.database.redis.get(`patronCache_${patron.full_name}`);
                    }

                    client.log(`Fetched patron ${patron.full_name} is tier ${tier}, currently_entitled_amount_cents: ${patron.currently_entitled_amount_cents} (discordID: ${patron.discord_id})`, "patron");
                    client.database.redis.set(`patron:${patron.discord_id}`, String(tier) + ":" + new Date(patron.last_charge_date).getTime());
                    client.patreons.push({
                        id: patron.discord_id,
                        level: tier,
                        lastPatreonCharge: new Date(patron.last_charge_date).getTime(),
                        data: patron
                    });
                }
            } else {
                setTimeout(fetchPatreonsFromCache, 1000 * 15);
            }
        }

        if (process.env.IGNORE_PATREONS !== "true") {
            const fetchPatreonsJob = new CronJob(
                "*/2 * * * *",
                fetchPatreons,
                null,
                true,
                "Europe/Paris"
            );
            fetchPatreonsJob.start();
            fetchPatreons();
        }

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
                        .filter((r) => r.type !== 5)
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
                            (r) => r.type === 3 || r.type === 6 || r.type === 4 || r.type === 5
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

        if (!(await client.database.redis.get("updateSettings"))) {
            await client.database.fixSettingsToEveryone();
            await client.database.redis.set("updateSettings", "true");
            console.log("Updated settings to everyone");
        }

        client.log(`Logged in as ${client.user?.tag}`, "ready");
        client.allCommands = commandsV3;

        // client.database.migrateData();

        setInterval(() => {
            client.database.redis.keys("*tempCache_*").then(async (keys) => {
                for (const key of keys) {
                    const value = await client.database.redis.get(key);
                    if (value.includes("trading") || value.includes("dungeon")) continue;
                    client.database.redis.del(key);
                }
                console.log(`Cleared ${keys.length} temp cache keys.`);
            });
        }, 1000 * 60 * 2);

        while (client.patreonTiers.length === 0) {
            const result = await client.fetchRewards();
            if (result) client.patreonTiers = result;
            console.log("Fetched patreon tiers");
            await new Promise((resolve) => setTimeout(resolve, 15000));
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
