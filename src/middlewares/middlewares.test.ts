import { describe, expect, it, beforeEach, vi } from "vitest";
import { MessageFlags } from "discord.js";

// Some middlewares pull `getRewardsCompareData` from utils/Functions, which
// transitively imports utils/Webhooks. Webhooks construct WebhookClients at
// module load and crash without real URLs. Stub the whole module so we
// don't have to seed every webhook env var in tests.
// `rpg/SideQuests` reaches into `Raids.ts` at module load, which reads
// `FightableNPCs.<x>.rewards` — that field is only populated by the boot
// pass in `index.ts`. Vitest doesn't run that pass, so unmocked imports
// crash. We mock the whole barrel to an empty record; the few middlewares
// that iterate it just see "no side quests" and behave correctly.
vi.mock("../rpg/SideQuests", () => ({}));

vi.mock("../utils/Webhooks", () => ({
    voteWebhook: { send: vi.fn() },
    tradeWebhook: { send: vi.fn() },
    raidWebhook: { send: vi.fn() },
    thrownItemsWebhook: { send: vi.fn() },
    claimedItemsWebhook: { send: vi.fn() },
    commandLogsWebhook: { send: vi.fn() },
    shardLogsWebhook: { send: vi.fn() },
    dungeonLogsWebhook: { send: vi.fn() },
    fightStartWebhook: { send: vi.fn() },
    fightEndWebhook: { send: vi.fn() },
    standLogsWebhook: { send: vi.fn() },
    specialLogsWebhook: { send: vi.fn() },
    erroredFightLogsWebhook: { send: vi.fn() },
    halloweenClaimsWebhook: { send: vi.fn() },
    transactionLogsWebhook: { send: vi.fn() },
}));

import { bannedUserMiddleware } from "./bannedUser";
import { channelMiddleware } from "./channel";
import { commandCooldownMiddleware } from "./commandCooldown";
import { deprecatedRedirectMiddleware } from "./deprecatedRedirect";
import { firstFightSkillPointsHintMiddleware } from "./firstFightSkillPointsHint";
import { maintenanceMiddleware } from "./maintenance";
import { permissionsMiddleware } from "./permissions";
import { patreonRewardsMiddleware } from "./patreonRewards";
import { restingAtCampfireMiddleware } from "./restingAtCampfire";
import { rpgCooldownMiddleware } from "./rpgCooldown";
import { seasonalEmailsMiddleware } from "./seasonalEmails";
import { sideQuestEnrollmentMiddleware } from "./sideQuestEnrollment";
import { userBusyMiddleware } from "./userBusy";
import { userDataFixupsMiddleware } from "./userDataFixups";
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

describe("bannedUserMiddleware", () => {
    const ctx = (candy_cane?: number): MiddlewareInput["ctx"] =>
        ({
            user: { username: "tester" },
            userData: { inventory: candy_cane === undefined ? {} : { candy_cane } },
        }) as unknown as MiddlewareInput["ctx"];

    it("passes when no candy_cane sentinel is set", async () => {
        const decision = await bannedUserMiddleware({ interaction: {} as ChatInputInteraction, ctx: ctx() });
        expect(decision).toEqual({ stop: false });
    });

    it("passes when candy_cane is positive", async () => {
        const decision = await bannedUserMiddleware({ interaction: {} as ChatInputInteraction, ctx: ctx(5) });
        expect(decision).toEqual({ stop: false });
    });

    it("blocks when candy_cane is negative", async () => {
        const decision = await bannedUserMiddleware({ interaction: {} as ChatInputInteraction, ctx: ctx(-1) });
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("banned");
    });
});

describe("firstFightSkillPointsHintMiddleware", () => {
    const buildCtx = (level: number, skillPointSum: number): MiddlewareInput["ctx"] =>
        ({
            user: { username: "tester" },
            userData: {
                level,
                prestige: 0,
                skillPoints: { strength: skillPointSum, defense: 0, speed: 0, perception: 0, stamina: 0 },
            },
            client: { getSlashCommandMention: (slug: string) => `</${slug}:0>` },
            makeMessage: vi.fn(),
        }) as unknown as MiddlewareInput["ctx"];

    const cmd = (name: string): SlashCommand =>
        ({ data: { name } }) as unknown as SlashCommand;

    it("passes for non-fight commands", async () => {
        const decision = await firstFightSkillPointsHintMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("profile"),
            ctx: buildCtx(1, 0),
        });
        expect(decision).toEqual({ stop: false });
    });

    it("passes when the user has already invested some skill points", async () => {
        const decision = await firstFightSkillPointsHintMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("fight"),
            ctx: buildCtx(1, 1),
        });
        expect(decision).toEqual({ stop: false });
    });

    it("blocks the brand-new player invoking /fight with all 4 points unspent", async () => {
        const ctx = buildCtx(1, 0);
        const decision = await firstFightSkillPointsHintMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("fight"),
            ctx,
        });
        expect(decision.stop).toBe(true);
        expect(ctx.makeMessage).toHaveBeenCalledOnce();
    });
});

describe("userBusyMiddleware", () => {
    const buildBusyInteraction = (
        reason: string | null,
        warningSeen: string | null = null,
        subcommand = "view",
    ): ChatInputInteraction => {
        const reply = vi.fn();
        const followUp = vi.fn();
        return {
            client: {
                database: {
                    getCooldown: vi.fn().mockResolvedValue(reason),
                    redis: {
                        get: vi.fn().mockResolvedValue(warningSeen),
                        set: vi.fn().mockResolvedValue("OK"),
                    },
                },
            },
            user: { id: "u1" },
            options: { getSubcommand: () => subcommand },
            reply,
        } as unknown as ChatInputInteraction;
    };

    const buildBusyCtx = (interaction: ChatInputInteraction): MiddlewareInput["ctx"] =>
        ({
            user: { id: "u1" },
            userData: { id: "u1" },
            interaction,
            followUp: vi.fn(),
        }) as unknown as MiddlewareInput["ctx"];

    const cmd = (name: string): SlashCommand =>
        ({ data: { name } }) as unknown as SlashCommand;

    it("passes when no busy reason is stored", async () => {
        const interaction = buildBusyInteraction(null);
        const decision = await userBusyMiddleware({
            interaction,
            command: cmd("fight"),
            ctx: buildBusyCtx(interaction),
        });
        expect(decision).toEqual({ stop: false });
    });

    it("blocks an arbitrary command when a busy reason is stored", async () => {
        const interaction = buildBusyInteraction("trading…");
        const decision = await userBusyMiddleware({
            interaction,
            command: cmd("fight"),
            ctx: buildBusyCtx(interaction),
        });
        expect(decision.stop).toBe(true);
        expect(interaction.reply).toHaveBeenCalledWith({ content: "trading…" });
    });

    it("lets non-finalising /trade subcommands through (e.g. /trade view)", async () => {
        const interaction = buildBusyInteraction("trading…", null, "view");
        const decision = await userBusyMiddleware({
            interaction,
            command: cmd("trade"),
            ctx: buildBusyCtx(interaction),
        });
        expect(decision).toEqual({ stop: false });
    });

    it("blocks /trade trade so a busy user can't double-finalise", async () => {
        const interaction = buildBusyInteraction("trading…", null, "trade");
        const decision = await userBusyMiddleware({
            interaction,
            command: cmd("trade"),
            ctx: buildBusyCtx(interaction),
        });
        expect(decision).toEqual({ stop: true });
    });

    it("only sends the warning followup once", async () => {
        const interaction = buildBusyInteraction("trading…", "true");
        const ctx = buildBusyCtx(interaction);
        await userBusyMiddleware({ interaction, command: cmd("fight"), ctx });
        expect(ctx.followUp).not.toHaveBeenCalled();
    });
});

describe("restingAtCampfireMiddleware", () => {
    const buildCtx = (resting: number | string): MiddlewareInput["ctx"] =>
        ({
            user: { id: "u1" },
            userData: { id: "u1", restingAtCampfire: resting },
            client: { getSlashCommandMention: (slug: string) => `</${slug}:0>` },
        }) as unknown as MiddlewareInput["ctx"];

    const cmd = (name: string): SlashCommand =>
        ({ data: { name } }) as unknown as SlashCommand;

    it("passes when user is not resting", async () => {
        const decision = await restingAtCampfireMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("fight"),
            ctx: buildCtx(0),
        });
        expect(decision).toEqual({ stop: false });
    });

    it("normalises a non-numeric restingAtCampfire to 0", async () => {
        const ctx = buildCtx("notanumber" as unknown as number);
        await restingAtCampfireMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("fight"),
            ctx,
        });
        expect(ctx.userData.restingAtCampfire).toBe(0);
    });

    it("blocks any command other than campfire/rest while resting", async () => {
        const decision = await restingAtCampfireMiddleware({
            interaction: {} as ChatInputInteraction,
            command: cmd("fight"),
            ctx: buildCtx(Date.now()),
        });
        expect(decision.stop).toBe(true);
        if (!decision.stop) throw new Error("expected stop");
        expect(decision.reply?.content).toContain("rest leave");
    });

    it("lets /rest and /campfire through while resting", async () => {
        for (const name of ["rest", "campfire"]) {
            const decision = await restingAtCampfireMiddleware({
                interaction: {} as ChatInputInteraction,
                command: cmd(name),
                ctx: buildCtx(Date.now()),
            });
            expect(decision).toEqual({ stop: false });
        }
    });
});

vi.mock("../services/EventService", async () => {
    const actual = await vi.importActual<typeof import("../services/EventService")>(
        "../services/EventService",
    );
    return { ...actual, isActive: vi.fn() };
});

import { isActive } from "../services/EventService";

describe("seasonalEmailsMiddleware", () => {
    const mockedIsActive = vi.mocked(isActive);

    type RedisStore = Map<string, string>;
    const buildSeasonalCtx = (
        existingEmailIds: string[] = [],
        redis: RedisStore = new Map(),
    ): MiddlewareInput["ctx"] => {
        const followUpQueue: Array<{ content: string }> = [];
        return {
            user: { id: "u1", username: "tester" },
            userData: {
                emails: existingEmailIds.map((id) => ({ id })),
            },
            client: {
                database: {
                    getString: async (k: string) => redis.get(k) ?? null,
                    setString: async (k: string, v: string) => {
                        redis.set(k, v);
                    },
                },
            },
            followUpQueue,
        } as unknown as MiddlewareInput["ctx"];
    };

    beforeEach(() => {
        mockedIsActive.mockReset();
    });

    it("does nothing when no events are active", async () => {
        mockedIsActive.mockReturnValue(false);
        const ctx = buildSeasonalCtx();
        const decision = await seasonalEmailsMiddleware({
            interaction: {} as ChatInputInteraction,
            ctx,
        });
        expect(decision).toEqual({ stop: false });
        expect(ctx.userData.emails).toHaveLength(0);
    });

    it("queues the 3rd anniversary follow-up (no Redis idempotency) when active and absent", async () => {
        mockedIsActive.mockImplementation((id) => id === "third_anniversary");
        const ctx = buildSeasonalCtx();
        await seasonalEmailsMiddleware({
            interaction: {} as ChatInputInteraction,
            ctx,
        });
        const queued = ctx.followUpQueue[0] as { content: string };
        expect(queued.content).toContain("3rd anniversary");
    });

    it("does not double-inject if the user already has the email", async () => {
        mockedIsActive.mockImplementation((id) => id === "halloween_2024");
        const redis = new Map<string, string>();
        const ctx = buildSeasonalCtx(["halloween_2024"], redis);
        await seasonalEmailsMiddleware({
            interaction: {} as ChatInputInteraction,
            ctx,
        });
        expect(ctx.followUpQueue).toHaveLength(0);
        expect(redis.size).toBe(0);
    });

    it("uses the Redis idempotency key for events that declare one", async () => {
        mockedIsActive.mockImplementation((id) => id === "halloween_2024");
        const redis = new Map<string, string>();
        const ctx = buildSeasonalCtx([], redis);
        await seasonalEmailsMiddleware({
            interaction: {} as ChatInputInteraction,
            ctx,
        });
        expect(redis.get("setHalloween2024:u1")).toBe("true");
    });

    it("respects an already-set Redis idempotency key", async () => {
        mockedIsActive.mockImplementation((id) => id === "halloween_2024");
        const redis = new Map([["setHalloween2024:u1", "true"]]);
        const ctx = buildSeasonalCtx([], redis);
        await seasonalEmailsMiddleware({
            interaction: {} as ChatInputInteraction,
            ctx,
        });
        expect(ctx.userData.emails).toHaveLength(0);
        expect(ctx.followUpQueue).toHaveLength(0);
    });
});

describe("patreonRewardsMiddleware", () => {
    const buildPatronCtx = (
        patrons: Array<{ id: string; level: 1 | 2 | 3 | 4; lastPatreonCharge: number }>,
        userData: { id: string; lastPatreonReward: number; inventory?: Record<string, number> },
    ): MiddlewareInput["ctx"] =>
        ({
            user: { id: userData.id },
            userData: {
                ...userData,
                inventory: userData.inventory ?? {},
                daily: { quests: [] },
                chapter: { quests: [] },
                sideQuests: [],
                xp: 0,
                coins: 0,
                health: 100,
                stamina: 100,
                level: 50,
                skillPoints: { strength: 0, defense: 0, speed: 0, perception: 0, stamina: 0 },
                equippedItems: {},
            },
            client: { patreons: patrons },
        }) as unknown as MiddlewareInput["ctx"];

    it("does nothing for non-patrons", async () => {
        const ctx = buildPatronCtx([], { id: "u1", lastPatreonReward: 0 });
        const input: MiddlewareInput = { interaction: {} as ChatInputInteraction, ctx };
        const decision = await patreonRewardsMiddleware(input);
        expect(decision).toEqual({ stop: false });
        expect(input.notifications ?? []).toHaveLength(0);
    });

    it("does nothing if the patron has already been credited for this charge", async () => {
        const ctx = buildPatronCtx(
            [{ id: "u1", level: 2, lastPatreonCharge: 1_000 }],
            { id: "u1", lastPatreonReward: 1_000 },
        );
        const input: MiddlewareInput = { interaction: {} as ChatInputInteraction, ctx };
        await patreonRewardsMiddleware(input);
        expect(input.notifications ?? []).toHaveLength(0);
    });

    it("credits and stamps `lastPatreonReward` on first run after a new charge", async () => {
        const ctx = buildPatronCtx(
            [{ id: "u1", level: 2, lastPatreonCharge: 2_000 }],
            { id: "u1", lastPatreonReward: 1_000 },
        );
        const input: MiddlewareInput = { interaction: {} as ChatInputInteraction, ctx };
        await patreonRewardsMiddleware(input);
        expect((ctx.userData as { lastPatreonReward: number }).lastPatreonReward).toBe(2_000);
        expect(input.notifications?.[0]).toContain("Patreon");
    });
});

describe("sideQuestEnrollmentMiddleware", () => {
    it("is a no-op without ctx", async () => {
        const input: MiddlewareInput = { interaction: {} as ChatInputInteraction };
        const decision = await sideQuestEnrollmentMiddleware(input);
        expect(decision).toEqual({ stop: false });
    });

    // Real coverage of the iteration logic would need to mock every entry in
    // SideQuests; instead we check the middleware initialises notifications
    // and tolerates a minimal ctx.
    it("initialises pipeline.notifications even when nothing is enrolled", async () => {
        const ctx = {
            user: { id: "u1" },
            userData: { sideQuests: [] },
            client: { getSlashCommandMention: (slug: string) => `</${slug}:0>` },
        } as unknown as MiddlewareInput["ctx"];
        const input: MiddlewareInput = { interaction: {} as ChatInputInteraction, ctx };
        await sideQuestEnrollmentMiddleware(input);
        expect(Array.isArray(input.notifications)).toBe(true);
    });
});

describe("userDataFixupsMiddleware", () => {
    it("syncs the discord username onto userData.tag", async () => {
        const ctx = {
            user: { id: "u1", username: "FreshName" },
            userData: { tag: "OldName", inventory: {} },
        } as unknown as MiddlewareInput["ctx"];
        await userDataFixupsMiddleware({ interaction: {} as ChatInputInteraction, ctx });
        expect(ctx.userData.tag).toBe("FreshName");
    });

    it("removes null inventory entries", async () => {
        const ctx = {
            user: { id: "u1", username: "u" },
            userData: { tag: "u", inventory: { stand_arrow: null, pizza: 5 } },
        } as unknown as MiddlewareInput["ctx"];
        await userDataFixupsMiddleware({ interaction: {} as ChatInputInteraction, ctx });
        expect(ctx.userData.inventory).toEqual({ pizza: 5 });
    });
});
