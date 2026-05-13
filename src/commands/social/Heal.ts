import {
    SlashCommandFile,
    Consumable,
} from "../../@types";
import {
    Message,
    InteractionResponse,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { NPCs } from "../../rpg/NPCs";
import { cloneDeep } from "lodash";
import { containers, COLORS, V2Reply, SectionData } from "../../utils/containers";
import { emojiBar } from "../../utils/emojiBar";

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
        const maxHealth = Functions.getMaxHealth(ctx.userData);
        const maxStamina = Functions.getMaxStamina(ctx.userData);
        const isPreview = ctx.options.getBoolean("preview") || false;
        const strictMode = ctx.options.getBoolean("strict-mode", false);
        let sortByStrongest = ctx.options.getBoolean("sort-by-strongest", false);

        if (sortByStrongest === null || sortByStrongest === undefined)
            sortByStrongest = ctx.userData.settings.auto_heal.sort_by_strongest;

        if (ctx.userData.health >= maxHealth && ctx.userData.stamina >= maxStamina) {
            return ctx.makeMessage(containers.error("You are already at full health and stamina."));
        }

        const maxOverLoop = 5;
        let currentOverLoop = 0;
        
        while (
            currentOverLoop < maxOverLoop &&
            (ctx.userData.health < maxHealth || ctx.userData.stamina < maxStamina)
        ) {
            currentOverLoop++;
            const formattedInventory = Object.keys(ctx.userData.inventory)
                .map((x) => {
                    const itemData = Functions.findItem(x);
                    if (!itemData || !Functions.isConsumable(itemData)) return null;
                    return {
                        item: itemData as Consumable,
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

                    const expectedBEffects = {
                        health: Functions.getHealthEffect(b.item, ctx.userData),
                        stamina: Functions.getStaminaEffect(b.item, ctx.userData),
                    };
                    const expectedAEffects = {
                        health: Functions.getHealthEffect(a.item, ctx.userData),
                        stamina: Functions.getStaminaEffect(a.item, ctx.userData),
                    };

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
            if (formattedInventory.length === 0) {
                return ctx.makeMessage(containers.error(Functions.makeNPCString(NPCs.Jolyne, `You don't have any items that can heal you. Consider buying some from the ${ctx.client.getSlashCommandMention("shop")}.`)));
            }

            while (
                (ctx.userData.health < maxHealth || ctx.userData.stamina < maxStamina) &&
                formattedInventory.length > 0 &&
                maximumLoop > 0
            ) {
                maximumLoop--;
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

                item.amount--;
                if (item.amount <= 0 || (ctx.userData.inventory[item.item.id] ?? 0) <= 0) {
                    formattedInventory.splice(formattedInventory.indexOf(item), 1);
                }

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
                Functions.useConsumableItem(item.item, ctx.userData);
                Functions.removeItem(ctx.userData, item.item.id, 1);
                itemsUsed.push(item.item);
            }

            if (maximumLoop <= 0 && !isPreview) {
                ctx.followUpQueue = [
                    {
                        content: `Maximum loop reached. It's most likely because you have too much health and you've got many weak items.\nFor safety & performance reasons, the maximum loop is limited to \`${constMaxLoop.toLocaleString("en-US")}\`.\n\nEither re-use this command or maybe try healing manually ${ctx.client.getSlashCommandMention("item use")}`,
                    },
                ];
            }
        }

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

        const rewards = Functions.getRewardsCompareData(oldData, ctx.userData);

        const usedStr = itemsUsedData.length > 0
            ? itemsUsedData.map((x) => `> ${x.item.emoji} **x${x.amount}** ${x.item.name}`).join("\n")
            : "> *(None)*";

        const rewardsStr = rewards.length > 0
            ? rewards.map((x) => `> - ${x}`).join("\n")
            : "> *(None)*";

        const sections: SectionData[] = [
            { text: `### 🎒 **Items Consumed**\n${usedStr}` },
            { text: `### ✨ **Effects Applied**\n${rewardsStr}` }
        ];

        const hpBar = emojiBar("hp", ctx.userData.health, maxHealth);
        const staBar = emojiBar("sta", ctx.userData.stamina, maxStamina);
        sections.push({
            text: `### 📊 **New Stats**\n> :heart: • **${ctx.userData.health.toLocaleString()} / ${maxHealth.toLocaleString()}** HP\n> ${hpBar}\n> :battery: • **${ctx.userData.stamina.toLocaleString()} / ${maxStamina.toLocaleString()}** STA\n> ${staBar}`
        });

        const reply = containers.primary({
            title: isPreview ? `👀 Auto-Heal Preview` : `❤️‍🩹 Auto-Heal Complete`,
            description: isPreview ? `If you proceed, the following items will be consumed to restore your stats:` : `You have successfully consumed items from your inventory to heal.`,
            descriptionDivider: true,
            sections,
            sectionDividers: true,
            color: isPreview ? COLORS.warning : COLORS.success,
        });

        const cancelButton = new ButtonBuilder()
            .setCustomId(ctx.interaction.id + "cancel")
            .setLabel("Undo Healing")
            .setEmoji("🔁")
            .setStyle(ButtonStyle.Secondary);

        if (!isPreview) {
            reply.components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(cancelButton));
            await ctx.client.database.saveUserData(ctx.userData);
        }

        await ctx.makeMessage(reply);

        if (!isPreview) {
            const collector = ctx.channel.createMessageComponentCollector({
                time: 60000,
                filter: (i) => i.user.id === ctx.user.id && i.customId === ctx.interaction.id + "cancel",
            });

            collector.on("collect", async (i) => {
                collector.stop();
                if (await ctx.antiCheat(true)) return;

                ctx.RPGUserData = oldData;
                await ctx.client.database.saveUserData(ctx.userData);

                await i.update(containers.success("Auto-Heal action undone. Items and stats have been reverted to their previous state."));
            });
        }
    },
};

export default slashCommand;
