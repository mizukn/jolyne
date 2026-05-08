import type { Middleware, MiddlewareDecision } from "./types";

// `interaction.channel` is null when the bot can't see / send to the channel
// the slash command was invoked from — typically a thread the bot was never
// added to. Bail with a hint about thread permissions so the user can fix it
// without opening a support ticket.
export const channelMiddleware: Middleware = ({ interaction }): MiddlewareDecision => {
    if (interaction.channel) return { stop: false };

    return {
        stop: true,
        reply: {
            content:
                "This command is not available here. If you're on a thread, please make sure that I have the permissions to send/read messages in this thread.",
        },
    };
};
