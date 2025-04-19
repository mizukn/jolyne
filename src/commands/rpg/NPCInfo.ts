import {
    SlashCommandFile,
    Leaderboard,
    equipableItemTypesLimit,
    formattedEquipableItemTypes,
    EquipableItem,
    SkillPoints,
    Weapon,
} from "../../@types";
import { Message, APIEmbed, InteractionResponse } from "discord.js";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import * as FightableNPCS from "../../rpg/NPCs/FightableNPCs";

const totalNPCs = Object.values(FightableNPCS);

const slashCommand: SlashCommandFile = {
    data: {
        name: "npc-info",
        description: "Show information about an NPC (kinda like a player profile)",
        options: [
            {
                name: "npc",
                description: "The NPC you want to see the profile of",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<Message<boolean> | void | InteractionResponse> => {
        const chosenNPC = ctx.options.getString("npc", true);
        const NPC = totalNPCs.find((x) => x.id === chosenNPC);

        const embed: APIEmbed = {
            author: {
                name: NPC.name,
                icon_url: NPC.avatarURL,
            },
            color: 0x70926c,
            thumbnail: {
                url: NPC.stand
                    ? Functions.findStand(NPC.stand, NPC.standsEvolved[NPC.stand])
                        ? Functions.findStand(NPC.stand, NPC.standsEvolved[NPC.stand]).image
                        : undefined
                    : undefined,
            },
            fields: [
                {
                    name: "Infos",
                    value: `:crossed_swords: True Level*: ${Functions.getTrueLevel(
                        NPC
                    ).toLocaleString()}\n${ctx.client.localEmojis.a_} Level: ${
                        NPC.level
                    }\n:heart: HP: ${Functions.localeNumber(
                        Functions.getMaxHealth(NPC)
                    )}\n:zap: Stamina: ${Functions.localeNumber(Functions.getMaxStamina(NPC))}`,
                    inline: true,
                },
                {
                    name: "Equipped Items",
                    value: `${Object.keys(equipableItemTypesLimit)
                        .map((w) => {
                            const formattedType =
                                formattedEquipableItemTypes[
                                    parseInt(w) as keyof typeof formattedEquipableItemTypes
                                ];
                            const equippedItems = Object.keys(NPC.equippedItems).filter(
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
                    inline: true,
                },
                {
                    name: "NPC Bonuses (from items)",
                    value: `\`[+]\` Health: **${
                        Functions.calcEquipableItemsBonus(NPC).health
                    }**\n\`[+]\` Stamina: **${Functions.calcEquipableItemsBonus(NPC).stamina}**\n${
                        ctx.client.localEmojis.xp
                    } XP Boost: **${
                        Functions.calcEquipableItemsBonus(NPC).xpBoost
                    }%**\n${Object.keys(Functions.calcEquipableItemsBonus(NPC).skillPoints)
                        .map((x) => {
                            const bonus =
                                Functions.calcEquipableItemsBonus(NPC).skillPoints[
                                    x as keyof SkillPoints
                                ];
                            if (bonus === 0) return;
                            return `\`[SP]\` ${Functions.capitalize(x)}: **${bonus}**`;
                        })
                        .filter((r) => r)
                        .join("\n")}\n\`[+]\` Stand Disc: **${
                        Functions.calcEquipableItemsBonus(NPC).standDisc
                    }**`,
                    inline: true,
                },
                {
                    name: "Stand",
                    value: NPC.stand
                        ? (() => {
                              const stand = Functions.findStand(
                                  NPC.stand,
                                  NPC.standsEvolved[NPC.stand]
                              );
                              return `${stand.emoji} **${stand.name}** (${stand.rarity}):\n[${
                                  stand.abilities.length
                              }] Abilities: ${stand.abilities.map((a) => a.name).join(", ")}`;
                          })()
                        : "Stand-less",
                    inline: true,
                },
                {
                    name: "Combat Infos",
                    value: `:crossed_swords: Power Level: ${Functions.calculateUserPower(
                        NPC
                    ).toLocaleString()}\n✊ ATK Damage: [${Math.round(
                        Functions.getAttackDamages(NPC) * 0.5
                    ).toLocaleString("en-US")} - ${Math.round(
                        Functions.getAttackDamages(NPC) * 1.1
                    ).toLocaleString("en-US")}]\n:leaves: Dodge score: ${Functions.getDodgeScore(
                        NPC
                    ).toLocaleString("en-US")}\n🔄 Speed score: ${Functions.getSpeedScore(
                        NPC
                    ).toLocaleString("en-US")}`,
                    inline: true,
                },
                {
                    name: "Weapon",
                    value: Object.keys(NPC.equippedItems).find(
                        (r) => Functions.findItem<Weapon>(r).type === 6
                    )
                        ? (() => {
                              const weapon = Functions.findItem<Weapon>(
                                  Object.keys(NPC.equippedItems).find(
                                      (r) => Functions.findItem<Weapon>(r).type === 6
                                  )
                              );
                              return `${weapon.emoji} **${weapon.name}** (${weapon.rarity}):\n${
                                  weapon.description
                              }\nAbilities: ${weapon.abilities.map((a) => a.name).join(", ")}`;
                          })()
                        : "None",
                    inline: true,
                },
            ],
        };

        ctx.makeMessage({
            embeds: [embed],
        });
    },
    autoComplete: async (interaction, userData, currentInput): Promise<void> => {
        const items = totalNPCs.filter(
            (r) =>
                r.name.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.id.toLowerCase().startsWith(currentInput.toLowerCase()) ||
                r.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                r.id.toLowerCase().includes(currentInput.toLowerCase())
        );

        const realItems = items.map((x) => {
            return {
                name: x.name,
                value: x.id,
            };
        });
        if (realItems.length > 24) realItems.length = 24;

        interaction.respond(realItems);
    },
};

export default slashCommand;
