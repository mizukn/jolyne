import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypes,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    RPGUserDataJSON,
} from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";

const slashCommand: SlashCommandFile = {
    data: {
        name: "trade",
        description: "trade with a yuser",
        description_localizations: {
            id: "Lihat profil Anda (atau orang lain)",
            bg: "Преглед на профила си (или на някой друг)",
            hr: "Pogledajte svoj profil (ili nečiji drugi)",
            cs: "Zobrazte si svůj profil (nebo někoho jiného)",
            da: "Se din profil (eller nogen andens)",
            nl: "Bekijk je profiel (of dat van iemand anders)",
            fi: "Näytä profiilisi (tai jonkun muun)",
            fr: "Affiche votre profil (ou celui d'une autre personne)",
            de: "Sieh dir dein Profil an (oder das von jemand anderem)",
            el: "Προβολή του προφίλ σας (ή κάποιου άλλου)",
            hi: "अपनी प्रोफ़ाइल देखें (या किसी और की)",
            hu: "Tekintse meg a profilját (vagy valaki másé)",
            it: "Visualizza il tuo profilo (o quello di qualcun altro)",
            ja: "プロフィールを表示します（または他の人のプロフィールを表示します）",
            ko: "프로필보기 (또는 다른 사람의 프로필보기)",
            lt: "Peržiūrėkite savo profilį (arba kito asmens)",
            no: "Vis profilen din (eller noen andres)",
            pl: "Zobacz swój profil (lub profil kogoś innego)",
            "pt-BR": "Veja seu perfil (ou o de alguém)",
            ro: "Vizualizați-vă profilul (sau al altcuiva)",
            ru: "Просмотрите свой профиль (или кого-то другого)",
            "zh-CN": "查看您的个人资料（或其他人的个人资料）",
            "zh-TW": "檢視您的個人資料（或其他人的個人資料）",
            "es-ES": "Ver tu perfil (o el de alguien más)",
            "sv-SE": "Visa din profil (eller någons annans)",
            th: "ดูโปรไฟล์ของคุณ (หรือของใครบางคน)",
            tr: "Profilinizi görüntüleyin (veya başkasının)",
            uk: "Перегляньте свій профіль (або когось іншого)",
            vi: "Xem hồ sơ của bạn (hoặc của ai đó)",
        },
        options: [
            {
                name: "user",
                description: "The user whose profile you want to view",
                description_localizations: {
                    id: "Pengguna yang profilnya ingin Anda lihat",
                    bg: "Потребителя, чието профилиране искате да видите",
                    hr: "Korisnik čiji profil želite vidjeti",
                    cs: "Uživatel, jehož profil chcete zobrazit",
                    da: "Brugeren, hvis profil du vil se",
                    nl: "De gebruiker wiens profiel u wilt bekijken",
                    fi: "Käyttäjä, jonka profiilin haluat nähdä",
                    fr: "L'utilisateur dont vous souhaitez afficher le profil",
                    de: "Der Benutzer, dessen Profil Sie ansehen möchten",
                    el: "Ο χρήστης του οποίου θέλετε να δείτε το προφίλ",
                    hi: "उस उपयोगकर्ता का प्रोफ़ाइल जिसे आप देखना चाहते हैं",
                    hu: "A felhasználó, aki profilját szeretné megtekinteni",
                    it: "L'utente di cui si desidera visualizzare il profilo",
                    ja: "プロフィールを表示したいユーザー",
                    ko: "프로필을 볼 사용자",
                    lt: "Vartotojas, kurio profilį norite peržiūrėti",
                    no: "Brukeren hvis profil du vil se",
                    pl: "Użytkownik, którego profil chcesz zobaczyć",
                    "pt-BR": "O usuário cujo perfil você deseja ver",
                },
                type: 6,
                required: true,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const target = ctx.options.getUser("user") || ctx.user;
        const targetData = await ctx.client.database.getRPGUserData(target.id);

        const targetOffers: RPGUserDataJSON["inventory"] = {};
        const localOffers: RPGUserDataJSON["inventory"] = {};
        // const targetChoices = array of array of items. each array in array has limit of 25 items due to discord string select menu limit.
        const targetChoices: string[][] = [];
        const localChoices: string[][] = [];

        for (const item in ctx.userData.inventory) {
            if (ctx.userData.inventory[item] <= 0) continue;
            const itemData = Functions.findItem(item);
            if (!itemData || !itemData.tradable) continue;
            const target = localChoices.filter((r) => r.length < 25);
            if (target.length === 0) localChoices.push([item]);
            else target[0].push(item);
        }

        for (const item in targetData.inventory) {
            if (targetData.inventory[item] <= 0) continue;
            const itemData = Functions.findItem(item);
            if (!itemData || !itemData.tradable) continue;
            const target = targetChoices.filter((r) => r.length < 25);
            if (target.length === 0) targetChoices.push([item]);
            else target[0].push(item);
        }

        console.log(targetChoices, localChoices);
    },
};

export default slashCommand;
