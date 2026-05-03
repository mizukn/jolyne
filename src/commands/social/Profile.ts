import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
} from "../../@types";
import { Message, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "../adventure/Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import { containers } from "../../utils/containers";
import { emojiBar } from "../../utils/emojiBar";

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
            Object.values(Chapters).find((c) => c.id === rpgData.chapter.id) ||
            Object.values(ChapterParts).find((c) => c.id === rpgData.chapter.id);

        const levelLb = (JSON.parse(
            await ctx.client.database.getString(`${ctx.client.user.id}_leaderboard:level`)
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        const levelLbPos = levelLb.data.findIndex((x) => x.id === userOption.id) + 1;

        const coinsLb = (JSON.parse(
            await ctx.client.database.getString(`${ctx.client.user.id}_leaderboard:coins`)
        ) as Leaderboard) || { lastUpdated: 0, data: [] };
        const coinsLbPos = coinsLb.data.findIndex((x) => x.id === userOption.id) + 1;

        let discCount = 0;
        for (const item of Object.keys(rpgData.inventory)) {
            if (item.includes("$disc$")) discCount += rpgData.inventory[item];
        }
        const badges: string[] = [];
        if (process.env.OWNER_IDS?.split(",").includes(userOption.id)) {
            badges.push(`:crown: Jolyne's Developer`);
        }
        // staff
        if (await ctx.client.database.redis.get(`jolyneRole_staff_${userOption.id}`)) {
            badges.push(`:shield: Jolyne Staff Team`);
            // jolyne admin
            if (
                process.env.OWNER_IDS.split(",").includes(userOption.id) ||
                process.env.ADMIN_IDS.split(",").includes(userOption.id)
            ) {
                badges.push(`:shield: Administrator`);
            }
        }

        // participated to the 2023 jolyne beta tournament
        if (
            await ctx.client.database.redis.get(
                `jolyneRole_beta_tournament_participant_${userOption.id}`
            )
        ) {
            badges.push(`:crossed_swords: Beta Tournament Participant`);
        }
        if (ctx.client.patreons.find((x) => x.id === userOption.id)) {
            badges.push(
                `<a:diamond_gif:927986118815809596> Patreon Member (Tier ${
                    ctx.client.patreons.find((x) => x.id === userOption.id).level
                })`
            );
        }
        // beta_tester
        if (await ctx.client.database.redis.get(`jolyneRole_beta_tester_${userOption.id}`)) {
            badges.push(`${ctx.client.localEmojis.a_} Beta Tester`);
        }
        // contributor
        if (await ctx.client.database.redis.get(`jolyneRole_contributor_${userOption.id}`)) {
            badges.push(`:white_check_mark: Contributor`);
        }
        // jolyneRole_huge_contributor_
        if (await ctx.client.database.redis.get(`jolyneRole_huge_contributor_${userOption.id}`)) {
            badges.push(`:star2: Huge Contributor`);
        }

        // booster
        if (await ctx.client.database.redis.get(`jolyneRole_booster_${userOption.id}`)) {
            badges.push(`:sparkles: Support Server Booster`);
        }

        if (rpgData.adventureStartedAt <= 1648764000000) {
            badges.push(`${ctx.client.localEmojis.jotaroHat} OG Player`);
        }

        if (rpgData.adventureStartedAt <= 1698682702407) {
            badges.push(`<:legacyplayer:1168585259084951652> Legacy Player`);
        }

        let patreonMult = 0;
        const patreonTier = ctx.client.patreons.find((v) => v.id === userOption.id)?.level;

        if (patreonTier)
            switch (patreonTier) {
                case 4:
                    patreonMult = 0.1;
                    break;
                case 3:
                    patreonMult += 0.07;
                    break;
                case 2:
                    patreonMult += 0.05;
                    break;
                case 1:
                    patreonMult += 0.04;
                    break;
            }
        let boosterMult = 0;

        if (ctx.client.boosters.includes(userOption.id)) {
            boosterMult = 0.03;
        }

        const color = await Functions.getProminentColor(
            userOption.displayAvatarURL({ extension: "png" }),
            50
        );

        const userIsCommunityBanned = Functions.userIsCommunityBanned(rpgData);
        const userisbanned = Functions.userIsCommunityBanned(ctx.userData);

        if (userisbanned) {
            ctx.followUpQueue.push({
                content: `${
                    ctx.user.id === rpgData.id ? "You are" : userOption.username + " is"
                } banned until ${Functions.generateDiscordTimestamp(
                    userisbanned.until,
                    "FULL_DATE"
                )} for the following reason: \`${userisbanned.reason}\``,
            });
        }

        const currentStand = rpgData.stand ? Functions.getCurrentStand(rpgData) : null;

        const description = 
            ctx.translate("profile:ADVENTUREAT", {
                rUnix: Functions.generateDiscordTimestamp(
                    Number(rpgData.adventureStartedAt),
                    "FROM_NOW"
                ),
                dUnix: Functions.generateDiscordTimestamp(
                    Number(rpgData.adventureStartedAt),
                    "DATE"
                ),
                lastSeenRUnix: Functions.generateDiscordTimestamp(rpgData.lastSeen, "FROM_NOW"),
                lastSeenDUnix: Functions.generateDiscordTimestamp(rpgData.lastSeen, "DATE"),
            }) +
            (badges.find((x) => x.toLowerCase().includes("staff"))
                ? "\n🛠️ This player is part of the staff team."
                : "") +
            (userIsCommunityBanned
                ? "\n:poop: This player is community banned. They get 50% less XP and they can't interact with other players."
                : "");

        const reply = containers.primary({
            title: `${userOption.username}'s Profile`,
            description,
            color,
            fields: [
                {
                    name: "Player Infos",
                    value: `:crossed_swords: True Level*: ${Functions.getTrueLevel(
                        rpgData
                    ).toLocaleString()}\n:heart: HP: ${Functions.localeNumber(
                        rpgData.health
                    )}/${Functions.localeNumber(
                        Functions.getMaxHealth(rpgData)
                    )}\n${emojiBar("hp", rpgData.health, Functions.getMaxHealth(rpgData))}\n:zap: Stamina: ${Functions.localeNumber(
                        rpgData.stamina
                    )}/${Functions.localeNumber(
                        Functions.getMaxStamina(rpgData)
                    )}\n${emojiBar("sta", rpgData.stamina, Functions.getMaxStamina(rpgData))}\n${makeChapterTitle(chapter, rpgData)}`,
                },
                {
                    name: "Ranking",
                    value: `:globe_with_meridians: \`${levelLbPos.toLocaleString()}\`/\`${levelLb.data.length.toLocaleString()}\`\n${
                        ctx.client.localEmojis.jocoins
                    } \`${coinsLbPos.toLocaleString()}\`/\`${coinsLb.data.length.toLocaleString()}\``,
                },
                {
                    name: "Player Stats",
                    value: `${
                        ctx.client.localEmojis.a_
                    } RPG Level: ${rpgData.level.toLocaleString()}\n${
                        ctx.client.localEmojis.xp
                    } XP: ${rpgData.xp.toLocaleString()}/${Functions.getMaxXp(
                        rpgData.level
                    ).toLocaleString()}\n${emojiBar(
                        "xp",
                        rpgData.xp,
                        Functions.getMaxXp(rpgData.level)
                    )}${
                        process.env.ENABLE_PRESTIGE
                            ? `\n<:restart:1362152085625241691> Prestige: ${rpgData.prestige}`
                            : ""
                    }\n${
                        ctx.client.localEmojis.jocoins
                    } Coins: ${rpgData.coins.toLocaleString()}\n${
                        ctx.client.localEmojis.prestige_shard
                    } Prestige shards: ${rpgData.prestige_shards.toLocaleString()}`,
                },
                {
                    name: "Equipped Items",
                    value: `${Object.keys(equipableItemTypesLimit)
                        .map((w) => {
                            const formattedType =
                                formattedEquipableItemTypes[
                                    parseInt(w) as keyof typeof formattedEquipableItemTypes
                                ];
                            const equippedItems = Object.keys(rpgData.equippedItems).filter(
                                (r) => Functions.findItem<EquipableItem>(r).type === parseInt(w)
                            );

                            return {
                                type: formattedType,
                                items: equippedItems
                                    .map((i) => {
                                        const item = Functions.findItem<EquipableItem>(i);
                                        return `${item.emoji} \`${item.name}\``;
                                    })
                                    .join("\n"),
                            };
                        })
                        .filter((r) => r.items.length > 0)
                        .map(
                            (x) =>
                                `[${x.type[0] === "F" ? x.type[0] + x.type[1] : x.type[0]}] ${
                                    x.items
                                }`
                        )
                        .join("\n")}`,
                },
                {
                    name: "Player Bonuses (from items)",
                    value: `\`[+]\` Health: **${Math.round(
                        Functions.calcEquipableItemsBonus(rpgData).health
                    ).toLocaleString()}**\n\`[+]\` Stamina: **${
                        Functions.calcEquipableItemsBonus(rpgData).stamina
                    }**\n${
                        ctx.client.localEmojis.xp
                    } XP Boost: **${Functions.calcEquipableItemsBonus(rpgData).xpBoost.toFixed(
                        2
                    )}%**\n${Object.keys(Functions.calcEquipableItemsBonus(rpgData).skillPoints)
                        .map((x) => {
                            const bonus =
                                Functions.calcEquipableItemsBonus(rpgData).skillPoints[
                                    x as keyof SkillPoints
                                ];
                            if (bonus === 0) return;
                            return `\`[SP]\` ${Functions.capitalize(x)}: **${bonus}**`;
                        })
                        .filter((r) => r)
                        .join("\n")}\n\`[+]\` Stand Disc: **${
                        Functions.calcEquipableItemsBonus(rpgData).standDisc
                    }**`,
                },
                {
                    name: "Stand",
                    value: currentStand
                        ? `${currentStand.emoji} **${currentStand.name}** (${currentStand.rarity}):\n[${
                              currentStand.abilities.length
                          }] Abilities: ${currentStand.abilities.map((a) => a.name).join(", ")}`
                        : "Stand-less",
                },
                {
                    name: "Combat Infos",
                    value: `:crossed_swords: Power Level: ${Functions.calculateUserPower(
                        rpgData
                    ).toLocaleString()}\n✊ ATK Damage: [${Math.round(
                        Functions.getAttackDamages(rpgData) * 0.5
                    ).toLocaleString()} - ${Math.round(
                        Functions.getAttackDamages(rpgData) * 1.1
                    ).toLocaleString()}]\n:leaves: Dodge score: ${Functions.getDodgeScore(
                        rpgData
                    ).toLocaleString()}\n🔄 Speed score: ${Functions.getSpeedScore(
                        rpgData
                    ).toLocaleString()}`,
                },
                {
                    name: "Stand Disc Capacity",
                    value: `- Limit: ${Functions.calcStandDiscLimit(
                        ctx,
                        rpgData
                    ).toLocaleString()} ${
                        ctx.client.localEmojis.disk
                    }\n- Used: ${discCount.toLocaleString()} ${
                        ctx.client.localEmojis.disk
                    }\n- Available: ${(
                        Functions.calcStandDiscLimit(ctx, rpgData) - discCount
                    ).toLocaleString()} ${ctx.client.localEmojis.disk}`,
                },
                {
                    name: "Weapon",
                    value: Object.keys(rpgData.equippedItems).find(
                        (r) => Functions.findItem<Weapon>(r).type === 6
                    )
                        ? (() => {
                              const weapon = Functions.findItem<Weapon>(
                                  Object.keys(rpgData.equippedItems).find(
                                      (r) => Functions.findItem<Weapon>(r).type === 6
                                  )
                              );
                              return `${weapon.emoji} **${weapon.name}** (${weapon.rarity}):\n${
                                  weapon.description
                              }\nAbilities: ${weapon.abilities.map((a) => a.name).join(", ")}`;
                          })()
                        : "None",
                },
                {
                    name: "Badges [" + badges.length + "]",
                    value: badges.length > 0 ? badges.join("\n") : "None",
                },
                {
                    name: "Extra Bonuses",
                    value: `<:patreon:1282049298866901103> [Patreon Bonus:](https://patreon.com/mizuki54) +**${
                        patreonMult * 100
                    }%** ${
                        ctx.client.localEmojis.xp
                    }\n<:BoosterStatus:1282050059898458153> [Booster Bonus:](https://discord.gg/jolyne-support-923608916540145694) +**${
                        boosterMult * 100
                    }%** ${ctx.client.localEmojis.xp}`,
                },
            ],
            footer: "* Your true level is determined by invested skill points plus bonuses",
        });

        return ctx.makeMessage({
            components: reply.components,
            flags: reply.flags,
        });
    },
};

export default slashCommand;