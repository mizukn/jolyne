import { Special, Stand } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as Stands from "../Stands/Stands";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { AttachmentBuilder } from "discord.js";

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
        items: [
            {
                id: "broken_arrow",
                amount: 4,
            },
        ],
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const standArray = Object.values(Stands);
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
