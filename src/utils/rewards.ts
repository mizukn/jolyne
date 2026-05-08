import type { RPGUserDataJSON } from "../@types";

export const getMaxXp = function getMaxXP(level: RPGUserDataJSON["level"]): number {
    return (level / 5) * 1000 * 13;
};

export const getRewards = (
    level: number,
): {
    coins: number;
    xp: number;
} => {
    const rewards = {
        coins: level * 1000 - (level * 1000 * 25) / 100,
        xp: level * 400 - (level * 400 * 10) / 100,
    };
    if (rewards.coins > 6000) rewards.coins = 6000;

    return rewards;
};

export const TopGGVoteRewards = (userData: RPGUserDataJSON): { coins: number; xp: number } => {
    let xp = Math.round((getMaxXp(userData.level) * 5) / 100);
    const coins = 15000;

    if (xp > 20000) {
        xp = 20000;
        xp += getMaxXp(userData.level) * 0.08;
    }

    xp = Math.round(xp * 2);

    return {
        coins,
        xp,
    };
};
