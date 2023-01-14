import type { RPGUserDataJSON } from "../@types";
import Jolyne from "./JolyneClient";
import {
    ChatInputCommandInteraction,
    MessagePayload,
    InteractionReplyOptions,
    Message,
    Channel,
    Guild,
    User,
    APIMessage,
    InteractionResponse,
} from "discord.js";

export default class CommandInteractionContext {
    constructor(
        public interaction: ChatInputCommandInteraction & { client: Jolyne },
        private RPGUserData?: RPGUserDataJSON
    ) {}

    get client(): Jolyne {
        return this.interaction.client;
    }

    get userData(): RPGUserDataJSON {
        return this.RPGUserData;
    }

    get user(): User {
        return this.interaction.user;
    }

    get channel(): Channel {
        return this.interaction.channel;
    }

    get guild(): Guild {
        return this.interaction.guild;
    }

    get options(): typeof this.interaction.options {
        return this.interaction.options;
    }

    private resolveMessage(message: Message | APIMessage | null): Message | null {
        if (!message) return null;
        if (message instanceof Message) return message;
        // @ts-expect-error Message constructor is private, but we need it.
        return new Message(this.client, message);
    }

    async makeMessage(options: InteractionReplyOptions): Promise<Message | InteractionResponse> {
        if (options.content) {
            options.content = options.content.replace(
                new RegExp(this.interaction.client.token, "gi"),
                "TOKEN"
            );
        }

        if (this.interaction.replied || this.interaction.deferred)
            return this.interaction.editReply(options);

        try {
            return this.interaction.reply({
                ...options,
                fetchReply: true,
            });
        } catch (_) {
            return this.interaction.reply(options);
        }
    }

    async followUp(options: MessagePayload | InteractionReplyOptions): Promise<Message | null> {
        return this.resolveMessage(await this.interaction.followUp(options));
    }

    translate(
        text: string,
        translateVars: TranslateVars = {
            emojis: this.client.localEmojis,
            user: this.interaction.user,
        }
    ): string {
        if (this.interaction.options.getUser("user"))
            translateVars.user_option = this.interaction.options.getUser("user");
        return this.client.translations.get(this.userData.language)(text, translateVars) || text;
    }

    sendTranslated(
        text: string,
        translateVars: TranslateVars = {
            emojis: this.client.localEmojis,
            user: this.interaction.user,
        }
    ): Promise<Message | InteractionResponse> {
        if (this.interaction.options.getUser("user"))
            translateVars.user_option = this.interaction.options.getUser("user");
        return this.makeMessage({
            content: this.translate(text, translateVars),
        });
    }
}

interface TranslateVars {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
