import type { FightableNPC } from "../../../@types";
import * as NPCs from "./index";

export const Harry_Lester: FightableNPC = {
	...NPCs.Harry_Lester,
	level: 1,
	skill_points: {
		defense: 0,
		strength: 0,
		speed: 0,
		perception: 0,
	},
	stand: null,
};
