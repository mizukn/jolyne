// Shared shape for the interactionCreate middleware pipeline (PLAN.md §P2.1).
//
// Each middleware is a small unit of pre-command work — gate checks, data
// fetches, side effects, save. The pipeline runs them in order and short-
// circuits on the first `stop: true` decision. Keeping the result type
// explicit (rather than relying on thrown exceptions or mutated globals)
// makes each middleware trivially testable in isolation.

import type { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";
import type JolyneClient from "../structures/JolyneClient";
import type CommandInteractionContext from "../structures/CommandInteractionContext";
import type { SlashCommand } from "../@types";

export type ChatInputInteraction = ChatInputCommandInteraction & { client: JolyneClient };

export interface MiddlewareInput {
    interaction: ChatInputInteraction;
    /** The resolved `SlashCommand`, present after the lookup middleware runs. */
    command?: SlashCommand;
    /** The wrapped context, present after the user-data middleware runs. */
    ctx?: CommandInteractionContext;
}

export type StopDecision = {
    stop: true;
    /** Reply payload to send. If absent, the middleware short-circuits silently. */
    reply?: InteractionReplyOptions;
    /** Optional log entry (forwarded to `client.log`) before the reply is sent. */
    log?: { message: string; type?: string };
};

export type ContinueDecision = { stop: false };

export type MiddlewareDecision = StopDecision | ContinueDecision;

export type Middleware = (
    input: MiddlewareInput,
) => MiddlewareDecision | Promise<MiddlewareDecision>;
