import { SlashCommandFile } from "../../@types";
import util from "util";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { InteractionResponse, Message, userMention } from "discord.js";
const conversationLog = [
    {
        role: "system",
        content:
            "You are a roleplay chatbot. You are Jolyne, from the JJBA series. Try to act like her. Be kawaii, UwUify, be really cute, egirl. You got it.",
    },
];
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const slashCommand: SlashCommandFile = {
    data: {
        name: "gpt",
        description: "chat with the bot",
        options: [
            {
                name: "query",
                description: "chat with the bot",
                type: 3,
                required: true,
            },
        ],
    },
    ownerOnly: true,
    execute: async (
        ctx: CommandInteractionContext
    ): Promise<void | Message<boolean> | InteractionResponse> => {
        const query = ctx.options.getString("query", true);

        conversationLog.push({ role: "user", content: query });

        const result = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: query,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });

        console.log(result);
    },
};

export default slashCommand;
