import { describe, expect, it, beforeEach, vi } from "vitest";
import { MessageFlags } from "discord.js";

import { channelMiddleware } from "./channel";
import { commandCooldownMiddleware } from "./commandCooldown";
import { deprecatedRedirectMiddleware } from "./deprecatedRedirect";
import { maintenanceMiddleware } from "./maintenance";
import { permissionsMiddleware } from "./permissions";
import { rpgCooldownMiddleware } from "./rpgCooldown";
import { userDataMiddleware } from "./userData";

import type { ChatInputInteraction, MiddlewareInput } from "./types";
import type { RPGUserDataJSON, SlashCommand } from "../@types";

vi.mock("../services/DeprecatedCommandService", () => ({
    getDeprecatedCommandRedirect: vi.fn(),
}));
import { getDeprecatedCommandRedirect } from "../services/DeprecatedCommandService";

const mockedGetDeprecatedCommandRedirect = vi.mocked(getDeprecatedCommandRedirect);

const buildInteraction = (
    overrides: Partial<{
        userId: string;
        username: string;
        maintenanceReason: string | null;
        channel: object | null;
        localEmojis: Record<string, string>;
        getMention: (slug: string) => string;
    }> = {},
): ChatInputInteraction =>
    ({
        client: {
            maintenanceReason: overrides.maintenanceReason ?? null,
            localEmojis: overrides.localEmojis ?? { jolyne: ":jolyne:" },
            getSlashCommandMention: overrides.getMention ?? ((slug: string) => `</${slug}:0>`),
            log: vi.fn(),
        },
        user: { id: overrides.userId ?? "1", username: overrides.username ?? "tester" },
        channel: overrides.channel === undefined ? { id: "channel" } : overrides.channel,
    }) as unknown as ChatInputInteraction;

const input = (interaction: ChatInputInteraction, command?: SlashCommand): MiddlewareInput => ({
    interaction,
    command,
});

describe("maintenanceMiddleware", () => {
    beforeEach(() => {
        process.env.OWNER_IDS = "999";
    });

    it("passes when no maintenance reason is set", async () => {
        const decision = await maintenanceMiddleware(input(buildInteraction()));
        expect(decision).toEqual({ stop: false });
    });

    it("blocks non-owners during maintenance and includes the reason", async () => {
        const decision = await maintenanceMiddleware(
            input(buildInteraction({ maintenanceReason: "redeploying", userId: "1" })),
        );
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("redeploying");
        expect(decision.reply?.flags).toBe(MessageFlags.Ephemeral);
        expect(decision.log?.type).toBe("warn");
    });

    it("lets owners through during maintenance", async () => {
        const decision = await maintenanceMiddleware(
            input(buildInteraction({ maintenanceReason: "redeploying", userId: "999" })),
        );
        expect(decision).toEqual({ stop: false });
    });
});

describe("permissionsMiddleware", () => {
    beforeEach(() => {
        process.env.OWNER_IDS = "999";
        process.env.ADMIN_IDS = "888";
        delete process.env.BETA;
    });

    const mkCmd = (flags: Partial<SlashCommand> = {}): SlashCommand =>
        ({ data: { name: "test" }, ...flags }) as unknown as SlashCommand;

    it("passes when no command is provided", async () => {
        expect(await permissionsMiddleware(input(buildInteraction()))).toEqual({ stop: false });
    });

    it("blocks ownerOnly silently for non-owner", async () => {
        const decision = await permissionsMiddleware(
            input(buildInteraction({ userId: "1" }), mkCmd({ ownerOnly: true })),
        );
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toBe(":jolyne:");
    });

    it("lets owner through ownerOnly", async () => {
        const decision = await permissionsMiddleware(
            input(buildInteraction({ userId: "999" }), mkCmd({ ownerOnly: true })),
        );
        expect(decision).toEqual({ stop: false });
    });

    it("blocks adminOnly with a clear error for non-admin", async () => {
        const decision = await permissionsMiddleware(
            input(buildInteraction({ userId: "1" }), mkCmd({ adminOnly: true })),
        );
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("don't have permission");
        expect(decision.reply?.flags).toBe(MessageFlags.Ephemeral);
    });

    it("BETA env disables admin gating", async () => {
        process.env.BETA = "1";
        const decision = await permissionsMiddleware(
            input(buildInteraction({ userId: "1" }), mkCmd({ adminOnly: true })),
        );
        expect(decision).toEqual({ stop: false });
    });
});

describe("channelMiddleware", () => {
    it("passes when interaction.channel is set", async () => {
        expect(await channelMiddleware(input(buildInteraction()))).toEqual({ stop: false });
    });

    it("blocks with a thread-permissions hint when channel is null", async () => {
        const decision = await channelMiddleware(input(buildInteraction({ channel: null })));
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("thread");
    });
});

describe("commandCooldownMiddleware", () => {
    const buildCooldownInteraction = (
        cooldowns: Map<string, number> = new Map(),
        userId = "1",
    ): ChatInputInteraction =>
        ({
            client: { cooldowns },
            user: { id: userId, username: "tester" },
        }) as unknown as ChatInputInteraction;

    const cmd = (cooldown?: number): SlashCommand =>
        ({ data: { name: "fight" }, cooldown }) as unknown as SlashCommand;

    it("passes when the command has no cooldown configured", async () => {
        const decision = await commandCooldownMiddleware(input(buildCooldownInteraction(), cmd()));
        expect(decision).toEqual({ stop: false });
    });

    it("sets a cooldown on first invocation and lets the call through", async () => {
        const cooldowns = new Map<string, number>();
        const interaction = buildCooldownInteraction(cooldowns);
        const decision = await commandCooldownMiddleware(input(interaction, cmd(10)));
        expect(decision).toEqual({ stop: false });
        expect(cooldowns.has("1:fight")).toBe(true);
    });

    it("blocks subsequent calls with the remaining time", async () => {
        const cooldowns = new Map<string, number>([["1:fight", Date.now() + 5_000]]);
        const decision = await commandCooldownMiddleware(
            input(buildCooldownInteraction(cooldowns), cmd(10)),
        );
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toMatch(/can use this command again/);
    });

    it("clears expired entries (preserving the pre-existing one-shot quirk)", async () => {
        const cooldowns = new Map<string, number>([["1:fight", Date.now() - 1_000]]);
        const interaction = buildCooldownInteraction(cooldowns);
        const decision = await commandCooldownMiddleware(input(interaction, cmd(10)));
        expect(decision).toEqual({ stop: false });
        expect(cooldowns.has("1:fight")).toBe(false);
    });
});

describe("userDataMiddleware", () => {
    const buildUserDataInteraction = (
        userData: RPGUserDataJSON | null,
        subcommandName = "view",
    ): ChatInputInteraction => {
        const getRPGUserData = vi.fn().mockResolvedValue(userData);
        return {
            client: {
                database: { getRPGUserData },
                translations: new Map([
                    ["en-US", () => "Translated NO_ADVENTURE"],
                ]),
                localEmojis: {},
            },
            user: { id: "u1", username: "tester" },
            options: { getSubcommand: () => subcommandName, getUser: (): null => null },
        } as unknown as ChatInputInteraction;
    };

    const cmd = (name: string): SlashCommand =>
        ({ data: { name } }) as unknown as SlashCommand;

    it("creates a ctx without userData for /help", async () => {
        const interaction = buildUserDataInteraction(null);
        const pipeline: MiddlewareInput = { interaction, command: cmd("help") };
        const decision = await userDataMiddleware(pipeline);
        expect(decision).toEqual({ stop: false });
        expect(pipeline.ctx).toBeDefined();
    });

    it("blocks with NO_ADVENTURE when an unknown user runs a non-onboarding command", async () => {
        const interaction = buildUserDataInteraction(null);
        const pipeline: MiddlewareInput = { interaction, command: cmd("fight") };
        const decision = await userDataMiddleware(pipeline);
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("Translated NO_ADVENTURE");
        expect(pipeline.ctx).toBeDefined();
    });

    it("lets onboarding commands through for users without RPG data", async () => {
        const interaction = buildUserDataInteraction(null);
        const pipeline: MiddlewareInput = { interaction, command: cmd("start") };
        const decision = await userDataMiddleware(pipeline);
        expect(decision).toEqual({ stop: false });
        expect(pipeline.ctx).toBeDefined();
    });

    it("publishes ctx with the fetched userData for normal commands", async () => {
        const userData = { id: "u1", level: 12 } as unknown as RPGUserDataJSON;
        const interaction = buildUserDataInteraction(userData);
        const pipeline: MiddlewareInput = { interaction, command: cmd("profile") };
        const decision = await userDataMiddleware(pipeline);
        expect(decision).toEqual({ stop: false });
        expect(pipeline.ctx?.userData).toBe(userData);
    });
});

describe("rpgCooldownMiddleware", () => {
    const baseCtx = { user: { id: "u1" }, userData: { id: "u1" } } as unknown as MiddlewareInput["ctx"];

    const buildRpgInteraction = (
        getRPGCooldown: (userId: string, key: string) => Promise<number>,
        username = "Jolyne",
    ): ChatInputInteraction =>
        ({
            client: {
                database: { getRPGCooldown },
                user: { username },
            },
        }) as unknown as ChatInputInteraction;

    const cmd = (checkRPGCooldown?: string): SlashCommand =>
        ({ data: { name: "raid" }, checkRPGCooldown }) as unknown as SlashCommand;

    it("passes when the command does not declare a checkRPGCooldown", async () => {
        const interaction = buildRpgInteraction(vi.fn());
        const decision = await rpgCooldownMiddleware({
            interaction,
            command: cmd(),
            ctx: baseCtx,
        });
        expect(decision).toEqual({ stop: false });
    });

    it("passes when the cooldown is in the past", async () => {
        const interaction = buildRpgInteraction(async () => Date.now() - 1_000);
        const decision = await rpgCooldownMiddleware({
            interaction,
            command: cmd("raid"),
            ctx: baseCtx,
        });
        expect(decision).toEqual({ stop: false });
    });

    it("blocks with a Discord-formatted timestamp when the cooldown is active", async () => {
        const cooldownAt = Date.now() + 60_000;
        const interaction = buildRpgInteraction(async () => cooldownAt);
        const decision = await rpgCooldownMiddleware({
            interaction,
            command: cmd("raid"),
            ctx: baseCtx,
        });
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toMatch(/<t:\d+:R>/);
    });

    it("ignores active cooldowns on Beta and Alpha deployments", async () => {
        const interaction = buildRpgInteraction(async () => Date.now() + 60_000, "Jolyne Beta");
        const decision = await rpgCooldownMiddleware({
            interaction,
            command: cmd("raid"),
            ctx: baseCtx,
        });
        expect(decision).toEqual({ stop: false });
    });
});

describe("deprecatedRedirectMiddleware", () => {
    beforeEach(() => {
        mockedGetDeprecatedCommandRedirect.mockReset();
    });

    it("passes when there is no redirect", async () => {
        mockedGetDeprecatedCommandRedirect.mockReturnValue(undefined);
        const decision = await deprecatedRedirectMiddleware(input(buildInteraction()));
        expect(decision).toEqual({ stop: false });
    });

    it("redirects to the new mention when a deprecated slug matches", async () => {
        mockedGetDeprecatedCommandRedirect.mockReturnValue("quests action");
        const interaction = buildInteraction({
            getMention: (slug) => `</${slug}:42>`,
        });
        const decision = await deprecatedRedirectMiddleware(input(interaction));
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("</quests action:42>");
        expect(decision.reply?.flags).toBe(MessageFlags.Ephemeral);
    });
});
