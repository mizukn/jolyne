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

        function makeMessage(): void {
            map[planeDirection] = "👆";
            ctx.makeMessage({
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
        makeMessage();
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
    id: "analyse_hair",
    completed: false,
    i18n_key: "ANALYSE_HAIR",
    emoji: "✉️",
    use: async (ctx) => {
        ctx.sendTranslated("action:ANALYSE_HAIR.SUCCESS", {
            components: [],
        });

        const quest = Functions.generateWaitQuest(60000 * 5, "p1c2:speedwagon_diohair");

        pushQuest(ctx, quest, "analyse_hair");
        validateQuest(ctx, "analyse_hair");

        ctx.client.database.saveUserData(ctx.userData);
    },
};

export const TakeKakyoinToHospital: ActionQuest = {
    id: "take_kakyoin_to_hospital",
    completed: false,
    i18n_key: "BRING_KAKYOIN_HOSPITAL",
    emoji: "🏥",
    use: async (ctx) => {
        if (ctx.userData.coins < 2500) {
            await ctx.sendTranslated("action:BRING_KAKYOIN_HOSPITAL.MONEY");
            ctx.followUp({
                content:
                    "You need 2,500 coins to do this. Try claiming your daily, fighting mobs from your daily quests or selling items.",
                ephemeral: true,
            });
            return;
        }
        ctx.userData.coins -= 5000;
        ctx.sendTranslated("action:BRING_KAKYOIN_HOSPITAL.SUCCESS");

        const quest = Functions.generateWaitQuest(
            60000 * 5,
            "p1c1:kakyoin_back",
            null,
            "WAIT_KAKYOIN_BACK"
        );

        pushQuest(ctx, quest, "take_kakyoin_to_hospital");
        validateQuest(ctx, "take_kakyoin_to_hospital");

        ctx.client.database.saveUserData(ctx.userData);
    },
};
