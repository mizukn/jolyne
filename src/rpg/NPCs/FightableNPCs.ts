import type { FightableNPC } from "../../@types";
import * as NPCs from "./NPCs";

export const Harry_Lester: FightableNPC = {
	...NPCs.Harry_Lester,
	level: 1,
	skill_points: {
		defense: 0,
		strength: 0,
		speed: 0,
		perception: 0,
		stamina: 0,
	},
	stand: null,
};

export const Kakyoin: FightableNPC = {
	...NPCs.Kakyoin,
	level: 1,
	skill_points: {
		defense: 1,
		strength: 1,
		speed: 1,
		perception: 1,
		stamina: 0,
	},
	stand: "Hierophant Green",
};
