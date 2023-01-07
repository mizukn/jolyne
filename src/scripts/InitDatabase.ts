import { createClient, SchemaFieldTypes } from "redis";
import pg from "pg";

const redisClient = createClient();

redisClient.on("connect", async () => {
	console.log("Redis connected, creating index for RPGUsers");
	await redisClient.ft
		.create(
			// @ts-expect-error I can't use NUMERIC lols badly typed
			`idx:rpgusers`,
			{
				"$.id": {
					type: SchemaFieldTypes.TEXT,
					AS: "id",
				},
				"$.tag": {
					type: SchemaFieldTypes.TEXT,
					AS: "tag",
				},
				"$.level": {
					type: SchemaFieldTypes.NUMERIC,
					AS: "level",
					SORTABLE: "UNF",
				},
				"$.health": {
					type: SchemaFieldTypes.NUMERIC,
					AS: "health",
					SORTABLE: "UNF",
				},
				"$.coins": {
					type: SchemaFieldTypes.NUMERIC,
					AS: "coins",
					SORTABLE: "UNF",
				},
				"$.stand": {
					type: SchemaFieldTypes.TEXT,
					AS: "stand",
				},
				"$.language": {
					type: SchemaFieldTypes.TEXT,
					AS: "language",
				},
				"$.chapter.id": {
					type: SchemaFieldTypes.NUMERIC,
					AS: "chapterId",
				},
				"$.sideQuests[*].id": {
					type: SchemaFieldTypes.TEXT,
					AS: "hasSideQuestId",
				},
			},
			{
				ON: "JSON",
				PREFIX: "rpgusers:",
			}
		)
		.catch(() => console.log("already exists"));
	console.log("Index created, creating index for RPGItems");
	await redisClient.quit();
	process.exit(0);
});

redisClient.connect();
