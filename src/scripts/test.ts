import { createClient, SchemaFieldTypes } from "redis";

const client = createClient();

client.on("connect", async () => {
	console.log("Redis connected");
	await client.ft
		.create(
			`mobiles:tt`,
			{
				"$.attributes[*].value": {
					type: SchemaFieldTypes.TAG,
					AS: "attributes",
				},
				"$.brand": {
					type: SchemaFieldTypes.TEXT,
					AS: "brand",
				},
			},
			{
				ON: "JSON",
				PREFIX: "mobiles:",
			}
		)
		.catch(() => console.log("already exists"));
	await client.json.set("mobiles:1", "$", {
		brand: "Apple",
		model: "iPhone 12",
		attributes: [
			{
				name: "color",
				value: "black",
			},
			{
				name: "color",
				value: "white",
			},
			{
				name: "color",
				value: "red x",
			},
		],
	});
	const date = Date.now();
	console.log(
		await client.ft
			.search("mobiles:tt", "@attributes:{white}")
			.then((r) => r.documents[0]),
		"took",
		Date.now() - date
	);
	const date2 = Date.now();
	console.log(await client.json.get("mobiles:1"), "took", Date.now() - date2);
	await client.json.del("mobiles:1");
	await client.ft.dropIndex("mobiles:tt");
	await client.quit();
	process.exit(0);
});

client.connect();
