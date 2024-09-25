import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
    Consumable,
} from "../../@types";
import {
    Message,
    APIEmbed,
    InteractionResponse,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { makeChapterTitle } from "./Chapter";
import * as Chapters from "../../rpg/Chapters/Chapters";
import * as ChapterParts from "../../rpg/Chapters/ChapterParts";
import { t } from "i18next";
import { cloneDeep, max } from "lodash";

const slashCommand: SlashCommandFile = {
    data: {
        name: "heal",
        description:
            "Automatically heals you & restores your stamina by using your consumable items in a smart way.",
        options: [
            {
                name: "preview",
                description:
                    "Preview the items that will be used to heal you. It won't affect your data.",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
            },
            {
                name: "sort-by-strongest",
                description: "Sort items by strongest effect first.",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
            },
            {
                name: "strict-mode",
                description:
                    "When this is enabled, it won't use items that will make you go over the max health OR max stamina.",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const oldData = cloneDeep(ctx.userData);
        const baseOldData = cloneDeep(ctx.userData);
        const maxHealth = Functions.getMaxHealth(ctx.userData);
        const maxStamina = Functions.getMaxStamina(ctx.userData);
        const isPreview = ctx.options.getBoolean("preview") || false;
        const strictMode = ctx.options.getBoolean("strict-mode", false);
        let sortByStrongest = ctx.options.getBoolean("sort-by-strongest", false);

        if (sortByStrongest === null || sortByStrongest === undefined)
            sortByStrongest = ctx.userData.settings.auto_heal.sort_by_strongest;

        if (ctx.userData.health >= maxHealth && ctx.userData.stamina >= maxStamina) {
            return ctx.makeMessage({
                content: "You are already at full health and stamina.",
            });
        }

        await ctx.makeMessage({
            content: `${ctx.client.localEmojis.loading} | Sorting your inventory...`,
        });

        const maxOverLoop = 5;
        let currentOverLoop = 0;
        while (
            currentOverLoop < maxOverLoop &&
            (ctx.userData.health < maxHealth || ctx.userData.stamina < maxStamina)
        ) {
            console.log("Looping...", currentOverLoop);
            currentOverLoop++;
            const formattedInventory = Object.keys(ctx.userData.inventory)
                .map((x) => {
                    const itemData = Functions.findItem(x);
                    if (!itemData) return null;
                    if (!Functions.isConsumable(itemData)) return null;
                    return {
                        item: Functions.findItem<Consumable>(x),
                        amount: ctx.userData.inventory[x],
                    };
                })
                .filter((x) => {
                    if (!x) return false;
                    return (
                        ((x &&
                            x.item &&
                            x.amount &&
                            x.item.rarity !== "T" &&
                            (x.item.effects.health && typeof x.item.effects.health === "number"
                                ? x.item.effects.health > 0
                                : x.item.effects.health && typeof x.item.effects.health === "string"
                                ? !x.item.effects.health.includes("-")
                                : true)) ||
                            (x.item.effects.stamina && typeof x.item.effects.stamina === "number"
                                ? x.item.effects.stamina > 0
                                : x.item.effects.stamina &&
                                  typeof x.item.effects.stamina === "string"
                                ? !x.item.effects.stamina.includes("-")
                                : true)) &&
                        x.item.rarity !== "T" &&
                        !ctx.userData.settings.auto_heal.excluded_items.includes(x.item.id)
                    );
                })
                .sort((a, b) => {
                    const aoldData = cloneDeep(ctx.userData);
                    Functions.useConsumableItem(a.item, aoldData);

                    const boldData = cloneDeep(ctx.userData);
                    Functions.useConsumableItem(b.item, boldData);

                    const bEffects = {
                        health: aoldData.health - boldData.health,
                        stamina: aoldData.stamina - boldData.stamina,
                    };

                    const aEffects = {
                        health: oldData.health - aoldData.health,
                        stamina: oldData.stamina - aoldData.stamina,
                    };

                    const expectedBEffects = {
                        health: Functions.getHealthEffect(b.item, ctx.userData),
                        stamina: Functions.getStaminaEffect(b.item, ctx.userData),
                    };
                    const expectedAEffects = {
                        health: Functions.getHealthEffect(a.item, ctx.userData),
                        stamina: Functions.getStaminaEffect(a.item, ctx.userData),
                    };

                    // check if

                    // priority: total health gained (% compared to max health) + total stamina gained (% compared to max stamina)
                    let aPriority =
                        (boldData.health / Functions.getMaxHealth(boldData)) * 0.5 +
                        (boldData.stamina / Functions.getMaxStamina(boldData)) * 0.5;
                    let bPriority =
                        (aoldData.health / Functions.getMaxHealth(aoldData)) * 0.5 +
                        (aoldData.stamina / Functions.getMaxStamina(aoldData)) * 0.5;

                    if (
                        ctx.userData.health + expectedAEffects.health > maxHealth &&
                        ctx.userData.stamina + expectedAEffects.stamina > maxStamina
                    ) {
                        aPriority -= 1;
                    } else if (
                        ctx.userData.health + expectedAEffects.health > maxHealth ||
                        ctx.userData.stamina + expectedAEffects.stamina > maxStamina
                    ) {
                        aPriority -= 0.5;
                    }

                    if (
                        ctx.userData.health + expectedBEffects.health > maxHealth &&
                        ctx.userData.stamina + expectedBEffects.stamina > maxStamina
                    ) {
                        bPriority -= 1;
                    } else if (
                        ctx.userData.health + expectedBEffects.health > maxHealth ||
                        ctx.userData.stamina + expectedBEffects.stamina > maxStamina
                    ) {
                        bPriority -= 0.5;
                    }

                    if (sortByStrongest) {
                        aPriority = (expectedAEffects.health + expectedAEffects.stamina) * 100;
                        bPriority = (expectedBEffects.health + expectedBEffects.stamina) * 100;
                    }

                    return (
                        bPriority *
                            (sortByStrongest
                                ? expectedBEffects.health + expectedBEffects.stamina
                                : b.amount) -
                        aPriority *
                            (sortByStrongest
                                ? expectedAEffects.health + expectedAEffects.stamina
                                : a.amount)
                    );
                });

            const itemsUsed: Consumable[] = [];

            const constMaxLoop = 500;
            let maximumLoop = constMaxLoop;
            await ctx.makeMessage({
                content: `${ctx.client.localEmojis.loading} | Using items...`,
            });

            while (
                (ctx.userData.health < maxHealth || ctx.userData.stamina < maxStamina) &&
                formattedInventory.length > 0 &&
                maximumLoop > 0
            ) {
                maximumLoop--;
                /*
            console.log(`Using ${item.item.name}`);

            const oldData = cloneDeep(ctx.userData);
            Functions.useConsumableItem(item.item, ctx.userData);
            Functions.removeItem(ctx.userData, item.item.id, 1);
            itemsUsed.push(item.item);
            console.log(`Difference: ${oldData.health - ctx.userData.health}`);
            console.log(`Difference: ${oldData.stamina - ctx.userData.stamina}`);*/
                const need = ["health", "stamina"].filter(
                    (x) =>
                        ctx.userData[x as "health" | "stamina"] <
                        (x === "health" ? maxHealth : maxStamina)
                );
                if (need.length === 0) break;
                const item = formattedInventory.filter((x) =>
                    x.amount > 0 && need.includes("health")
                        ? x.item.effects.health
                        : need.includes("stamina")
                        ? x.item.effects.stamina
                        : false
                )[0];
                if (!item) break;
                // remoev amount from formatted inventory
                item.amount--;
                if (item.amount <= 0 || (ctx.userData.inventory[item.item.id] ?? 0) <= 0) {
                    formattedInventory.splice(formattedInventory.indexOf(item), 1);
                }
                // check if using this item will make the user go over the max health or max stamina
                const expectedEffects = {
                    health: Functions.getHealthEffect(item.item, ctx.userData),
                    stamina: Functions.getStaminaEffect(item.item, ctx.userData),
                };

                if (
                    (ctx.userData.health + expectedEffects.health > maxHealth &&
                        ctx.userData.stamina + expectedEffects.stamina > maxStamina) ||
                    (strictMode &&
                        (ctx.userData.health + expectedEffects.health > maxHealth ||
                            ctx.userData.stamina + expectedEffects.stamina > maxStamina))
                ) {
                    formattedInventory.splice(formattedInventory.indexOf(item), 1);
                }
                const oldData = cloneDeep(ctx.userData);
                Functions.useConsumableItem(item.item, ctx.userData);
                Functions.removeItem(ctx.userData, item.item.id, 1);
                itemsUsed.push(item.item);
                console.log(`Using ${item.item.name}`);
                console.log(`Difference: ${ctx.userData.health - oldData.health}`);
                console.log(`Difference: ${ctx.userData.stamina - oldData.stamina}`);
            }

            if (maximumLoop <= 0 && !isPreview) {
                ctx.followUpQueue = [
                    {
                        content: `Maximum loop reached. It's most likely because you have too much health and you've got many weak items.\nFor safety & performance reasons, the maximum loop is limited to \`${constMaxLoop.toLocaleString(
                            "en-US"
                        )}\`.
                \n\nEither re-use this command or maybe try healing manually ${ctx.client.getSlashCommandMention(
                    "inventory use"
                )}`,
                    },
                ];
            }
        }
        // compare oldData.inventory with ctx.userData.inventory
        // get the difference
        // get the rewards

        const itemsUsedData = Object.keys(oldData.inventory)
            .map((x) => {
                const item = Functions.findItem(x);
                if (!item) return null;
                const amountHad = ctx.userData.inventory[x] || 0;
                const amountUsed = oldData.inventory[x] - amountHad;
                if (amountUsed <= 0) return null;

                return {
                    item,
                    amount: amountUsed,
                };
            })
            .filter((x) => x !== null);

        const uniqueItemsUsed = itemsUsedData
            .filter((x) => x !== null)
            .map((x) => x.item as Consumable);
        //[...new Set(itemsUsed)];

        const rewards = Functions.getRewardsCompareData(oldData, ctx.userData);

        // You used x1 xitem, x2 yitem and you got: rewards.join(", ")

        const msgString = `${
            isPreview ? ":information_source: | `[PREVIEW]` " : ""
        }You used ${uniqueItemsUsed
            .map(
                (x) =>
                    `x${itemsUsedData.find((g) => g.item.id === x.id).amount} **${x.name}** ${
                        x.emoji
                    }`
            )
            .join(", ")} and you got: ${rewards.join(", ")}`;

        const cancelButton = new ButtonBuilder()
            .setCustomId(ctx.interaction.id + "cancel")
            .setLabel("Cancel")
            .setEmoji("🔁")
            .setStyle(ButtonStyle.Secondary);

        ctx.makeMessage({
            content: msgString,
            components: !isPreview ? [Functions.actionRow([cancelButton])] : [],
        });

        if (!isPreview) {
            ctx.client.database.saveUserData(ctx.userData);

            const collector = ctx.channel.createMessageComponentCollector({
                time: 60000,
                filter: (i) =>
                    i.user.id === ctx.user.id && i.customId === ctx.interaction.id + "cancel",
            });

            collector.on("end", async (collected, reason) => {
                //if (reason === "time") {
                Functions.disableRows(ctx.interaction);
                return;
                //}
            });

            collector.on("collect", async (i) => {
                collector.stop("received item");
                if (await ctx.antiCheat(true)) return;

                ctx.RPGUserData = oldData;
                ctx.client.database.saveUserData(ctx.userData);

                //ctx.interaction.deleteReply().catch(() => {});
                ctx.interaction
                    .fetchReply()
                    .then((x) => {
                        if (!x) return;
                        const content = x.content;
                        x.edit({
                            content: `~~${content}~~\n\n*Cancelled.*`,
                        });
                    })
                    .catch(() => {});
                i.deferUpdate().catch(() => {});
            });
        }
    },
};

export default slashCommand;
