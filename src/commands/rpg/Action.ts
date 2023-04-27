import {
    SlashCommandFile,
    Chapter,
    ChapterPart,
    RPGUserDataJSON,
    Consumable,
    numOrPerc,
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

const slashCommand: SlashCommandFile = {
    data: {
        name: "action",
        description: "d",
        options: [
            {
                name: "use",
                description: "dd",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    execute: async (ctx: CommandInteractionContext): Promise<Message<boolean> | void> => {
        const questId = ctx.interaction.options.getString("use", true);
        const quest = Object.values(ActionQuestsL).find((v) => v.id === questId);
        if (!quest) {
            ctx.makeMessage({
                content:
                    "Error: Quest not found. MAKE SURE YOU'RE USING THE SUGGESTED QUESTS, DON'T TYPE IT YOURSELF!",
            });
            return;
        }

        quest.use(ctx);
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const toRespond: {
            name: string;
            value: string;
        }[] = [];

        for (const quests of [
            userData.daily.quests,
            userData.chapter.quests,
            ...userData.sideQuests.map((v) => v.quests),
        ]) {
            for (const quest of quests) {
                if (Functions.isActionQuest(quest) && !quest.completed) {
                    const originalQuest = Object.values(ActionQuestsL).find(
                        (v) => v.id === quest.id
                    );
                    if (originalQuest) {
                        let from: string;
                        if (userData.daily.quests.find((r) => r.id === originalQuest.id))
                            from = "[FROM YOUR DAILY QUESTS]";
                        else if (userData.chapter.quests.find((r) => r.id === originalQuest.id))
                            from = "[FROM YOUR CHAPTER QUESTS]";
                        else {
                            for (const sideQuest of userData.sideQuests) {
                                if (sideQuest.quests.find((r) => r.id === originalQuest.id))
                                    from = `[FROM YOUR SIDE QUESTS: ${sideQuest.id}]`;
                            }
                        }
                        console.log(quest, "action");
                        if (originalQuest.id.toLowerCase().startsWith(currentInput.toLowerCase()))
                            toRespond.push({
                                name:
                                    originalQuest.emoji +
                                    " " +
                                    interaction.client.translations.get(userData.language)(
                                        `action:${originalQuest.i18n_key}.DESCRIPTION`
                                    ) +
                                    " " +
                                    from,
                                value: originalQuest.id,
                            });
                    }
                }
            }
        }

        interaction.respond(toRespond);
    },
};

export default slashCommand;
