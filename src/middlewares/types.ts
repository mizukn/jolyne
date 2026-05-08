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
    /**
     * Notifications accumulated by middlewares that observe RPG-state side
     * effects (Patreon rewards, sidequest enrollment, level-ups, low-health
     * reminders, …). The save middleware joins them with `\n\n` and queues
     * the result as a single follow-up so users get one consolidated bubble
     * instead of one Discord message per concern.
     */
    notifications?: string[];
    /**
     * Resolved command path including the subcommand if the command declares
     * one (e.g. "settings notifications", "fight quest"). Populated by the
     * userData middleware once `command` is known. Quest effects compare
     * against this to increment `UseXCommand` quest counters.
     */
    commandName?: string;
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
