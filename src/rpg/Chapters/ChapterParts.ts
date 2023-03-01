import { Chapter, ChapterPart } from "../../@types";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../NPCs/NPCs";
import * as Chapters from "./Chapters";

export const C1: ChapterPart = {
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
        Functions.generateClaimXQuest("coin", 3500),
        Functions.generateFightQuest(NPCs.Kakyoin),
    ],
    parent: Chapters.C1,
};
