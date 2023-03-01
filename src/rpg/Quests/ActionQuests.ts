import { ButtonStyle, ButtonBuilder, MessageComponentInteraction } from "discord.js";
import { ActionQuest } from "../../@types";
import * as Functions from "../../utils/Functions";

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
        const invisibleBTN = new ButtonBuilder()
            .setCustomId("invisibleId")
            .setLabel("ㅤ")
            .setStyle(ButtonStyle.Secondary);
        const invisibleBTN2 = new ButtonBuilder()
            .setCustomId("invisibleId2")
            .setLabel("ㅤ")
            .setStyle(ButtonStyle.Secondary);

        function makeMessage(): void {
            map[planeDirection] = "👆";
            ctx.makeMessage({
                components: [
                    Functions.actionRow([backBTN, centerBTN, forwardBTN]),
                    Functions.actionRow([invisibleBTN, bottomBTN, invisibleBTN2]),
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
                    content: "You failed to remove the fleshbud. Try again later.",
                });
            } else if (map[planeDirection] === finishEmoji) {
                collector.stop("finished");
                ctx.makeMessage({
                    content: "You succesfully removed the fleshbud.",
                });
                // validate quest
                if (ctx.userData.chapter.quests.find((v) => v.id === "remove_fleshbud_to_kakyoin"))
                    ctx.userData.chapter.quests.find(
                        (v) => v.id === "remove_fleshbud_to_kakyoin"
                    ).completed = true;
            }
            oldEmoji = map[planeDirection];
            makeMessage();
        });

        collector.on("end", () => {
            //ctx.client.database.delCooldownCache("cooldown", userData.id);
        });
    },
};
