import { RPGUserDataJSON, SlashCommandFile } from "../../@types";
import { Message, InteractionResponse, APIEmbed, AttachmentBuilder } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { generateDiscordTimestamp, TopGGVoteRewards } from "../../utils/Functions";
import simpleGit, { SimpleGit } from "simple-git";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800;
const height = 300;
const ticksOptions = [
    {
        ticks: {
            fontColor: "white",
            fontStyle: "bold",
        },
    },
];
const options = {
    legend: {
        display: false,
    },
    scales: {
        yAxes: ticksOptions,
        xAxes: ticksOptions,
    },
};
const isSameDay = (firstDate: Date, secondDate: Date) => {
    return (
        `${firstDate.getDate()}|${firstDate.getMonth()}|${firstDate.getFullYear()}` ===
        `${secondDate.getDate()}|${secondDate.getMonth()}|${secondDate.getFullYear()}`
    );
};
const generateCanvas = async (joinedXDays: number[], lastXDays: string[]) => {
    const canvasRenderService = new ChartJSNodeCanvas({
        width,
        height,
    });
    const image = await canvasRenderService.renderToBuffer({
        type: "line",
        data: {
            labels: lastXDays,
            datasets: [
                {
                    label: "Players",
                    data: joinedXDays,
                    borderColor: "rgb(112, 146, 108)",
                    fill: true,
                    backgroundColor: "rgba(150, 219, 150, 0.11)",
                },
            ],
        },
        options,
    });
    const attachment = new AttachmentBuilder(image, { name: "image.png" });
    return attachment;
};
const joinedXDayss = async (numberOfDays: number, members: RPGUserDataJSON[]) => {
    const days: number[] = [];
    let lastDate = 0;
    members = members.sort(
        (a: RPGUserDataJSON, b: RPGUserDataJSON) => b.adventureStartedAt - a.adventureStartedAt
    );
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        for (const member of members) {
            const joinedDate = new Date(Number(member.adventureStartedAt));
            if (isSameDay(joinedDate, date)) {
                if (lastDate !== joinedDate.getDate()) {
                    lastDate = joinedDate.getDate();
                    days.push(1);
                } else {
                    let currentDay = days.pop();
                    days.push(++currentDay);
                }
            }
        }
        if (days.length < i) days.push(0);
    }
    return days.reverse();
};
const lastXDayss = (numberOfDays: number, monthIndex: string[]) => {
    const days = [];
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        let day: string | number = date.getDate();
        const month = monthIndex[date.getMonth()];
        if (day < 10) day = `0${day}`;
        days.push(`${day} ${month}`);
    }
    return days.reverse();
};

const git: SimpleGit = simpleGit();

const getCommit = async () => {
    const commit = await git.log({ n: 1 });
    return commit.latest;
};

const numberOfDays = 30;

const slashCommand: SlashCommandFile = {
    data: {
        name: "infos",
        description: "Display informations about the bot",
        options: [],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message | void | InteractionResponse> => {
        await ctx.interaction.deferReply();

        const usersKeys = await ctx.client.database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
        let users: RPGUserDataJSON[] = [];
        for (const key of usersKeys) {
            const user = await ctx.client.database.redis.get(key);
            if (user) users.push(JSON.parse(user));
        }
        users = users
            .filter((m) => m.adventureStartedAt !== undefined)
            .sort((a, b) => b.adventureStartedAt - a.adventureStartedAt);
        const days: {
            count: number;
            date: `${number} ${string}`;
        }[] = [];

        const m: string[] = ctx.translate("base:SMALL_MONTHS", {
            returnObjects: true,
        });

        for (const member of users) {
            const date = new Date(Number(member.adventureStartedAt));
            const day = date.getDate();
            const month = m[date.getMonth()];
            let dayIndex = days.find((r) => r.date === `${day} ${month}`);
            if (!dayIndex)
                days.push({
                    count: 0,
                    date: `${day} ${month}`,
                });
            dayIndex = days.find((r) => r.date === `${day} ${month}`);
            dayIndex.count++;
            days.map((v) => {
                if (v.date === `${day} ${month}`) v = dayIndex;
                return v;
            });
        }

        const joinedXDays = await joinedXDayss(numberOfDays, users);
        const lastXDays = lastXDayss(numberOfDays, m);
        lastXDays.length = lastXDays.length - 1;
        const attachment = await generateCanvas(joinedXDays, lastXDays);

        const clusterPromises = await Promise.all([
            ctx.client.cluster.broadcastEval("this.guilds.cache.size"),
            ctx.client.cluster.broadcastEval(
                "this.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0)"
            ),
            ctx.client.cluster.broadcastEval(
                "Number(Number(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))"
            ),
        ]);
        const guilds = clusterPromises[0].reduce((acc, guild) => acc + guild, 0);
        const members = clusterPromises[1].reduce((acc, member) => acc + member, 0);
        const memory = clusterPromises[2].reduce((acc, mem) => acc + mem, 0);
        const commit = await getCommit();
        const todayDateString = `${new Date().getUTCDate()}-${
            new Date().getUTCMonth() + 1
        }-${new Date().getUTCFullYear()}`;

        const embed: APIEmbed = {
            author: {
                name: "Jolyne",
                url: "https://jolyne.moe",
                icon_url: ctx.client.user.displayAvatarURL(),
            },
            color: 0x70926c,
            fields: [
                {
                    name: "Developer",
                    value: "@**mizufare** (239739781238620160) `mizu@jolyne.moe`",
                },
                {
                    name: "Version",
                    value: `\`v3.0.01:${commit["hash"].slice(0, 7)}\` (${
                        commit["message"]
                    } ${generateDiscordTimestamp(new Date(commit["date"]), "FROM_NOW")})`,
                },
                {
                    name: "Guilds",
                    value: guilds.toLocaleString("en-US"),
                    inline: true,
                },
                {
                    name: "Members (cache)",
                    value: members.toLocaleString("en-US"),
                    inline: true,
                },
                {
                    name: "Memory",
                    value: `${memory.toLocaleString("en-US")} MB`,
                    inline: true,
                },
                {
                    name: ctx.translate("infos:SUPPORT_INVITE"),
                    value: "https://discord.gg/9a2HYsum2v",
                    inline: true,
                },
                {
                    name: ctx.translate("infos:PLAYERS") + " (RPG)",
                    value: users.length.toLocaleString("en-US"),
                    inline: true,
                },
                {
                    name: "Uptime",
                    value: generateDiscordTimestamp(Date.now() - ctx.client.uptime, "FROM_NOW"),
                    inline: true,
                },
                {
                    name: ctx.translate("infos:NEW_PLAYERS"),
                    value: ctx.translate("infos:NEW_PLAYERS_VALUE", {
                        new: users.filter(
                            (user) =>
                                `${new Date(user.adventureStartedAt).getUTCDate()}-${
                                    new Date(user.adventureStartedAt).getUTCMonth() + 1
                                }-${new Date(user.adventureStartedAt).getUTCFullYear()}` ===
                                todayDateString
                        ).length,
                        newUsersLast31Days: users.filter(
                            (user) =>
                                new Date(user.adventureStartedAt).getTime() >
                                new Date().getTime() - 31 * 24 * 60 * 60 * 1000
                        ).length,
                    }),
                },
            ],
            image: {
                url: "attachment://image.png",
            },
            footer: {
                text: `Cluster #${process.env.CLUSTER} | Shard #${ctx.interaction.guild.shardId}`,
            },
            timestamp: new Date().toISOString(),
        };

        console.log(commit);

        return await ctx.interaction.editReply({
            files: [attachment],
            embeds: [embed],
        });
    },
};

export default slashCommand;
