import { ButtonStyle, ButtonBuilder, MessageComponentInteraction } from "discord.js";
import { ActionQuest, Quests, RPGUserQuest } from "../../@types";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";

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
            .setEmoji("🔽")
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
