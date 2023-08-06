import { Special, Stand, Item } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as Stands from "../Stands/Stands";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { AttachmentBuilder } from "discord.js";
import * as Consumables from "./ConsumableItems";
import * as Items from "./Items";
import { EvolutionStands } from "../Stands";

interface boxLoot {
    percent: number;
    loot?: string;
    xp?: number;
    coins?: number;
    mult?: number;
}

async function useBox(
    ctx: CommandInteractionContext,
    loot: boxLoot[][],
    name: string,
    superator: string,
    emoji: string,
    shakingEmoji: string
): Promise<boolean> {
    await ctx.makeMessage({
        content: `${shakingEmoji} Your **${Functions.capitalize(name)}** is shaking...`,
    });
    await Functions.sleep(2000);

    loot = loot.filter((r) => r.length > 0);
    const winContent: string[] = [`▬▬▬▬▬**「${emoji} ${name.toUpperCase()}」**▬▬▬▬▬▬`];
    const updateMessage = () => ctx.makeMessage({ content: winContent.join("\n") });
    updateMessage();
    let counter = 0;
    for await (const lootBox of loot) {
        counter++;
        if (counter !== 1) {
            winContent.push(superator);
            await Functions.sleep(1000);
            updateMessage();
        }

        for await (const reward of lootBox) {
            await Functions.sleep(1000);
            if (reward.xp) {
                const xp = Functions.addXp(ctx.userData, reward.xp);
                winContent.push(`- **${xp.toLocaleString("en-US")}** ${Emojis.xp} XP`);
            } else if (reward.coins) {
                const coins = Functions.addCoins(ctx.userData, reward.coins);
                winContent.push(`- **${coins.toLocaleString("en-US")}** ${Emojis.jocoins} coins`);
            } else {
                const item = Functions.findItem(reward.loot);
                if (!item) continue;
                Functions.addItem(ctx.userData, reward.loot, reward.mult ?? 1);
                winContent.push(`- ${reward.mult ?? 1}x **${item.emoji} ${item.name}**`);
            }
            updateMessage();
        }
        updateMessage();
    }
    await Functions.sleep(1000);
    winContent.push(superator);
    ctx.client.database.saveUserData(ctx.userData);
    updateMessage();

    return true;
}

export const Box: Special = {
    id: "box",
    name: "Box",
    description: "A box.",
    rarity: "B",
    emoji: "📦",
    price: 5000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const possibleConsumables = Object.values(Consumables).filter(
            (r) => r.tradable && r.storable
        );
        const midItemsList1 = Object.values(Items).filter(
            (r) => r.tradable && r.storable && r.rarity !== "A" && r.rarity !== "B"
        );
        const standList = Object.values(Stands).filter(
            (r) => r.available && r.rarity !== "SS" && r.rarity !== "T"
        );

        const midItems = [
            ...possibleConsumables,
            ...midItemsList1,
            ...standList
                .filter((r) => r.rarity === "C")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
        ].filter((r) => r);
        const okItems = [Items.Diamond, Items.AncientScroll];
        const rareItems = [
            ...standList
                .filter((r) => r.rarity === "B")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
            ...Object.values(Items).filter(
                (r) =>
                    (r.tradable && r.storable && r.rarity === "B") ||
                    (r.tradable && r.storable && r.rarity === "A")
            ),
            Functions.findItem("stand_arrow"),
        ].filter((r) => r);

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: Functions.randomNumber(1000, 5000),
                },
                {
                    percent: 100,
                    xp: Functions.randomNumber(
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 100,
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 50
                    ),
                },
            ],
            [],
            [],
        ];

        for (const item of midItems.filter((r) => Functions.percent(70))) {
            const target = finalLoot[1];

            if (!Functions.percent(50)) continue;
            target.push({
                percent: 100,
                loot: item.id,
            });
        }

        for (const item of rareItems.filter((r) => Functions.percent(50))) {
            const target = finalLoot[2];

            if (!Functions.percent(50)) continue;
            target.push({
                percent: 100,
                loot: item.id,
            });
        }
        return useBox(ctx, finalLoot, "box", "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", "📦", Emojis.box_shaking);
    },
};

export const MoneyBox: Special = {
    id: "money_box",
    name: "Money Box",
    description: "A money box.",
    rarity: "B",
    emoji: Emojis.moneyBox,
    price: 35000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: Functions.randomNumber(20000, 5000),
                },
                {
                    percent: 100,
                    xp: Functions.randomNumber(
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 100,
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 50
                    ),
                },
            ],
            [],
            [],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Money Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis.moneyBox,
            "<a:money_box_shaking:962388845540823100>"
        );
    },
};

export const PatreonBox: Special = {
    id: "patron_box",
    name: "Patron Box",
    description: "A patron box.",
    rarity: "S",
    emoji: "<:patronbox:1056324158524502036>",
    price: 200000,
    tradable: false,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const standList = Object.values(Stands).filter((r) => r.available && r.rarity === "S");

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: 100000,
                },
                {
                    percent: 100,
                    xp: Functions.getMaxXp(ctx.userData.level ?? 1),
                },
            ],
            [
                {
                    percent: 100,
                    loot: standList[Math.floor(Math.random() * standList.length)].id + ".$disc$",
                },
                {
                    percent: 100,
                    loot: StandArrow.id,
                    mult: 30,
                },
            ],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Patron Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            "<:x:1056324158524502036>",
            "<a:x:1056324219639701504>"
        );
    },
};

export const StandArrow: Special = {
    id: "stand_arrow",
    name: "Stand Arrow",
    description: "A stand arrow.",
    rarity: "A",
    emoji: Emojis["mysterious_arrow"],
    price: 35000,
    tradable: true,
    storable: true,
    craft: {
        pizza: 4,
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const standArray = Object.values(Stands);
        standArray.push({
            id: "silver_chariot",
            ...EvolutionStands.SilverChariot.evolutions[0],
        });

        const percent = Math.floor(Math.random() * 100);

        if (Functions.findStand(ctx.userData.stand)) {
            await ctx.sendTranslated("items:MYSTERIOUS_ARROW.ALREADY_STAND");
            await Functions.sleep(2000);
            await ctx.sendTranslated("items:MYSTERIOUS_ARROW.ALREADY_STAND2");
            return false;
        }

        await ctx.sendTranslated("items:MYSTERIOUS_ARROW.MANIFESTING");
        await Functions.sleep(2000);
        await ctx.sendTranslated("items:MYSTERIOUS_ARROW.INVADING");
        await Functions.sleep(2000);

        let stand: Stand;
        let color: number;

        if (percent <= 4) {
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "S"));
            color = 0x2b82ab;
        } else if (percent <= 20) {
            color = 0x3b8c4b;
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "A"));
        } else if (percent <= 40) {
            color = 0x786d23;
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "B"));
        } else {
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "C"));
            color = stand.color;
        }

        ctx.userData.stand = stand.id;

        const standCartBuffer = await Functions.generateStandCart(stand);
        const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });
        const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

        ctx.makeMessage({
            content: `...`,
            files: [file],
            embeds: [
                {
                    title: stand.name,
                    image: { url: "attachment://stand.png" },
                    color: color,
                    description: `**Rarity:** ${stand.rarity}\n**Abilities [${
                        stand.abilities.length
                    }]:** ${stand.abilities
                        .map((v) => v.name)
                        .join(
                            ", "
                        )}\n**Skill-Points:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                        stand.skillPoints
                    )
                        .map(([key, value]) => `• +${value} ${key}`)
                        .join("\n")}`,
                },
            ],
        });
        await ctx.client.database.saveUserData(ctx.userData);
        return true;
    },
};

export const RequiemArrow: Special = {
    id: "requiem_arrow",
    name: "Requiem Arrow",
    description:
        "A requiem arrow. It can be used to evolve your stand if you have Gold Experience or Silver Chariot.",
    rarity: "SS",
    emoji: Emojis["requiem_arrow"],
    price: 5000000,
    tradable: true,
    storable: true,
    craft: {
        ancient_scroll: 150,
        stand_arrow: 300,
        broken_arrow: 150,
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const stand = Functions.findStand(ctx.userData.stand);

        if (ctx.userData.stand !== "gold_experience" && ctx.userData.stand !== "silver_chariot") {
            await ctx.sendTranslated("items:REQUIEM_ARROW.NOT_REQUIEM");
            return false;
        }
        if (ctx.userData.level < 50) {
            ctx.makeMessage({
                content: "You are not worthy of this arrow yet...",
            });
            return false;
        }
        if (ctx.userData.standsEvolved[stand.id] === 1) {
            await ctx.sendTranslated("items:REQUIEM_ARROW.ALREADY_REQUIEM", {
                stand: stand.name,
            });
            return false;
        }
        ctx.userData.standsEvolved[stand.id] = 1;
        await ctx.sendTranslated("items:REQUIEM_ARROW.EVOLVING", {
            stand: stand.name,
        });
        ctx.client.database.saveUserData(ctx.userData);
        return true;
    },
};
