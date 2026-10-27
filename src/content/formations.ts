import type { Phase, Player, Point, Role, Rotation, System, Zone, ZoneMap } from '../domain/types';

export interface FormationPlayer {
  id: string;
  role: Role;
  label: string;
  zone: Zone;
  position: Point;
}

export interface Formation {
  id: string;
  system: System;
  rotation: Rotation;
  phase: Phase;
  /** One sentence explaining the key idea of this formation. */
  note?: string;
  /** Players at the moment of serve, one per zone. */
  players: FormationPlayer[];
}

/** Standard base spots per zone: front row at 7.5 m, back row at 3 m. */
export const BASE_SPOTS: ZoneMap<Point> = {
  4: { x: 1.5, y: 7.5 },
  3: { x: 4.5, y: 7.5 },
  2: { x: 7.5, y: 7.5 },
  5: { x: 1.5, y: 3 },
  6: { x: 4.5, y: 3 },
  1: { x: 7.5, y: 3 },
};

/** 5-1, rotation 1 (setter in zone 1), base positions. */
export const BASE_5_1_ROTATION_1: Formation = {
  id: '5-1-r1-base',
  system: '5-1',
  rotation: 1,
  phase: 'base',
  players: [
    { id: 's', role: 'S', label: 'S', zone: 1, position: BASE_SPOTS[1] },
    { id: 'oh1', role: 'OH', label: 'OH1', zone: 2, position: BASE_SPOTS[2] },
    { id: 'mb2', role: 'MB', label: 'MB2', zone: 3, position: BASE_SPOTS[3] },
    { id: 'opp', role: 'OPP', label: 'OPP', zone: 4, position: BASE_SPOTS[4] },
    { id: 'oh2', role: 'OH', label: 'OH2', zone: 5, position: BASE_SPOTS[5] },
    { id: 'mb1', role: 'MB', label: 'MB1', zone: 6, position: BASE_SPOTS[6] },
  ],
};

export function formationToPlayers(formation: Formation): Player[] {
  return formation.players.map(({ id, role, label, position }) => ({
    id,
    role,
    label,
    team: 'us',
    position: { ...position },
  }));
}

export function formationToZones(formation: Formation): ZoneMap<string> {
  const zones: Partial<ZoneMap<string>> = {};
  for (const player of formation.players) zones[player.zone] = player.id;
  for (const zone of [1, 2, 3, 4, 5, 6] as const) {
    if (!zones[zone]) throw new Error(`Formation ${formation.id} has no player in zone ${zone}`);
  }
  return zones as ZoneMap<string>;
}
