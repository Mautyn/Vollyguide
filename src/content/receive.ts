import type { Point, Rotation } from '../domain/types';
import type { Formation } from './formations';
import { BASE_5_1_ROTATIONS } from './rotations';

interface ReceiveData {
  note: string;
  /** Position in meters for each player id, at the moment of the opponent's serve. */
  positions: Record<string, Point>;
}

/**
 * 5-1 serve receive. Three passers (OH1, OH2 and the back-row MB) form a line at
 * x ≈ 1.5 / 4.5 / 7.5 m. The setter stands as close to the setting spot (x 6, y 8.5)
 * as the overlap rule allows; the opposite and the front-row MB stay out of the
 * passing lanes. Zones are the same as in the base rotation.
 */
const RECEIVE_5_1: Record<Rotation, ReceiveData> = {
  // Front: OPP 4, MB2 3, OH1 2. Back: OH2 5, MB1 6, S 1.
  1: {
    note: 'Setter in 1 must stay behind the right-front passer, so this is the longest run to the net.',
    positions: {
      opp: { x: 1, y: 8.5 },
      mb2: { x: 4.5, y: 8.5 },
      oh1: { x: 7.5, y: 4 },
      oh2: { x: 1.5, y: 4 },
      mb1: { x: 4.5, y: 4 },
      s: { x: 8.5, y: 3.5 },
    },
  },
  // Front: OH2 4, OPP 3, MB2 2. Back: MB1 5, S 6, OH1 1.
  6: {
    note: 'Setter in 6 hides right behind the opposite at the net and steps forward to set.',
    positions: {
      oh2: { x: 1.5, y: 4.5 },
      opp: { x: 5.5, y: 8.6 },
      mb2: { x: 8, y: 8.5 },
      mb1: { x: 4.5, y: 4 },
      s: { x: 6, y: 8 },
      oh1: { x: 7.5, y: 4 },
    },
  },
  // Front: MB1 4, OH2 3, OPP 2. Back: S 5, OH1 6, MB2 1.
  5: {
    note: 'Setter in 5 stays behind the left-front middle and left of the middle passer, then runs along the net.',
    positions: {
      mb1: { x: 0.8, y: 8.6 },
      oh2: { x: 1.5, y: 4.5 },
      opp: { x: 8, y: 8.5 },
      s: { x: 4, y: 8.1 },
      oh1: { x: 4.5, y: 4 },
      mb2: { x: 7.5, y: 4 },
    },
  },
  // Front: S 4, MB1 3, OH2 2. Back: OH1 5, MB2 6, OPP 1.
  4: {
    note: 'Setter in 4 is already in the front row and slides along the net to the right.',
    positions: {
      s: { x: 5.5, y: 8.5 },
      mb1: { x: 6.4, y: 8.7 },
      oh2: { x: 7.3, y: 4.5 },
      oh1: { x: 1.5, y: 4 },
      mb2: { x: 4.5, y: 4 },
      opp: { x: 8.7, y: 2 },
    },
  },
  // Front: OH1 4, S 3, MB1 2. Back: MB2 5, OPP 6, OH2 1.
  3: {
    note: 'Setter in 3 starts at the net; the back-row opposite hides just behind the setter.',
    positions: {
      oh1: { x: 1.5, y: 4.5 },
      s: { x: 6, y: 8.6 },
      mb1: { x: 7.5, y: 8.6 },
      mb2: { x: 4.5, y: 4 },
      opp: { x: 6, y: 7.8 },
      oh2: { x: 7.5, y: 4 },
    },
  },
  // Front: MB2 4, OH1 3, S 2. Back: OPP 5, OH2 6, MB1 1.
  2: {
    note: 'Setter in 2 already stands at the setting spot, so this is the easiest rotation.',
    positions: {
      mb2: { x: 0.8, y: 8.6 },
      oh1: { x: 1.5, y: 4.5 },
      s: { x: 6, y: 8.6 },
      opp: { x: 2.2, y: 7.8 },
      oh2: { x: 4.5, y: 4 },
      mb1: { x: 7.5, y: 4 },
    },
  },
};

function buildReceive(rotation: Rotation): Formation {
  const base = BASE_5_1_ROTATIONS[rotation];
  const { note, positions } = RECEIVE_5_1[rotation];
  return {
    id: `5-1-r${rotation}-receive`,
    system: '5-1',
    rotation,
    phase: 'receive',
    note,
    players: base.players.map((player) => {
      const position = positions[player.id];
      if (!position)
        throw new Error(`No receive position for ${player.id} in rotation ${rotation}`);
      return { ...player, position: { ...position } };
    }),
  };
}

export const RECEIVE_5_1_ROTATIONS: Readonly<Record<Rotation, Formation>> = {
  1: buildReceive(1),
  2: buildReceive(2),
  3: buildReceive(3),
  4: buildReceive(4),
  5: buildReceive(5),
  6: buildReceive(6),
};
