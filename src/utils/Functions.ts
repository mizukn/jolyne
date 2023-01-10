import {
	NPC,
	FightNPCQuest,
	Quest,
	MustReadEmailQuest,
	Email,
	ActionQuest,
	Action,
	ClaimXQuest,
	ClaimItemQuest,
	UseXCommandQuest,
	Quests,
	Item,
	Garment,
	RPGUserQuest,
} from "../@types";

export const generateRandomId = (): string => {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const randomArray = (array: any[]): any => {
	return array[Math.floor(Math.random() * array.length)];
};

export const isGarment = (item: Item): item is Garment => {
	return (item as Garment).skill_points !== undefined;
};

export const isBaseQuest = (quest: Quests): quest is Quest => {
	return (quest as Quest).i18n_key !== undefined;
};

export const isFightNPCQuest = (quest: Quests): quest is FightNPCQuest => {
	return (quest as FightNPCQuest).npc !== undefined;
};

export const isMustReadEmailQuest = (
	quest: Quests
): quest is MustReadEmailQuest => {
	return (quest as MustReadEmailQuest).email !== undefined;
};

export const isActionQuest = (quest: Quests): quest is ActionQuest => {
	return (quest as ActionQuest).action !== undefined;
};

export const pushQuest = (quest: Quests): RPGUserQuest => {
	const questData: Quests = {
		...quest,
	};
	if (isBaseQuest(questData)) {
		delete questData.i18n_key;
	}
	if (
		!isActionQuest(questData) ||
		!isFightNPCQuest(questData) ||
		!isMustReadEmailQuest(questData)
	) {
		delete (questData as Quest).completed;
	}

	return questData as RPGUserQuest;
};

export const generateFightQuest = (
	npc: NPC,
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): FightNPCQuest => {
	const quest: FightNPCQuest = {
		id: generateRandomId(),
		completed: false,
		npc: npc.id,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};

export const generateMustReadEmailQuest = (
	email: Email,
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): MustReadEmailQuest => {
	const quest: MustReadEmailQuest = {
		id: generateRandomId(),
		completed: false,
		email: email.id,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};

export const generateActionQuest = (
	action: Action,
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ActionQuest => {
	const quest: ActionQuest = {
		id: generateRandomId(),
		completed: false,
		action: action.id,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};

export const generateClaimXQuest = (
	x: ClaimXQuest["x"],
	goal: ClaimXQuest["goal"],
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ClaimXQuest => {
	const quest: ClaimXQuest = {
		id: generateRandomId(),
		amount: 0,
		x,
		goal,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};

export const generateClaimItemQuest = (
	item: ClaimItemQuest["item"],
	goal: ClaimXQuest["goal"],
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): ClaimItemQuest => {
	const quest: ClaimItemQuest = {
		id: generateRandomId(),
		amount: 0,
		item,
		goal,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};

export const generateUseXCommandQuest = (
	command: UseXCommandQuest["command"],
	goal: ClaimXQuest["goal"],
	pushQuestWhenCompleted?: Quest["pushQuestWhenCompleted"],
	pushEmailWhenCompleted?: Quest["pushEmailWhenCompleted"]
): UseXCommandQuest => {
	const quest: UseXCommandQuest = {
		id: generateRandomId(),
		amount: 0,
		command,
		goal,
		pushEmailWhenCompleted,
		pushQuestWhenCompleted,
	};

	return quest;
};
