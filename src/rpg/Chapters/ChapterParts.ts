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
            "Du hast Kakyoin besiegt. Du siehst ein seltsames Wesen auf seinem Kopf, du weisst, dass es durch dieses Wesen ist manipuliert. Auf seinem Rücken, auch auf seinen Hüften, du findest auch einige gelbe Haare..."
    },
    quests: [
        ActionQuests.RemoveFleshbudToKakyoin,
        ActionQuests.AnalyseHair,
        Functions.generateClaimItemQuest(Functions.findItem("pizza").id, 2),
        Functions.generateClaimItemQuest(Functions.findItem("cola").id, 2)
    ],
    parent: Chapters.C1,
    private: false,
    hints: (ctx) => [
        `You can claim some pizzas and colas by using the ${ctx.client.getSlashCommandMention(
            "shop"
        )} command!`
    ]
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
            "Nachdem du den Dieb besiegt hast, gehst du weiter zum Haus von Jotaro und du siehst deinen Klassenkameraden, Noriaki Kakyoin, er sieht dich mit einem leeren Ausdruck an und einige grüne Tentakel fliegen auf dich zu, dein Stand blockiert es, du bereitest dich auf den Kampf vor..."
    },
    quests: [
        Functions.generateFightQuest(NPCs.Kakyoin, null, null, [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 5
            },
            {
                item: Functions.findItem("Box").id,
                amount: 1
            }
        ]),
        Functions.generateUseXCommandQuest("loot", 1),
        Functions.generateUseXCommandQuest("assault", 1)
    ],
    parent: Chapters.C1,
    private: false
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
            "Du betrittst den Flughafen und triffst Mohammed Avdol. Du hast auch deinen Großvater und deinen Freund Kakyoin wieder gesehen. Du bist jetzt bereit, nach Ägypten zu gehen, um DIO zu finden und zu besiegen."
    },
    quests: [
        Functions.generateFightQuest(NPCs.SecurityGuard, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1
            }
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
        Functions.generateUseXCommandQuest("assault", 1)
    ],
    parent: Chapters.C2,
    private: false
};

export const C2_P2: ChapterPart = {
    id: 3.2,
    description: {
        "en-US":
            "As you and your recently acquired friends continue their journey, you are attacked by yet another stand user. The swordsman challenges you, after he managed to beat your friends. He says that if you win, he won't kill them.",
        "fr-FR":
            "Alors que toi et tes amis récemment acquis continuez votre voyage, vous êtes attaqués par un autre utilisateur de stand. Le bretteur vous défie, après avoir réussi à battre vos amis. Il dit que si vous gagnez, il ne les tuera pas.",
        "es-ES":
            "Mientras vos y tus amigos recientemente adquiridos continúan su viaje, son atacados por otro usuario de stand. El espadachín te desafía, después de haber logrado vencer a tus amigos. Él dice que si ganás, no los matará.",
        "de-DE":
            "Während du und deine kürzlich erworbenen Freunde ihre Reise fortsetzen, werdet ihr von einem weiteren Stand-Benutzer angegriffen. Der Schwertkämpfer fordert dich heraus, nachdem er es geschafft hat, deine Freunde zu schlagen. Er sagt, dass er sie nicht töten wird, wenn du gewinnst."
    },
    quests: [
        Functions.generateFightQuest(NPCs.Polnareff, null, null, [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2
            },
            {
                item: Functions.findItem("Money Box").id,
                amount: 1
            }
        ]),
        Functions.generateClaimXQuest("xp", 5000)
    ],
    parent: Chapters.C2,
    private: false
};

/*
export const C2_P3: ChapterPart = {
    id: 3.3,
    description: {
        "en-US":
            "As you and your recently acquired friends continue their journey, you are attacked by yet another stand user. The swordsman challenges you, after he managed to beat your friends. He says that if you win, he won't kill them.",
        "fr-FR":
            "Alors que toi et tes amis récemment acquis continuez votre voyage, vous êtes attaqués par un autre utilisateur de stand. Le bretteur vous défie, après avoir réussi à battre vos amis. Il dit que si vous gagnez, il ne les tuera pas.",
        "es-ES":
            "Mientras vos y tus amigos recientemente adquiridos continúan su viaje, son atacados por otro usuario de stand. El espadachín te desafía, después de haber logrado vencer a tus amigos. Él dice que si ganás, no los matará.",
        "de-DE":
            "Während du und deine kürzlich erworbenen Freunde ihre Reise fortsetzen, werdet ihr von einem weiteren Stand-Benutzer angegriffen. Der Schwertkämpfer fordert dich heraus, nachdem er es geschafft hat, deine Freunde zu schlagen. Er sagt, dass er sie nicht töten wird, wenn du gewinnst.",
    },
    quests: [
        Functions.generateFightQuest(NPCs.Polnareff, null, null, [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 2,
            },
            {
                item: Functions.findItem("Money Box").id,
                amount: 1,
            },
        ]),
        Functions.generateClaimXQuest("xp", 5000),
    ],
    parent: Chapters.C2,
    private: false,
};

export const C2_P4: ChapterPart = {
    id: 3.4,
    description: {
        "en-US":
            "After defeating Devo, you tell Polnareff that you must join your friends in the airplane. Polnareff accepts to follow you and becomes your companion. You go together in the airplane, and you find your companions. The journey goes well, until the appearance of an invincible fly and who dodges every attacks. This fly was in fact a stand that killed all the passengers, including the pilots.",
        "fr-FR":
            "Après avoir vaincu Devo, tu dis à Polnareff que tu dois rejoindre tes amis dans l'avion. Polnareff accepte de te suivre et devient ton compagnon. Vous allez ensemble dans l'avion, et vous retrouvez vos compagnons. Le voyage se passe bien, jusqu'à l'apparition d'une mouche invincible et qui esquive toutes les attaques. Cette mouche était en fait un stand qui a tué tous les passagers, y compris les pilotes.",
        "es-ES":
            "Después de derrotar a Devo, le decís a Polnareff que debés unirte a tus amigos en el avión. Polnareff acepta seguirte y se convierte en tu compañero. Van juntos en el avión, y encuentran a sus compañeros. El viaje va bien, hasta la aparición de una mosca invencible y que esquiva todos los ataques. Esta mosca era en realidad un stand que mató a todos los pasajeros, incluidos los pilotos.",
        "de-DE":
            "Nachdem du Devo besiegt hast, sagst du Polnareff, dass du dich deinen Freunden im Flugzeug anschließen musst. Polnareff akzeptiert es, dir zu folgen und wird dein Begleiter. Ihr geht zusammen in das Flugzeug, und ihr findet eure Gefährten. Die Reise verläuft gut, bis zum Auftauchen einer unbesiegbaren Fliege, die allen Angriffen ausweicht. Diese Fliege war in der Tat ein Stand, der alle Passagiere, einschließlich der Piloten, tötete.",
    },
    quests: [],
    parent: Chapters.C2,
    private: false,
};
*/