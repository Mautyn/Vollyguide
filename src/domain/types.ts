/** A point on the court in meters. See src/domain/court.ts for the coordinate system. */
export interface Point {
  x: number;
  y: number;
}

/** S = setter, OH = outside hitter, OPP = opposite, MB = middle blocker, L = libero. */
export type Role = 'S' | 'OH' | 'OPP' | 'MB' | 'L';

/** 1 right back, 2 right front, 3 middle front, 4 left front, 5 left back, 6 middle back. */
export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

/** Rotation number: the zone the setter occupies at the moment of serve in a 5-1. */
export type Rotation = 1 | 2 | 3 | 4 | 5 | 6;

/** `base` is where players stand by default in a rotation; the others are phases of a rally. */
export type Phase = 'base' | 'serve' | 'receive' | 'attack' | 'defense' | 'transition';

export type System = '5-1' | '4-2' | '6-2';

export type Team = 'us' | 'them';

export interface Player {
  id: string;
  role: Role;
  /** Short on-court label, e.g. "S" or "OH1". */
  label: string;
  team: Team;
  position: Point;
}

/** One player per zone at the moment of serve. */
export type ZoneMap<T> = Record<Zone, T>;
