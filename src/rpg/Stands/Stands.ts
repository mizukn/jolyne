import { Stand } from "../../@types";
import * as Emojis from "../../emojis.json";

export const Star_Platinum: Stand = {
	id: "star_platinum",
	name: "Star Platinum",
	description:
		"Star Platinum is a very strong humanoid Stand. It was designed to look like a guardian spirit. It was used by [Jotaro Kujo](https://jojo.fandom.com/wiki/Jotaro_Kujo)",
	rarity: "S",
	emoji: Emojis["sp"],
	abilities: [],
	skillPoints: {
		strength: 10,
		defense: 5,
		perception: 5,
		speed: 5,
		stamina: 0,
	},
	available: true,
};
