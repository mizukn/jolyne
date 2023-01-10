// file will be deleted as well.

import { Pool, QueryResult } from "pg";
import log from "../utils/Logger";

// note: we're using postgresql as backup for redis
export default class PostgresHandler {
	connect: Promise<void>;
	connected: boolean;
	connectResolve: (value: void | PromiseLike<void>) => void;
	client: Pool;

	constructor() {
		this.connect = new Promise((resolve) => (this.connectResolve = resolve));
		this.connected = false;
		this.client = new Pool({
			user: process.env.PSQL_USER,
			host: "127.0.0.1",
			database: process.env.PSQL_DB,
			password: process.env.PSQL_PASSWORD,
			port: 5432,
		})
			.on("connect", () => {
				if (!this.connected) {
					this.connected = true;
					log("Connected.", "postgres");
					if (this.connectResolve) this.connectResolve();
				}
			})
			.on("error", (e) => {
				throw new PostgreSQLError(e.stack);
			});

		this.client.connect();
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	query(query: string, ...args: any[]): Promise<QueryResult> {
		return new Promise((resolve, reject) => {
			this.client.query(query, args, (error, results) => {
				if (error)
					reject(new PostgreSQLError(error.stack.replace("error: ", "")));
				else resolve(results);
			});
		});
	}
}

class PostgreSQLError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PostgreSQLError";
	}
}
