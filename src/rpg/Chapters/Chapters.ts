import { Chapter } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../NPCs/NPCs";

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
    hints: {
        "en-US": [
            "You may need the `/loot` command until you collect an amout of coins in order to complete some of your quests",
        ],
        "de-DE": [
            "Du benötigst möglicherweise den `/loot` Befehl, bis du eine bestimmte Anzahl an Münzen sammelst, um einige deiner Quests abzuschließen",
        ],
        "fr-FR": [
            "Vous aurez peut-être besoin de la commande `/loot` jusqu'à ce que vous collectiez une certaine quantité de pièces pour pouvoir terminer certaines de vos quêtes",
        ],
        "ja-JP": [
            "あなたはいくつかのクエストを完了するためにコインを集めるまで、`/loot`コマンドを必要とするかもしれません",
        ],
        "ko-KR": [
            "일부 퀘스트를 완료하기 위해 동전을 모을 때까지 `/loot` 명령어가 필요할 수 있습니다",
        ],
        "ru-RU": [
            "Вам может понадобиться команда `/loot`, пока вы не соберете определенное количество монет, чтобы завершить некоторые из ваших квестов",
        ],
        "pt-BR": [
            "Você pode precisar do comando `/loot` até coletar uma quantidade de moedas para concluir algumas de suas missões",
        ],
        "zh-CN": ["你可能需要 `/loot` 命令，直到你收集一定数量的硬币才能完成一些任务"],
        "zh-TW": ["你可能需要 `/loot` 命令，直到你收集一定數量的硬幣才能完成一些任務"],
        "it-IT": [
            "Potresti aver bisogno del comando `/loot` fino a quando non collezioni una certa quantità di monete per completare alcune delle tue missioni",
        ],
    },
    quests: [
        Functions.generateClaimXQuest("daily", 1),
        Functions.generateClaimXQuest("coins", 3500),
        Functions.generateFightQuest(NPCs.Kakyoin),
    ],
};
