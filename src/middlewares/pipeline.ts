// Runner for the interactionCreate middleware chain (PLAN.md §P2.1). Each
// middleware is invoked against the shared pipeline object; on a `stop`
// decision we optionally log + reply and return `true` so the caller can
// short-circuit. Middlewares may mutate the pipeline to publish state for
// later steps (e.g. `ctx`, `command`, `notifications`).

import type { Middleware, MiddlewareInput } from "./types";

export async function runStep(
    pipeline: MiddlewareInput,
    middleware: Middleware,
): Promise<boolean> {
    const decision = await middleware(pipeline);
    if (!decision.stop) return false;
    const { interaction } = pipeline;
    if (decision.log) {
        interaction.client.log(decision.log.message, decision.log.type ?? "info");
    }
    if (decision.reply && interaction.isRepliable()) {
        await interaction.reply(decision.reply);
    }
    return true;
}
