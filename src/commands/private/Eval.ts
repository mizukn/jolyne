import { RPGUserDataJSON, SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
import RPGUserData from "../../structures/RPGUserData";

const data =
    '{"id":"239739781238620160","tag":"justaplayer1","level":161,"health":4067,"coins":75046455,"stamina":330,"xp":387981,"stand":"killer_queen","language":"en-US","chapter":{"id":3.7,"quests":[{"type":"fight","id":"d7ityrvgs1dow4ro1aou","completed":true,"npc":"rubber_soul","pushEmailWhenCompleted":null,"pushQuestWhenCompleted":null,"pushItemWhenCompleted":null},{"type":"claimX","id":"iu42rfoyrtscyed3cbbmig","amount":6,"x":"daily","goal":2},{"type":"claimX","id":"r3cwbu4h0bvssc9lzrh5c","amount":18561286,"x":"xp","goal":50000},{"type":"raid","id":"uex69uukf08c5ridkby","boss":"bandit_leader","completed":true},{"type":"action","id":"throw_rubber_soul_body_to_ocean","completed":true,"i18n_key":"THROW_RUBBER_SOUL_BODY_OCEAN"},{"type":"action","id":"get_a_tram_and_go_to_india","completed":true,"i18n_key":"GET_TRAM_GO_INDIA"},{"type":"wait","end":1701116971129,"id":"93vbl49tykfn1gaq7itss","i18n_key":"GET_TRAM_GO_INDIA","claimed":true}]},"skillPoints":{"speed":120,"defense":67,"stamina":59,"strength":275,"perception":123},"sideQuests":[{"id":"RequiemArrowEvolve","quests":[{"type":"UseXCommandQuest","id":"dsfcz55bp99qkyxffbfeg","amount":113,"command":"assault","goal":100},{"type":"UseXCommandQuest","id":"ywiopxgfsdncpypuds4qir","amount":87,"command":"loot","goal":100},{"type":"UseXCommandQuest","id":"dv5zsob2ehyv4jey2dq6","amount":372,"command":"raid","goal":10},{"type":"UseXCommandQuest","id":"w6ohkblw1gtc26r4b2gice","amount":28,"command":"blackjack","goal":25},{"type":"claimX","id":"txagsarqprt2crgewb2pwc","amount":20,"x":"daily","goal":7},{"type":"raid","id":"75j5184zhbdxscrgmak1ic","boss":"requiem_polnareff","completed":true},{"type":"raid","id":"vueympapy5apmps374h5tp","boss":"giorno_giovanna_requiem","completed":true},{"type":"fight","id":"5j3pxazu649v35djv3h3xt","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"uzdl7igfbunzzivwjnt8jo","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"kqkc0h0muirure7nhwjqvs","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"dr4mdhc6mmf67n6dfmcna","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"pzftp541fs95zt894c65b","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"cdjstxafbysrbdacu1ssbo","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"oy9dna7ozost0i34jy3tnl","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"lmc8i2310xdqoojdu12ek","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"v29i86fd4vqn211i11zudt","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"j5zd5rgj0kevt56g309rk","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"hfxxwdls5ke1e4as2ekucm","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"rdfxsji3llmv1r4vck5nla","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"vvxxksnbmsqsczxmv2a","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"awso6axudsuz60ayuxdqg","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"l9fih72irkrjo2rzw1ixs","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"24n5ui3rfjxtlbb9myn2d9","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"x5zkxgfj6deyb34iqx1y9","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ktiv0mbcp0lfu8gn22ipy8","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"r6kdfdmmmjrz64gsecdmx9","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"accjd0usmrri6otm8uc4jn","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"3qudgw9rzsm3u3jyoknoja","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"vva2zmig9fggkya3anl6xk","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"qjls9p1wazjigds7dx8hri","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"5i75qd37wjxwi9be4qez","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"n5226y82iskxam2a8ael9","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ewy6576kfnp7g23mac3f","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"tnsw8vo0yrx6bjohyp2g","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"z651azdbw8ibysluw7ap","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"6v7q7tr7m9qo5qlxx1916k","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ylra8tdp81mdb4pd0ood8b","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"4vqes6bgdm6o5qf6jqmbgl","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"lkj1evc4yab11m30tc424j","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"4ha7953626az6viekd6jk","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"stmn5wbz06mg20ovasa6","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"l08f5vnnnyn1cet4ertf","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"gt3pjp8gfxni85qzsmfioj","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"8vvqc4pl6yw69rxqjphm7i","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ttgr9r90xuwh7mozidozi","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"fev54wzbeih9jzk68s7t6i","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"wdn67l91g2r1xz00fh6eyg","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"p5l7zuiw3mbbw6bns5d94s","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ytw0uygc9vk1vrfj79mx","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"22k39z2sul4jyh776sl0a8k","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"dafqh2dvgb7ex7ainsyra","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"qpnog8jt968e0mumeo6vq","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"0bblq05n841ijkgcaxkstbd","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"hd4u5z70l0pcxa7nhnveko","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"ay6621nx0sul0zkc9eq9a","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"j5cov9ipjxsyg23fpwgo","completed":true,"npc":"bandit_leader"},{"type":"fight","id":"o82di7tk45ehv0yr5uwudi","completed":true,"npc":"bandit_leader"}]},{"id":"KillerQueenDitesTheDust","quests":[{"type":"UseXCommandQuest","id":"law83mzrfi02wjzemnppco","amount":102,"command":"assault","goal":100},{"type":"claimX","id":"50xtmif0znrb4al07bifun","amount":7,"x":"daily","goal":7},{"type":"raid","id":"pa2eufk2lfr3umqmf7chq9","boss":"yoshikage_kira","completed":true},{"type":"raid","id":"lxo049ikch7wp379kalsxa","boss":"yoshikage_kira","completed":true},{"type":"fight","id":"x0j00wbd7e042bjjw06y7r","completed":true,"npc":"KillerQueen_user"},{"type":"fight","id":"atps6tsryw55u5iv79ph4","completed":true,"npc":"KillerQueen_user"},{"type":"fight","id":"ua119jnmhpg9zbgeikird","completed":true,"npc":"KillerQueen_user"},{"type":"fight","id":"knjl3nxms5iy30wzqo0lia","completed":true,"npc":"KillerQueen_user"},{"type":"fight","id":"4u7uwu0i7344o9o0xnxvny","completed":true,"npc":"KillerQueen_user"}]}],"daily":{"quests":[{"type":"fight","id":"a425okey4pbluwpd9i3y0p","completed":false,"npc":"HorusUserbloody_knife"},{"type":"fight","id":"x4ncosl8wjfvy3tmsuplui","completed":false,"npc":"StoneFreeUserdios_knives"},{"type":"fight","id":"vqo85h6ddgpnyp6aqfnxkg","completed":false,"npc":"CrazyDiamondUserdios_knives"},{"type":"fight","id":"6cesav3wp5g2d3phqgye3h","completed":false,"npc":"HorusUserbloody_knife"},{"type":"fight","id":"urnx56lorrk3z92edeun1i","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"ed4s6cbxg88wsfu9dn6ro9","completed":false,"npc":"EmperorUserBasic Katana"},{"type":"fight","id":"96srqbtayycqut3tele14g","completed":false,"npc":"GoldExperience_user"},{"type":"fight","id":"cfrvp37xtk6boytxs09b8f","completed":false,"npc":"GoldExperience_user"},{"type":"fight","id":"ba7rii0e6knbwt9wowt859","completed":false,"npc":"StoneFreeUserdios_knives"},{"type":"fight","id":"ptgupfv6c7s643xs6nege","completed":false,"npc":"TheWorld (RU)Userdios_knives"},{"type":"fight","id":"1h21z0cl88f1gajxikmtc1","completed":false,"npc":"EmperorUserBasic Katana"},{"type":"fight","id":"xq5xixekmcqjltdypakht","completed":false,"npc":"TheWorld (RU)Userdios_knives"},{"type":"fight","id":"3ww7dr9ke1dbsbiaoovvi4","completed":false,"npc":"HierophantGreenUserdios_knives"},{"type":"fight","id":"hugx4wqa5a4h8ka1yqd8fp","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"p31var2spah374h93tqn7y","completed":false,"npc":"StoneFreeUserdios_knives"},{"type":"fight","id":"y2vn5ztonmcdw0rhj3f6s","completed":false,"npc":"TheFoolUsermegumins_wand"},{"type":"fight","id":"hckwmxglac7chs2369hgh","completed":false,"npc":"HierophantGreenUserdios_knives"},{"type":"fight","id":"dijce69efz5uwi8qongjp","completed":false,"npc":"EmperorUserBasic Katana"},{"type":"fight","id":"jsx3wsks1zfya4jephf20a","completed":false,"npc":"HorusUserbloody_knife"},{"type":"fight","id":"5g6nespj2orxo4qa4devg","completed":false,"npc":"SexPistolsUsergauntlets_of_the_berserker"},{"type":"fight","id":"2kh2ch5fp97sl7aitd5jan","completed":false,"npc":"YellowTemperanceUserbloody_knife"},{"type":"fight","id":"1qxyrpusmhxjxkm2raxay5","completed":false,"npc":"TheWorld (RU)Userdios_knives"},{"type":"fight","id":"nht1cmej84kapq8gidicwk","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"5njtljk83vvz9bje1p5c0r","completed":false,"npc":"Wonderof UUserBasic Katana"},{"type":"fight","id":"ebgua8hbw1eerzp5drizi","completed":false,"npc":"devo"},{"type":"fight","id":"1dfs79sgnpz0dlj0knkbly","completed":false,"npc":"TowerOf GrayUsermegumins_wand"},{"type":"fight","id":"ait5q4auh7ntejecxjpdv","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"xlcy45h9qyon7248hkcb","completed":false,"npc":"CrazyDiamondUserdios_knives"},{"type":"fight","id":"3r0lc0j8wdoygtr15m3im","completed":false,"npc":"StoneFreeUserdios_knives"},{"type":"fight","id":"ybg8jr799q30bg5v8vw04","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"pwpgpx45gzpnd6uuoyw2d","completed":false,"npc":"TowerOf GrayUsermegumins_wand"},{"type":"fight","id":"oqhx3kdyj9g8u23u1asi","completed":false,"npc":"GoldExperience_user"},{"type":"fight","id":"93n4zxihvkqplx09cvqr","completed":false,"npc":"HierophantGreenUserdios_knives"},{"type":"fight","id":"nkiydz86rg9filp8rq3x59","completed":false,"npc":"TheFoolUsermegumins_wand"},{"type":"fight","id":"2ltz6uh1uiyu0m1uygnqc","completed":false,"npc":"TowerOf GrayUsermegumins_wand"},{"type":"fight","id":"5zjfdd0juof4rgd6a71956","completed":false,"npc":"TheFool_user"},{"type":"fight","id":"vfjhoqsngju5ysqlb03jr","completed":false,"npc":"WheelOf FortuneUserBasic Katana"},{"type":"fight","id":"rprcg6876kkv4kyuiasp3q","completed":false,"npc":"TheFoolUsermegumins_wand"},{"type":"fight","id":"1tnsvr5w787kh936a93jyl","completed":false,"npc":"CrazyDiamondUserdios_knives"},{"type":"fight","id":"4k25atltgjbwfgb3b1cu7","completed":false,"npc":"Wonderof UUserBasic Katana"},{"type":"fight","id":"sw5uf7acv2hr85osp11t6","completed":false,"npc":"Wonderof UUserBasic Katana"},{"type":"fight","id":"mkm7buu7iplg1nympcrk67","completed":false,"npc":"devo"},{"type":"fight","id":"cesjzksaj1nhtpqwnfjkvu","completed":false,"npc":"YellowTemperanceUserbloody_knife"},{"type":"claimX","id":"jqdxj4z0gsa9b91vhoxgzb","amount":207523,"x":"coin","goal":15000},{"type":"claimX","id":"cpz0qwu23s8zlq37sp3f","amount":223724,"x":"xp","goal":144900}],"claimStreak":11,"lastClaimed":1701561600000,"questsStreak":0,"lastDailyQuestsReset":1701561600000},"standsEvolved":{"silver_chariot":1},"emails":[{"id":"migration-v3_update","date":1698749293100,"read":1698753934304,"archived":false},{"id":"halloween_2023","read":1698755109782,"archived":false,"date":1698753144767},{"id":"p1c2:kakyoin_back","read":1698756835530,"archived":false,"date":1698756682235},{"id":"p1c2:speedwagon_diohair","read":1698756848621,"archived":false,"date":1698756682236},{"id":"c2p1:grandfadioalertstand","read":1698759447048,"archived":false,"date":1698759435493},{"id":"topgg_rewards_buff","read":1701031084046,"archived":false,"date":1701030977005}],"inventory":{"cola":9,"dead_rat":19,"broken_arrow":2,"ancient_scroll":19,"rare_stand_arrow":109,"skill_points_reset_potion":3,"kakyoins_snazzy_shades":3,"sandwich":4,"red_cloth":4,"purple_cloth":5,"white_cloth":6,"yellow_cloth":6,"orange_cloth":5,"green_hoodie_jacket":0,"blue_jeans":0,"shrimp_fried_rice":4,"green_cloth":6,"blue_cloth":4,"meat":3,"squid_ink_spaghetti":3,"salad_bowl":1,"candy":4,"Bento_Box":2,"black_cloth":1,"sbr_boots":0,"dios_knives":0,"sticky_fingers.$disc$":1,"purple_haze.$disc$":1,"whitesnake.$disc$":2,"box":46,"money_box":2,"spooky_soul":28,"star_platinum.$disc$":4,"silver_chariot.$disc$":1,"crazy_diamond.$disc$":1,"iron_ingot":3,"requiem_arrow":1,"diamond":1,"wood":2,"pizza":3,"green_baby":1,"megumins_hat":0,"burger":7,"stand_arrow":60},"adventureStartedAt":1683047022497,"equippedItems":{"kakyoins_snazzy_shades":8,"green_hoodie_jacket":2,"blue_jeans":3,"sbr_boots":4,"megumins_hat":1,"dios_knives":6},"communityBans":[],"learnedItems":[],"totalVotes":1,"restingAtCampfire":0,"voteHistory":{"November 2023":[1698830088944]},"lastPatreonReward":0,"lastSeen":"2023-12-03T09:04:13.156Z"}';

const slashCommand: SlashCommandFile = {
    data: {
        name: "eval",
        description: "Evaluates a JavaScript code",
        description_localizations: {
            id: "Menghitung kode JavaScript",
            bg: "Изчислява JavaScript код",
            hr: "Izračunava JavaScript kod",
            cs: "Vypočítává JavaScriptový kód",
            da: "Udregner JavaScript-kode",
            nl: "Berekent JavaScript-code",
            fi: "Laskee JavaScript-koodin",
            fr: "Calcule le code JavaScript",
            de: "Berechnet JavaScript-Code",
            el: "Υπολογίζει τον κώδικα JavaScript",
            hi: "JavaScript कोड का गणना करता है",
            hu: "JavaScript kód kiszámítása",
            it: "Calcola il codice JavaScript",
            ja: "JavaScriptコードを計算します",
            ko: "JavaScript 코드 계산",
            lt: "Skaičiuoja JavaScript kodą",
            no: "Regner ut JavaScript-kode",
            pl: "Oblicza kod JavaScript",
            "pt-BR": "Calcula o código JavaScript",
            ro: "Calculează codul JavaScript",
            ru: "Вычисляет JavaScript-код",
            "zh-CN": "计算JavaScript代码",
            "zh-TW": "計算JavaScript代碼",
            "es-ES": "Calcula el código JavaScript",
            "sv-SE": "Beräknar JavaScript-kod",
            th: "คำนวณโค้ด JavaScript",
            tr: "JavaScript kodunu hesaplar",
            uk: "Обчислює JavaScript-код",
            vi: "Tính toán mã JavaScript",
        },
        options: [
            {
                name: "code",
                description: "The code to evaluate",
                description_localizations: {
                    id: "Kode yang akan dihitung",
                    bg: "Кода за изчисляване",
                    hr: "Kod za izračunavanje",
                    cs: "Kód k výpočtu",
                    da: "Koden der skal udregnes",
                    nl: "De code om te berekenen",
                    fi: "Koodi laskemiseen",
                    fr: "Le code à calculer",
                    de: "Der Code zum Berechnen",
                    el: "Ο κώδικας για υπολογισμό",
                    hi: "गणना करने के लिए कोड",
                    hu: "A kód kiszámításához",
                    it: "Il codice da calcolare",
                    ja: "計算するコード",
                    ko: "계산할 코드",
                    lt: "Kodas skaičiavimui",
                    no: "Koden som skal regnes ut",
                    pl: "Kod do obliczenia",
                    "pt-BR": "O código a ser calculado",
                    ro: "Codul de calculat",
                    ru: "Код для вычисления",
                    "zh-CN": "要计算的代码",
                    "zh-TW": "要計算的代碼",
                    "es-ES": "El código a calcular",
                    "sv-SE": "Koden som ska beräknas",
                    th: "โค้ดที่จะคำนวณ",
                    tr: "Hesaplanacak kod",
                    uk: "Код для обчислення",
                    vi: "Mã để tính toán",
                },
                type: 3,
                required: true,
            },
        ],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const Functions = require("../../utils/Functions"); // eslint-disable-line @typescript-eslint/no-var-requires
        const { FightHandler } = require("../../structures/FightHandler"); // eslint-disable-line @typescript-eslint/no-var-requires
        const NPCs = require("../../rpg/NPCs/FightableNPCs"); // eslint-disable-line @typescript-eslint/no-var-requires
        const SpecialItems = require("../../rpg/Items/SpecialItems"); // eslint-disable-line @typescript-eslint/no-var-requires
        await ctx.interaction.deferReply();
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);
        const Aes = require("../../utils/Aes").default; // eslint-disable-line @typescript-eslint/no-var-requires

        const { client } = ctx;
        const content = ctx.options.getString("code", true);

        // prevent malicious code
        if (
            content.includes("rm -rf") ||
            content.toLowerCase().includes("flushdb") ||
            content.includes("--no-preserve-root") ||
            ((content.includes("child_process") ||
                content.includes("token") ||
                content.includes("process")) &&
                ctx.user.id !== process.env.OWNER_IDS.split(",")[0])
        ) {
            // alert every owners
            for (const id of (process.env.OWNER_IDS + "," + process.env.ADMIN_IDS).split(",")) {
                const owner = await client.users.fetch(id);
                await owner.send({
                    content: `:warning: [EMERGENCY ALERT]::: **${ctx.user.tag}** (${
                        ctx.user.id
                    }) tried to execute malicious code on **${ctx.guild.name}** (${
                        ctx.guild.id
                    })). Please, alert <@${process.env.OWNER_IDS.split(",")[0]}> and kick **${
                        ctx.user.tag
                    }** in the Support Server before it's too late !!!!! If you can, alert other admins.`,
                });
            }
            // remove the owner from process.env on every clusters
            await client.cluster.broadcastEval(
                `process.env.OWNER_IDS = process.env.OWNER_IDS.replace("${ctx.user.id}", "x021x")`
            );
            // remove the owner from process.env.ADMIN_IDS
            await client.cluster.broadcastEval(
                `process.env.ADMIN_IDS = process.env.ADMIN_IDS.replace("${ctx.user.id}", "x021x")`
            );

            return ctx.makeMessage({
                content: "Nice try, but you can't do that.",
            });
        }
        const result = new Promise((resolve) => resolve(eval(content)));

        return result
            .then((output) => {
                if (typeof output !== `string`) {
                    output = util.inspect(output, {
                        depth: 0,
                    });
                }
                if ((output as string).includes(client.token)) {
                    output = (output as string).replace(
                        new RegExp(client.token, "gi"),
                        `T0K3N`
                    ) as string;
                }
                try {
                    if (!ctx.interaction.replied)
                        ctx.makeMessage({
                            // eslint-disable-next-line no-useless-escape
                            content: `\`\`\`\js\n${output}\n\`\`\``,
                        });
                } catch (_) {}
            })
            .catch((err) => {
                err = err.toString();
                if (err.includes(client.token)) {
                    err = err.replace(new RegExp(client.token, "gi"), `T0K3N`);
                }
                try {
                    ctx.makeMessage({
                        // eslint-disable-next-line no-useless-escape
                        content: `\`\`\`\js\n${err}\n\`\`\``,
                    });
                } catch (e) {
                    console.error(e);
                }
            });

        ctx.client.database.postgresql
            .query<RPGUserDataJSON>('SELECT * FROM "RPGUsers"')
            .then((res) => {
                // find who has the most 'rat' in their inventory
                let max = 0;
                let user: RPGUserDataJSON | undefined;
                for (const row of res.rows) {
                    if (row.inventory.dead_rat > max) {
                        max = row.inventory.dead_rat;
                        user = row;
                    }
                }
                console.log(user);
            });

        for (const user of [
            "732308822131212359",
            "694532723187908670",
            "499630750405230613",
            "911775344896393237",
            "703673868379881503",
            "802116826653655050",
            "1052118068001783848",
            "723691231380504737",
            "884838876303228928",
        ]) {
            client.database.getRPGUserData(user).then(async (data) => {
                if (!data) return ctx.interaction.channel.send(`No data for ${userMention(user)}`);
                Functions.addItem(data, "second_anniversary_bag", 1);
                data.xp += 200000;
                client.database.saveUserData(data);
                ctx.interaction.channel.send(
                    `Added 200000 XP and a second_anniversary_bag to ${userMention(user)}`
                );
            });
        }

        client.database.postgresql
            .query<RPGUserDataJSON>('SELECT * FROM "RPGUsers"')
            .then((res) => {
                res.rows.forEach((row) => {
                    const oldSkills = JSON.stringify(row.skillPoints);
                    if (!row.skillPoints.speed) row.skillPoints.speed = 0;
                    if (!row.skillPoints.defense) row.skillPoints.defense = 0;
                    if (!row.skillPoints.stamina) row.skillPoints.stamina = 0;
                    if (!row.skillPoints.strength) row.skillPoints.strength = 0;
                    if (!row.skillPoints.perception) row.skillPoints.perception = 0;

                    if (oldSkills !== JSON.stringify(row.skillPoints)) {
                        client.database.postgresql.query(
                            `UPDATE "RPGUsers" SET "skillPoints" = $1 WHERE "id" = $2`,
                            [row.skillPoints, row.id]
                        );
                        console.log(`Updated ${row.id}`);
                        client.database.redis.del(`${process.env.REDIS_PREFIX}:${row.id}`);
                    }
                });
            });
    },
};

export default slashCommand;
