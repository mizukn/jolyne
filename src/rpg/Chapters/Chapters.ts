import { Chapter } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../NPCs/NPCs";
import * as Quests from "../Quests/Quests";
import * as ActionQuests from "../Quests/ActionQuests";

export const C1: Chapter = {
    id: 1,
    title: {
        "en-US": "Prologue",
        "fr-FR": "Prologue",
        "es-ES": "Prologue",
        "pt-BR": "Prologue",
        "ru-RU": "Prologue",
        "ja-JP": "Prologue",
        "ko-KR": "Prologue",
        "zh-CN": "Prologue",
        "de-DE": "Prologue",
        "it-IT": "Prologue",
    },
    /*
    description: {
        "en-US":
            "You live an ordinary life until you are 15 years old. It's your first day in high school, you're on your way home from school and you see an old classmate. It's Kakyoin ! You greet him but but he runs into you and attacks you. It appears he's being manipulated.\n\nP.S: He's a stand user...",
        "de-DE":
            "Du lebst ein normales Leben, bis du 15 Jahre alt bist. Es ist dein erster Tag in der High School, du gehst nach Hause von der Schule und siehst einen alten Klassenkameraden. Es ist Kakyoin! Du grüßt ihn, aber er rennt auf dich zu und greift dich an. Es scheint, als würde er manipuliert werden.\n\nP.S: Er ist ein Standbenutzer...",
        "fr-FR":
            "Vous vivez une vie ordinaire jusqu'à l'âge de 15 ans. C'est votre premier jour au lycée, vous rentrez chez vous de l'école et vous voyez un ancien camarade de classe. C'est Kakyoin ! Vous le saluez mais il vous attaque en courant. Il semble être manipulé.\n\nP.S: Il est un utilisateur de stand...",
        "es-ES":
            "Vives una vida ordinaria hasta los 15 años. Es tu primer día en la escuela secundaria, estás en camino a casa de la escuela y ves a un antiguo compañero de clase. ¡Es Kakyoin! Lo saludas, pero corre hacia ti y te ataca. Parece que está siendo manipulado.\n\nP.S: Es un usuario de stand...",
        "pt-BR":
            "Você vive uma vida comum até os 15 anos. É o seu primeiro dia na escola secundária, está a caminho de casa da escola e vê um antigo colega de classe. É Kakyoin! Você o cumprimenta, mas ele corre para você e o ataca. Parece que está sendo manipulado.\n\nP.S: Ele é um usuário de stand...",
        "ru-RU":
            "Вы живете обычной жизнью до 15 лет. Это ваш первый день в средней школе, вы возвращаетесь домой из школы, и вы видите старого одноклассника. Это Какёйн! Вы приветствуете его, но он бежит к вам и нападает на вас. Похоже, он подвергается влиянию.\n\nP.S: Он пользователь стенда...",
        "ja-JP":
            "あなたは15歳まで普通の生活を送っています。あなたは高校に入学する初日で、学校から帰宅している途中で、昔の同級生を見ます。それはカキヨインです！あなたは彼に挨拶しますが、彼はあなたに襲いかかります。彼は操られているようです。\n\nP.S：彼はスタンドユーザーです...",
        "ko-KR":
            "당신은 15세까지 평범한 삶을 살고 있습니다. 당신은 고등학교에 입학한 첫날이고, 학교에서 집으로 가는 길에, 옛 동창을 보게 됩니다. 그것은 카키요인입니다! 당신은 그에게 인사를 하지만, 그는 당신을 쳐다보고 당신을 공격합니다. 그는 조종되고 있다는 것 같습니다.\n\nP.S: 그는 스탠드 사용자입니다...",
        "zh-CN":
            "你在15岁之前过着普通的生活。这是你第一天上高中，你从学校回家的路上，你看到了一个老同学。这是卡基约！你向他打招呼，但他跑向你并攻击你。看来他正在被操纵。\n\nP.S：他是一个站立用户...",
        "zh-TW":
            "你在15歲之前過著普通的生活。這是你第一天上高中，你從學校回家的路上，你看到了一個老同學。這是卡基約！你向他打招呼，但他跑向你並攻擊你。看來他正在被操縱。\n\nP.S：他是一個站立用戶...",
        "it-IT":
            "Vivi una vita normale fino ai 15 anni. È il tuo primo giorno di scuola superiore, stai tornando a casa dalla scuola e vedi un vecchio compagno di classe. È Kakyoin! Lo saluti, ma lui corre verso di te e ti attacca. Sembra essere manipolato.\n\nP.S: È un utente di stand...",
    },
    quests: [
        Functions.generateClaimXQuest("daily", 1),
        Functions.generateClaimXQuest("coin", 650),
        Functions.generateFightQuest(NPCs.Kakyoin, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1,
            },
        ]),
        Quests.AwakenYourStand,
    ],*/
    description: {
        "en-US":
            "You’re 17 years old and living an ordinary life until one day you are mailed a Mysterious Arrow, as you go to grab it your hand starts bleeding and you feel a lot stronger all of a sudden. You are walking down a alleyway until you are stopped by a Thief and he tries to steal your wallet…",
        "fr-FR":
            "Vous avez 17 ans et menez une vie ordinaire jusqu'au jour où vous recevez une flèche mystérieuse par la poste, lorsque vous allez la saisir, votre main commence à saigner et vous vous sentez tout à coup beaucoup plus fort. Vous marchez dans une ruelle jusqu'à ce qu'un voleur vous arrête et essaie de vous voler votre portefeuille...",
        "es-ES":
            "Tienes 17 años y llevas una vida ordinaria hasta que un día te envían por correo una flecha misteriosa, cuando vas a agarrarla tu mano comienza a sangrar y de repente te sientes mucho más fuerte. Estás caminando por un callejón hasta que un ladrón te detiene y trata de robarte la billetera...",
        "pt-BR":
            "Você tem 17 anos e leva uma vida comum até que um dia recebe uma Flecha Misteriosa pelo correio, quando você vai pegá-la sua mão começa a sangrar e você se sente muito mais forte de repente. Você está andando por um beco até que é parado por um Ladrão e ele tenta roubar sua carteira...",
        "ru-RU":
            "Вам 17 лет, и вы ведете обычную жизнь, пока однажды вам не присылают по почте Таинственную Стрелу, когда вы хотите схватить ее, ваша рука начинает кровоточить, и вы чувствуете себя намного сильнее. Вы идете по переулку, пока вас не останавливает вор, и он пытается украсть ваш кошелек...",
        "ja-JP":
            "あなたは17歳で、普通の生活を送っていましたが、ある日、不思議な矢が郵送されてきました。それをつかもうとすると、手が出血し、突然とても強くなったように感じます。あなたは路地を歩いていると、突然泥棒に止められ、財布を盗もうとします...",
        "ko-KR":
            "당신은 17살이고 평범한 삶을 살고 있습니다. 어느 날, 당신에게 신비한 화살이 우편으로 보내졌습니다. 당신이 그것을 잡으려고 하면서 당신의 손이 피를 흘리기 시작하고 갑자기 훨씬 강해진 것 같습니다. 당신은 골목길을 걷고 있습니다. 도둑에게 막히고 그는 당신의 지갑을 훔치려고 시도합니다...",
        "zh-CN":
            "你今年17岁，过着平凡的生活，直到有一天你收到了一支神秘的箭，当你去抓它时，你的手开始流血，你突然感觉自己变得更强壮了。你走在小巷里，直到你被一个小偷拦住，他试图偷你的钱包...",
        "zh-TW":
            "你今年17歲，過著平凡的生活，直到有一天你收到了一支神秘的箭，當你去抓它時，你的手開始流血，你突然感覺自己變得更強壯了。你走在小巷裡，直到你被一個小偷攔住，他試圖偷你的錢包...",
        "it-IT":
            "Hai 17 anni e stai vivendo una vita ordinaria fino a quando un giorno ti viene spedita una Freccia Misteriosa, mentre vai a prenderla la tua mano inizia a sanguinare e ti senti molto più forte all'improvviso. Stai camminando in un vicolo fino a quando non vieni fermato da un Ladro e cerca di rubarti il portafoglio...",
    },
    quests: [
        Quests.AwakenYourStand,
        Quests.CompleteBeginnerSideQuest,
        Functions.generateClaimXQuest("daily", 1),
        Functions.generateFightQuest(NPCs.Bandit),
        Functions.generateFightQuest(NPCs.Bandit),
        Functions.generateFightQuest(NPCs.Bandit),
        Functions.generateFightQuest(NPCs.Bandit),
        Functions.generateFightQuest(NPCs.Bandit),
        Functions.generateFightQuest(NPCs.Bandit, null, null, [
            {
                item: Functions.findItem("Stand Arrow").name,
                amount: 1,
            },
        ]),
        Functions.generateClaimXQuest("coin", 650),
    ],
    hints: (ctx) => [
        `Do not forget to complete your **Beginner** side quest! (${ctx.client.getSlashCommandMention(
            "side quest view"
        )})! You can get a Stand Arrow and a Money Box (gives you between 20k and 50k coins)`,
    ],
};

export const C2: Chapter = {
    id: 3,
    title: {
        "en-US": "The beginning of a mysterious journey",
        "fr-FR": "Le début d'un voyage mystérieux",
        "es-ES": "El comienzo de un viaje misterioso",
        "pt-BR": "O começo de uma jornada misteriosa",
        "ru-RU": "Начало таинственного путешествия",
        "ja-JP": "不思議な旅の始まり",
        "ko-KR": "신비한 여행의 시작",
        "zh-CN": "神秘旅程的开始",
        "zh-TW": "神秘旅程的開始",
        "it-IT": "L'inizio di un viaggio misterioso",
    },
    description: {
        "en-US":
            "Kakyoin tells you that he has been manipulated by a certain Dio and asks you if you could stop Dio. You accept and you have the mission to contact your grandfather about Dio...",
        "fr-FR":
            "Kakyoin vous dit qu'il a été manipulé par un certain Dio et vous demande si vous pourriez arrêter Dio. Vous acceptez et vous avez pour mission de contacter votre grand-père à propos de Dio...",
        "es-ES":
            "Kakyoin te dice que ha sido manipulado por un tal Dio y te pregunta si podrías detener a Dio. Aceptas y tienes la misión de contactar a tu abuelo sobre Dio...",
        "pt-BR":
            "Kakyoin diz que foi manipulado por um certo Dio e pergunta se você poderia parar Dio. Você aceita e tem a missão de entrar em contato com seu avô sobre Dio...",
        "ru-RU":
            "Какёйн говорит вам, что его манипулировал определенный Дио, и спрашивает, не могли бы вы остановить Дио. Вы соглашаетесь, и у вас есть миссия связаться с вашим дедушкой о Дио...",
        "ja-JP":
            "カキヨインは、あるDioによって操られていると言い、Dioを止めることができるかどうか尋ねます。あなたは受け入れ、あなたはDioについてあなたの祖父に連絡するミッションを持っています...",
        "ko-KR":
            "카키요인은 어떤 디오에 의해 조종되었다고 말하고 디오를 멈출 수 있는지 묻습니다. 당신은 받아들이고 당신은 디오에 대해 당신의 할아버지에게 연락할 임무를 가지고 있습니다...",
        "zh-CN":
            "卡基约告诉你，他被某个Dio操纵，并问你是否可以阻止Dio。你接受了，你的任务是联系你的祖父关于Dio...",
        "zh-TW":
            "卡基約告訴你，他被某個Dio操縱，並問你是否可以阻止Dio。你接受了，你的任務是聯繫你的祖父關於Dio...",
        "it-IT":
            "Kakyoin ti dice che è stato manipolato da un certo Dio e ti chiede se potresti fermare Dio. Accetti e hai la missione di contattare tuo nonno su Dio...",
    },
    quests: [ActionQuests.AlertYourGrandFatherAboutDioAndYourStand],
};
