import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/Functions", () => ({
    findNPC: vi.fn(() => undefined),
    fixFields: vi.fn((fields: unknown) => fields),
    splitEmbedIfExceedsLimit: vi.fn((embed: unknown) => [embed]),
    actionRow: vi.fn((components: unknown[]) => ({ components })),
    capitalize: vi.fn((s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)),
}));

vi.mock("../structures/FightHandler", () => ({
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

import { renderTurn, type FightSnapshot } from "./FightRenderer";
import type { Fighter, FightInfos } from "../structures/FightHandler";

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
    ...overrides,
});

describe("FightRenderer.renderTurn", () => {
    it("renders a 4-fighter, two-team, mid-turn snapshot", () => {
        // Pin the date so the April Fools branch stays off and the snapshot is stable.
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

    it("disables every button when silent: true", () => {
        vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));

        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderTurn(snap, { silent: true });

        for (const row of result.components) {
            const components = (row as unknown as { components: { data: { disabled?: boolean } }[] }).components;
            for (const c of components) {
                expect(c.data.disabled).toBe(true);
            }
        }

        vi.useRealTimers();
    });

    it("returns a single waitingNPC component row when whosTurn is an NPC", () => {
        vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));

        const npc = fighter({ id: "dio_npc", name: "Dio" });
        const snap = buildSnapshot({
            teams: [[npc]],
            fighters: [npc],
            whosTurn: npc,
        });

        const result = renderTurn(snap);

        expect(result.components).toHaveLength(1);
        const row = result.components[0] as unknown as { components: { data: { custom_id: string } }[] };
        expect(row.components).toHaveLength(1);
        expect(row.components[0].data.custom_id).toBe("fight-idwaitingNPC");

        vi.useRealTimers();
    });

    it("uses customId prefixes derived from the fight id", () => {
        vi.setSystemTime(new Date("2026-05-07T12:00:00Z"));

        const alice = fighter({ id: "111", name: "Alice" });
        const snap = buildSnapshot({
            id: "abc",
            teams: [[alice]],
            fighters: [alice],
            whosTurn: alice,
        });

        const result = renderTurn(snap);
        const firstRow = result.components[0] as unknown as { components: { data: { custom_id: string } }[] };
        const customIds = firstRow.components.map((c) => c.data.custom_id);

        expect(customIds).toEqual(
            expect.arrayContaining(["abcattack", "abcdefend", "abcskip", "abcforfeit"])
        );

        vi.useRealTimers();
    });
});
