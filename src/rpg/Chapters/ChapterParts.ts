import { Chapter, ChapterPart } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../NPCs/NPCs";
import * as Chapters from "./Chapters";
import * as Quests from "../Quests/Quests";
import * as ActionQuests from "../Quests/ActionQuests";

export const C1_P2: ChapterPart = {
    id: 2,
    description: {
        "en-US":
            "You finally beat Kakyoin. You notice a strange creature on his head, you conclude that it is because of this creature that he is manipulated. On his back, you also find some yellow hairs...",
        "fr-FR":
            "Tu as vaincu Kakyoin. Tu remarques une créature étrange sur sa tête, tu conclues que c'est parce que cette créature qu'il est manipulé. Sur son dos, tu trouves aussi des poils jaune...",
        "es-ES":
            "Has derrotado a Kakyoin. Te notas una criatura extraña en su cabeza, concluyes que es por esta criatura que él es manipulado. En su espalda, también encontrás algunos pelos amarillos...",
        "de-DE":
            "Du hast Kakyoin besiegt. Du siehst ein seltsames Wesen auf seinem Kopf, du weisst, dass es durch dieses Wesen ist manipuliert. Auf seinem Rücken, auch auf seinen Hüften, du findest auch einige gelbe Haare...",
    },
    quests: [
        ActionQuests.RemoveFleshbudToKakyoin,
        ActionQuests.AnalyseHair,
        Functions.generateClaimItemQuest("pizza", 2),
    ],
    parent: Chapters.C1,
    private: false,
};
