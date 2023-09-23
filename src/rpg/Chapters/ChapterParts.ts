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
            "You and your companions board the airplane headed for Egypt. As you settle in your seats, you notice a mysterious presence on the plane. Suddenly, a massive fly with gray wings appears, and it's none other than Gray Fly, one of Dio's henchmen. He killed everyone on the plane, including the pilots. He now threatens you and your group, revealing his Stand, Tower of Gray.",
        "fr-FR":
            "Toi et tes compagnons montez à bord de l'avion à destination de l'Égypte. Alors que vous vous installez dans vos sièges, vous remarquez une présence mystérieuse dans l'avion. Soudain, une énorme mouche aux ailes grises apparaît, et c'est nul autre que Gray Fly, l'un des sbires de Dio. Il a tué tout le monde dans l'avion, y compris les pilotes. Il menace maintenant toi et ton groupe, révélant son Stand, Tower of Gray.",
        "es-ES":
            "Vos y tus compañeros abordan el avión con destino a Egipto. Mientras te acomodás en tu asiento, notás una presencia misteriosa en el avión. De repente, aparece una enorme mosca con alas grises, y no es otra que Gray Fly, uno de los secuaces de Dio. Mató a todos en el avión, incluidos los pilotos. Ahora amenaza a vos y a tu grupo, revelando su Stand, Tower of Gray.",
        "de-DE":
            "Du und deine Gefährten besteigen das Flugzeug nach Ägypten. Als du dich in deinen Sitz setzt, bemerkst du eine mysteriöse Präsenz im Flugzeug. Plötzlich erscheint eine riesige Fliege mit grauen Flügeln, und es ist niemand anderes als Gray Fly, einer von Dios Handlangern. Er hat alle im Flugzeug getötet, einschließlich der Piloten. Er bedroht dich und deine Gruppe nun und enthüllt seinen Stand, Tower of Gray."
    },
    quests: [
        Functions.generateFightQuest(NPCs.GrayFly, Functions.pushQuest(ActionQuests.Drive_Airplane_To_Hongkong), null, null),
        Functions.generateUseXCommandQuest("assault", 1),
        Functions.generateUseXCommandQuest("loot", 1)

    ],
    parent: Chapters.C2,
    private: false
};

export const C2_P3: ChapterPart = {
    id: 3.3,
    description: {
        "en-US":
            "After a turbulent flight to Hong Kong, you and your companions finally arrive at a luxurious 5-star hotel. You're hoping for some relaxation and respite, but it seems trouble follows you everywhere. As you check in and make your way to your rooms, you encounter a stylish and flamboyant man in the hotel lobby. He introduces himself as Jean Pierre Polnareff, a Stand user manipulated by Dio.",
        "fr-FR":
            "Après un vol turbulent vers Hong Kong, toi et tes compagnons arrivez enfin dans un luxueux hôtel 5 étoiles. Vous espérez vous détendre un peu, mais il semble que les ennuis vous suivent partout. Lorsque vous vous enregistrez et vous dirigez vers vos chambres, vous rencontrez un homme élégant et flamboyant dans le hall de l'hôtel. Il se présente comme Jean Pierre Polnareff, un utilisateur de Stand manipulé par Dio.",
        "es-ES":
            "Después de un vuelo turbulento a Hong Kong, tú y tus compañeros finalmente llegan a un lujoso hotel de 5 estrellas. Esperan relajarse un poco, pero parece que los problemas los persiguen en todas partes. Mientras haces el check-in y te diriges a tus habitaciones, te encuentras con un hombre elegante y llamativo en el vestíbulo del hotel. Se presenta como Jean Pierre Polnareff, un usuario de Stand manipulado por Dio.",
        "de-DE":
            "Nach einem turbulenten Flug nach Hongkong kommst du und deine Begleiter endlich in einem luxuriösen 5-Sterne-Hotel an. Ihr hofft auf etwas Entspannung, aber anscheinend folgen euch die Probleme überall hin. Während ihr eincheckt und zu euren Zimmern geht, trefft ihr in der Hotellobby auf einen stilvollen und extravaganten Mann. Er stellt sich als Jean Pierre Polnareff vor, ein Stand-Benutzer, der von Dio manipuliert wird."
    },
    quests: [
        Functions.generateFightQuest(NPCs.Polnareff, Functions.pushQuest(ActionQuests.RemoveFleshbudToPolnareff), null, null),
        Functions.generateUseXCommandQuest("assault", 1),
        Functions.generateUseXCommandQuest("loot", 1)
    ],
    parent: Chapters.C2,
    private: false
};

export const C2_P5: ChapterPart = {
    id: 3.4,
    description: {
        "en-US":
            "As the Joestar group travels from Hong Kong to Singapore by ship, they discover a stowaway child in the ship's storage. The child falls into the shark-infested ocean but is saved by Jotaro's Stand, Star Platinum. They rescue the girl, realizing she is not affiliated with Dio. However, the ship's captain is revealed to be an impostor and a Stand user...", // During the confrontation, the ship is sabotaged with explosives. The group and the crew escape on emergency boats and spot a massive freighter on the horizon.
        "fr-FR":
            "Alors que le groupe Joestar voyage de Hong Kong à Singapour en bateau, ils découvrent un enfant clandestin dans la cale du navire. L'enfant tombe dans l'océan infesté de requins mais est sauvé par le Stand de Jotaro, Star Platinum. Ils sauvent la fille, se rendant compte qu'elle n'est pas affiliée à Dio. Cependant, le capitaine du navire est révélé comme un imposteur et un utilisateur de Stand...", // Au cours de la confrontation, le navire est saboté avec des explosifs. Le groupe et l'équipage s'échappent sur des bateaux de secours et aperçoivent un cargo massif à l'horizon.
        "es-ES":
            "Mientras el grupo Joestar viaja de Hong Kong a Singapur en barco, descubren a un niño clandestino en el almacén del barco. El niño cae al océano infestado de tiburones pero es salvado por el Stand de Jotaro, Star Platinum. Rescatan a la niña, dándose cuenta de que no está afiliada a Dio. Sin embargo, el capitán del barco resulta ser un impostor y un usuario de Stand...", // Durante el enfrentamiento, el barco es saboteado con explosivos. El grupo y la tripulación escapan en botes de emergencia y ven un carguero masivo en el horizonte.
        "de-DE":
            "Während die Joestar-Gruppe von Hongkong nach Singapur reist, entdecken sie ein Kind in der Schiffslagerung. Das Kind fällt in den von Haien verseuchten Ozean, wird aber von Jotaros Stand, Star Platinum, gerettet. Sie retten das Mädchen und erkennen, dass sie nicht mit Dio verbunden ist. Der Kapitän des Schiffes entpuppt sich jedoch als Betrüger und Stand-Benutzer..." // Während der Konfrontation wird das Schiff mit Sprengstoff sabotiert. Die Gruppe und die Besatzung fliehen auf Rettungsboote und entdecken einen massiven Frachter am Horizont.
    },
    quests: [
        Functions.generateFightQuest(NPCs.CaptainTennilleImpostor, Functions.pushQuest(ActionQuests.DriveBoatToRescue), null, null)

    ],
    parent: Chapters.C2,
    private: false,
    rewardsWhenComplete: {
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3
            }
        ]
    }
};

export const C2_P6: ChapterPart = {
    id: 3.5,
    description: {
        "en-US":
            "After the intense confrontation with the impostor captain and the explosive sabotage of the ship, the Joestar group manages to escape on emergency boats. As they drift in the open sea, their relief is short-lived as they spot an unusual presence on the rescue boat—the Stand user controlling 'Strength,' the Stand that took the form of an orangutan on the freighter. A battle ensues as they face this new Stand threat.",
        "fr-FR":
            "Après l'intense confrontation avec le capitaine imposteur et le sabotage explosif du navire, le groupe Joestar parvient à s'échapper sur des bateaux de secours. Alors qu'ils dérivent en pleine mer, leur soulagement est de courte durée car ils repèrent une présence inhabituelle sur le bateau de secours : l'utilisateur de Stand contrôlant 'Strength,' le Stand qui avait pris la forme d'un orang-outan sur le cargo. S'ensuit un combat alors qu'ils font face à cette nouvelle menace de Stand.",
        "es-ES":
            "Después de la intensa confrontación con el capitán impostor y el sabotaje explosivo del barco, el grupo Joestar logra escapar en botes de emergencia. Mientras derivan en el mar abierto, su alivio es efímero ya que detectan una presencia inusual en el bote de rescate: el usuario de Stand que controla 'Strength,' el Stand que tomó la forma de un orangután en el carguero. Se desata una batalla mientras enfrentan esta nueva amenaza de Stand.",
        "de-DE":
            "Nach der intensiven Konfrontation mit dem falschen Kapitän und der explosiven Sabotage des Schiffes gelingt es der Joestar-Gruppe, auf Rettungsbooten zu entkommen. Während sie in der offenen See treiben, ist ihre Erleichterung nur von kurzer Dauer, da sie eine ungewöhnliche Präsenz auf dem Rettungsboot bemerken - den Benutzer von 'Strength,' dem Stand, der die Form eines Orang-Utans auf dem Frachtschiff angenommen hatte. Es bricht ein Kampf aus, als sie dieser neuen Stand-Bedrohung gegenüberstehen."
    },
    quests: [
        Functions.generateFightQuest(NPCs.Forever, Functions.pushQuest(ActionQuests.DriveBoatToSingapore), null, null)
    ],
    parent: Chapters.C2,
    private: false
};

// next chapter: defeat ebony devil
/*
export const C2_P7: ChapterPart = {
    id: 3.6,
    description: {
        "en-US":
            ""
    },
    quests: [
        //Functions.generateFightQuest(NPCs.Forever, Functions.pushQuest(ActionQuests.DriveBoatToSingapore), null, null)
    ],
    parent: Chapters.C2,
    private: false
};
*/


/*
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
};*/

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

/*
export const C2_P3: ChapterPart = {
    id: 3.3,
    description: {
        "en-US": "After defeating Polnareff, you return to the hotel you were staying in with him, you realize that Devo is in a refrigerator. You think he is easily defeated, you don't remember him anymore. Later, you are attacked by a stand, you lose your precision because of lack of vision on the stand user, you try to defeat him",
        "fr-FR": "Après avoir vaincu Polnareff, tu retournes à l'hôtel où tu étais avec lui, tu te rends compte que Devo est dans un réfrigérateur. Tu penses qu'il est facilement vaincu, tu ne te souviens plus de lui. Plus tard, tu es attaqué par un stand, tu perds ta précision à cause du manque de vision sur l'utilisateur de stand, tu essayes de le vaincre",
        "es-ES": "Después de derrotar a Polnareff, regresas al hotel donde estabas con él, te das cuenta de que Devo está en un refrigerador. Crees que es fácilmente derrotado, ya no lo recuerdas. Más tarde, eres atacado por un stand, pierdes tu precisión por falta de visión sobre el usuario de stand, intentas derrotarlo",
        "de-DE": "Nachdem du Polnareff besiegt hast, kehrst du in das Hotel zurück, in dem du mit ihm warst, du stellst fest, dass Devo in einem Kühlschrank ist. Du denkst, er ist leicht besiegt, du erinnerst dich nicht mehr an ihn. Später wirst du von einem Stand angegriffen, du verlierst deine Präzision wegen mangelnder Sicht auf den Stand-Benutzer, du versuchst, ihn zu besiegen"
    },
    quests: [
        ActionQuests.RemoveFleshbudToPolnareff
        // Attack devo
    ],
    parent: Chapters.C2,
    private: false
};*/