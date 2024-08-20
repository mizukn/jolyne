import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserDataJSON,
    Consumable,
    numOrPerc,
    equipableItemTypes,
    Weapon,
} from "../../@types";
import {
    Message,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    MessageComponentInteraction,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as ActionQuestsL from "../../rpg/Quests/ActionQuests";
import * as EquippableItems from "../../rpg/Items/EquipableItems";

const Weapons = Object.values(EquippableItems).filter((x) => Functions.isWeapon(x));

const slashCommand: SlashCommandFile = {
    data: {
        name: "weapon",
        description:
            "Display information about your current equipped weapon OR the weapon you specify.",
        options: [
            {
                name: "weapon",
                description: "The weapon to display",
                type: 3,
                required: false,
                autocomplete: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const hasWeaponEquipped =
            ctx.interaction.options.getString("weapon") ??
            Object.keys(ctx.userData.equippedItems).find(
                (x) => ctx.userData.equippedItems[x] === equipableItemTypes.WEAPON
            );
        if (!hasWeaponEquipped) {
            ctx.makeMessage({
                content: "You don't have a weapon equipped!",
            });
            return;
        }
        if (!Functions.findItem<Weapon>(hasWeaponEquipped)) {
            ctx.makeMessage({
                content: "That weapon doesn't exist...",
            });
            return;
        }

        ctx.makeMessage({
            embeds: [Functions.weaponAbilitiesEmbed(ctx.userData, null, hasWeaponEquipped)],
        });
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const foundWeapons = Weapons.filter((x) =>
            x.name.toLowerCase().includes(currentInput.toLowerCase())
        );

        foundWeapons.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 25);

        const options = foundWeapons.map((x) => ({
            name: x.name,
            value: x.name,
        }));

        interaction.respond(options);
    },
};

export default slashCommand;
