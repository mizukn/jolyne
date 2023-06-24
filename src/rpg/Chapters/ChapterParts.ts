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
        Functions.generateClaimItemQuest(Functions.findItem("pizza").id, 2),
        Functions.generateClaimItemQuest(Functions.findItem("cola").id, 2),
    ],
    parent: Chapters.C1,
    private: false,
    hints: (ctx) => [
        `You can claim some pizzas and colas by using the ${ctx.client.getSlashCommandMention(
            "shop"
        )} command!`,
    ],
};

export const C1_P2L: ChapterPart = {
    id: 1.1,
    description: {
        "en-US":
            "After you’ve beaten the hell out of that Thief you continue walking to Jotaro’s House and you see your fellow classmate, Noriaki Kakyoin, he looks at you with a blank expression and some green tentacles fly at you, your stand blocks it, you prepare to fight…",
        "fr-FR":
            "Après avoir battu le voleur, tu continues à marcher vers la maison de Jotaro et tu vois ton camarade de classe, Noriaki Kakyoin, il te regarde avec une expression vide et des tentacules vertes volent vers toi, ton stand le bloque, tu te prépares à combattre...",
        "es-ES":
            "Después de haber derrotado al ladrón, sigues caminando hacia la casa de Jotaro y ves a tu compañero de clase, Noriaki Kakyoin, te mira con una expresión vacía y unos tentáculos verdes vuelan hacia ti, tu stand lo bloquea, te preparas para luchar...",
        "de-DE":
            "Nachdem du den Dieb besiegt hast, gehst du weiter zum Haus von Jotaro und du siehst deinen Klassenkameraden, Noriaki Kakyoin, er sieht dich mit einem leeren Ausdruck an und einige grüne Tentakel fliegen auf dich zu, dein Stand blockiert es, du bereitest dich auf den Kampf vor...",
    },
    quests: [
        Functions.generateFightQuest(NPCs.Kakyoin, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1,
            },
        ]),
        Functions.generateUseXCommandQuest("loot", 1),
        Functions.generateUseXCommandQuest("assault", 1),
    ],
    parent: Chapters.C1,
    private: false,
};

export const C2_P1: ChapterPart = {
    id: 3.1,
    description: {
        "en-US":
            "You enter the airport and meet Mohammed Avdol. You also saw your grandfather and your friend Kakyoin again. You are now ready to go to Egypt to find and defeat DIO.",
        "fr-FR":
            "Tu entres dans l'aéroport et rencontres Mohammed Avdol. Tu as aussi revu ton grand-père et ton ami Kakyoin. Tu es maintenant prêt à aller en Égypte pour trouver et vaincre DIO.",
        "es-ES":
            "Entrás en el aeropuerto y conocés a Mohammed Avdol. También viste a tu abuelo y a tu amigo Kakyoin de nuevo. Ahora estás listo para ir a Egipto para encontrar y derrotar a DIO.",
        "de-DE":
            "Du betrittst den Flughafen und triffst Mohammed Avdol. Du hast auch deinen Großvater und deinen Freund Kakyoin wieder gesehen. Du bist jetzt bereit, nach Ägypten zu gehen, um DIO zu finden und zu besiegen.",
    },
    quests: [
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1,
            },
        ]),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, null),
        Functions.generateUseXCommandQuest("loot", 1),
        Functions.generateUseXCommandQuest("assault", 1),
    ],
    parent: Chapters.C2,
    private: false,
};
