import type { SlashCommand } from "../@types";
import { Client, Collection, ClientOptions } from "discord.js";
import { TFunction } from "i18next";
import { REST } from "@discordjs/rest";
import { ClusterManager } from "discord-hybrid-sharding";
import emojis from "../emojis.json";
import log from "../utils/Logger";
import database from "../database";

export default class Jolyne extends Client {
	_ready: boolean;
	localEmojis = emojis;
	_rest: REST;
	commands: Collection<string, SlashCommand> = new Collection();
	cooldowns: Collection<string, number> = new Collection();
	log: typeof log;
	database: database;
	translations: Map<string, TFunction>;
	cluster: ClusterManager;
	patreons: { id: string; level: number }[] = [];
	boosters: string[] = [];
	testers: string[] = [];

	constructor(options?: ClientOptions) {
		super(options);
		this._ready = false;
		this.log = log;
		this.database = new database(this);
		this._rest = new REST({
			version: "9",
		}).setToken(process.env.CLIENT_TOKEN);
	}
}
