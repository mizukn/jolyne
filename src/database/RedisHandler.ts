import redis, { ChainableCommander } from "ioredis";
import log from "../utils/Logger";

export default class RedisHandler {
	client: redis;
	connect: Promise<void>;
	connected: boolean;
	connectResolve: (value: void | PromiseLike<void>) => void;

	constructor() {
		this.connected = false;
		this.connect = new Promise((resolve) => (this.connectResolve = resolve));
		this.client = new redis({
			db: process.env.DEV_MODE === "true" ? 2 : 1,
		}).on("connect", () => {
			this.connected = true;
			log("Connected.", "redis");
			if (this.connectResolve) this.connectResolve();
		});
	}

	async get(key: string): Promise<string> {
		return await this.client.get(key);
	}

	async set(key: string, value: string): Promise<"OK"> {
		return await this.client.set(key, value);
	}

	async del(key: string): Promise<number> {
		return await this.client.del(key);
	}

	async hget(key: string, field: string): Promise<string> {
		return await this.client.hget(key, field);
	}

	async hset(
		key: string,
		field: string,
		value: string | number
	): Promise<number> {
		return await this.client.hset(key, field, value);
	}

	async hdel(key: string, field: string): Promise<number> {
		return await this.client.hdel(key, field);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async hgetall(key: string): Promise<Record<string, any>> {
		const data = (await this.client.hgetall(key)) as Record<
			string,
			string | number
		>;
		for (const key in data) {
			if (!isNaN(Number(data[key]))) data[key] = Number(data[key]);
		}
		return data;
	}

	async hkeys(key: string): Promise<string[]> {
		return await this.client.hkeys(key);
	}

	async hincrby(
		key: string,
		field: string,
		increment: number
	): Promise<number> {
		return await this.client.hincrby(key, field, increment);
	}

	async hincrbyfloat(
		key: string,
		field: string,
		increment: number
	): Promise<string> {
		return await this.client.hincrbyfloat(key, field, increment);
	}

	async hmset(key: string, jsonData: object): Promise<"OK"> {
		return await this.client.hmset(key, jsonData);
	}

	async hmget(key: string, ...args: string[]): Promise<string[]> {
		return await this.client.hmget(key, ...args);
	}

	async keys(pattern: string): Promise<string[]> {
		return await this.client.keys(pattern);
	}

	async hexists(key: string, field: string): Promise<number> {
		return await this.client.hexists(key, field);
	}
	multi(): ChainableCommander {
		return this.client.multi();
	}
}
