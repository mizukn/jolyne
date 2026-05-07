import type { Rarity, Special, Stand } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as NPCs from "../NPCs/NPCs";
import * as Stands from "../Stands";
import * as Functions from "../../utils/Functions";
import Items from ".";

const itemRegistry = Items as unknown as Record<string, Special>;

const standPrices: Record<Rarity, number> = {
    SS: 200000,
    S: 50000,
    A: 25000,
    B: 10000,
    C: 5000,
    T: 69,
};

const getInitials = (name: string): string =>
    name
        .split(" ")
        .map((x) => x[0])
        .join("");

const comasAnd = (arr: string[]): string => {
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(", ") + " and " + arr.slice(-1);
};

const getStandDiscTargets = (): Stand[] => [
    ...Object.values(Stands.Stands),
    ...Object.values(Stands.EvolutionStands).map((x) => ({
        ...x.evolutions[0],
        id: x.id,
    })),
];

export const registerStandDiscs = (): void => {
    for (const stand of getStandDiscTargets()) {
        if (!stand.available) continue;

        const evolutions = Object.values(Stands.EvolutionStands).find((x) => x.id === stand.id);
        const standDisc: Special = {
            id: `${stand.id}.$disc$`,
            name:
                stand.name +
                " Stand Disc" +
                (evolutions
                    ? ` [${evolutions.evolutions.map((x) => getInitials(x.name)).join(", ")}]`
                    : ""),
            description:
                "A disc that contains the power of " +
                (evolutions ? comasAnd(evolutions.evolutions.map((x) => x.name)) : stand.name),
            rarity: stand.rarity,
            price: standPrices[stand.rarity],
            tradable: true,
            storable: true,
            emoji: stand.emoji + Emojis.disk,
            use: async (ctx) => {
                if (Functions.findStand(ctx.userData.stand)) {
                    ctx.makeMessage({
                        content: `Dawg you already have a stand. If you'd like to change your stand, please either erase your current one (${ctx.client.getSlashCommandMention(
                            "stand erase"
                        )}) or store it (${ctx.client.getSlashCommandMention("stand store")})`,
                    });
                    return 0;
                }

                ctx.userData.stand = stand.id;
                const newStand = Functions.findStand(
                    ctx.userData.stand,
                    ctx.userData.standsEvolved[ctx.userData.stand]
                );
                ctx.makeMessage({
                    content: Functions.makeNPCString(
                        NPCs.Pucci,
                        "You have successfully equipped **" +
                            newStand.name +
                            "** " +
                            newStand.emoji +
                            " !"
                    ),
                });
                return 1;
            },
        };

        itemRegistry[standDisc.id] = standDisc;
    }
};
