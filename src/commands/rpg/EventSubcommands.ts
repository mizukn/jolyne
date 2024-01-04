import { RPGUserDataJSON, SlashCommandFile, Leaderboard, i18n_key } from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionCollector,
    ButtonInteraction,
    CacheType,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    InteractionResponse,
    MessageComponentInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { FightableNPCS, NPCs } from "../../rpg/NPCs";
import { FightHandler, FightTypes } from "../../structures/FightHandler";
import Items from "../../rpg/Items";
import { cloneDeep } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "event",
        description: "Trade your souls for items or get information about the event.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "raid",
                description: "Trade your souls for items.",
                type: 1,
            },
            {
                name: "info",
                description: "Displays information about the event.",
                type: 1,
            },
            {
                name: "feed",
                description: "Feeds reindeer to help santa and his elf.",
                type: 1,
                options: [
                    {
                        name: "candy",
                        description: "The amount of candy you want to feed the reindeer.",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse<boolean>> => {
        if (Date.now() > 1704582000000)
            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.Santa,
                    "Sorry, my reindeers are no longer corrupted."
                ),
            });
        if (ctx.options.getSubcommand() === "info") {
            /**
             * Context: Happy Halloween! Skeletons, zombies and lots more scary creatures have invaded Morioh City. Kill them all for souls!
             * The player has to help the speedwagons foundation by giving them souls, the speedwagon foundation will give the player items in return.
             * Every players got a side quest.
             */
            /*
            const embed: APIEmbed = {
                title: "Christmas Event 2023",
                // orange
                color: 0xffa500,
                description: `- Use the ${ctx.client.getSlashCommandMention(
                    "side quest view"
                )} command to complete the event side quest.\n- You can gain ${
                    ctx.client.localEmojis.spooky_soul
                } **Spooky Souls** by killing event NPCs and by completing the event side quest.\n- You can trade your ${
                    ctx.client.localEmojis.spooky_soul
                } **Spooky Souls** by using the ${ctx.client.getSlashCommandMention(
                    "event trade"
                )} command.\n\n${
                    ctx.client.localEmojis.timerIcon
                } The event ends ${Functions.generateDiscordTimestamp(
                    1701385140000,
                    "FROM_NOW"
                )} (${Functions.generateDiscordTimestamp(1701385140000, "DATE")})`,
            };

            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.SPEEDWAGON_FOUNDATION,
                    "Zombies and skeletons have invaded Morioh City. Please help us by giving us souls, we will give you items in return."
                ),
                embeds: [embed],
            });
            */
            /**
             * Context: A mysterious person has corrupted santa's reindeers and they are now attacking people. Help santa and his elf to defeat the big corrupted reindeer and save christmas!
             */
            const embed: APIEmbed = {
                title: "Christmas Event 2023",
                color: 0xff0000,
                description: `- Don't forget to claim your daily EVERYDAY (${ctx.client.getSlashCommandMention(
                    "daily claim"
                )})\n- Everyone has a **+25%** XP boost!\n- You can get **Consumable Candy Canes** and **Corrupted Souls** by completing the christmas side quest: ${ctx.client.getSlashCommandMention(
                    "side quest view"
                )}\n- You can feed santa's reindeers (**${
                    Items.CandyCane.emoji + " " + Items.CandyCane.name
                }**) by using the ${ctx.client.getSlashCommandMention(
                    "event feed"
                )} command.\n- You can craft **Santa's Candy Cane** by using the ${ctx.client.getSlashCommandMention(
                    "craft"
                )} command.\n- Once you and your friends have enough **${
                    Items.CorruptedSoul.emoji + " " + Items.CorruptedSoul.name
                }**, you can use the ${ctx.client.getSlashCommandMention(
                    "event raid"
                )} command to wake the corrupted reindeer and fight him with your friend(s) and Santa + Santa's Elf (you can get a limited stand; **The Chained**)\n\n ${
                    ctx.client.localEmojis.timerIcon
                } The event ends ${Functions.generateDiscordTimestamp(
                    1704582000000,
                    "FROM_NOW"
                )} (${Functions.generateDiscordTimestamp(1704582000000, "DATE")})`,
            };

            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.SantasElf,
                    "Merry christmas! Here's some information about the event."
                ),
                embeds: [embed],
            });
        } else if (ctx.options.getSubcommand() === "raid") {
            if (ctx.userData.inventory[Items.CorruptedSoul.id] <= 0) {
                return void ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Santa,
                        "You don't have any corrupted souls."
                    ),
                });
            }
            const addSoulButton = new ButtonBuilder()
                .setCustomId(ctx.interaction.id + "add_soul")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Add a soul")
                .setEmoji(ctx.client.localEmojis.corrupted_soul);
            const removeSoulButton = new ButtonBuilder()
                .setCustomId(ctx.interaction.id + "remove_soul")
                .setStyle(ButtonStyle.Danger)
                .setLabel("Remove a soul")
                .setEmoji(ctx.client.localEmojis.corrupted_soul);
            const cancelButton = new ButtonBuilder()
                .setCustomId(ctx.interaction.id + "cancel")
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Cancel")
                .setEmoji("❌");

            // basically, people have to put 10 ccorrupted souls to summon the corrupted reindeer.
            // if they put 10 souls, it will create a new fight

            const players: RPGUserDataJSON[] = [ctx.userData];
            const soulsPut: {
                [key: RPGUserDataJSON["id"]]: number;
            } = {
                [ctx.userData.id]: 1,
            };

            const collector = ctx.interaction.channel.createMessageComponentCollector({
                time: 120000,
            });

            const updateMessage = async (): Promise<void> => {
                const totalSouls = Object.values(soulsPut).reduce((a, b) => a + b, 0);
                if (totalSouls >= 10) {
                    if (players.length === 1) {
                        return void ctx.makeMessage({
                            content: Functions.makeNPCString(
                                NPCs.Santa,
                                "Sorry, you may seem strong but please bring some friends with you... If you don't have any, ask the community for help! https://discord.gg/jolyne"
                            ),
                            components: [],
                            embeds: [],
                        });
                    }
                    startRaid();
                    return void collector.stop();
                }
                for (const [id, souls] of Object.entries(soulsPut)) {
                    if (souls <= 0) {
                        delete soulsPut[id];
                        const index = players.findIndex((p) => p.id === id);
                        if (index !== -1) {
                            players.splice(index, 1);
                        }
                        ctx.client.database.deleteCooldown(id);
                    } else {
                        if (!players.some((p) => p.id === id)) {
                            const data = await ctx.client.database.getRPGUserData(id);
                            if (data) {
                                players.push(data);
                                setCooldown(ctx, id);
                            } else {
                                delete soulsPut[id];
                                const index = players.findIndex((p) => p.id === id);
                                if (index !== -1) {
                                    players.splice(index, 1);
                                    ctx.client.database.deleteCooldown(id);
                                }
                            }
                        } else {
                            const index = players.findIndex((p) => p.id === id);
                            if (index !== -1) {
                                players[index] = await ctx.client.database.getRPGUserData(id);
                            }
                        }
                    }
                }

                ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Santa,
                        "We need to put 10 corrupted souls to summon the corrupted reindeer. Bring some friends with you!"
                    ),
                    embeds: [
                        {
                            title: "Christmas Event 2023",
                            color: 0xff0000,
                            description: `A mysterious person has corrupted santa's reindeers and they are now attacking people. Help santa and his elf to defeat the big corrupted reindeer!`,
                            fields: [
                                {
                                    name: "Players",
                                    value: players.map((p) => `<@${p.id}>`).join("\n"),
                                    inline: true,
                                },
                                {
                                    name: "Souls put",
                                    value: Object.entries(soulsPut)
                                        .map(([id, souls]) => `<@${id}>: ${souls}`)
                                        .join("\n"),
                                    inline: true,
                                },
                                {
                                    name: "Total souls",
                                    value: totalSouls.toString() + "/10",
                                    inline: true,
                                },
                            ],
                        },
                    ],
                    components: [
                        Functions.actionRow([addSoulButton, removeSoulButton]),
                        Functions.actionRow([cancelButton]),
                    ],
                });
            };

            const startRaid = (): void => {
                const fight = new FightHandler(
                    ctx,
                    [
                        [FightableNPCS.Santa, FightableNPCS.SantasElf, ...players],
                        [FightableNPCS.CorruptedReindeer],
                    ],
                    FightTypes.Boss
                );

                fight.on("end", async (winners, losers) => {
                    for (let player of players) {
                        ctx.client.database.deleteCooldown(player.id);
                        player = await ctx.client.database.getRPGUserData(player.id);
                        if (!player) {
                            players.splice(
                                players.findIndex((p) => p.id === player.id),
                                1
                            );
                            continue;
                        }
                        console.log(
                            `Removed ${soulsPut[player.id]} corrupted souls from ${player.id}`
                        );
                    }

                    if (losers[0].find((r) => r.id === FightableNPCS.Santa.id)) {
                        for (const player of players) player.health = 0;
                        ctx.followUp({
                            content: Functions.makeNPCString(
                                NPCs.CorruptedReindeer,
                                "... pathetic."
                            ),
                        });
                    } else {
                        for (const player of players) {
                            const oldData = cloneDeep(player);
                            const fighter = winners.find((r) => r.id === player.id);
                            const percentOfTheChained = Math.round(
                                (fighter.totalDamageDealt /
                                    Functions.getMaxHealth(FightableNPCS.CorruptedReindeer)) *
                                    100
                            );

                            for (let i = 0; i < 10; i++)
                                if (Functions.percent(60))
                                    Functions.addItem(player, Items.ChristmasGift);
                            Functions.addXp(
                                player,
                                Math.round(
                                    (fighter.totalDamageDealt /
                                        Functions.getMaxHealth(FightableNPCS.CorruptedReindeer)) *
                                        FightableNPCS.CorruptedReindeer.rewards.xp
                                )
                            );

                            if (Functions.percent(percentOfTheChained)) {
                                Functions.addItem(player, Functions.findItem("the_chained"));
                            }

                            ctx.followUp({
                                content: Functions.makeNPCString(
                                    NPCs.Santa,
                                    `Yes, we did it!!! Since you dealt **${percentOfTheChained}%** of the damage, you have **${percentOfTheChained.toLocaleString(
                                        "en-US"
                                    )}%** to get **${
                                        Functions.findItem("the_chained").name +
                                        " " +
                                        Functions.findItem("the_chained").emoji
                                    }**.\n\n${
                                        ctx.client.localEmojis.arrowRight
                                    } Rewards: ${Functions.getRewardsCompareData(
                                        oldData,
                                        player
                                    )} (<@${player.id}>))`
                                ),
                            });
                        }
                    }

                    for (const player of players) {
                        Functions.removeItem(player, Items.CorruptedSoul.id, soulsPut[player.id]);
                        ctx.client.database.saveUserData(player);
                    }
                });
            };

            collector.on("collect", async (i: ButtonInteraction) => {
                const data = await ctx.client.database.getRPGUserData(i.user.id);
                if (!data) return;
                const totalPut = Object.values(soulsPut).reduce((a, b) => a + b, 0) || 0;
                const left = (data.inventory[Items.CorruptedSoul.id] ?? 0) - totalPut;

                switch (i.customId.slice(ctx.interaction.id.length)) {
                    case "add_soul":
                        if (left <= 0) return void i.reply("You don't have any corrupted souls.");
                        if (soulsPut[i.user.id]) soulsPut[i.user.id]++;
                        else soulsPut[i.user.id] = 1;
                        i.deferUpdate().catch(() => {});
                        updateMessage();
                        break;
                    case "remove_soul":
                        if (!soulsPut[i.user.id])
                            return void i.reply("You didn't put any corrupted souls.");
                        soulsPut[i.user.id]--;
                        if (soulsPut[i.user.id] <= 0) {
                            if (i.user.id !== ctx.user.id) {
                                delete soulsPut[i.user.id];
                                players.splice(
                                    players.findIndex((p) => p.id === i.user.id),
                                    1
                                );
                            } else {
                                i.deferUpdate().catch(() => {});
                                collector.stop();
                                return void ctx.makeMessage({
                                    content:
                                        "The raid has been cancelled since the host removed their souls .",
                                    components: [],
                                    embeds: [],
                                });
                            }
                        }
                        i.deferUpdate().catch(() => {});
                        updateMessage();
                        break;
                    case "cancel":
                        i.deferUpdate().catch(() => {});
                        if (i.user.id !== ctx.user.id) return;
                        players.forEach((p) => ctx.client.database.deleteCooldown(p.id));
                        ctx.makeMessage({
                            content: "The raid has been cancelled.",
                            components: [],
                            embeds: [],
                        });
                        collector.stop();
                }
            });
            updateMessage();
        } else {
            const candy = ctx.options.getNumber("candy", true);
            const left = ctx.userData.inventory[Items.CandyCane.id] || 0;
            if (candy < 1) {
                return void ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.SantasElf,
                        "You need to feed at least 1 candy to the reindeer."
                    ),
                });
            }
            if (left < candy) {
                return void ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.SantasElf,
                        "You don't have enough candies."
                    ),
                });
            }

            const oldData = cloneDeep(ctx.userData);

            for (let i = 0; i < candy; i++) {
                if (Functions.percent(0.1)) Functions.addItem(ctx.userData, Items.RequiemArrow);
                if (Functions.percent(10)) Functions.addItem(ctx.userData, Items.RareStandArrow);
                Functions.addItem(ctx.userData, Items.CorruptedSoul, Functions.randomNumber(1, 3));
                // give 1-3% of max xp
                Functions.addXp(
                    ctx.userData,
                    Math.round((Functions.getMaxXp(ctx.userData.level) / 100) * 0.8)
                );
            }
            Functions.removeItem(ctx.userData, Items.CandyCane.id, candy);
            if (ctx.userData.inventory[Items.CandyCane.id] <= 0) {
                return void ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.SantasElf,
                        "an error occured, dont try that again or else youll get banned."
                    ),
                });
            }

            ctx.client.database.saveUserData(ctx.userData);

            return void ctx.makeMessage({
                content: Functions.makeNPCString(
                    NPCs.SantasElf,
                    `Thank you for helping us! Here's your reward: ${Functions.getRewardsCompareData(
                        oldData,
                        ctx.userData
                    )} [DEBUG: ${candy} candies fed while had ${left} candies]`
                ),
            });
        }
    },
};

function setCooldown(ctx: CommandInteractionContext, userId: string): void {
    ctx.interaction.fetchReply().then((r) => {
        ctx.client.database.setCooldown(
            userId,
            `You're currently in a limited raid. Lost the message ? Click here --> https://discord.com/channels/${r.guild.id}/${r.channel.id}/${r.id}`
        );
    });
}

export default slashCommand;
