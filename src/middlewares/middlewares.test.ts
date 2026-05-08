import { describe, expect, it, beforeEach, vi } from "vitest";
import { MessageFlags } from "discord.js";

import { channelMiddleware } from "./channel";
import { deprecatedRedirectMiddleware } from "./deprecatedRedirect";
import { maintenanceMiddleware } from "./maintenance";
import { permissionsMiddleware } from "./permissions";

import type { ChatInputInteraction, MiddlewareInput } from "./types";
import type { SlashCommand } from "../@types";

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
