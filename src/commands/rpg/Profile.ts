import { SlashCommandFile, Leaderboard } from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";

const slashCommand: SlashCommandFile = {
    data: {
        name: "profile",
        description: "View your profile (or someone else's)",
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
                required: false,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const userOption = ctx.options.getUser("user") || ctx.user;
        const rpgData = ctx.options.getUser("user")
            ? await ctx.client.database.getRPGUserData(ctx.options.getUser("user", false).id)
            : ctx.userData;

        if (!rpgData) return ctx.sendTranslated("base:USER_NO_ADVENTURE");
        const chapter =
            Object.values(Chapters).find((c) => c.id === ctx.userData.chapter.id) ||
            Object.values(ChapterParts).find((c) => c.id === ctx.userData.chapter.id);

        const levelLb = (JSON.parse(
            await ctx.client.database.getString(`${ctx.client.user.id}_leaderboard:level`)
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        const levelLbPos = levelLb.data.findIndex((x) => x.id === userOption.id) + 1;

        const coinsLb = (JSON.parse(
            await ctx.client.database.getString(`${ctx.client.user.id}_leaderboard:coins`)
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        const coinsLbPos = coinsLb.data.findIndex((x) => x.id === userOption.id) + 1;

        const embed: APIEmbed = {
            author: {
                name: userOption.tag,
                icon_url: userOption.displayAvatarURL({ extension: "gif" }),
            },
            description: ctx.translate("profile:ADVENTUREAT", {
                rUnix: Functions.generateDiscordTimestamp(
                    parseInt(rpgData.adventureStartedAt),
                    "FROM_NOW"
                ), //`<t:${(userData.adventureat/1000).toFixed(0)}:R>`,
                dUnix: Functions.generateDiscordTimestamp(
                    parseInt(rpgData.adventureStartedAt),
                    "DATE"
                ), //`<t:${(userData.adventureat/1000).toFixed(0)}:D>`,
            }),
            color: 0x70926c,
            fields: [
                {
                    name: "Player Infos",
                    value: `:heart: HP: ${Functions.localeNumber(
                        rpgData.health
                    )}/${Functions.localeNumber(
                        Functions.getMaxHealth(rpgData)
                    )}\n:zap: Stamina: ${Functions.localeNumber(
                        rpgData.stamina
                    )}/${Functions.localeNumber(
                        Functions.getMaxStamina(rpgData)
                    )}\n${makeChapterTitle(chapter, rpgData)}`,
                    inline: true,
                },
                {
                    name: "Ranking",
                    value: `:globe_with_meridians: \`${levelLbPos}\`/\`${levelLb.data.length}\`\n${ctx.client.localEmojis.jocoins} \`${coinsLbPos}\`/\`${coinsLb.data.length}\``,
                    inline: true,
                },
                {
                    name: "Player Stats",
                    value: `${ctx.client.localEmojis.a_} Level: ${rpgData.level}\n${
                        ctx.client.localEmojis.xp
                    } XP: ${rpgData.xp.toLocaleString("en-US")}/${Functions.getMaxXp(
                        rpgData.level
                    ).toLocaleString("en-US")}\n${
                        ctx.client.localEmojis.jocoins
                    } Coins: ${rpgData.coins.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: "Combat Infos",
                    value: `✊ ATK Damage: ${Functions.getAttackDamages(rpgData).toLocaleString(
                        "en-US"
                    )}\n:leaves: Dodge score: ${Functions.getDodgeScore(rpgData).toLocaleString(
                        "en-US"
                    )}\n🔄 Speed score: ${Functions.getSpeedScore(rpgData).toLocaleString(
                        "en-US"
                    )}`,
                    inline: true,
                },
                {
                    name: "Stand",
                    value: rpgData.stand
                        ? (() => {
                              const stand = Functions.findStand(rpgData.stand);
                              return `${stand.emoji} **${stand.name}** (${stand.rarity}):\n[${
                                  stand.abilities.length
                              }] Abilities: ${stand.abilities.map((a) => a.name).join(", ")}`;
                          })()
                        : "Stand-less",
                    inline: true,
                },
            ],
        };

        ctx.makeMessage({
            embeds: [embed],
        });
    },
};

export default slashCommand;
