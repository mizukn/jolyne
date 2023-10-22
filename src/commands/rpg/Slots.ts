import { Message, ButtonBuilder, ButtonStyle, MessageComponentInteraction, APIEmbed } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { shuffleArray, actionRow, generateRandomId } from "../../utils/Functions";
import * as Functions from "../../utils/Functions";
import * as NPCs from "../../rpg/NPCs/NPCs";
import { SlashCommandFile } from "../../@types";

const slotsChart = {
    "💎": {
        2: 100,
        3: 500
    },
    "🍑": {
        2: 50,
        3: 250
    },
    "🍒": {
        2: 25,
        3: 100
    },
    "🍓": {
        2: 10,
        3: 50
    },
    "🍇": {
        2: 5,
        3: 25
    },
    "🍉": {
        2: 2,
        3: 10
    },
    "🍌": {
        2: 1,
        3: 5
    },
    "🍋": {
        2: 0,
        3: 2
    },
    "🍊": {
        2: 0,
        3: 1
    },
};


const slashCommand: SlashCommandFile = {
    data: {
        name: "slots",
        description: "Play the slots machine or view the slots chart.",
        options: [
            {
                name: "spin",
                description: "Spins the slots machine.",
                options: [
                    {
                        name: "bet",
                        description: "The amount of money you want to bet.",
                        type: 4,
                        required: true
                    }
                ],
                type: 1
            },
            {
                name: "chart",
                description: "View the slots chart.",
                type: 1
            }
        ]
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message | void> => {
        if (ctx.options.getSubcommand() === "chart") {
            const embed: APIEmbed = {
                    title: "Slots Chart",
                    description: "The slots chart is a table that shows the payout of each symbol.",
                    fields: [
                        {
                            name: "Symbol",
                            value: Object.keys(slotsChart).map(s => s).join("\n"),
                            inline: true
                        },
                        {
                            name: "2",
                            value: Object.keys(slotsChart).map(s => slotsChart[s as keyof typeof slotsChart][2]).join("\n"),
                            inline: true
                        },
                        {
                            name: "3",
                            value: Object.keys(slotsChart).map(s => slotsChart[s as keyof typeof slotsChart][3]).join("\n"),
                            inline: true
                        }
                    ],
                    footer: {
                        text: "The payout is multiplied by the bet amount."
                    }
                };

            return void ctx.makeMessage({
                embeds: [embed]
            });
        } else {
            const bet = ctx.options.getInteger("bet", true);
            if (bet < 1) {
                ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        "Hahahahaha... You're joking, right?"
                    )
                });
                return;
            }
            if (bet > ctx.userData.coins) {
                ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        `Are you trying to scam me? You don't have that much money... BOZO`
                    )
                });
                return;
            }
    
            const fruits = Object.keys(slotsChart);
            
            const patreonData = ctx.client.patreons.find(s => s.id === ctx.user.id);
            if (patreonData) {
                for (let i = 0; i < patreonData.level; i++) fruits.push("💎");
                ctx.followUpQueue.push({
                    ephemeral: true,
                    content: Functions.makeNPCString(
                        NPCs.Daniel_J_DArby,
                        `Since you're a patreon, I'll add some diamonds (+${patreonData.level}) to the slots machine.`
                    )
                });
            }
    
            let slotsMachine: string[] = Functions.shuffle([...Functions.shuffle([...Functions.shuffle(fruits), ...Functions.shuffle(fruits), ...Functions.shuffle(fruits), ...Functions.shuffle(fruits)])]); // Am I shuffling too much? Yes.
            const betID = Functions.generateRandomId();
            const cancelID = Functions.generateRandomId();
            const pullAgainID = Functions.generateRandomId();
    
            const betButton = new ButtonBuilder()
                .setCustomId(betID)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🎰")
                .setLabel("Bet");
            
            const cancelButton = new ButtonBuilder()
                .setCustomId(cancelID)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Nevermind");
            
            const pullAgainButton = new ButtonBuilder()
                .setCustomId(pullAgainID)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🎰")
                .setLabel("Pull again");
            
    
            await ctx.sendTranslated('casino:CONFIRM_MESSAGE', {
                bet: Functions.localeNumber(bet),
                left: Functions.localeNumber(ctx.userData.coins),
                components: [
                    Functions.actionRow([ betButton, cancelButton ])
                ]
            });
    
            const filter = (i: MessageComponentInteraction) => (i.user.id === ctx.user.id && (i.customId === betID || i.customId === cancelID || i.customId === pullAgainID));
    
            const collector = ctx.channel.createMessageComponentCollector({ filter, time: 30000, max: 2 });
    
            let followUpReply: Message | undefined;
            let left = Functions.randomNumber(2, 6);
    
            collector.on("collect", async (i: MessageComponentInteraction) => {
                if (await ctx.antiCheat(true)) return;
                i.deferUpdate().catch(() => { });
    
                if (i.customId === cancelID) {
                    return void ctx.sendTranslated('casino:CANCEL_MESSAGE', {
                        components: []
                    });
                } else if (i.customId === pullAgainID) {
                    if (followUpReply) await followUpReply.fetch().then(m => m.delete()).catch(() => {});
    
                    return void ctx.client.commands.get("slots")?.execute(ctx);
                }
    
                ctx.interaction.fetchReply().then(async (m: Message) => {
                    ctx.client.database.setCooldown(ctx.user.id, `You're currently spinning the slots machione. Can't find the message? https://discord.com/channels/${m.guild?.id}/${m.channel.id}/${m.id}`);
                }).catch(() => {
                    ctx.client.database.setCooldown(ctx.user.id, `You're currently spinning the slots machione. Can't find the message?`);
                });
    
                while (left !== -1) {
                    await runMachine(ctx, slotsMachine, bet, followUpReply, left, pullAgainButton);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    slotsMachine = slotsMachine.slice(3);
                    left--;
                }
    
            });    
        }
    }
};

async function runMachine(ctx: CommandInteractionContext, slotMachineFruits: string[], bet: number, followUpReply: Message, left: number, pullAgainButton: ButtonBuilder): Promise<void> {
    let msg = "[  :slot_machine: | **CASINO** ]\n+----------------+\n"
    + "| " + slotMachineFruits[0] + " : " + slotMachineFruits[1] + " : " + slotMachineFruits[2] + "  | \n"
    + "| " + slotMachineFruits[3] + " : " + slotMachineFruits[4] + " : " + slotMachineFruits[5] + "  | **<**\n"
    + "| " + slotMachineFruits[6] + " : " + slotMachineFruits[7] + " : " + slotMachineFruits[8] + "  | \n+----------------+\n";
    let followUpMsg: string;

    let loose = true;

    if (left === 0) {
        ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.user.id);

        if (slotMachineFruits[3] === slotMachineFruits[4] && slotMachineFruits[4] === slotMachineFruits[5]) { // JACKPOT
            const multiplier = slotsChart[slotMachineFruits[3] as keyof typeof slotsChart][3];
            loose = false;

            msg += "| : : **JACKPOT** : : |\n";
            Functions.addCoins(ctx.userData, bet * multiplier);
            followUpMsg = Functions.randomArray(ctx.translate("casino:JACKPOT_MESSAGES", {
                returnObjects: true
            }));
        } else if (slotMachineFruits[3] === slotMachineFruits[4] || slotMachineFruits[4] === slotMachineFruits[5] || slotMachineFruits[3] === slotMachineFruits[5]) { // 2/3
            const emojiMatch = slotMachineFruits[3] === slotMachineFruits[4] ? slotMachineFruits[3] : slotMachineFruits[4] === slotMachineFruits[5] ? slotMachineFruits[4] : slotMachineFruits[3];
            const multiplier = slotsChart[emojiMatch as keyof typeof slotsChart][2];
            if (multiplier) {
                msg += "| : : : : **WIN** : : : : |";
                loose = false;
                Functions.addCoins(ctx.userData, bet * multiplier);   
                followUpMsg = ctx.translate("casino:CASINO_YOU_GOT", {
                    amount: Functions.localeNumber(Math.round(bet * multiplier))
                });
            }
        }

        if (loose) {
            msg += "| : : : : **LOOSE** : : : : |";
            Functions.addCoins(ctx.userData, -bet);
            followUpMsg = Functions.randomArray(ctx.translate("casino:LOSE_MESSAGES", {
                returnObjects: true
            }));
        }

        ctx.client.database.saveUserData(ctx.RPGUserData);
        ctx.client.database.deleteCooldown(ctx.user.id);
        ctx.makeMessage({
            content: msg,
            components: [
                Functions.actionRow([ pullAgainButton ])
            ]
        });
        followUpReply = await ctx.followUp({
            content: followUpMsg,
            fetchReply: true
        });
    } else {
        msg += `| : : : : :  **${left}**  : : : : : |`;

        await ctx.makeMessage({
            content: msg,
            components: []
        });
    }

}


export default slashCommand;
