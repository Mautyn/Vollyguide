import type { Role, Zone, ZoneMap } from './types';
import { isFrontRow, ZONES } from './zones';

export interface RosterEntry {
  id: string;
  role: Role;
}

export type LiberoViolation =
  { kind: 'front-row'; zone: Zone; id: string } | { kind: 'too-many'; count: number };

/**
 * Swaps the back-row middle blocker for the libero. In a 5-1 exactly one MB is in the
 * back row in every rotation. Returns the new zone assignment and the id of the MB who
 * goes to the bench, or `replaced: null` (zones unchanged) if no MB is in the back row.
 *
 * At our serve, see `applyLiberoAtServe` in serve.ts: this app follows the USAV/NCAA rule
 * (the libero may serve in one rotation per set); FIVB does not let the libero serve.
 */
export function applyLibero(
  zones: ZoneMap<string>,
  players: readonly RosterEntry[],
  libero: RosterEntry,
): { zones: ZoneMap<string>; replaced: string | null } {
  const roleOf = new Map(players.map((p) => [p.id, p.role]));
  const backRowMbZone = ZONES.find((zone) => !isFrontRow(zone) && roleOf.get(zones[zone]) === 'MB');
  if (backRowMbZone === undefined) return { zones: { ...zones }, replaced: null };
  return {
    zones: { ...zones, [backRowMbZone]: libero.id },
    replaced: zones[backRowMbZone],
  };
}

/** Libero rules at the moment of serve: never in the front row, and at most one on court. */
export function findLiberoViolations(
  zones: ZoneMap<string>,
  roles: Readonly<Record<string, Role>>,
): LiberoViolation[] {
  const liberoZones = ZONES.filter((zone) => roles[zones[zone]] === 'L');
  const violations: LiberoViolation[] = liberoZones
    .filter(isFrontRow)
    .map((zone) => ({ kind: 'front-row', zone, id: zones[zone] }));
  if (liberoZones.length > 1) violations.push({ kind: 'too-many', count: liberoZones.length });
  return violations;
}
