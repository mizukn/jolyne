import type {
	RPGUserDataHash,
	SkillPoints,
	RPGUserDataInventoryHash,
	Email,
	RPGUserDataEmailsHash,
	RPGUserDataJSON,
} from "../@types";
import redis from "./RedisHandler";
import JolyneClient from "../structures/JolyneClient";
import * as Consumables from "./rpg/Items/ConsumableItems";
import { User } from "discord.js";

export default class DatabaseHandler {
	redis: redis;
	_client: JolyneClient;

	constructor(client: JolyneClient) {
		this.redis = new redis();
		this._client = client;
	}

	async fetchUserData(user: string): Promise<RPGUserDataHash> {
		const data = (await this.redis.hgetall(
			`userData_${user}`
		)) as RPGUserDataHash;
		if (!data) return null;
		return data;
	}

	async setUserData(user: string, data: RPGUserDataHash): Promise<"OK"> {
		return await this.redis.client.hmset(`userData_${user}`, data);
	}

	async changeUserDataValue(
		user: string,
		key: string,
		value: string | number
	): Promise<number> {
		return await this.redis.hset(`userData_${user}`, key, value);
	}

	async createUserData(
		user: string | User,
		overwrite?: true
	): Promise<RPGUserDataHash> {
		if (typeof user === "string") {
			user = await this._client.users.fetch(user).catch(() => null);
		}
		if (!user) return null;
		user = user as User;

		if (!overwrite) {
			const data = await this.fetchUserData(user.id);
			if (data) return data;
		}
		const userData: RPGUserDataJSON = {
			id: user.id,
			tag: user.tag,
			level: 1,
			health: 100,
			stamina: 60,
			xp: 0,
			coins: 500,
			language: "en-US",
			stand: null,
			chapter: {
				id: 1,
				quests: 
			}
			adventureStartedAt: Date.now(),
		};

		const skillPoints: SkillPoints = {
			defense: 0,
			strength: 0,
			speed: 0,
			perception: 0,
		};

		const inventory: RPGUserDataInventoryHash = {
			[Consumables.Pizza.id]: 3,
		};

		await this.redis
			.multi()
			.hmset(`userData_${user.id}`, userData)
			.hmset(`userData_${user.id}:skillPoints`, skillPoints)
			.hmset(`userData_${user.id}:inventory`, inventory)
			.exec();

		// TODO: Add chapter quests

		return userData;
	}

	async addCoins(user: string, amount: number): Promise<number> {
		return await this.redis.hincrby(`userData_${user}`, "coins", amount);
	}

	async addEmail(user: string, email: Email): Promise<number> {
		const formattedEmailHash: RPGUserDataEmailsHash = {
			id: email.id,
			read: false,
			archived: false,
			date: Date.now(),
		};
		return await this.redis.hset(
			`userData_${user}:emails`,
			email.id,
			JSON.stringify(formattedEmailHash)
		);
	}
	async fetchUserEmails(user: string): Promise<RPGUserDataEmailsHash[]> {
		const emails = await this.redis.hgetall(`userData_${user}:emails`);
		if (!emails) return null;

		const formattedEmailHash: RPGUserDataEmailsHash[] = Object.keys(emails).map(
			(v) => JSON.parse(emails[v]) as RPGUserDataEmailsHash
		);
		return formattedEmailHash;
	}

	async getCooldownCache(
		base: string,
		target?: string
	): Promise<string | null> {
		if (!target) {
			const keys = await this.redis.client.keys(`tempCache_*${base}`);
			if (keys.filter((r) => r.includes(base)).length !== 0)
				return keys.filter((r) => r.includes(base))[0];
			else return null;
		}
		return await this.redis.client
			.get(`tempCache_${base}:${target}`)
			.then((r) => r || null);
	}

	async setCooldownCache(
		base: string,
		target: string,
		value: string | number = Date.now()
	): Promise<string> {
		return await this.redis.client.set(`tempCache_${base}:${target}`, value);
	}
	async delCooldownCache(
		base: string,
		target?: string
	): Promise<string | number> {
		if (!target) return await this.redis.client.del(`tempCache_*${base}`);
		return await this.redis.client.del(`tempCache_${base}:${target}`);
	}
}
