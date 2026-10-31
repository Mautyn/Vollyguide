import { rotateClockwise } from '../domain/rotation';
import type { Point, Rotation, System, ZoneMap } from '../domain/types';
import { isFrontRow, ZONES } from '../domain/zones';
import { BASE_SPOTS, type Formation, type FormationPlayer } from './formations';
import { RECEIVE_5_1_ROTATIONS } from './receive';
import { serveFormation } from './serve';
import { BASE_5_1_ROTATIONS, ROTATION_ORDER } from './rotations';

export const SYSTEMS: readonly System[] = ['5-1', '6-2', '4-2'];

const ROTATIONS: readonly Rotation[] = [1, 2, 3, 4, 5, 6];

/**
 * 6-2 and 4-2 roster in rotation 1: two setters opposite each other (S1 in zone 1, S2 in
 * zone 4) instead of a setter and an opposite.
 */
const TWO_SETTER_ROTATION_1: readonly FormationPlayer[] = [
  { id: 's1', role: 'S', label: 'S1', zone: 1, position: BASE_SPOTS[1] },
  { id: 'oh1', role: 'OH', label: 'OH1', zone: 2, position: BASE_SPOTS[2] },
  { id: 'mb2', role: 'MB', label: 'MB2', zone: 3, position: BASE_SPOTS[3] },
  { id: 's2', role: 'S', label: 'S2', zone: 4, position: BASE_SPOTS[4] },
  { id: 'oh2', role: 'OH', label: 'OH2', zone: 5, position: BASE_SPOTS[5] },
  { id: 'mb1', role: 'MB', label: 'MB1', zone: 6, position: BASE_SPOTS[6] },
];

/** Base positions, generated from rotation 1 by rotating clockwise (as for 5-1). */
function buildBase(system: System, rotation: Rotation): Formation {
  const start = TWO_SETTER_ROTATION_1;
  let assignment = Object.fromEntries(start.map((p) => [p.zone, p])) as ZoneMap<FormationPlayer>;
  for (let step = 0; step < ROTATION_ORDER.indexOf(rotation); step++) {
    assignment = rotateClockwise(assignment);
  }
  const players = ZONES.map((zone) => ({
    ...assignment[zone],
    zone,
    position: { ...BASE_SPOTS[zone] },
  }));
  // Keep the roster order of rotation 1 so the player list doesn't reshuffle.
  players.sort(
    (a, b) => start.findIndex((p) => p.id === a.id) - start.findIndex((p) => p.id === b.id),
  );
  return { id: `${system}-r${rotation}-base`, system, rotation, phase: 'base', players };
}

type Positions = Record<string, Point>;

/** Rotations 4, 3 and 2 of a two-setter system are rotations 1, 6 and 5 with these pairs swapped. */
const PAIR_SWAP: Readonly<Record<string, string>> = {
  s1: 's2',
  s2: 's1',
  oh1: 'oh2',
  oh2: 'oh1',
  mb1: 'mb2',
  mb2: 'mb1',
};

const SWAPPED_FROM: Readonly<Partial<Record<Rotation, Rotation>>> = { 4: 1, 3: 6, 2: 5 };

const renamed = (positions: Positions, names: Readonly<Record<string, string>>): Positions =>
  Object.fromEntries(Object.entries(positions).map(([id, p]) => [names[id] ?? id, { ...p }]));

function buildReceive(
  system: System,
  rotation: Rotation,
  data: { note: string; positions: Positions },
): Formation {
  const base = BASES[system][rotation];
  return {
    id: `${system}-r${rotation}-receive`,
    system,
    rotation,
    phase: 'receive',
    note: data.note,
    players: base.players.map((player) => {
      const position = data.positions[player.id];
      if (!position) throw new Error(`No ${system} receive position for ${player.id}`);
      return { ...player, position: { ...position } };
    }),
  };
}

const BASES: Record<System, Record<Rotation, Formation>> = {
  '5-1': { ...BASE_5_1_ROTATIONS },
  '6-2': Object.fromEntries(ROTATIONS.map((r) => [r, buildBase('6-2', r)])) as Record<
    Rotation,
    Formation
  >,
  '4-2': Object.fromEntries(ROTATIONS.map((r) => [r, buildBase('4-2', r)])) as Record<
    Rotation,
    Formation
  >,
};

/**
 * 6-2 receive. The back-row setter always sets, so rotations 1, 6 and 5 are exactly the
 * 5-1 receive with S → S1 and OPP → S2 (the front-row setter attacks on the right).
 */
const RECEIVE_6_2_NOTES: Record<Rotation, string> = {
  1: 'S1 sets from zone 1 and must stay behind the right-front passer; S2 is in the front row and attacks on the right.',
  6: 'S1 sets from zone 6, hiding right behind S2 at the net; S2 attacks on the right.',
  5: 'S1 sets from zone 5: it stays farther from the net than the left-front middle and left of the middle passer, then runs along the net.',
  4: 'Rotation 1 with the setters swapped: S2 sets from zone 1, S1 attacks on the right.',
  3: 'Rotation 6 with the setters swapped: S2 sets from zone 6, hiding behind S1 at the net.',
  2: 'Rotation 5 with the setters swapped: S2 sets from zone 5 and runs along the net.',
};

/** Where the 4-2 setter sets from: zone 3, 0.5 m from the net. */
export const SETTING_TARGET_4_2: Point = { x: 4.5, y: 8.5 };

/**
 * 4-2 receive for rotations 1, 6 and 5, where S2 is in the front row and sets from zone 3.
 * Passers are OH1, OH2 and the back-row MB, as in 5-1. Shared frame: y = 0 at our end line.
 */
const RECEIVE_4_2: Partial<Record<Rotation, { note: string; positions: Positions }>> = {
  // Front: S2 4, MB2 3, OH1 2. Back: OH2 5, MB1 6, S1 1.
  1: {
    note: 'S2 sets from the front row: it starts in zone 4, must stay left of the middle blocker, then steps right to zone 3.',
    positions: {
      s2: { x: 3.6, y: 8.6 }, // 0.4 m from the net, 0.9 m from the zone-3 target
      mb2: { x: 5.2, y: 8.5 },
      oh1: { x: 7.5, y: 4 }, // passer, 5 m from the net
      oh2: { x: 1.5, y: 4 }, // passer
      mb1: { x: 4.5, y: 4 }, // passer
      s1: { x: 8.6, y: 1.5 }, // back-row setter stays deep in the right corner
    },
  },
  // Front: OH2 4, S2 3, MB2 2. Back: MB1 5, S1 6, OH1 1.
  6: {
    note: 'S2 is already in zone 3 and sets from where it stands; S1 stays deep, out of the passing lanes.',
    positions: {
      oh2: { x: 1.5, y: 4.5 }, // passer, front row
      s2: { x: 4.5, y: 8.6 }, // at the target
      mb2: { x: 8, y: 8.5 },
      mb1: { x: 4.5, y: 4 }, // passer
      s1: { x: 6, y: 1.5 }, // deep, between the middle and right lanes
      oh1: { x: 7.5, y: 4 }, // passer
    },
  },
  // Front: MB1 4, OH2 3, S2 2. Back: S1 5, OH1 6, MB2 1.
  5: {
    note: 'S2 starts in zone 2, must stay right of the middle-front passer, then steps left to zone 3.',
    positions: {
      mb1: { x: 0.8, y: 8.6 },
      oh2: { x: 1.5, y: 4.5 }, // passer, front row
      s2: { x: 5, y: 8.5 }, // 0.5 m from the zone-3 target
      s1: { x: 2, y: 8 }, // back-row setter hides near the net behind MB1
      oh1: { x: 4.5, y: 4 }, // passer
      mb2: { x: 7.5, y: 4 }, // passer
    },
  },
};

const RECEIVE_4_2_SWAPPED_NOTES: Partial<Record<Rotation, string>> = {
  4: 'Rotation 1 with the setters swapped: S1 starts in zone 4 and steps right to zone 3 to set.',
  3: 'Rotation 6 with the setters swapped: S1 is already in zone 3 and sets from there.',
  2: 'Rotation 5 with the setters swapped: S1 starts in zone 2 and steps left to zone 3 to set.',
};

/** 5-1 positions keyed for the two-setter roster: S → S1, OPP → S2. */
function from51(rotation: Rotation): Positions {
  const positions = Object.fromEntries(
    RECEIVE_5_1_ROTATIONS[rotation].players.map((p) => [p.id, p.position]),
  );
  return renamed(positions, { s: 's1', opp: 's2' });
}

function receive62(rotation: Rotation): Formation {
  const source = SWAPPED_FROM[rotation];
  const positions = source ? renamed(from51(source), PAIR_SWAP) : from51(rotation);
  return buildReceive('6-2', rotation, { note: RECEIVE_6_2_NOTES[rotation], positions });
}

function receive42(rotation: Rotation): Formation {
  const source = SWAPPED_FROM[rotation];
  const data = source
    ? {
        note: RECEIVE_4_2_SWAPPED_NOTES[rotation]!,
        positions: renamed(RECEIVE_4_2[source]!.positions, PAIR_SWAP),
      }
    : RECEIVE_4_2[rotation]!;
  return buildReceive('4-2', rotation, data);
}

const RECEIVES: Record<System, Record<Rotation, Formation>> = {
  '5-1': { ...RECEIVE_5_1_ROTATIONS },
  '6-2': Object.fromEntries(ROTATIONS.map((r) => [r, receive62(r)])) as Record<Rotation, Formation>,
  '4-2': Object.fromEntries(ROTATIONS.map((r) => [r, receive42(r)])) as Record<Rotation, Formation>,
};

const SERVES: Record<System, Record<Rotation, Formation>> = Object.fromEntries(
  SYSTEMS.map((system) => [
    system,
    Object.fromEntries(ROTATIONS.map((r) => [r, serveFormation(BASES[system][r])])),
  ]),
) as Record<System, Record<Rotation, Formation>>;

const BY_PHASE = { base: BASES, serve: SERVES, receive: RECEIVES } as const;

export function systemFormation(
  system: System,
  rotation: Rotation,
  phase: 'base' | 'serve' | 'receive',
): Formation {
  return BY_PHASE[phase][system][rotation];
}

/**
 * The setter who sets in this formation: the only one in 5-1, the back-row setter in
 * 6-2, the front-row setter in 4-2.
 */
export function settingSetter(formation: Formation): FormationPlayer {
  const setters = formation.players.filter((p) => p.role === 'S');
  if (formation.system === '5-1') return setters[0]!;
  const wantFrontRow = formation.system === '4-2';
  return setters.find((p) => isFrontRow(p.zone) === wantFrontRow)!;
}
