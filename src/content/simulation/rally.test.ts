import { describe, expect, it } from 'vitest';
import { rotationNumber, server, type MatchState, newMatch } from '../../domain/match';
import { distanceBetween } from '../../domain/grading';
import { NET_Y } from '../../domain/court';
import { ZONES } from '../../domain/zones';
import { SYSTEMS } from '../systems';
import { EN_SIM_CAPTIONS } from './captions';
import { PL_SIM_CAPTIONS } from '../i18n/pl/simulation';
import {
  mirrorToOpponent,
  phasePositions,
  settingSetterId,
  settingSpot,
  type Positions,
} from './positions';
import { buildRally, checkChoices, choicesFor } from './rally';
import { buildTour, TOUR } from './tour';
import { opponentTeam, ourTeam, teamOnCourt } from './teams';

const start = (system: (typeof SYSTEMS)[number], libero: boolean): MatchState =>
  newMatch(ourTeam(system, 1, libero), opponentTeam(1), 'them');

describe.each(SYSTEMS.flatMap((s) => [true, false].map((l) => [s, l] as const)))(
  '%s tour, libero %s',
  (system, libero) => {
    const tour = buildTour(system, libero, 'en');

    it('plays every rally of the script', () => {
      expect(tour).toHaveLength(TOUR.length);
    });

    it.each(tour.map((t, i) => [i + 1, t] as const))(
      'rally %i: a well-formed scene',
      (_, { start, rally }) => {
        const { scene, next } = rally;
        const ids = scene.players.map((p) => p.id).sort();
        let previousTime = -1;
        for (const k of scene.keyframes) {
          expect(k.time).toBeGreaterThan(previousTime);
          previousTime = k.time;
          expect(Object.keys(k.positions).sort()).toEqual(ids);
          expect(k.ball).toBeDefined();
          expect(k.caption.trim()).not.toBe('');
        }
        // Blockers jump at the net, on their own side.
        for (const k of scene.keyframes) {
          for (const id of k.blocking ?? []) {
            const y = k.positions[id]!.y;
            expect(Math.abs(y - NET_Y)).toBeLessThanOrEqual(0.6);
          }
        }
        // The ball never jumps more than a court length between two keyframes.
        for (let i = 1; i < scene.keyframes.length; i++) {
          const a = scene.keyframes[i - 1]!.ball!.position;
          const b = scene.keyframes[i]!.ball!.position;
          expect(distanceBetween(a, b)).toBeLessThanOrEqual(19);
        }
        // It ends where the next rally starts: the state the engine gives after the result.
        const last = scene.keyframes.at(-1)!;
        for (const side of ['us', 'them'] as const) {
          const team = teamOnCourt(next, side);
          const expected = phasePositions(team, { kind: team.serving ? 'serve' : 'receive' });
          const shared = side === 'us' ? expected : mirrorToOpponent(expected);
          for (const z of ZONES) {
            expect(last.positions[team.zones[z]]).toEqual(shared[team.zones[z]]);
          }
        }
        expect(next.score.us + next.score.them).toBe(start.score.us + start.score.them + 1);
      },
    );

    it('visits all six rotations and shows every kind of rally', () => {
      const rotations = tour.map((t) => rotationNumber(t.rally.next.us));
      expect(new Set(rotations)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
      const events = tour.flatMap((t) => t.rally.events);
      expect(events.some((e) => e.kind === 'side-out' && e.team === 'us')).toBe(true);
      const held = tour.some((t) => t.start.serving === 'us' && t.rally.next.serving === 'us');
      expect(held).toBe(true);
      expect(
        tour.some(
          (t) => t.rally.events[0]!.kind === 'point' && t.rally.events[0]!.winner === 'them',
        ),
      ).toBe(true);
      const captions = tour.flatMap((t) => t.rally.scene.keyframes.map((k) => k.caption)).join(' ');
      expect(captions).toContain('free ball');
      expect(captions).toContain('down ball');
      expect(captions).toContain('pipe');
      if (libero) {
        expect(events.some((e) => e.kind === 'libero-in')).toBe(true);
        expect(events.some((e) => e.kind === 'libero-out')).toBe(true);
      }
      expect(rotationNumber(tour.at(-1)!.rally.next.us)).toBe(1);
    });
  },
);

describe('choices', () => {
  it('lets the receiving team act first and the teams take turns', () => {
    const state = start('5-1', true);
    expect(() =>
      checkChoices(state, { steps: [{ by: 'them', attack: 'left' }], winner: 'us' }),
    ).toThrow(/by us/);
    expect(() =>
      checkChoices(state, {
        steps: [
          { by: 'us', attack: 'outside' },
          { by: 'us', attack: 'pipe' },
        ],
        winner: 'us',
      }),
    ).toThrow(/by them/);
    expect(() => checkChoices(state, { steps: [], winner: 'us' })).toThrow(/at least one/);
  });

  it('offers only attacks this rotation has', () => {
    expect(choicesFor(start('4-2', true), 'us')).not.toContain('middle');
    expect(() =>
      checkChoices(start('4-2', true), { steps: [{ by: 'us', attack: 'middle' }], winner: 'us' }),
    ).toThrow(/not possible/);
  });

  it('gives the opponent free and down balls, but not twice in a row', () => {
    const serving = newMatch(ourTeam('5-1', 1, true), opponentTeam(1), 'us');
    expect(choicesFor(serving, 'them')).toEqual(expect.arrayContaining(['free-ball', 'down-ball']));
    expect(choicesFor(serving, 'them', true)).not.toContain('free-ball');
  });

  it('names the server in the first caption and the result in the last two', () => {
    const state = start('5-1', true);
    const { scene } = buildRally(
      state,
      { steps: [{ by: 'us', attack: 'outside' }], winner: 'us' },
      'en',
    );
    expect(server(state)).toBe('them-s');
    expect(scene.keyframes[0]!.caption).toBe('Their S serves from behind the end line.');
    expect(scene.keyframes.at(-2)!.caption).toBe('Point for us: 1–0.');
    expect(scene.keyframes.at(-1)!.caption).toBe(
      'Side-out: we rotate to rotation 6. OH1 serves next.',
    );
  });

  it('writes Polish captions with Polish labels', () => {
    const { scene } = buildRally(
      start('5-1', true),
      { steps: [{ by: 'us', attack: 'outside' }], winner: 'us' },
      'pl',
    );
    expect(scene.keyframes[0]!.caption).toBe('R przeciwnika zagrywa zza linii końcowej.');
    expect(scene.keyframes.at(-1)!.caption).toBe(
      'Punkt na przyjęciu: przechodzimy do ustawienia 6. Teraz zagrywa P1.',
    );
  });
});

describe('captions in both languages', () => {
  const samples = (c: typeof EN_SIM_CAPTIONS) => [
    c.who('OH1', false),
    c.serve('X'),
    c.pass(true),
    c.pass(false),
    c.switched(true),
    c.switched(false),
    c.set('S', 'OH1', 'pipe'),
    c.attack('OH1', true, 2),
    c.attack('OH1', false, 1),
    c.dig(true),
    c.dig(false),
    c.freeBall(true),
    c.freeBall(false),
    c.downBall(true),
    c.downBall(false),
    c.point(true, 1, 0),
    c.sideOut(true, 6),
    c.sideOut(false, 6),
    c.server('X', true),
    c.server('X', false),
    c.liberoIn('MB1'),
    c.liberoOut('MB1'),
  ];

  it('has every caption, different in English and Polish', () => {
    expect(Object.keys(PL_SIM_CAPTIONS).sort()).toEqual(Object.keys(EN_SIM_CAPTIONS).sort());
    const en = samples(EN_SIM_CAPTIONS);
    const pl = samples(PL_SIM_CAPTIONS);
    en.forEach((text, i) => {
      expect(text.trim()).not.toBe('');
      expect(pl[i]!.trim()).not.toBe('');
      expect(pl[i]).not.toBe(text);
    });
  });

  it('builds the whole Polish tour', () => {
    const tour = buildTour('6-2', true, 'pl');
    expect(tour.at(-1)!.rally.scene.keyframes.every((k) => k.caption.trim() !== '')).toBe(true);
  });
});

describe('both teams keep moving (#62)', () => {
  const cases = SYSTEMS.flatMap((system) =>
    [true, false].flatMap((libero) =>
      buildTour(system, libero, 'en').map((t, i) => ({
        name: `${system} libero ${libero} rally ${i + 1}`,
        ...t,
      })),
    ),
  );

  it.each(cases)('$name', ({ start, rally }) => {
    const { keyframes } = rally.scene;
    const sides = { us: teamOnCourt(start, 'us'), them: teamOnCourt(start, 'them') };
    const onCourt = (side: 'us' | 'them') => ZONES.map((z) => sides[side].zones[z]);

    // The receiving team's setter left at the serve and is at the setting spot at the pass;
    // everyone else on that team is still in the receive formation.
    const receiving = start.serving === 'us' ? 'them' : 'us';
    const team = sides[receiving];
    const setter = settingSetterId(team);
    const formation = phasePositions(team, { kind: 'receive' });
    const shared = (p: Positions) => (receiving === 'us' ? p : mirrorToOpponent(p));
    const atPass = keyframes[1]!.positions;
    expect(atPass[setter]).toEqual(shared({ [setter]: settingSpot(team.system) })[setter]);
    for (const id of onCourt(receiving).filter((id) => id !== setter)) {
      expect(atPass[id]).toEqual(shared(formation)[id]);
    }

    // Between every two moments both teams move, except into the point and the line-up after.
    // One exception: from the serve to the pass the receiving team only moves its setter,
    // so when the setter already stands on the setting spot (a front-row setter) nobody needs to.
    const setterAlreadyThere = distanceBetween(formation[setter]!, settingSpot(team.system)) < 0.3;
    for (let k = 0; k + 1 <= keyframes.length - 3; k++) {
      for (const side of ['us', 'them'] as const) {
        if (k === 0 && side === receiving && setterAlreadyThere) continue;
        const moved = onCourt(side).some(
          (id) =>
            distanceBetween(keyframes[k]!.positions[id]!, keyframes[k + 1]!.positions[id]!) >= 0.3,
        );
        expect(moved, `${side} between moments ${k + 1} and ${k + 2}`).toBe(true);
      }
    }

    // Everyone stays in the playable area, and the setter never digs.
    for (const k of keyframes) {
      for (const p of Object.values(k.positions)) {
        expect(p.x).toBeGreaterThanOrEqual(-3);
        expect(p.x).toBeLessThanOrEqual(12);
        expect(p.y).toBeGreaterThanOrEqual(-3);
        expect(p.y).toBeLessThanOrEqual(21);
      }
      if (/dig/i.test(k.caption)) {
        const ball = k.ball!.position;
        const digger = Object.entries(k.positions).find(
          ([, p]) => distanceBetween(p, ball) < 0.01,
        )?.[0];
        expect(digger).toBeDefined();
        const side = digger!.startsWith('them-') ? 'them' : 'us';
        expect(digger).not.toBe(settingSetterId(sides[side]));
      }
    }
  });
});
