import CommandInteractionContext from "../structures/CommandInteractionContext";
import * as Functions from "./Functions";
import { Ornament } from "../rpg/Items/Items";
import { APIEmbed, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { cloneDeep } from "lodash";
import { i18n_key, SlashCommand } from "../@types";

export const endOf2024ChristmasEvent = 1735772399000;
export const startOf2024ChristmasEvent = 1732996800000; //new Date(2024, 11, 1).getTime();
export const is2024ChristmasEventActive = (): boolean =>
    Date.now() > startOf2024ChristmasEvent && Date.now() < endOf2024ChristmasEvent;
export const is2024ChristmasEventEndingSoon = (): boolean => {
    // 4 days before the event ends
    if (!is2024ChristmasEventActive()) return false;
    return endOf2024ChristmasEvent - Date.now() < 4 * 24 * 60 * 60 * 1000;
};

export const trades = [
    {
        amount: 10,
        item: "elf_hat",
    },
    {
        amount: 20,
        item: "xp_box",
    },
    {
        amount: 20,
        item: "santa_hat",
    },
    {
        amount: 30,
        item: "skill_points_reset_potion",
    },
    {
        amount: 30,
        item: "rare_stand_arrow",
    },
    {
        amount: 350,
        item: "requiem_arrow",
    },
    {
        amount: 100,
        item: "gauntlets_of_the_berserker",
    },
    {
        amount: 900,
        item: "krampus_staff",
    },

    {
        amount: 15000,
        item: "excalibur",
    },
].sort((a, b) => a.amount - b.amount);

const translations = (
    ctx: CommandInteractionContext
): // use the i18n_key type to get the correct type for the translations
Record<i18n_key, string> => ({
    "en-US": `\`\`\`\nKrampus has been abducting children, leaving chaos in his wake! Defeat him to free the children and earn rewards\n\`\`\`

- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] command to check your progression
- - Defeat Krampus' Goons <:krampus_goon:1311458615173054604> to get <:ornament:1311072010696396840> **Ornaments** (15%)
- - Completing this side quest will give you a <:xmasgift:1055916688568229938> **Christmas Gift**
- You can trade your <:ornament:1311072010696396840> **Ornaments** with <:jollypolpo:1311452026428723240> **Jolly Polpo** for items using the ${ctx.client.getSlashCommandMention(
        "event trade"
    )} command
- You can ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, the event boss to get more <:ornament:1311072010696396840> **Ornaments** and other rewards
- Use the ${ctx.client.getSlashCommandMention(
        "craft"
    )} command to craft <:krampus_staff:1311446274540830720> **Krampus' Staff**
- - Alternatively, you can get it by ${ctx.client.getSlashCommandMention(
        "event trade"
    )} with <:jollypolpo:1311452026428723240> **Jolly Polpo**
- Everyone has a **+25% ${ctx.client.localEmojis.xp} Boost** during the weekend
- Make sure to ${ctx.client.getSlashCommandMention("daily claim")} to get special rewards every day!
- - If you claim your daily on <t:1735084800:F> (<t:1735084800:R>), you will get a T-tier weapon that is only obtainable that day
- The event ends on ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "es-ES": `\`\`\`\n¡Krampus ha estado secuestrando niños, dejando caos a su paso! ¡Derrota a Krampus para liberar a los niños y ganar recompensas!\n\`\`\`

- Usa el comando ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] para verificar tu progreso
- - Derrota a los esbirros de Krampus <:krampus_goon:1311458615173054604> para obtener <:ornament:1311072010696396840> **Adornos** (15%)
- - Completar esta misión secundaria te dará un <:xmasgift:1055916688568229938> **Regalo Navideño**
- Puedes intercambiar tus <:ornament:1311072010696396840> **Adornos** con <:jollypolpo:1311452026428723240> **Jolly Polpo** por artículos usando el comando ${ctx.client.getSlashCommandMention(
        "event trade"
    )}
- Puedes ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, el jefe del evento para conseguir más <:ornament:1311072010696396840> **Adornos** y otras recompensas
- Usa el comando ${ctx.client.getSlashCommandMention(
        "craft"
    )} para crear <:krampus_staff:1311446274540830720> **Bastón de Krampus**
- - Alternativamente, puedes obtenerlo mediante ${ctx.client.getSlashCommandMention(
        "event trade"
    )} con <:jollypolpo:1311452026428723240> **Jolly Polpo**
- ¡Asegúrate de ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} para obtener recompensas especiales todos los días!
- - Si reclamas tu recompensa diaria el <t:1735084800:F> (<t:1735084800:R>), obtendrás un arma de nivel T que solo estará disponible ese día
- El evento termina el ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "de-DE": `\`\`\`\nKrampus entführt Kinder und hinterlässt Chaos! Besiege ihn, um die Kinder zu retten und Belohnungen zu verdienen!\n\`\`\`

- Verwende den ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] Befehl, um deinen Fortschritt zu überprüfen
- - Besiege Krampus' Handlanger <:krampus_goon:1311458615173054604>, um <:ornament:1311072010696396840> **Ornamente** (15%) zu erhalten
- - Das Abschließen dieser Nebenquest bringt dir ein <:xmasgift:1055916688568229938> **Weihnachtsgeschenk**
- Du kannst deine <:ornament:1311072010696396840> **Ornamente** bei <:jollypolpo:1311452026428723240> **Jolly Polpo** gegen Gegenstände eintauschen, indem du den Befehl ${ctx.client.getSlashCommandMention(
        "event trade"
    )} benutzt
- Du kannst ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, den Event-Boss herausfordern, um mehr <:ornament:1311072010696396840> **Ornamente** und andere Belohnungen zu erhalten
- Benutze den Befehl ${ctx.client.getSlashCommandMention(
        "craft"
    )}, um <:krampus_staff:1311446274540830720> **Krampus' Stab** herzustellen
- - Alternativ kannst du ihn über ${ctx.client.getSlashCommandMention(
        "event trade"
    )} bei <:jollypolpo:1311452026428723240> **Jolly Polpo** erhalten
- Denke daran, ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} zu nutzen, um jeden Tag spezielle Belohnungen zu erhalten!
- - Wenn du deine tägliche Belohnung am <t:1735084800:F> (<t:1735084800:R>) beanspruchst, erhältst du eine T-Stufen-Waffe, die nur an diesem Tag verfügbar ist
- Das Event endet am ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "fr-FR": `\`\`\`\nKrampus a kidnappé des enfants, laissant le chaos derrière lui ! Vainquez-le pour libérer les enfants et gagner des récompenses !\n\`\`\`

- Utilisez la commande ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] pour vérifier votre progression
- - Battez les sbires de Krampus <:krampus_goon:1311458615173054604> pour obtenir <:ornament:1311072010696396840> **Ornements** (15%)
- - Compléter cette quête secondaire vous donnera un <:xmasgift:1055916688568229938> **Cadeau de Noël**
- Vous pouvez échanger vos <:ornament:1311072010696396840> **Ornements** avec <:jollypolpo:1311452026428723240> **Jolly Polpo** pour des objets en utilisant la commande ${ctx.client.getSlashCommandMention(
        "event trade"
    )}
- Vous pouvez ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, le boss de l’événement, pour obtenir plus de <:ornament:1311072010696396840> **Ornements** et d’autres récompenses
- Utilisez la commande ${ctx.client.getSlashCommandMention(
        "craft"
    )} pour fabriquer <:krampus_staff:1311446274540830720> **Le bâton de Krampus**
- - Vous pouvez également l'obtenir avec ${ctx.client.getSlashCommandMention(
        "event trade"
    )} auprès de <:jollypolpo:1311452026428723240> **Jolly Polpo**
- N'oubliez pas de ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} pour obtenir des récompenses spéciales tous les jours !
- - Si vous réclamez votre récompense quotidienne le <t:1735084800:F> (<t:1735084800:R>), vous obtiendrez une arme de rang T uniquement disponible ce jour-là
- L'événement se termine le ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "it-IT": `\`\`\`\nKrampus ha rapito dei bambini, lasciando caos dietro di sé! Sconfiggilo per liberare i bambini e guadagnare ricompense\n\`\`\`

- Usa il comando ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] per verificare i tuoi progressi
- - Sconfiggi i scagnozzi di Krampus <:krampus_goon:1311458615173054604> per ottenere <:ornament:1311072010696396840> **Decorazioni** (15%)
- - Completare questa missione secondaria ti darà un <:xmasgift:1055916688568229938> **Regalo di Natale**
- Puoi scambiare i tuoi <:ornament:1311072010696396840> **Decorazioni** con <:jollypolpo:1311452026428723240> **Jolly Polpo** per oggetti utilizzando il comando ${ctx.client.getSlashCommandMention(
        "event trade"
    )}
- Puoi ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, il boss dell'evento per ottenere più <:ornament:1311072010696396840> **Decorazioni** e altre ricompense
- Usa il comando ${ctx.client.getSlashCommandMention(
        "craft"
    )} per creare <:krampus_staff:1311446274540830720> **Bastone di Krampus**
- - In alternativa, puoi ottenerlo tramite ${ctx.client.getSlashCommandMention(
        "event trade"
    )} con <:jollypolpo:1311452026428723240> **Jolly Polpo**
- Assicurati di usare ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} per ottenere ricompense speciali ogni giorno!
- - Se ritiri il tuo premio giornaliero il <t:1735084800:F> (<t:1735084800:R>), riceverai un'arma di livello T che sarà disponibile solo quel giorno
- L'evento termina il ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "ja-JP": `\`\`\`\nKrampusは子供たちを誘拐し、混乱を引き起こしています！彼を倒して子供たちを解放し、報酬を獲得しましょう\n\`\`\`

- ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] コマンドを使用して進行状況を確認
- - Krampusの手下を倒して <:krampus_goon:1311458615173054604> <:ornament:1311072010696396840> **オーナメント** (15%) を取得
- - このサイドクエストを完了すると、<:xmasgift:1055916688568229938> **クリスマスギフト** がもらえます
- あなたの <:ornament:1311072010696396840> **オーナメント** は、${ctx.client.getSlashCommandMention(
        "event trade"
    )} コマンドで <:jollypolpo:1311452026428723240> **ジョリーポルポ** と交換できます
- ${ctx.client.getSlashCommandMention(
        "raid"
    )} でイベントボス **Krampus** を倒して、さらに多くの <:ornament:1311072010696396840> **オーナメント** と他の報酬を得ましょう
- ${ctx.client.getSlashCommandMention(
        "craft"
    )} コマンドを使用して <:krampus_staff:1311446274540830720> **Krampusの杖** を作成
- - あるいは、${ctx.client.getSlashCommandMention(
        "event trade"
    )} コマンドで <:jollypolpo:1311452026428723240> **ジョリーポルポ** と交換して入手することもできます
- ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} を忘れずに使って、毎日特別な報酬を手に入れましょう！
- - <t:1735084800:F> (<t:1735084800:R>) に毎日の報酬を受け取ると、その日にしか手に入らないT-tier武器がもらえます
- イベントは${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} に終了します (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "ko-KR": `\`\`\`\n크람푸스가 아이들을 납치하고 혼란을 일으켰습니다! 그를 물리쳐 아이들을 구하고 보상을 얻으세요\n\`\`\`

- ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] 명령어를 사용하여 진행 상황을 확인하세요
- - 크람푸스의 부하들을 처치하고 <:krampus_goon:1311458615173054604> <:ornament:1311072010696396840> **장식품** (15%)을 얻으세요
- - 이 사이드 퀘스트를 완료하면 <:xmasgift:1055916688568229938> **크리스마스 선물**을 받게 됩니다
- 당신의 <:ornament:1311072010696396840> **장식품**은 ${ctx.client.getSlashCommandMention(
        "event trade"
    )} 명령어를 사용하여 <:jollypolpo:1311452026428723240> **조리 폴포**와 교환할 수 있습니다
- ${ctx.client.getSlashCommandMention(
        "raid"
    )} 명령어를 사용하여 이벤트 보스 **크람푸스**를 처치하고 더 많은 <:ornament:1311072010696396840> **장식품**과 다른 보상을 얻으세요
- ${ctx.client.getSlashCommandMention(
        "craft"
    )} 명령어를 사용하여 <:krampus_staff:1311446274540830720> **크람푸스의 지팡이**를 만드세요
- - 또는, ${ctx.client.getSlashCommandMention(
        "event trade"
    )} 명령어를 사용하여 <:jollypolpo:1311452026428723240> **조리 폴포**와 교환할 수 있습니다
- ${ctx.client.getSlashCommandMention("daily claim")} 명령어를 사용하여 매일 특별한 보상을 받으세요!
- - <t:1735084800:F> (<t:1735084800:R>)에 매일 보상을 받으면 그 날만 얻을 수 있는 T-tier 무기를 받을 수 있습니다
- 이벤트는 ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} 에 종료됩니다 (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "pt-BR": `\`\`\`\nKrampus tem sequestrado crianças, deixando caos por onde passa! Derrote-o para libertar as crianças e ganhar recompensas\n\`\`\`

- Use o comando ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] para verificar seu progresso
- - Derrote os capangas do Krampus <:krampus_goon:1311458615173054604> para obter <:ornament:1311072010696396840> **Enfeites** (15%)
- - Completar essa missão secundária te dará um <:xmasgift:1055916688568229938> **Presente de Natal**
- Você pode trocar seus <:ornament:1311072010696396840> **Enfeites** com <:jollypolpo:1311452026428723240> **Jolly Polpo** por itens usando o comando ${ctx.client.getSlashCommandMention(
        "event trade"
    )}
- Você pode ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, o chefe do evento para obter mais <:ornament:1311072010696396840> **Enfeites** e outras recompensas
- Use o comando ${ctx.client.getSlashCommandMention(
        "craft"
    )} para criar <:krampus_staff:1311446274540830720> **Cajado do Krampus**
- - Alternativamente, você pode obtê-lo por ${ctx.client.getSlashCommandMention(
        "event trade"
    )} com <:jollypolpo:1311452026428723240> **Jolly Polpo**
- Não se esqueça de usar ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} para obter recompensas especiais todos os dias!
- - Se você resgatar sua recompensa diária em <t:1735084800:F> (<t:1735084800:R>), receberá uma arma de T-tier que só estará disponível nesse dia
- O evento termina em ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "ru-RU": `\`\`\`\nКрампус похищает детей, оставляя за собой хаос! Победите его, чтобы освободить детей и получить награды\n\`\`\`

- Используйте команду ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] для проверки вашего прогресса
- - Побеждайте приспешников Крампуса <:krampus_goon:1311458615173054604>, чтобы получать <:ornament:1311072010696396840> **Украшения** (15%)
- - Завершив этот побочный квест, вы получите <:xmasgift:1055916688568229938> **Рождественский подарок**
- Вы можете обменять свои <:ornament:1311072010696396840> **Украшения** на предметы у <:jollypolpo:1311452026428723240> **Джолли Полпо**, используя команду ${ctx.client.getSlashCommandMention(
        "event trade"
    )}
- Вы можете ${ctx.client.getSlashCommandMention(
        "raid"
    )} победить **Крампуса**, босса события, чтобы получить больше <:ornament:1311072010696396840> **Украшений** и другие награды
- Используйте команду ${ctx.client.getSlashCommandMention(
        "craft"
    )}, чтобы создать <:krampus_staff:1311446274540830720> **Посох Крампуса**
- - Альтернативно, вы можете получить его через ${ctx.client.getSlashCommandMention(
        "event trade"
    )} у <:jollypolpo:1311452026428723240> **Джолли Полпо**
- Не забудьте использовать ${ctx.client.getSlashCommandMention(
        "daily claim"
    )} для получения специальных наград каждый день!
- - Если вы заберете свою ежедневную награду <t:1735084800:F> (<t:1735084800:R>), вы получите оружие Т-уровня, которое можно получить только в этот день
- Событие заканчивается ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "zh-CN": `\`\`\`\n克兰普斯绑架了孩子，带来了混乱！击败他以解救孩子并获得奖励\n\`\`\`

- 使用${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] 命令查看你的进度
- - 击败克兰普斯的手下 <:krampus_goon:1311458615173054604> 以获得 <:ornament:1311072010696396840> **装饰品** (15%)
- - 完成这个支线任务将赠送你一个 <:xmasgift:1055916688568229938> **圣诞礼物**
- 你可以通过使用${ctx.client.getSlashCommandMention(
        "event trade"
    )} 命令将你的 <:ornament:1311072010696396840> **装饰品** 与 <:jollypolpo:1311452026428723240> **Jolly Polpo** 交换物品
- 你可以${ctx.client.getSlashCommandMention(
        "raid"
    )} 挑战事件Boss **克兰普斯**以获取更多 <:ornament:1311072010696396840> **装饰品** 以及其他奖励
- 使用${ctx.client.getSlashCommandMention(
        "craft"
    )} 命令来制作 <:krampus_staff:1311446274540830720> **克兰普斯之杖**
- - 或者你可以通过${ctx.client.getSlashCommandMention(
        "event trade"
    )} 与 <:jollypolpo:1311452026428723240> **Jolly Polpo** 交换获得
- 别忘了使用${ctx.client.getSlashCommandMention("daily claim")}来领取每天的特殊奖励！
- - 如果你在 <t:1735084800:F> (<t:1735084800:R>) 领取日常奖励，你将获得当天专属的T-tier武器
- 本活动将于 ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} 结束 (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,

    "zh-TW": `\`\`\`\n克蘭普斯綁架了孩子，帶來了混亂！擊敗他以解救孩子並獲得獎勳\n\`\`\`

- 使用${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] 命令查看你的進度
- - 擊敗克蘭普斯的手下 <:krampus_goon:1311458615173054604> 以獲得 <:ornament:1311072010696396840> **裝飾品** (15%)
- - 完成這個支線任務將會贈送你一個 <:xmasgift:1055916688568229938> **聖誕禮物**
- 你可以使用${ctx.client.getSlashCommandMention(
        "event trade"
    )} 命令將你的 <:ornament:1311072010696396840> **裝飾品** 與 <:jollypolpo:1311452026428723240> **Jolly Polpo** 交換物品
- 你可以${ctx.client.getSlashCommandMention(
        "raid"
    )} 挑戰活動Boss **克蘭普斯**以獲得更多 <:ornament:1311072010696396840> **裝飾品** 及其他獎勳
- 使用${ctx.client.getSlashCommandMention(
        "craft"
    )} 命令來製作 <:krampus_staff:1311446274540830720> **克蘭普斯之杖**
- - 或者你可以使用${ctx.client.getSlashCommandMention(
        "event trade"
    )} 與 <:jollypolpo:1311452026428723240> **Jolly Polpo** 交換獲得
- 別忘了使用${ctx.client.getSlashCommandMention("daily claim")}來每天領取特殊獎勳！
- - 如果你在 <t:1735084800:F> (<t:1735084800:R>) 領取日常獎勳，你將獲得當天專屬的T-tier武器
- 本活動將於 ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} 結束 (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`,
});

export const Chritmas2024eventMessage = (ctx: CommandInteractionContext): string => {
    return translations(ctx)[ctx.userData.language];
    return `\`\`\`\nKrampus has been abducting children, leaving chaos in his wake! Defeat him to free the children and earn rewards\n\`\`\`

- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} [\`${"ChristmasEvent2024"}\`] command to check your progression
- - Defeat Krampus' Goons <:krampus_goon:1311458615173054604> to get <:ornament:1311072010696396840> **Ornaments** (15%)
- - Completing this side quest will give you a <:xmasgift:1055916688568229938> **Christmas Gift**
- You can trade your <:ornament:1311072010696396840> **Ornaments** with <:jollypolpo:1311452026428723240> **Jolly Polpo** for items using by using the ${ctx.client.getSlashCommandMention(
        "event trade"
    )} command
- You can ${ctx.client.getSlashCommandMention(
        "raid"
    )} **Krampus**, the event boss to get more <:ornament:1311072010696396840> **Ornaments** and other rewards
- Use the ${ctx.client.getSlashCommandMention(
        "craft"
    )} command to craft <:krampus_staff:1311446274540830720> **Krampus' Staff**
- - Alternatively, you can get it by ${ctx.client.getSlashCommandMention(
        "event trade"
    )} with <:jollypolpo:1311452026428723240> **Jolly Polpo**
- Make sure to ${ctx.client.getSlashCommandMention("daily claim")} to get special rewards every day!
- - If you claim your daily on <t:1735084800:F> (<t:1735084800:R>), you will get a T-tier weapon that is only obtainable that day
-# - The event ends on ${Functions.generateDiscordTimestamp(
        endOf2024ChristmasEvent,
        "FULL_DATE"
    )} (${Functions.generateDiscordTimestamp(endOf2024ChristmasEvent, "FROM_NOW")})`;
};

export const Christmas2024EventCommandHandler: SlashCommand["execute"] = async (
    ctx: CommandInteractionContext
): Promise<void> => {
    if (!is2024ChristmasEventActive()) {
        const eventStartsIn = startOf2024ChristmasEvent - Date.now();
        if (eventStartsIn > 0) {
            if (!process.env.BETA) {
                await ctx.makeMessage({
                    content: `The event will start in ${Functions.generateDiscordTimestamp(
                        startOf2024ChristmasEvent,
                        "FROM_NOW"
                    )} (${Functions.generateDiscordTimestamp(
                        startOf2024ChristmasEvent,
                        "FULL_DATE"
                    )}).`,
                });
                return;
            }
        } else {
            await ctx.makeMessage({
                content: "There is no event currently running.",
            });
            return;
        }
    }
    const subcommand = ctx.interaction.options.getSubcommand();
    if (subcommand === "info") {
        const embed: APIEmbed = {
            title: "<:ornament:1311072010696396840> **__2024 Christmas Event__**",
            description: Chritmas2024eventMessage(ctx),
            color: 0xd8304a,
        };

        await ctx.makeMessage({ embeds: [embed] });
    } else if (subcommand === "trade") {
        if (!ctx.userData) {
            return;
        }
        const ornaments = () => ctx.userData.inventory[Ornament.id] || 0;
        if (ornaments() === 0) {
            await ctx.makeMessage({ content: "You don't have any ornaments." });
            return;
        }
        const formattedTrades = trades.map((trade) => ({
            item: Functions.findItem(trade.item),
            amount: trade.amount,
            hasEnough: () =>
                ornaments() >= trade.amount &&
                Functions.addItem(cloneDeep(ctx.userData), trade.item, 1),
        }));

        const getSelectMenuTrades = () =>
            formattedTrades
                .filter((trade) => trade.hasEnough())
                .map((trade) => ({
                    label: `${trade.item.name}`,
                    value: trade.item.name,
                    description: `${trade.amount.toLocaleString("en-US")} Ornaments`,
                    emoji: trade.item.emoji,
                }));

        const selectMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "trade")
                .setPlaceholder("Select a trade")
                .addOptions(
                    getSelectMenuTrades().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getSelectMenuTrades()
                )
                .setDisabled(formattedTrades.filter((trade) => trade.hasEnough()).length === 0);

        const getOptions = () =>
            Array.from({ length: 25 }, (_, i) => i + 1)
                .map((i) => ({
                    label: `x${i} (${
                        i *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount
                    } Ornaments)`,
                    value: i.toString(),
                }))
                .filter(
                    (i) =>
                        ornaments() >=
                            parseInt(i.value) *
                                formattedTrades.find(
                                    (trade) => trade.item.name === currentTrade.item
                                ).amount &&
                        Functions.addItem(
                            cloneDeep(ctx.userData),
                            currentTrade.item,
                            parseInt(i.value)
                        )
                );
        const selectAnAmountMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "amount")
                .setPlaceholder("Select an amount")
                .setDisabled(getOptions().length === 0)
                .addOptions(
                    getOptions().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getOptions()
                );
        let currentTrade: { item: string; amount: number } | null = null;

        const embed = (): APIEmbed => {
            return {
                author: {
                    name: `Jolly Polpo's Trades`,
                    icon_url: "https://media.jolyne.moe/Yxa0fy/direct",
                },
                color: 0xd8304a,
                description: `${
                    ctx.client.localEmojis.replyEnd
                } You have \`${ornaments().toLocaleString(
                    "en-US"
                )}\` ornaments <:ornament:1311072010696396840>`,
                fields: [
                    ...formattedTrades.map((trade) => ({
                        name: `${trade.item.emoji} ${trade.item.name}`,
                        value: `${ctx.client.localEmojis.replyEnd} \`x${trade.amount.toLocaleString(
                            "en-US"
                        )}\` <:ornament:1311072010696396840>`,
                        inline: true,
                    })),
                    {
                        // blank
                        name: "\u200b",
                        value: `-# You can only have x3 copies of <:krampus_staff:1311446274540830720> **Krampus' Staff**.`,
                    },
                ],
                /*thumbnail: {
                    url: "https://cdn.discordapp.com/emojis/1294731380017856715.webp?size=512",
                },*/
            };
        };

        const goBackButton = new ButtonBuilder()
            .setCustomId(ctx.interaction.id + "goBack")
            .setLabel("Go back")
            .setEmoji("🔙")
            .setStyle(ButtonStyle.Secondary);

        const components = () => Functions.actionRow([selectMenu()]);
        await ctx.makeMessage({ embeds: [embed()], components: [components()] });

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                (interaction.customId === ctx.interaction.id + "trade" ||
                    interaction.customId === ctx.interaction.id + "amount" ||
                    interaction.customId === ctx.interaction.id + "goBack") &&
                ctx.interaction.user.id === interaction.user.id,
        });

        const Timeouter = () =>
            setTimeout(() => {
                collector.stop();
            }, 60000);
        let timeouter: NodeJS.Timeout = Timeouter();

        collector.on("collect", async (interaction) => {
            clearTimeout(timeouter);
            timeouter = Timeouter();

            if (await ctx.antiCheat(true)) return;

            switch (interaction.customId) {
                case ctx.interaction.id + "trade": {
                    if (!interaction.isStringSelectMenu()) return;

                    const selectedItem = formattedTrades.find(
                        (trade) => trade.item.name === interaction.values[0]
                    );
                    if (!selectedItem) {
                        return;
                    }
                    currentTrade = {
                        item: interaction.values[0],
                        amount: null,
                    };
                    const selectAnAmountComponents = Functions.actionRow([selectAnAmountMenu()]);
                    const goBack = Functions.actionRow([goBackButton]);
                    ctx.makeMessage({
                        content: `${selectedItem.item.emoji} | You selected **${selectedItem.item.name}**.`,
                        components: [selectAnAmountComponents, goBack],
                    });
                    interaction.deferUpdate().catch(() => {});
                    break;
                }

                case ctx.interaction.id + "amount": {
                    if (!interaction.isStringSelectMenu()) return;
                    if (!currentTrade) {
                        return;
                    }
                    const selectedAmount = parseInt(interaction.values[0]); //currentTrade.amount = parseInt(interaction.values[0]);
                    const amountBought =
                        selectedAmount *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount;

                    if (ornaments() < selectedAmount) {
                        ctx.interaction.followUp({
                            content: "You don't have enough ornaments.",
                            ephemeral: true,
                        });
                        interaction.deferUpdate().catch(() => {});
                        return;
                    }
                    const status: boolean[] = [
                        Functions.addItem(ctx.userData, currentTrade.item, selectedAmount),
                        Functions.removeItem(ctx.userData, Ornament.id, amountBought),
                    ];
                    if (!status.every((s) => s)) {
                        ctx.interaction
                            .followUp({
                                content:
                                    "An error occurred. Please note that you can only have 5 copies of the event hats and 3 copies of the event weapon.",
                                ephemeral: true,
                            })
                            .catch(() => {});
                        return;
                    }
                    ctx.client.database.saveUserData(ctx.userData);

                    ctx.interaction
                        .followUp({
                            content: `You traded ${amountBought} ornaments for ${selectedAmount}x ${currentTrade.item}.`,
                            ephemeral: true,
                        })
                        .catch(() => {});
                    ctx.makeMessage({
                        content: null,
                        embeds: [embed()],
                        components: [components()],
                    }).catch(() => {});
                    break;
                }

                case ctx.interaction.id + "goBack": {
                    ctx.makeMessage({
                        content: null,
                        components: [components()],
                        embeds: [embed()],
                    });
                    interaction.deferUpdate().catch(() => {});
                    return;
                }
            }
        });

        collector.on("end", () => {
            Functions.disableRows(ctx.interaction);
        });
    }
};

export const Christmas2024EventCommandData: SlashCommand["data"] = {
    name: "event",
    description: "Check the current event.",
    type: 1,
    options: [
        {
            name: "info",
            description: "Get information about the current event.",
            type: 1,
            options: [],
        },
        {
            name: "trade",
            description: "Trade your ornaments for items with jolly polpo.",
            type: 1,
            options: [],
        },
    ],
};

export const handleInteraction = async (ctx: CommandInteractionContext): Promise<void> => {
    const ornamentsLeft = () => ctx.userData.inventory[Ornament.id] || 0;
    if (is2024ChristmasEventActive() && ornamentsLeft() > 150 && Functions.percent(30)) {
        ctx.interaction.followUp({
            content: `<:ornament:1311072010696396840> | The christmas event is ending soon! You have ${ornamentsLeft()} ornaments left. Trade them with Jolly Polpo before the event ends`,
        });
    }
};
