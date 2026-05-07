import type {
    Email,
    EquipableItem,
    EvolutionStand,
    FightableNPC,
    Item,
    NPC,
    Quest,
    Special,
    Stand,
    Weapon,
} from "../@types";
import * as Stands from "../rpg/Stands";
import * as Items from "../rpg/Items";
import * as BaseQuests from "../rpg/Quests/Quests";
import * as Emails from "../rpg/Emails";
import { FightableNPCS, NPCs } from "../rpg/NPCs";

export const findQuest = (query: string): Quest => {
    const quest = Object.values(BaseQuests).find(
        (quest) => quest.id === query || quest.id.toLocaleLowerCase() === query.toLocaleLowerCase(),
    );
    if (!quest) return;

    return quest;
};

export const findEmail = (query: string): Email => {
    if (!query) return;
    if (Object.values(Emails).find((email) => email.id === query)) {
        return Object.values(Emails).find((email) => email.id === query);
    }

    const email = Object.values(Emails).find(
        (email) =>
            (email.id || email.subject) === query ||
            (email.id || email.subject) === query ||
            (email.id || email.subject).toLocaleLowerCase() === query.toLocaleLowerCase() ||
            (email.id || email.subject).toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
            query.toLocaleLowerCase().includes((email.id || email.subject).toLocaleLowerCase()),
    );

    return email;
};

export const findStand = (stand: string, evolution?: number): Stand => {
    if (!stand) return null;

    const stands = Object.values({ ...Stands.Stands, ...Stands.EvolutionStands });
    let foundStand = stands.find(
        (standClass) =>
            standClass.id === stand ||
            ((standClass as Stand).name !== undefined && (standClass as Stand).name === stand) ||
            ((standClass as Stand).name !== undefined &&
                (standClass as Stand).name.toLocaleLowerCase() === stand.toLocaleLowerCase()),
    );
    if (!foundStand) return null;

    if ((foundStand as EvolutionStand).evolutions) {
        if (!evolution) evolution = 0;
        foundStand = {
            id: foundStand.id,
            name: (foundStand as EvolutionStand).evolutions[evolution].name,
            description: (foundStand as EvolutionStand).evolutions[evolution].description,
            image: (foundStand as EvolutionStand).evolutions[evolution].image,
            color: (foundStand as EvolutionStand).evolutions[evolution].color,
            rarity: (foundStand as EvolutionStand).evolutions[evolution].rarity,
            abilities: (foundStand as EvolutionStand).evolutions[evolution].abilities,
            skillPoints: (foundStand as EvolutionStand).evolutions[evolution].skillPoints,
            customAttack: (foundStand as EvolutionStand).evolutions[evolution].customAttack,
            available: (foundStand as EvolutionStand).evolutions[evolution].available,
            emoji: (foundStand as EvolutionStand).evolutions[evolution].emoji,
        } as Stand;
    }

    return foundStand as Stand;
};

export const findNPC = <T extends NPC | FightableNPC>(npc: string, fightable?: boolean): T => {
    if (!npc) return null;

    const npcs = fightable ? Object.values(FightableNPCS) : Object.values(NPCs);

    if (npcs.find((r) => r.id.toLowerCase() === npc.toLowerCase()))
        return npcs.find((r) => r.id.toLowerCase() === npc.toLowerCase()) as T;

    const foundNPC = npcs.find(
        (npcClass) =>
            npcClass.id === npc ||
            npcClass.name === npc ||
            npcClass.name.toLocaleLowerCase() === npc.toLocaleLowerCase() ||
            npcClass.name.toLocaleLowerCase().includes(npc.toLocaleLowerCase()) ||
            npc.toLocaleLowerCase().includes(npcClass.name.toLocaleLowerCase()),
    );

    return foundNPC as T;
};

export const findItem = <T extends Item | EquipableItem | Special | Weapon>(
    name: string,
    includePrivate?: boolean,
): T => {
    if (!name) return null;
    const totalitems = Object.values(Items.default).filter((x) =>
        includePrivate ? true : !x.private,
    );

    if (totalitems.find((item) => item.id.toLowerCase() === name.toLowerCase()))
        return (
            (totalitems.find((item) => item.id.toLowerCase() === name.toLowerCase()) as T) || null
        );
    return (totalitems.find((item) => item.id.toLocaleLowerCase() === name.toLocaleLowerCase()) ||
        totalitems.find((item) => item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase())) ||
        totalitems.find((item) =>
            item.id.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()),
        ) ||
        totalitems.find((item) => item.id.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())) ||
        totalitems.find((item) =>
            item.id.toLocaleLowerCase().includes(name.toLocaleLowerCase().replace(/ /g, "")),
        ) ||
        totalitems.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()),
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().endsWith(name.toLocaleLowerCase()),
        ) ||
        totalitems.find((item) =>
            item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase().replace(/ /g, "")),
        )) as T;
};
