import type { RPGUserDataJSON, SkillPointsBuildArr } from "../@types";
import type DatabaseHandler from "../structures/DatabaseHandler";
import * as Functions from "../utils/Functions";

export const updateSkillPointsBuilds = async (
    database: DatabaseHandler,
): Promise<SkillPointsBuildArr> => {
    const users = await database.redis.keys(`${process.env.REDIS_PREFIX}:*`);
    const builds: SkillPointsBuildArr = [];
    for (const user of users) {
        const data = await database.getJSONData(user);
        if (data) {
            const userData = data as RPGUserDataJSON;
            if (Functions.getRawSkillPointsLeft(userData) === 0) {
                builds.push({
                    level: userData.level,
                    skillPoints: Functions.getSkillPointsBuild(userData),
                });
            }
        }
    }

    await database.redis.set("skillPointsBuilds", JSON.stringify(builds));
    return builds;
};
