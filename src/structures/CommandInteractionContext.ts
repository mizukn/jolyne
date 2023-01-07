// https://github.com/MenheraBot/MenheraBot helped me a lot with making this class

import type { RPGUserDataHash } from "../@types";
import Jolyne from "./JolyneClient";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
	CommandInteraction,
	MessagePayload,
	InteractionReplyOptions,
	Message,
	Channel,
	Guild,
	User,
	APIMessage,
} from "discord.js";

export default class CommandInteractionContext {
	constructor(
		public interaction: CommandInteraction & { client: Jolyne },
		public userData?: RPGUserDataHash
	) {}

	get client(): Jolyne {
		return this.interaction.client;
	}

	get author(): User {
		return this.interaction.user;
	}

	get channel(): Channel {
		return this.interaction.channel;
	}

	get guild(): Guild {
		return this.interaction.guild;
	}

	private resolveMessage(message: Message | APIMessage | null): Message | null {
		if (!message) return null;
		if (message instanceof Message) return message;
		// @ts-expect-error Message constructor is private, but we need it.
		return new Message(this.client, message);
	}

	async makeMessage(options: object): Promise<Message | null> {
		if (this.interaction.replied || this.interaction.deferred)
			return this.resolveMessage(await this.interaction.editReply(options));

		return this.resolveMessage(
			await this.interaction.reply({ ...options, fetchReply: true })
		);
	}

	async followUp(
		options: MessagePayload | InteractionReplyOptions
	): Promise<Message | null> {
		return this.resolveMessage(await this.interaction.followUp(options));
	}

	translate(
		text: string,
		translateVars: {
			emojis: Record<string, string>;
			user: User;
			user_option?: User;
		} = {
			emojis: this.client.localEmojis,
			user: this.interaction.user,
		}
	): string {
		if (this.interaction.options.getUser("user"))
			translateVars.user_option = this.interaction.options.getUser("user");
		return (
			this.client.translations.get(this.userData.language)(
				text,
				translateVars
			) || text
		);
	}
}
