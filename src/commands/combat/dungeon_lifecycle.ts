import { cloneDeep } from "lodash";
import type { possibleModifiers as PossibleModifierId, RPGUserDataJSON } from "../../@types";
import type CommandInteractionContext from "../../structures/CommandInteractionContext";
import DungeonHandler from "../../structures/DungeonHandler";
import * as Functions from "../../utils/Functions";
import { giveRewards } from "./dungeon_rewards";

export const safeDungeonReply = async (
    dungeon: DungeonHandler,
    ctx: CommandInteractionContext,
    content: string,
): Promise<void> => {
    if (dungeon.message) {
        const replied = await dungeon.message
            .reply({ content })
            .then(() => true)
            .catch(() => false);
        if (replied) return;
    }

    await ctx.followUp({ content }).catch(() => undefined);
};

export const finalizeDungeonRewards = async (
    dungeon: DungeonHandler,
    ctx: CommandInteractionContext,
    selectedModifiers: PossibleModifierId[],
    options: {
        consumeKey?: boolean;
    } = {},
): Promise<void> => {
    await giveRewards(dungeon, ctx, selectedModifiers, options).catch((error) => {
        ctx.client.log(
            `Dungeon reward finalization failed: ${
                error instanceof Error ? error.stack ?? error.message : String(error)
            }`,
            "error",
        );
    });
};

export const hasDungeonProgress = (dungeon: DungeonHandler): boolean =>
    dungeon.stage > 0 || dungeon.beatenEnemies.length > 0;

export const isMessageAccessFailure = (reason: string): boolean =>
    reason.includes("permission") ||
    reason.includes("Missing Access") ||
    reason.includes("50001") ||
    reason.includes("50013") ||
    reason.includes("message access") ||
    reason.includes("send messages");

export const recordDungeonAttempt = async (
    ctx: CommandInteractionContext,
    players: RPGUserDataJSON[],
): Promise<void> => {
    for (const player of players) {
        await ctx.client.database.setRPGCooldown(player.id, "dungeon", 1000 * 60 * 15);
        const key = `dungeonDone:${player.id}:${Functions.getTodayString()}`;
        const dungeonDoneToday = await ctx.client.database.getString(key);
        const dungeonDoneTodayCount = dungeonDoneToday ? parseInt(dungeonDoneToday) : 0;
        await ctx.client.database.redis.set(key, (dungeonDoneTodayCount + 1).toString());
    }
};

export const consumeDungeonKeyOnly = async (
    ctx: CommandInteractionContext,
    dungeon: DungeonHandler,
): Promise<void> => {
    const host = await ctx.client.database.getRPGUserData(ctx.userData.id);
    if (!host) return;

    const oldData = cloneDeep(host);
    const removedKey = Functions.removeItem(host, "dungeon_key", 1);
    await ctx.client.database.handleTransaction(
        [
            {
                oldData,
                newData: host,
            },
        ],
        `Aborted a dungeon before progress after losing message access: total of ${dungeon.stage} waves and beaten ${dungeon.beatenEnemies.length} enemies.`,
        [removedKey],
    );
};
