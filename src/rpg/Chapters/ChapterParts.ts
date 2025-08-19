import { Chapter, ChapterPart } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../NPCs/FightableNPCs";
import * as Chapters from "./Chapters";
import * as Quests from "../Quests/Quests";
import * as ActionQuests from "../Quests/ActionQuests";
import * as Raids from "../Raids";
import { generateStartDungeonQuest } from "../../utils/Functions";

/**
 *         "en-US": "The beginning of a mysterious journey",
 "fr-FR": "Le début d'un voyage mystérieux",
 "es-ES": "El comienzo de un viaje misterioso",
 "pt-BR": "O começo de uma jornada misteriosa",
 "ru-RU": "Начало таинственного путешествия",
 "ja-JP": "不思議な旅の始まり",
 "ko-KR": "신비한 여행의 시작",
 "zh-CN": "神秘旅程的开始",
 "zh-TW": "神秘旅程的開始",
 "it-IT": "L'inizio di un viaggio misterioso",
 */

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
        "pt-BR":
            "Você finalmente venceu Kakyoin. Você nota uma criatura estranha em sua cabeça, você conclui que é por causa dessa criatura que ele é manipulado. Em suas costas, você também encontra alguns pelos amarelos...",
        "ru-RU":
            "Вы наконец победили Какёйна. Вы замечаете странное существо на его голове, вы заключаете, что именно из-за этого существа он манипулируется. На его спине вы также находите некоторые желтые волосы...",
        "ja-JP":
            "あなたはついにカキヨインを倒しました。あなたは彼が操られているのはこの生き物のせいだと結論付けます。彼の背中には、あなたはまたいくつかの黄色の髪を見つけます...",
        "ko-KR":
            "당신은 마침내 카키요인을 이겼습니다. 당신은 그가 이 생물 때문에 조종되고 있다고 결론을 내립니다. 그의 등에는 또한 몇 가닥의 노란색 머리카락을 발견합니다...",
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
        "pt-BR":
            "Depois de ter batido no ladrão, você continua andando até a casa de Jotaro e vê seu colega de classe, Noriaki Kakyoin, ele olha para você com uma expressão vazia e alguns tentáculos verdes voam em sua direção, seu stand bloqueia, você se prepara para lutar...",
        "ru-RU":
            "После того, как вы избили вора, вы продолжаете идти к дому Джотаро, и вы видите своего одноклассника, Нориаки Какёйна, он смотрит на вас с пустым выражением, и на вас летят зеленые щупальца, ваш стенд блокирует его, вы готовитесь к бою...",
        "ja-JP":
            "泥棒を殴り飛ばした後、あなたはジョセフの家に向かって歩き続け、あなたの同級生、花京院典明を見ます。彼は空白の表情であなたを見つめ、緑色の触手があなたに飛んできます。あなたのスタンドはそれをブロックし、あなたは戦う準備をします...",
        "ko-KR":
            "도둑을 때려잡은 후, 당신은 조타로의 집으로 걸어가는 동안 동급생인 카키요인 노리아키를 보게됩니다. 그는 당신을 빈 표정으로 쳐다보고 있으며, 녹색 촉수가 당신을 향해 날아옵니다. 당신의 스탠드는 그것을 막고, 당신은 싸울 준비를 합니다...",
    },
    quests: [
        Functions.generateFightQuest(NPCs.Kakyoin, null, null, [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 5,
            },
            {
                item: Functions.findItem("Box").id,
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
        "pt-BR":
            "Você entra no aeroporto e encontra Mohammed Avdol. Você também viu seu avô e seu amigo Kakyoin novamente. Agora você está pronto para ir ao Egito para encontrar e derrotar DIO.",
        "ru-RU":
            "Вы входите в аэропорт и встречаете Мохаммеда Авдола. Вы также снова видели своего дедушку и друга Какёйна. Теперь вы готовы отправиться в Египет, чтобы найти и победить ДИО.",
        "ja-JP":
            "あなたは空港に入り、モハメド・アヴドゥルに会います。あなたはまた、あなたの祖父とあなたの友人カキヨインに会いました。あなたは今、エジプトに行ってDIOを見つけて倒す準備ができています。",
        "ko-KR":
            "당신은 공항에 들어가 모하메드 아브돌을 만납니다. 당신은 또한 당신의 할아버지와 당신의 친구 카키요인을 다시 봤습니다. 이제 당신은 이집트로 가서 디오를 찾고 물리칠 준비가 되었습니다.",
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
            "Du und deine Gefährten besteigen das Flugzeug nach Ägypten. Als du dich in deinen Sitz setzt, bemerkst du eine mysteriöse Präsenz im Flugzeug. Plötzlich erscheint eine riesige Fliege mit grauen Flügeln, und es ist niemand anderes als Gray Fly, einer von Dios Handlangern. Er hat alle im Flugzeug getötet, einschließlich der Piloten. Er bedroht dich und deine Gruppe nun und enthüllt seinen Stand, Tower of Gray.",
        "pt-BR":
            "Você e seus companheiros embarcam no avião com destino ao Egito. Enquanto você se acomoda em seu assento, você nota uma presença misteriosa no avião. De repente, uma enorme mosca com asas cinzas aparece, e não é ninguém menos que Gray Fly, um dos capangas de Dio. Ele matou todos no avião, incluindo os pilotos. Ele agora ameaça você e seu grupo, revelando seu Stand, Tower of Gray.",
        "ru-RU":
            "Вы и ваши спутники отправляетесь в самолет с направлением в Египет. Когда вы устраиваетесь на своих местах, вы замечаете таинственное присутствие в самолете. Внезапно появляется огромная муха с серыми крыльями, и это никто иной, как Грей Флай, один из приспешников Дио. Он убил всех в самолете, включая пилотов. Теперь он угрожает вам и вашей группе, раскрывая свой стенд, Башня Серого.",
        "ja-JP":
            "あなたと仲間たちはエジプト行きの飛行機に乗り込みます。あなたが座席に落ち着くと、飛行機の中に不気味な存在を感じます。突然、灰色の翼を持つ巨大なハエが現れ、それはDIOの手下の1人であるグレイ・フライでした。パイロットを含む飛行機の中の全員を殺しました。彼は今、あなたとあなたのグループを脅し、彼のスタンド、タワー・オブ・グレイを明らかにします。",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.GrayFly,
            Functions.pushQuest(ActionQuests.Drive_Airplane_To_Hongkong),
            null,
            null
        ),
        Functions.generateUseXCommandQuest("assault", 1),
        Functions.generateUseXCommandQuest("loot", 1),
    ],
    parent: Chapters.C2,
    private: false,
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
            "Nach einem turbulenten Flug nach Hongkong kommst du und deine Begleiter endlich in einem luxuriösen 5-Sterne-Hotel an. Ihr hofft auf etwas Entspannung, aber anscheinend folgen euch die Probleme überall hin. Während ihr eincheckt und zu euren Zimmern geht, trefft ihr in der Hotellobby auf einen stilvollen und extravaganten Mann. Er stellt sich als Jean Pierre Polnareff vor, ein Stand-Benutzer, der von Dio manipuliert wird.",
        "pt-BR":
            "Depois de um voo turbulento para Hong Kong, você e seus companheiros finalmente chegam a um luxuoso hotel 5 estrelas. Você espera um pouco de relaxamento, mas parece que os problemas o seguem por toda parte. Ao fazer o check-in e ir para seus quartos, você encontra um homem elegante e extravagante no saguão do hotel. Ele se apresenta como Jean Pierre Polnareff, um usuário de Stand manipulado por Dio.",
        "ru-RU":
            "После бурного полета в Гонконг вы и ваши спутники наконец прибываете в роскошный 5-звездочный отель. Вы надеетесь на немного расслабления, но кажется, что проблемы следуют за вами повсюду. Когда вы регистрируетесь и направляетесь в свои номера, вы встречаете стильного и экстравагантного мужчину в холле отеля. Он представляется Жаном Пьером Польнарефом, пользователем стенда, управляемым Дио.",
        "ja-JP":
            "香港への荒れた飛行の後、あなたと仲間たちはついに高級な5つ星ホテルに到着します。あなたは少しリラックスしたいと思っていますが、問題はどこにでもついてきます。チェックインし、部屋に向かう途中で、ホテルのロビーでスタイリッシュで派手な男性に出会います。彼はジャン・ピエール・ポルナレフと名乗り、DIOに操られたスタンドユーザーです。",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.Polnareff,
            Functions.pushQuest(ActionQuests.RemoveFleshbudToPolnareff),
            null,
            null
        ),
        Functions.generateUseXCommandQuest("assault", 1),
        Functions.generateUseXCommandQuest("loot", 1),
    ],
    parent: Chapters.C2,
    private: false,
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
            "Während die Joestar-Gruppe von Hongkong nach Singapur reist, entdecken sie ein Kind in der Schiffslagerung. Das Kind fällt in den von Haien verseuchten Ozean, wird aber von Jotaros Stand, Star Platinum, gerettet. Sie retten das Mädchen und erkennen, dass sie nicht mit Dio verbunden ist. Der Kapitän des Schiffes entpuppt sich jedoch als Betrüger und Stand-Benutzer...", // Während der Konfrontation wird das Schiff mit Sprengstoff sabotiert. Die Gruppe und die Besatzung fliehen auf Rettungsboote und entdecken einen massiven Frachter am Horizont.
        "pt-BR":
            "Enquanto o grupo Joestar viaja de Hong Kong para Singapura de navio, eles descobrem uma criança clandestina no depósito do navio. A criança cai no oceano infestado de tubarões, mas é salva pelo Stand de Jotaro, Star Platinum. Eles resgatam a garota, percebendo que ela não está afiliada a Dio. No entanto, o capitão do navio é revelado como um impostor e um usuário de Stand...", // Durante o confronto, o navio é sabotado com explosivos. O grupo e a tripulação escapam em botes de emergência e avistam um cargueiro massivo no horizonte.
        "ru-RU":
            "Когда группа ДжоДжо путешествует из Гонконга в Сингапур на корабле, они обнаруживают нелегального ребенка в трюме корабля. Ребенок падает в океан, полный акул, но спасается стендом Джотаро, Звездным Платинумом. Они спасают девочку, понимая, что она не связана с Дио. Однако капитан корабля оказывается поддельным и пользователем стенда...", // Во время столкновения корабль подрывается взрывчаткой. Группа и команда спасаются на аварийных лодках и видят на горизонте огромный грузовой корабль.
        "ja-JP":
            "ジョースター一行は香港からシンガポールへ船で旅をしていると、船倉に密航した子供を発見します。子供はサメのいる海に落ちますが、ジョセフのスタンド、スタープラチナによって助けられます。彼らは少女を救出し、彼女がDIOとは関係がないことに気づきます。しかし、船長は偽者であり、スタンドユーザーであることが判明します...", // 対決中、船は爆発物で破壊されます。グループと乗組員は非常用ボートで脱出し、地平線に巨大な貨物船を見つけます。
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.CaptainTennilleImpostor,
            Functions.pushQuest(ActionQuests.DriveBoatToRescue),
            null,
            null
        ),
    ],
    parent: Chapters.C2,
    private: false,
    rewardsWhenComplete: {
        items: [
            {
                item: Functions.findItem("Stand Arrow").id,
                amount: 3,
            },
        ],
    },
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
            "Nach der intensiven Konfrontation mit dem falschen Kapitän und der explosiven Sabotage des Schiffes gelingt es der Joestar-Gruppe, auf Rettungsbooten zu entkommen. Während sie in der offenen See treiben, ist ihre Erleichterung nur von kurzer Dauer, da sie eine ungewöhnliche Präsenz auf dem Rettungsboot bemerken - den Benutzer von 'Strength,' dem Stand, der die Form eines Orang-Utans auf dem Frachtschiff angenommen hatte. Es bricht ein Kampf aus, als sie dieser neuen Stand-Bedrohung gegenüberstehen.",
        "pt-BR":
            "Após a intensa confrontação com o capitão impostor e o sabotagem explosiva do navio, o grupo Joestar consegue escapar em botes de emergência. Enquanto eles derivam no mar aberto, seu alívio é de curta duração, pois eles avistam uma presença incomum no barco de resgate: o usuário de Stand que controla 'Strength', o Stand que assumiu a forma de um orangotango no cargueiro. Uma batalha se segue quando eles enfrentam essa nova ameaça de Stand.",
        "ru-RU":
            "После интенсивной конфронтации с поддельным капитаном и взрывного саботажа корабля группе ДжоДжо удается сбежать на аварийных лодках. Пока они дрейфуют в открытом море, их облегчение недолговечно, поскольку они замечают необычное присутствие на спасательной лодке - пользователя стенда, контролирующего 'Силу', стенд, который принял форму орангутана на грузовом судне. Следует битва, когда они сталкиваются с этой новой угрозой стенда.",
        "ja-JP":
            "偽の船長と船の爆破工作との激しい対決の後、ジョースター一行は非常ボートで脱出に成功します。彼らが開けた海で漂流している間、彼らの安心は短命です。救助ボートにいるスタンドユーザーを発見します。彼は貨物船でオランウータンの姿をしたスタンド、'ストレングス'を操っています。彼らはこの新しいスタンドの脅威に直面すると、戦いが始まります。",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.Forever,
            Functions.pushQuest(ActionQuests.DriveBoatToSingapore),
            null,
            null
        ),
    ],
    parent: Chapters.C2,
    private: false,
};

// next chapter: defeat ebony devil

/**
 * Jotaro and crew get to Singapore and once they get to their hotel, they seperate. However, Soul Sacrifice was waiting for Polnareff in his room. Polnareff falls for the trap that Soul Sacrifice's Stand, Ebony Devil, had set for him. Does Polnareff have a chance of defeating an enemy he can't see?
 */

export const C2_P7: ChapterPart = {
    id: 3.6,
    description: {
        "en-US":
            "Jotaro and crew get to Singapore and once they get to their hotel, they seperate. However, Soul Sacrifice was waiting for Polnareff in his room. Polnareff falls for the trap that Soul Sacrifice's Stand, Ebony Devil, had set for him...",
        "fr-FR":
            "Jotaro et son équipage arrivent à Singapour et une fois arrivés à leur hôtel, ils se séparent. Cependant, Soul Sacrifice attendait Polnareff dans sa chambre. Polnareff tombe dans le piège que le Stand de Soul Sacrifice, Ebony Devil, lui avait tendu...",
        "es-ES":
            "Jotaro y su tripulación llegan a Singapur y una vez que llegan a su hotel, se separan. Sin embargo, Soul Sacrifice estaba esperando a Polnareff en su habitación. Polnareff cae en la trampa que el Stand de Soul Sacrifice, Ebony Devil, le había preparado...",
        "de-DE":
            "Jotaro und seine Crew kommen in Singapur an und sobald sie in ihrem Hotel ankommen, trennen sie sich. Soul Sacrifice wartete jedoch in Polnareffs Zimmer. Polnareff fällt auf die Falle herein, die Soul Sacrifices Stand, Ebony Devil, für ihn gestellt hatte...",
        "pt-BR":
            "Jotaro e sua tripulação chegam a Singapura e, assim que chegam ao hotel, se separam. No entanto, Soul Sacrifice estava esperando Polnareff em seu quarto. Polnareff cai na armadilha que o Stand de Soul Sacrifice, Ebony Devil, havia preparado para ele...",
        "ru-RU":
            "Джотаро и его команда прибывают в Сингапур, и как только они прибывают в отель, они разделяются. Однако Душа Жертвоприношения ждала Польнарефа в его номере. Польнареф попадает в ловушку, которую стенд Души Жертвоприношения, Ebony Devil, подготовил для него...",
        "ja-JP":
            "ジョセフとクルーはシンガポールに到着し、ホテルに到着するとすぐに別れます。しかし、ソウル・サクリファイスは彼の部屋でポルナレフを待っていました。ポルナレフはソウル・サクリファイスのスタンド、エボニー・デビルが彼のために用意した罠にかかります...",
    },
    quests: [
        Functions.generateFightQuest(NPCs.Devo, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1,
            },
        ]),
        Functions.generataRaidQuest(Raids.BanditBoss.boss),
        Functions.generateUseXCommandQuest("assault", 1),
        Functions.generateUseXCommandQuest("loot", 1),
        Functions.generateClaimItemQuest(Functions.findItem("stand_arrow").id, 15),
    ],
    parent: Chapters.C2,
    private: false,
};

export const C2_P8: ChapterPart = {
    id: 3.7,
    description: {
        "en-US":
            "Jotaro, Anne, and Kakyoin find themselves walking together somewhere in Singapore. Jotaro decides to buy some chilled coconut juice for everyone at an ice cream kiosk. However, Kakyoin is acting abnormal, being far more vulgar and violent. At a cable car station, Kakyoin attempts to kill Jotaro by pushing him off a ledge, but Jotaro manages to save himself and punches Kakyoin, who reveals himself as an impostor named Rubber Soul, who uses the blob-like Yellow Temperance...",
        "fr-FR":
            "Jotaro, Anne et Kakyoin se retrouvent à marcher quelque part à Singapour. Jotaro décide d'acheter du jus de coco glacé pour tout le monde à un kiosque à glaces. Cependant, Kakyoin agit de manière anormale, étant beaucoup plus vulgaire et violent. À une station de téléphérique, Kakyoin tente de tuer Jotaro en le poussant d'une corniche, mais Jotaro parvient à se sauver et frappe Kakyoin, qui se révèle être un imposteur nommé Rubber Soul, qui utilise le Stand en forme de blob, Yellow Temperance...",
        "es-ES":
            "Jotaro, Anne y Kakyoin se encuentran caminando juntos en algún lugar de Singapur. Jotaro decide comprar jugo de coco frío para todos en un puesto de helados. Sin embargo, Kakyoin actúa de manera anormal, siendo mucho más vulgar y violento. En una estación de teleférico, Kakyoin intenta matar a Jotaro empujándolo desde un borde, pero Jotaro logra salvarse y golpea a Kakyoin, quien se revela como un impostor llamado Rubber Soul, que utiliza el Stand con forma de blob, Yellow Temperance...",
        "de-DE":
            "Jotaro, Anne und Kakyoin finden sich zusammen irgendwo in Singapur wieder. Jotaro beschließt, für alle an einem Eisstand gekühlten Kokosnuss-Saft zu kaufen. Allerdings verhält sich Kakyoin abnormal, er ist vulgärer und gewalttätiger. An einer Seilbahnstation versucht Kakyoin, Jotaro zu töten, indem er ihn von einem Vorsprung stößt, aber Jotaro schafft es, sich zu retten und schlägt Kakyoin, der sich als ein Betrüger namens Rubber Soul entpuppt, der den blobartigen Stand Yellow Temperance verwendet...",
        "pt-BR":
            "Jotaro, Anne e Kakyoin se encontram caminhando juntos em algum lugar de Singapura. Jotaro decide comprar suco de coco gelado para todos em um quiosque de sorvetes. No entanto, Kakyoin está agindo de forma anormal, sendo muito mais vulgar e violento. Em uma estação de teleférico, Kakyoin tenta matar Jotaro empurrando-o de uma borda, mas Jotaro consegue se salvar e soca Kakyoin, que se revela ser um impostor chamado Rubber Soul, que usa o Stand com forma de blob, Yellow Temperance...",
        "ru-RU":
            "Джотаро, Энн и Какиоин оказываются гуляющими вместе где-то в Сингапуре. Джотаро решает купить всем охлажденного кокосового сока на киоске с мороженым. Однако Какиоин ведет себя необычно, гораздо более вульгарно и насильственно. На станции канатной дороги Какиоин пытается убить Джотаро, толкнув его с обрыва, но Джотаро удается спасти себя и ударить Какиоин, который выявляется как мошенник по имени Раббер Соул, использующий стенд в виде блоба, Йеллоу Темперанс...",
        "ja-JP":
            "シンガポールのどこかを歩いているジョタロ、アン、カキョイン。ジョタロはアイスクリームのキオスクでみんなに冷たいココナッツジュースを買うことに決めます。しかし、カキョインは異常な行動をしており、非常に粗野で暴力的です。ケーブルカーステーションでは、カキョインがジョタロを押し下げて殺そうとしますが、ジョタロは自分を救うことに成功し、カキョインを殴り、その後、自分をRubber Soulという名前の詐欺師であることを明かすYellow Temperanceを使用しているのStand、ブロブのような形状をしています...",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.RubberSoul,
            Functions.pushQuest(ActionQuests.throwRubberSoulBodyToOcean),
            null,
            [
                {
                    item: Functions.findItem("rare_stand_arrow").name,
                    amount: 3,
                },
            ]
        ),
        Functions.generateClaimXQuest("daily", 2),
        Functions.generateClaimXQuest("xp", 50000),
        Functions.generataRaidQuest(Raids.BanditBoss.boss),
    ],
    parent: Chapters.C2,
    private: false,
};

export const C2_P9: ChapterPart = {
    id: 3.8,
    description: {
        "en-US":
            "Jotaro and the others safely leave Singapore and enter India. Despite being rather surprised at the difference in culture, they stop in at a restaurant. There, Polnareff is attacked by a mysterious Stand that is inside a mirror.",
        "fr-FR":
            "Jotaro et les autres quittent Singapour en toute sécurité et entrent en Inde. Bien qu'ils soient plutôt surpris par la différence de culture, ils s'arrêtent dans un restaurant. Là, Polnareff est attaqué par un Stand mystérieux qui se trouve à l'intérieur d'un miroir.",
        "es-ES":
            "Jotaro y los demás salen de Singapur y entran en India. A pesar de estar bastante sorprendidos por la diferencia cultural, se detienen en un restaurante. Allí, Polnareff es atacado por un misterioso Stand que está dentro de un espejo.",
        "de-DE":
            "Jotaro und die anderen verlassen Singapur sicher und betreten Indien. Obwohl sie ziemlich überrascht sind von der kulturellen Unterschied, halten sie in einem Restaurant an. Dort wird Polnareff von einem mysteriösen Stand angegriffen, der sich in einem Spiegel befindet.",
        "pt-BR":
            "Jotaro e os outros saem de Singapura e entram na Índia. Apesar de ficarem bastante surpresos com a diferença cultural, eles param em um restaurante. Lá, Polnareff é atacado por um misterioso Stand que está dentro de um espelho.",
        "ru-RU":
            "Джотаро и другие благополучно покидают Сингапур и входят в Индию. Несмотря на то, что они довольно удивлены разницей в культуре, они заходят в ресторан. Там Польнарефа атакует таинственный стенд, который находится в зеркале.",
        "ja-JP":
            "ジョタロと他の人々はシンガポールを無事に出てインドに入ります。文化の違いにかなり驚いているにもかかわらず、彼らはレストランに立ち寄ります。そこで、ポルナレフは鏡の中にいる謎のスタンドに襲われます。",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.JGeil,
            Functions.pushQuest(Functions.generataRaidQuest(Raids.HolHorse.boss)),
            null,
            null
        ),
        Functions.generateClaimXQuest("daily", 2),
        Functions.generateClaimXQuest("xp", 50000),
        Functions.generataRaidQuest(Raids.BanditBoss.boss),
    ],
    parent: Chapters.C2,
    private: false,
};

export const C2_P10: ChapterPart = {
    id: 3.9,
    description: {
        "en-US":
            "After the fight, the team continued to Pakistan by car, avoiding the police. They encountered a strange car and the girl from the ship. They decided to give her a ride, but the suspicious car caused problems. They suspected a stand user and their suspicions were confirmed when the car transformed into a stand after pushing them off a mountain. You must now defeat Wheel of Fortune.",
        "fr-FR":
            "Après le combat, l'équipe a continué vers le Pakistan en voiture, évitant la police. Ils ont rencontré une voiture étrange et la fille du bateau. Ils ont décidé de lui donner un tour, mais la voiture suspecte a causé des problèmes. Ils ont soupçonné un utilisateur de Stand et leurs soupçons ont été confirmés lorsque la voiture s'est transformée en Stand après les avoir poussés d'une montagne. Vous devez maintenant vaincre Wheel of Fortune.",
        "es-ES":
            "Después de la pelea, el equipo continuó hacia Pakistán en coche, evitando a la policía. Se encontraron con un coche extraño y la chica del barco. Decidieron llevarla en coche, pero el coche sospechoso les causó problemas. Sospecharon de un usuario de Stand y sus sospechas se confirmaron cuando el coche se transformó en un Stand después de empujarlos por una montaña. Ahora debes derrotar a Wheel of Fortune.",
        "de-DE":
            "Nach dem Kampf fuhr das Team mit dem Auto weiter nach Pakistan und vermied die Polizei. Sie trafen auf ein seltsames Auto und das Mädchen vom Schiff. Sie beschlossen, sie mitzunehmen, aber das verdächtige Auto verursachte Probleme. Sie verdächtigten einen Stand-Benutzer und ihre Verdächtigungen bestätigten sich, als das Auto sich nachdem es sie von einem Berg gestoßen hatte, in einen Stand verwandelte. Du musst jetzt Wheel of Fortune besiegen.",
        "pt-BR":
            "Após a luta, a equipe continuou para o Paquistão de carro, evitando a polícia. Eles encontraram um carro estranho e a garota do navio. Eles decidiram dar uma carona a ela, mas o carro suspeito causou problemas. Eles suspeitaram de um usuário de Stand e suas suspeitas foram confirmadas quando o carro se transformou em um Stand depois de empurrá-los de uma montanha. Agora você deve derrotar Wheel of Fortune.",
        "ru-RU":
            "После битвы команда продолжила движение в Пакистан на машине, избегая полиции. Они встретили странную машину и девушку с корабля. Они решили подвезти ее, но подозрительная машина вызвала проблемы. Они подозревали пользователя стенда, и их подозрения подтвердились, когда машина превратилась в стенд после того, как вытолкнула их с горы. Теперь вам нужно победить Wheel of Fortune.",
        "ja-JP":
            "戦いの後、チームは車でパキスタンに向かい、警察を避けました。彼らは奇妙な車と船からの少女に出会いました。彼らは彼女を乗せることに決めましたが、疑わしい車が問題を引き起こしました。彼らはスタンドユーザーを疑っており、その疑念は、山から突き落とされた後に車がスタンドに変身したことで確認されました。Wheel of Fortuneを倒す必要があります。",
    },
    quests: [
        Functions.generateFightQuest(
            NPCs.ZZ,
            Functions.pushQuest(ActionQuests.DriveToPakistan),
            null,
            null
        ),
        Functions.generateClaimXQuest("daily", 1),
        Functions.generateClaimXQuest("xp", 150000),
        Functions.generateStartDungeonQuest(1, 5, 1),
    ],
    parent: Chapters.C2,
};

export const C2_P11: ChapterPart = {
    id: 4,
    description: {
        "en-US":
            "The Crusaders found themselves in a bizarre Pakistani town, where they stumbled upon some strange corpses. After exploring, they met an elderly woman named Enya, who happened to run the local hotel. The gang, tired from their travels, checked into the hotel. As the crusaders headed to their rooms on the second floor, Polnareff decided to use the bathroom on the first floor when he was suddenly ambushed by Enya",
        "fr-FR":
            "Le groupe de Jotaro se retrouva dans une étrange ville pakistanaise, où ils tombèrent sur des cadavres inhabituels. Après avoir exploré les lieux, ils rencontrèrent une vieille femme nommée Enya, qui gérait l'hôtel local. Fatigués par leur voyage, le groupe décida de s'y installer pour la nuit. Tandis que les membres montaient dans leurs chambres au deuxième étage, Polnareff descendit au premier pour utiliser la salle de bain, mais fut soudainement attaqué par Enya.",
        "es-ES":
            "El grupo de Jotaro se encontró en un extraño pueblo paquistaní, donde tropezaron con unos cadáveres inusuales. Después de explorar el lugar, conocieron a una anciana llamada Enya, quien administraba el hotel local. Cansados de su viaje, el grupo decidió hospedarse allí. Mientras los miembros subían a sus habitaciones en el segundo piso, Polnareff bajó al primero para usar el baño, pero fue atacado repentinamente por Enya.",
        "de-DE":
            "Die Gruppe von Jotaro fand sich in einer bizarren pakistanischen Stadt wieder, wo sie auf seltsame Leichen stieß. Nach einer Erkundung trafen sie eine ältere Frau namens Enya, die das örtliche Hotel leitete. Erschöpft von ihrer Reise beschloss die Gruppe, dort einzuchecken. Während die Mitglieder zu ihren Zimmern im zweiten Stock gingen, begab sich Polnareff ins Erdgeschoss, um die Toilette zu benutzen, wurde jedoch plötzlich von Enya überfallen.",
        "pt-BR":
            "O grupo de Jotaro se encontrou em uma cidade paquistanesa bizarra, onde tropeçaram em cadáveres estranhos. Após explorarem o lugar, conheceram uma senhora idosa chamada Enya, que administrava o hotel local. Cansados da viagem, o grupo decidiu se hospedar ali. Enquanto os membros subiam para seus quartos no segundo andar, Polnareff desceu para o primeiro para usar o banheiro, mas foi subitamente atacado por Enya.",
        "ru-RU":
            "Группа Джотаро оказалась в странном пакистанском городке, где наткнулась на загадочные трупы. Исследуя окрестности, они встретили пожилую женщину по имени Энья, которая управляла местной гостиницей. Устав от путешествия, группа решила остановиться там на ночь. Пока участники поднимались в свои комнаты на втором этаже, Полнарефф спустился на первый, чтобы воспользоваться ванной, но внезапно подвергся нападению со стороны Эньи.",
        "ja-JP":
            "承太郎たちのグループは、不思議な雰囲気のパキスタンの町にたどり着き、奇妙な死体を発見しました。探索の末、地元のホテルを経営する老婦人エンヤと出会います。旅の疲れを癒すため、一行はそのホテルに泊まることにしました。メンバーが二階の部屋に向かう中、ポルナレフは一階のトイレを使おうとしていましたが、そこで突然エンヤに襲われました。",
    },
    quests: [
        Functions.generateFightQuest(NPCs.Enya, null, null, [
            {
                item: "xp_box",
                amount: 10,
            },
        ]),
        Functions.generateClaimXQuest("xp", 250000),
        Functions.generateClaimXQuest("coin", 80000),
        Functions.generateClaimXQuest("daily", 1),
        Functions.generateStartDungeonQuest(4, 5),
    ],
    parent: Chapters.C2,
    private: false,
    rewardsWhenComplete: {
        items: [
            {
                item: "rare_stand_arrow",
                amount: 6,
            },
        ],
    },
};

/**
 * After Defeating Enya, she now reveals a hidden card up her sleeve, as you and your group become surrounded by corpses, being controlled like zombies. Now, you must confront the horde with all your might.


📜 Quests: (0.00%)
:reply: Defeat 1 Corpse Horde Dungeon (0/1) 0%
:reply: Claim 175,000 coins  (0/175,000) 0.00%
:reply: Claim your daily reward 2 times (using the /daily claim command)  (0/2) 0.00%
:reply: Use the /loot command 10 times  (0/10) 0.00%
:replyEnd: Use the /assault command 10 times  (0/10) 0.00% 
@
**/

export const C2_P12: ChapterPart = {
    id: 5,
    description: {
        "en-US":
            "After defeating Enya, she reveals a hidden card up her sleeve, as you and your group become surrounded by corpses, being controlled like zombies. Now, you must confront the horde with all your might.",
        "fr-FR":
            "Après avoir vaincu Enya, elle révèle une carte cachée dans sa manche, alors que vous et votre groupe êtes entourés de cadavres, contrôlés comme des zombies. Maintenant, vous devez affronter la horde de toutes vos forces.",
        "es-ES":
            "Después de derrotar a Enya, ella revela una carta oculta bajo su manga, ya que tú y tu grupo quedan rodeados por cadáveres, controlados como zombis. Ahora debes enfrentarte a la horda con todas tus fuerzas.",
        "de-DE":
            "Nach dem Sieg über Enya enthüllt sie eine versteckte Karte in ihrem Ärmel, während du und deine Gruppe von Leichen umgeben werdet, die wie Zombies kontrolliert werden. Jetzt musst du der Horde mit all deiner Kraft gegenübertreten.",
        "pt-BR":
            "Após derrotar Enya, ela revela uma carta escondida na manga, enquanto você e seu grupo são cercados por cadáveres, controlados como zumbis. Agora, você deve enfrentar a horda com todas as suas forças.",
        "ru-RU":
            "После победы над Эньей она раскрывает скрытую карту в рукаве, и вы с группой оказываетесь окружены трупами, управляемыми как зомби. Теперь вам предстоит противостоять орде изо всех сил.",
        "ja-JP":
            "エンヤを倒した後、彼女は袖の中に隠されたカードを明らかにし、あなたとあなたのグループはゾンビのように操られる死体に囲まれます。今、あなたは全力でその群れに立ち向かわなければなりません。",
    },
    quests: [
        /*Functions.generateFightQuest(
            NPCs.CorpseHorde,
           Functions.pushQuest(ActionQuests.DefeatCorpseHorde),
            null,
            [
                {
                    item: Functions.findItem("xp_box").name,
                    amount: 10,
                },
            ]
        ),*/
        Functions.generateClaimXQuest("coin", 175000),
        Functions.generateClaimXQuest("daily", 2),
        Functions.generateUseXCommandQuest("loot", 10), // Use the /loot command 10 times
        Functions.generateUseXCommandQuest("assault", 10), // Use the /assault command 10 times
    ],
    parent: Chapters.C2,
    private: true,
    rewardsWhenComplete: {
        items: [
            {
                item: Functions.findItem("rare_stand_arrow").id,
                amount: 6,
            },
        ],
    },
};
