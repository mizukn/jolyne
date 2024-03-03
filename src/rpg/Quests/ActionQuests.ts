import { ButtonStyle, ButtonBuilder, MessageComponentInteraction } from "discord.js";
import { ActionQuest, Quests, RPGUserQuest } from "../../@types";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as NPCs from "../NPCs/NPCs";

function validateQuest(ctx: CommandInteractionContext, questId: string): void {
    for (const quests of [
        ctx.userData.daily.quests,
        ctx.userData.chapter.quests,
        ...ctx.userData.sideQuests.map((v) => v.quests),
    ]) {
        for (const quest of quests.filter((r) => r.id === questId)) {
            quest.completed = true;
        }
    }
}

function pushQuest(ctx: CommandInteractionContext, quest: Quests, questId: string): void {
    let base: RPGUserQuest[];

    if (ctx.userData.daily.quests.find((r) => r.id === questId)) base = ctx.userData.daily.quests;
    else if (ctx.userData.chapter.quests.find((r) => r.id === questId))
        base = ctx.userData.chapter.quests;
    else {
        for (const sideQuest of ctx.userData.sideQuests) {
            if (sideQuest.quests.find((r) => r.id === questId)) base = sideQuest.quests;
        }
    }

    base.push(Functions.pushQuest(quest));
}

export const RemoveFleshbudToKakyoin: ActionQuest = {
    type: "action",
    id: "remove_fleshbud_to_kakyoin",
    completed: false,
    i18n_key: "REMOVE_FLESHBUD",
    emoji: "🐛",
    use: async (ctx) => {
        const finishEmoji = "🐛";
        const map = ["🔲", "🔲", "🔲", "🔲", finishEmoji, "🔲", "🔲", "🔲", "🔲", "🔲"];
        const crashEmoji = "<:redtick:1071137546819600424>";
        for (let i = 0; i < 15; i++) {
            const howMuch = Functions.randomNumber(1, 5);
            const map2 = ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            Functions.shuffleArray(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let planeDirection = map.length - 5;
        map[planeDirection - 10] = "🔲"; // anti impossible
        let oldEmoji = "🔲";

        const backId = "backId";
        const centerId = "cennterId";
        const forwardId = "forwardIdShinzoSasageyooo";

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Secondary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);
        const bottomBTN = new ButtonBuilder()
            .setCustomId("bottomId")
            .setEmoji("⬇️")
            .setStyle(ButtonStyle.Secondary);

        function generateInvisibleBTN() {
            const invisibleBTN2 = new ButtonBuilder()
                .setCustomId("invisibleId" + Functions.generateRandomId())
                .setLabel("ㅤ")
                .setStyle(ButtonStyle.Secondary);
            return invisibleBTN2;
        }

        async function makeMessage(): Promise<void> {
            map[planeDirection] = "👆";
            await ctx.makeMessage({
                components: [
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        centerBTN,
                        generateInvisibleBTN(),
                    ]),
                    Functions.actionRow([backBTN, generateInvisibleBTN(), forwardBTN]),
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        bottomBTN,
                        generateInvisibleBTN(),
                    ]),
                ],
                embeds: [
                    {
                        title: "🐛 Kakyoin's head",
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Remove the fleshbud.",
                        },
                        color: 0x70926c,
                    },
                ],
            });
        }

        await makeMessage();
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently removing Kakyoin's fleshbud. Can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });
        const filter = async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId ||
                    i.customId === centerId ||
                    i.customId === forwardId ||
                    i.customId === "bottomId") &&
                i.user.id === ctx.user.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[planeDirection] = oldEmoji;
            if (i.customId === backId) {
                planeDirection -= 1;
            } else if (i.customId === forwardId) {
                planeDirection += 1;
            } else if (i.customId === centerId) {
                planeDirection -= 10;
            } else if (i.customId === "bottomId") {
                planeDirection += 10;
            }

            if (map[planeDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "You failed to remove the fleshbud. Try again.",
                });
            } else if (map[planeDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You succesfully removed the fleshbud.",
                });
                validateQuest(ctx, "remove_fleshbud_to_kakyoin");
                pushQuest(ctx, TakeKakyoinToHospital, "remove_fleshbud_to_kakyoin");
                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[planeDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};

export const AnalyseHair: ActionQuest = {
    type: "action",
    id: "analyse_hair",
    completed: false,
    i18n_key: "ANALYSE_HAIR",
    emoji: "✉️",
    use: async (ctx) => {
        ctx.sendTranslated("action:ANALYSE_HAIR.SUCCESS", {
            components: [],
        });

        const quest = Functions.generateWaitQuest(
            60000 * 5,
            "p1c2:speedwagon_diohair",
            null,
            null,
            true
        );

        pushQuest(ctx, quest, "analyse_hair");
        validateQuest(ctx, "analyse_hair");

        ctx.client.database.saveUserData(ctx.userData);
    },
};

export const TakeKakyoinToHospital: ActionQuest = {
    type: "action",
    id: "take_kakyoin_to_hospital",
    completed: false,
    i18n_key: "BRING_KAKYOIN_HOSPITAL",
    emoji: "🏥",
    use: async (ctx) => {
        ctx.sendTranslated("action:BRING_KAKYOIN_HOSPITAL.SUCCESS");

        const quest = Functions.generateWaitQuest(
            60000 * 5,
            Functions.findEmail("p1c2:kakyoin_back").id,
            null,
            null,
            true
        );

        pushQuest(ctx, quest, "take_kakyoin_to_hospital");
        validateQuest(ctx, "take_kakyoin_to_hospital");

        ctx.client.database.saveUserData(ctx.userData);
    },
};

export const AlertYourGrandFatherAboutDioAndYourStand: ActionQuest = {
    type: "action",
    id: "alert_your_grandfather_about_dio_and_your_stand",
    completed: false,
    i18n_key: "TYGAD",
    emoji: "📞",
    use: async (ctx) => {
        const quest = Functions.generateWaitQuest(
            60000 * 15,
            Functions.findEmail("c2p1:grandfadioalertstand").id,
            null,
            null,
            true
        );
        pushQuest(ctx, quest, "alert_your_grandfather_about_dio_and_your_stand");
        validateQuest(ctx, "alert_your_grandfather_about_dio_and_your_stand");
        ctx.client.database.saveUserData(ctx.userData);
        ctx.sendTranslated("action:TYGAD.SUCCESS");
    },
};

export const GoToAirport: ActionQuest = {
    type: "action",
    id: "go_to_airport",
    completed: false,
    i18n_key: "GO_TO_AIRPORT",
    emoji: "🛫",
    use: async (ctx) => {
        const slowPrice = 5000;
        const fastPrice = 15000;
        const slowPriceTime = 60000 * 60 * 2;
        const fastPriceTime = (60000 * 60) / 2;
        const slowPriceID = Functions.generateRandomId();
        const fastPriceID = Functions.generateRandomId();
        const slowPriceBTN = new ButtonBuilder()
            .setCustomId(slowPriceID)
            .setLabel(slowPrice.toLocaleString("en-US"))
            .setStyle(ButtonStyle.Primary)
            .setEmoji(ctx.client.localEmojis.jocoins);
        const fastPriceBTN = new ButtonBuilder()
            .setCustomId(fastPriceID)
            .setLabel(fastPrice.toLocaleString("en-US"))
            .setStyle(ButtonStyle.Primary)
            .setEmoji(ctx.client.localEmojis.jocoins);

        await ctx.sendTranslated("action:GO_TO_AIRPORT.BASE", {
            components: [Functions.actionRow([slowPriceBTN, fastPriceBTN])],
            slowPrice: slowPrice.toLocaleString("en-US"),
        });
        ctx.interaction.fetchReply().then((m) => {
            ctx.client.database.setCooldown(
                ctx.userData.id,
                `Please finish your selection ---> ${Functions.generateMessageLink(m)}`
            );
        });

        const filter = (i: MessageComponentInteraction) => {
            return (
                (i.customId === slowPriceID || i.customId === fastPriceID) &&
                i.user.id === ctx.user.id
            );
        };

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 30000,
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            const quest = Functions.generateWaitQuest(
                i.customId === slowPriceID ? slowPriceTime : fastPriceTime,
                null,
                null,
                "GO_TO_AIRPORT"
            );
            const price = i.customId === slowPriceID ? slowPrice : fastPrice;

            if (ctx.userData.coins < price) {
                await ctx.makeMessage({
                    content:
                        "You don't have enough coins. Try claiming your daily, fighting mobs from your daily quests or selling items and try again.",
                    components: [],
                });
                collector.stop("finished");
                return;
            }
            ctx.sendTranslated(
                `action:GO_TO_AIRPORT.${i.customId === slowPriceID ? "SLOW" : "FAST"}`,
                {
                    components: [],
                }
            );
            Functions.addCoins(ctx.userData, -price);
            pushQuest(ctx, quest, "go_to_airport");
            validateQuest(ctx, "go_to_airport");
            ctx.client.database.deleteCooldown(ctx.userData.id);
            ctx.client.database.saveUserData(ctx.userData);
        });
    },
};

export const RemoveFleshbudToPolnareff: ActionQuest = {
    type: "action",
    id: "remove_fleshbud_to_polnareff",
    completed: false,
    i18n_key: "REMOVE_FLESHBUD_POLNAREFF",
    emoji: "🐛",
    use: async (ctx) => {
        const finishEmoji = "🐛";
        const map = ["🔲", "🔲", "🔲", "🔲", finishEmoji, "🔲", "🔲", "🔲", "🔲", "🔲"];
        const crashEmoji = "<:redtick:1071137546819600424>";
        for (let i = 0; i < 15; i++) {
            const howMuch = Functions.randomNumber(1, 5);
            const map2 = ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            Functions.shuffleArray(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let planeDirection = map.length - 5;
        map[planeDirection - 10] = "🔲"; // anti impossible
        let oldEmoji = "🔲";

        const backId = ctx.interaction.id + "backId";
        const centerId = ctx.interaction.id + "cennterId";
        const forwardId = ctx.interaction.id + "forwardIdShinzoSasageyooo";

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Secondary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);
        const bottomBTN = new ButtonBuilder()
            .setCustomId("bottomId")
            .setEmoji("⬇️")
            .setStyle(ButtonStyle.Secondary);

        function generateInvisibleBTN() {
            const invisibleBTN2 = new ButtonBuilder()
                .setCustomId("invisibleId" + Functions.generateRandomId())
                .setLabel("ㅤ")
                .setStyle(ButtonStyle.Secondary);
            return invisibleBTN2;
        }

        async function makeMessage(): Promise<void> {
            map[planeDirection] = "👆";
            await ctx.makeMessage({
                components: [
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        centerBTN,
                        generateInvisibleBTN(),
                    ]),
                    Functions.actionRow([backBTN, generateInvisibleBTN(), forwardBTN]),
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        bottomBTN,
                        generateInvisibleBTN(),
                    ]),
                ],
                embeds: [
                    {
                        title: "🐛 Polnareff's head",
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Remove the fleshbud.",
                        },
                        color: 0x70926c,
                    },
                ],
            });
        }

        await makeMessage();
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently removing Polnareff's fleshbud. Can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });
        const filter = async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId ||
                    i.customId === centerId ||
                    i.customId === forwardId ||
                    i.customId === "bottomId") &&
                i.user.id === ctx.user.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[planeDirection] = oldEmoji;
            if (i.customId === backId) {
                planeDirection -= 1;
            } else if (i.customId === forwardId) {
                planeDirection += 1;
            } else if (i.customId === centerId) {
                planeDirection -= 10;
            } else if (i.customId === "bottomId") {
                planeDirection += 10;
            }

            if (map[planeDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "You failed to remove the fleshbud. Try again.",
                });
            } else if (map[planeDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You succesfully removed the fleshbud.",
                });
                validateQuest(ctx, "remove_fleshbud_to_polnareff");
                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[planeDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};

export const Drive_Airplane_To_Hongkong: ActionQuest = {
    type: "action",
    id: "drive_airplane_to_hongkong",
    i18n_key: "DRIVE_AIRPLANE_TO_HONGKONG",
    emoji: "🛩",
    completed: false,
    use: async (ctx) => {
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently driving the airplaaane! Woohoo, can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });

        const finishEmoji = "🔲";
        const map = [
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
        ];
        const crashEmoji = "🪰";
        for (let i = 0; i < 18; i++) {
            const howMuch = Functions.randomNumber(2, 4);
            let map2 = ["🟦", "🟦", "🟦", "🟦", "🟦", "🟦", "🟦", "🟦", "🟦", "🟦"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            map2 = Functions.shuffle(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let planeDirection = map.length - 5;
        map[planeDirection - 10] = "🟦"; // anti impossible
        let oldEmoji = "🟦";

        const backId = Functions.generateRandomId();
        const centerId = Functions.generateRandomId();
        const forwardId = Functions.generateRandomId();

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Primary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);

        function makeMessage(): void {
            map[planeDirection] = "✈️";
            ctx.makeMessage({
                components: [Functions.actionRow([backBTN, centerBTN, forwardBTN])],
                embeds: [
                    {
                        title: "🌏 Hongkong",
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Drive the airplane to hongkong. Don't crash!",
                        },
                    },
                ],
            });
        }

        makeMessage();
        const filter = async (i: MessageComponentInteraction) => {
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId || i.customId === centerId || i.customId === forwardId) &&
                i.user.id === ctx.userData.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[planeDirection] = oldEmoji;
            if (i.customId === backId) {
                planeDirection -= 1;
            } else if (i.customId === forwardId) {
                planeDirection += 1;
            } else planeDirection -= 10;
            if (map[planeDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "💥 YOURE SO BAD YOU CRASHED THE AIRPLANE!",
                });
            } else if (map[planeDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You successfully landed in Hongkong!",
                });
                // validate quest
                validateQuest(ctx, "drive_airplane_to_hongkong");

                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[planeDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};

export const DriveBoatToRescue: ActionQuest = {
    type: "action",
    id: "drive_boat_to_rescue",
    completed: false,
    i18n_key: "DRIVE_BOAT_RESCUE",
    emoji: "🚤",
    use: async (ctx) => {
        const finishEmoji = "🚤";
        const map = ["🔲", "🔲", "🔲", "🔲", finishEmoji, "🔲", "🔲", "🔲", "🔲", "🔲"];
        const crashEmoji = "<:redtick:1071137546819600424>";
        for (let i = 0; i < 15; i++) {
            const howMuch = Functions.randomNumber(1, 5);
            const map2 = ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            Functions.shuffleArray(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let boatDirection = map.length - 5;
        map[boatDirection - 10] = "🔲"; // anti impossible
        let oldEmoji = "🔲";

        const backId = ctx.interaction.id + "backId";
        const centerId = ctx.interaction.id + "cennterId";
        const forwardId = ctx.interaction.id + "forwardIdShinzoSasageyooo";

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Secondary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);
        const bottomBTN = new ButtonBuilder()
            .setCustomId("bottomId")
            .setEmoji("⬇️")
            .setStyle(ButtonStyle.Secondary);

        function generateInvisibleBTN() {
            const invisibleBTN2 = new ButtonBuilder()
                .setCustomId("invisibleId" + Functions.generateRandomId())
                .setLabel("ㅤ")
                .setStyle(ButtonStyle.Secondary);
            return invisibleBTN2;
        }

        async function makeMessage(): Promise<void> {
            map[boatDirection] = "👆";
            await ctx.makeMessage({
                components: [
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        centerBTN,
                        generateInvisibleBTN(),
                    ]),
                    Functions.actionRow([backBTN, generateInvisibleBTN(), forwardBTN]),
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        bottomBTN,
                        generateInvisibleBTN(),
                    ]),
                ],
                embeds: [
                    {
                        title: "🚤 Boat Navigation",
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Navigate the boat to the nearest rescue boat.",
                        },
                        color: 0x3366cc,
                    },
                ],
            });
        }

        await makeMessage();
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently navigating the boat. Can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });
        const filter = async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId ||
                    i.customId === centerId ||
                    i.customId === forwardId ||
                    i.customId === "bottomId") &&
                i.user.id === ctx.user.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[boatDirection] = oldEmoji;
            if (i.customId === backId) {
                boatDirection -= 1;
            } else if (i.customId === forwardId) {
                boatDirection += 1;
            } else if (i.customId === centerId) {
                boatDirection -= 10;
            } else if (i.customId === "bottomId") {
                boatDirection += 10;
            }

            if (map[boatDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "You failed to navigate the boat. Try again.",
                });
            } else if (map[boatDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You successfully navigated the boat to the rescue boat.",
                });
                validateQuest(ctx, "drive_boat_to_rescue");
                for (let i = 0; i < 5; i++)
                    ctx.userData.chapter.quests.push(
                        Functions.pushQuest(
                            Functions.generateFightQuest(NPCs.Bandit, null, null, null)
                        )
                    );
                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[boatDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};

export const DriveBoatToSingapore: ActionQuest = {
    type: "action",
    id: "drive_boat_singapore",
    completed: false,
    i18n_key: "DRIVE_BOAT_SINGAPORE",
    emoji: "🚤",
    use: async (ctx) => {
        const finishEmoji = "⚓";
        const map = [
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
            finishEmoji,
        ];
        const crashEmoji = "<:Strength:1155080130142687323>"; //"<:redtick:1071137546819600424>";
        for (let i = 0; i < 15; i++) {
            const howMuch = Functions.randomNumber(1, 5);
            const map2 = ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            Functions.shuffleArray(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let boatDirection = map.length - 5;
        map[boatDirection - 10] = "🔲"; // anti impossible
        let oldEmoji = "🔲";

        const backId = ctx.interaction.id + "backId";
        const centerId = ctx.interaction.id + "cennterId";
        const forwardId = ctx.interaction.id + "forwardIdShinzoSasageyooo";

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Secondary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);
        const bottomBTN = new ButtonBuilder()
            .setCustomId("bottomId")
            .setEmoji("⬇️")
            .setStyle(ButtonStyle.Secondary);

        function generateInvisibleBTN() {
            const invisibleBTN2 = new ButtonBuilder()
                .setCustomId("invisibleId" + Functions.generateRandomId())
                .setLabel("ㅤ")
                .setStyle(ButtonStyle.Secondary);
            return invisibleBTN2;
        }

        async function makeMessage(): Promise<void> {
            map[boatDirection] = "👆";
            await ctx.makeMessage({
                components: [
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        centerBTN,
                        generateInvisibleBTN(),
                    ]),
                    Functions.actionRow([backBTN, generateInvisibleBTN(), forwardBTN]),
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        bottomBTN,
                        generateInvisibleBTN(),
                    ]),
                ],
                embeds: [
                    {
                        title: "🚤 Boat Navigation",
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Navigate the boat to Singapore.",
                        },
                        color: 0x3366cc,
                    },
                ],
            });
        }

        await makeMessage();
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently navigating the boat. Can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });
        const filter = async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId ||
                    i.customId === centerId ||
                    i.customId === forwardId ||
                    i.customId === "bottomId") &&
                i.user.id === ctx.user.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[boatDirection] = oldEmoji;
            if (i.customId === backId) {
                boatDirection -= 1;
            } else if (i.customId === forwardId) {
                boatDirection += 1;
            } else if (i.customId === centerId) {
                boatDirection -= 10;
            } else if (i.customId === "bottomId") {
                boatDirection += 10;
            }

            if (map[boatDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "You failed to navigate the boat. Try again.",
                });
            } else if (map[boatDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You successfully arrived to singapore.",
                });
                validateQuest(ctx, "drive_boat_singapore");
                for (let i = 0; i < 5; i++)
                    ctx.userData.chapter.quests.push(
                        Functions.pushQuest(
                            Functions.generateFightQuest(NPCs.Bandit, null, null, null)
                        )
                    );
                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[boatDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};

export const throwRubberSoulBodyToOcean: ActionQuest = {
    type: "action",
    id: "throw_rubber_soul_body_to_ocean",
    completed: false,
    i18n_key: "THROW_RUBBER_SOUL_BODY_OCEAN",
    emoji: "🌊",
    use: async (ctx) => {
        validateQuest(ctx, "throw_rubber_soul_body_to_ocean");
        // go to india
        ctx.userData.chapter.quests.push(Functions.pushQuest(getATramAndGoToIndia));
        ctx.client.database.saveUserData(ctx.userData);

        await ctx.makeMessage({
            content:
                "https://cdn.discordapp.com/attachments/940347021779427349/1178405972339855430/2023-11-26_19-39-11.gif?ex=65760715&is=65639215&hm=df54db0dec580d9d33b51ef877aecac0bf692a14708f7581d42d1d169fd97756&",
        });
        ctx.followUp({
            content:
                "You threw Rubber Soul's body to the ocean. You can now continue your journey.",
        });
    },
};

export const getATramAndGoToIndia: ActionQuest = {
    type: "action",
    id: "get_a_tram_and_go_to_india",
    completed: false,
    i18n_key: "GET_TRAM_GO_INDIA",
    emoji: "🚋",
    use: async (ctx) => {
        if (ctx.userData.coins < 100000) {
            ctx.sendTranslated("action:GET_TRAM_GO_INDIA.NO_COINS");
            return;
        }
        Functions.addCoins(ctx.userData, -100000);
        ctx.sendTranslated("action:GET_TRAM_GO_INDIA.SUCCESS");
        const quest = Functions.generateWaitQuest(60000 * 60 * 3, null, null, "GET_TRAM_GO_INDIA");
        pushQuest(ctx, quest, "get_a_tram_and_go_to_india");
        validateQuest(ctx, "get_a_tram_and_go_to_india");
        ctx.client.database.saveUserData(ctx.userData);
    },
};

export const GrabGreenBaby: ActionQuest = {
    type: "action",
    id: "grab_green_baby",
    completed: false,
    i18n_key: "GRAB_GREEN_BABY",
    emoji: Emojis.greenbaby,
    use: async (ctx) => {
        const handGrabEmoji = "🤚";
        const map = ["🔲", "🔲", "🔲", "🔲", handGrabEmoji, "🔲", "🔲", "🔲", "🔲", "🔲"];
        const crashEmoji = "<:redtick:1071137546819600424>";
        for (let i = 0; i < 15; i++) {
            const howMuch = Functions.randomNumber(1, 5);
            const map2 = ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"];
            for (let i = 0; i < howMuch; i++) {
                map2[i] = crashEmoji;
            }
            Functions.shuffleArray(map2);
            for (const i of map2) map.push(i);
        }

        function splitEvery10Array(arr: string[]) {
            const result: string[][] = [];
            for (let i = 0; i < arr.length; i += 10) {
                result.push(arr.slice(i, i + 10));
            }
            return result.map((v) => v.join(""));
        }

        let planeDirection = map.length - 5;
        map[planeDirection - 10] = "🔲"; // anti impossible
        let oldEmoji = "🔲";

        const backId = ctx.interaction.id + "backId";
        const centerId = ctx.interaction.id + "cennterId";
        const forwardId = ctx.interaction.id + "forwardIdShinzoSasageyooo";

        const backBTN = new ButtonBuilder()
            .setCustomId(backId)
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);
        const centerBTN = new ButtonBuilder()
            .setCustomId(centerId)
            .setEmoji("⬆️")
            .setStyle(ButtonStyle.Secondary);
        const forwardBTN = new ButtonBuilder()
            .setCustomId(forwardId)
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);
        const bottomBTN = new ButtonBuilder()
            .setCustomId("bottomId")
            .setEmoji("⬇️")
            .setStyle(ButtonStyle.Secondary);

        function generateInvisibleBTN() {
            const invisibleBTN2 = new ButtonBuilder()
                .setCustomId("invisibleId" + Functions.generateRandomId())
                .setLabel("ㅤ")
                .setStyle(ButtonStyle.Secondary);
            return invisibleBTN2;
        }

        async function makeMessage(): Promise<void> {
            map[planeDirection] = handGrabEmoji;
            await ctx.makeMessage({
                components: [
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        centerBTN,
                        generateInvisibleBTN(),
                    ]),
                    Functions.actionRow([backBTN, generateInvisibleBTN(), forwardBTN]),
                    Functions.actionRow([
                        generateInvisibleBTN(),
                        bottomBTN,
                        generateInvisibleBTN(),
                    ]),
                ],
                embeds: [
                    {
                        title: `${Emojis.greenbaby} Green Baby`,
                        description: splitEvery10Array(map).join("\n"),
                        footer: {
                            text: "Grab the Green Baby.",
                        },
                        color: 0x70926c,
                    },
                ],
            });
        }

        await makeMessage();
        ctx.interaction.fetchReply().then((r) => {
            ctx.client.database.setCooldown(
                ctx.user.id,
                `You're currently grabbing the Green Baby. Can't find it? Click here ---> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
            );
        });
        const filter = async (i: MessageComponentInteraction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            i.deferUpdate().catch(() => {});
            return (
                (i.customId === backId ||
                    i.customId === centerId ||
                    i.customId === forwardId ||
                    i.customId === "bottomId") &&
                i.user.id === ctx.user.id
            );
        };
        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter,
            time: 150000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
            map[planeDirection] = oldEmoji;
            if (i.customId === backId) {
                planeDirection -= 1;
            } else if (i.customId === forwardId) {
                planeDirection += 1;
            } else if (i.customId === centerId) {
                planeDirection -= 10;
            } else if (i.customId === "bottomId") {
                planeDirection += 10;
            }

            if (map[planeDirection] === crashEmoji) {
                collector.stop("crashed");
                ctx.makeMessage({
                    content: "You failed to grab the Green Baby. Try again.",
                });
            } else if (map[planeDirection] === handGrabEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You successfully grabbed the Green Baby.",
                });
                validateQuest(ctx, "grab_green_baby");
                ctx.client.database.saveUserData(ctx.userData);
            }
            oldEmoji = map[planeDirection];
            makeMessage();
        });

        collector.on("end", () => {
            ctx.client.database.deleteCooldown(ctx.userData.id);
        });
    },
};