import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/Functions", () => ({
    findNPC: vi.fn(() => undefined),
    fixFields: vi.fn((fields: unknown) => fields),
    splitEmbedIfExceedsLimit: vi.fn((embed: unknown) => [embed]),
    actionRow: vi.fn((components: unknown[]) => ({ kind: "ActionRow", components })),
    capitalize: vi.fn((s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)),
    standAbilitiesEmbed: vi.fn(() => ({ description: "stand abilities embed" })),
    weaponAbilitiesEmbed: vi.fn(() => ({ description: "weapon abilities embed" })),
    generateDiscordTimestamp: vi.fn(() => "TIMESTAMP"),
}));

vi.mock("../structures/FightTypes", () => ({
    FightTypes: {
        Friendly: "🎌 Friendly Fight",
        Ranked: "⚔️ Ranked Fight",
        Dungeon: "🏰 Dungeon Raid",
        DailyQuest: "📆 Daily Quest Fight",
        ChapterQuest: "📜 Chapter Quest Fight",
        Boss: "💣 Boss Raid",
        Assault: "Assault Fight",
        SideQuest: "❓📜 Side Quest Fight",
    },
    FightTypeColor: {
        "🎌 Friendly Fight": 0x3da8be,
        "⚔️ Ranked Fight": 0xffa500,
        "🏰 Dungeon Raid": 0x542121,
        "📆 Daily Quest Fight": 0xc9b829,
        "📜 Chapter Quest Fight": 0xc92b29,
        "💣 Boss Raid": 0x531574,
        "Assault Fight": 0x15745a,
        "❓📜 Side Quest Fight": 0xc642c6,
    },
}));

import {
    renderTurn,
    renderTargetSelect,
    renderForfeitConfirm,
    type FightSnapshot,
} from "./FightRenderer";
import type { Fighter } from "../structures/FightHandler";
import type { FightInfos } from "../structures/FightTypes";

const fighter = (overrides: Partial<Fighter> = {}): Fighter =>
    ({
        id: "1234567",
        name: "Player",
        health: 1000,
        stamina: 8,
        maxHealth: 1000,
        maxStamina: 10,
        defense: 100,
        maxDefense: 100,
        trueLevel: 50,
        skillPoints: { strength: 0, defense: 0, stamina: 0, perception: 0, speed: 0 },
        canAttack: true,
        autoLock: false,
        ...overrides,
    }) as unknown as Fighter;

const baseInfos = (): FightInfos =>
    ({
        type: "🎌 Friendly Fight",
        attackAgain: 0,
        dodgeAgain: 0,
        orderIndex: 0,
        cooldowns: [],
        lastHit: null,
        attackOrder: [],
    }) as unknown as FightInfos;

const buildSnapshot = (overrides: Partial<FightSnapshot> = {}): FightSnapshot => ({
    id: "fight-id",
    infos: baseInfos(),
    teams: [],
    fighters: [],
    turns: [{ logs: [] }],
    whosTurn: undefined,
    hasOneTarget: false,
    ctx: {
        client: { users: { cache: { get: (): undefined => undefined } } } as never,
    },
    getTeamIdx: () => 0,
    ...overrides,
});

const isContainer = (c: unknown): c is { type: 17; components: unknown[] } =>
    typeof c === "object" && c !== null && (c as { type: number }).type === 17;

const isActionRow = (
    c: unknown
): c is { kind: "ActionRow"; components: { data: { custom_id?: string; disabled?: boolean } }[] } =>
    typeof c === "object" && c !== null && (c as { kind?: string }).kind === "ActionRow";

describe("FightRenderer.renderTurn", () => {
    it("renders a 4-fighter, two-team, mid-turn snapshot", () => {
        vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));

        const alice = fighter({ id: "111", name: "Alice" });
        const bob = fighter({ id: "222", name: "Bob", health: 0 });
        const carol = fighter({ id: "333", name: "Carol", frozenFor: 2 });
        const dan = fighter({ id: "444", name: "Dan" });
        const teams = [
            [alice, bob],
            [carol, dan],
        ];
        const snap = buildSnapshot({
            teams,
            fighters: teams.flat(),
            turns: [{ logs: ["Alice punched Carol"] }, { logs: ["Carol froze Dan"] }],
            whosTurn: alice,
        });

        expect(renderTurn(snap)).toMatchSnapshot();

        vi.useRealTimers();
    });

    it("disables every action button when silent: true", () => {
        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderTurn(snap, { silent: true });
        const rows = result.components.filter(isActionRow);

        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
            for (const c of row.components) {
                expect(c.data.disabled).toBe(true);
            }
        }
    });

    it("returns a single waitingNPC button row when whosTurn is an NPC", () => {
        const npc = fighter({ id: "dio_npc", name: "Dio" });
        const snap = buildSnapshot({
            teams: [[npc]],
            fighters: [npc],
            whosTurn: npc,
        });

        const result = renderTurn(snap);
        const rows = result.components.filter(isActionRow);

        expect(rows).toHaveLength(1);
        expect(rows[0].components).toHaveLength(1);
        expect(rows[0].components[0].data.custom_id).toBe("fight-idwaitingNPC");
    });

    it("uses customId prefixes derived from the fight id", () => {
        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            id: "abc",
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderTurn(snap);
        const rows = result.components.filter(isActionRow);
        const customIds = rows.flatMap((row) =>
            row.components.map((c) => c.data.custom_id).filter((id): id is string => !!id)
        );

        expect(customIds).toEqual(
            expect.arrayContaining(["abcdefend", "abcskip", "abcforfeit"])
        );
    });

    it("emits a V2 components container as the first element", () => {
        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderTurn(snap);
        expect(isContainer(result.components[0])).toBe(true);
        // 32768 is MessageFlags.IsComponentsV2 — assert just that the bit is set.
        expect(result.flags).toBeGreaterThan(0);
    });
});

describe("FightRenderer.renderTargetSelect", () => {
    it("includes a target select menu and a goBack button", () => {
        const alice = fighter({ id: "111", name: "Alice" });
        const dio = fighter({ id: "dio_npc", name: "Dio" });
        const snap = buildSnapshot({
            id: "abc",
            teams: [[alice], [dio]],
            fighters: [alice, dio],
            whosTurn: alice,
            getTeamIdx: (f) => (f.id === "111" ? 0 : 1),
        });

        const result = renderTargetSelect(snap, [dio]);
        const rows = result.components.filter(isActionRow);
        const customIds = rows.flatMap((row) =>
            row.components.map((c) => c.data.custom_id).filter((id): id is string => !!id)
        );

        expect(customIds).toContain("abcgoBack");
    });
});

describe("FightRenderer.renderForfeitConfirm", () => {
    it("renders confirm + cancel buttons", () => {
        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            id: "abc",
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderForfeitConfirm(snap, {
            username: "Alice",
            avatarURL: "https://example.com/alice.png",
        });
        const rows = result.components.filter(isActionRow);
        const customIds = rows.flatMap((row) =>
            row.components.map((c) => c.data.custom_id).filter((id): id is string => !!id)
        );

        expect(customIds).toEqual(
            expect.arrayContaining(["abcforfeitConfirm", "abcgoBack"])
        );
    });
});
