import { RPGUserDataJSON } from "../@types";
import {
	createClient,
	RedisClientType,
	RedisScripts,
	RedisModules,
	RedisFunctions,
} from "redis";
import JolyneClient from "../structures/JolyneClient";
import { User } from "discord.js";
import * as Chapters from "../rpg/Chapters/Chapters";
import * as Functions from "../utils/Functions";
import { Pool } from "pg";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RedisJSONArray extends Array<RedisJSON> {}
interface RedisJSONObject {
	[key: string]: RedisJSON;
	[key: number]: RedisJSON;
}
type RedisJSON =
	| null
	| boolean
	| number
	| string
	| Date
	| RedisJSONArray
	| RedisJSONObject;

type LocalRedisJSON = RedisJSON | RPGUserDataJSON;

export default class DatabaseHandler {
	postgresql: Pool;
	redis: RedisClientType<
		{
			json: {
				del: typeof import("@redis/json/dist/commands/DEL");
				get: typeof import("@redis/json/dist/commands/GET");
				mGet: typeof import("@redis/json/dist/commands/MGET");
				set: typeof import("@redis/json/dist/commands/SET");
				type: typeof import("@redis/json/dist/commands/TYPE");
			};
			ft: {
				_LIST: typeof import("@redis/search/dist/commands/_LIST");
				_list: typeof import("@redis/search/dist/commands/_LIST");
				alter: typeof import("@redis/search/dist/commands/ALTER");
				create: typeof import("@redis/search/dist/commands/CREATE");
				dictDump: typeof import("@redis/search/dist/commands/DICTDUMP");
				dropIndex: typeof import("@redis/search/dist/commands/DROPINDEX");
				info: typeof import("@redis/search/dist/commands/INFO");
				search: typeof import("@redis/search/dist/commands/SEARCH");
				spellCheck: typeof import("@redis/search/dist/commands/SPELLCHECK");
			};
		} & RedisModules,
		RedisFunctions,
		RedisScripts
	>;

	private jolyneClient: JolyneClient;

	constructor(client: JolyneClient) {
		this.jolyneClient = client;
		this.redis = createClient({
			database: process.env.DEV_MODE === "true" ? 2 : 1,
		});
		this.postgresql = new Pool({
			user: process.env.PSQL_USER,
			host: "127.0.0.1",
			database: process.env.PSQL_DB,
			password: process.env.PSQL_PASSWORD,
			port: 5432,
		});
		// prettier-ignore
		Promise.all([
			this.redis.connect(),
			this.postgresql.connect()
		]);
	}

	async reloadRPGUsers(): Promise<void> {
		const result = await this.postgresql.query(`SELECT * FROM "RPGUsers"`);
		for (const row of result.rows) {
			const userData: RPGUserDataJSON = row;
			await this.setJSONData(
				`${process.env.REDIS_PREFIX}:${userData.id}`,
				userData
			);
		}
	}

	async setString(key: string, value: string): Promise<void> {
		await this.redis.set(key, value);
	}

	async getString(key: string): Promise<string | null> {
		return await this.redis.get(key);
	}

	async setJSONData(key: string, data: LocalRedisJSON): Promise<string> {
		if (key.startsWith(`${process.env.REDIS_PREFIX}:`)) {
			// postgresql save
			const userData = data as RPGUserDataJSON;
			const columns = Object.keys(userData);
			const values = Object.values(userData);
			const query = `INSERT INTO "RPGUsers" (${columns.join(
				", "
			)}) VALUES (${values
				.map((v, i) => `$${i + 1}`)
				.join(", ")}) ON CONFLICT (id) DO UPDATE SET (${columns.join(
				", "
			)}) = (${values.map((v, i) => `$${i + 1}`).join(", ")})`;

			this.postgresql.query(query, values).catch(() => console.error);
		}
		return await this.redis.json.set(key, "$", data as RedisJSON);
	}
	async getJSONData(key: string): Promise<LocalRedisJSON> {
		return await this.redis.json.get(key);
	}
	async searchRPGUser(
		query: string
	): Promise<{ total: number; documents: RPGUserDataJSON[] }> {
		const result: { total: number; documents: LocalRedisJSON[] } =
			await this.redis.ft.search(`idx:${process.env.REDIS_PREFIX}`, query);
		return result as { total: number; documents: RPGUserDataJSON[] };
	}

	async createUserData(
		user: string | User,
		overwrite?: true
	): Promise<RPGUserDataJSON> {
		if (typeof user === "string") {
			user = await this.jolyneClient.users.fetch(user).catch(() => null);
		}
		if (!user) return null;
		user = user as User;

		if (!overwrite) {
			let data = await this.getJSONData(
				`${process.env.REDIS_PREFIX}:${user.id}`
			);
			if (data) return data as RPGUserDataJSON;

			data = await this.postgresql
				.query(`SELECT * FROM "RPGUsers" WHERE id = $1`, [user.id])
				.then((res) => res.rows[0]);
			if (data) {
				await this.setJSONData(
					`${process.env.REDIS_PREFIX}:${user.id}`,
					data as LocalRedisJSON
				);
				return data as RPGUserDataJSON;
			}
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
				quests: Chapters.C1.quests.map((q) => Functions.pushQuest(q)),
			},
			sideQuests: [],
			skillPoints: {
				strength: 0,
				defense: 0,
				speed: 0,
				stamina: 0,
				perception: 0,
			},
			inventory: {
				pizza: 5,
				mysterious_arrow: 1,
			},
			adventureStartedAt: Date.now(),
		};

		const query = `INSERT INTO "RPGUsers" (${Object.keys(userData)
			.map((c) => `"${c}"`)
			.join(", ")}) VALUES (${Object.values(userData)
			.map((v, i) => `$${i + 1}`)
			.join(", ")}) ON CONFLICT (id) DO UPDATE SET (${Object.keys(userData)
			.map((c) => `"${c}"`)
			.join(", ")}) = (${Object.values(userData)
			.map((v, i) => `$${i + 1}`)
			.join(", ")})`;
		console.log(Object.values(userData) instanceof Array, query);
		await this.postgresql.query(query, Object.values(userData));
		await this.setJSONData(`${process.env.REDIS_PREFIX}:${user.id}`, userData);

		return userData;
	}

	async getCooldownCache(
		base: string,
		target?: string
	): Promise<string | null> {
		if (!target) {
			const keys = await this.redis.keys(`tempCache_*${base}`);
			if (keys.filter((r) => r.includes(base)).length !== 0)
				return keys.filter((r) => r.includes(base))[0];
			else return null;
		}
		return await this.redis
			.get(`tempCache_${base}:${target}`)
			.then((r) => r || null);
	}

	async setCooldownCache(
		base: string,
		target: string,
		value: string | number = Date.now()
	): Promise<string> {
		return await this.redis.set(`tempCache_${base}:${target}`, value);
	}
	async delCooldownCache(
		base: string,
		target?: string
	): Promise<string | number> {
		if (!target) return await this.redis.del(`tempCache_*${base}`);
		return await this.redis.del(`tempCache_${base}:${target}`);
	}
}
