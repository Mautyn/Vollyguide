import { applyLibero } from '../domain/libero';
import type { Point } from '../domain/types';
import { formationToZones, type Formation, type FormationPlayer } from './formations';

export const LIBERO = { id: 'l', role: 'L', label: 'L' } as const;

/**
 * Where the replaced middle blocker waits: our sideline's free zone between the end line
 * and the attack line, which is the libero replacement zone.
 */
export const LIBERO_REPLACEMENT_SPOT: Point = { x: -1.5, y: 3 };

export type BenchedPlayer = Omit<FormationPlayer, 'zone'>;

/**
 * The formation with the libero standing where the back-row middle blocker would stand
 * (same zone, same spot), and that middle blocker on the bench.
 */
export function withLibero(formation: Formation): {
  formation: Formation;
  benched: BenchedPlayer | null;
} {
  const { replaced } = applyLibero(formationToZones(formation), formation.players, LIBERO);
  const mb = formation.players.find((p) => p.id === replaced);
  if (!mb) return { formation, benched: null };

  return {
    formation: {
      ...formation,
      id: `${formation.id}-libero`,
      players: formation.players.map((p) =>
        p.id === mb.id ? { ...LIBERO, zone: mb.zone, position: { ...mb.position } } : p,
      ),
    },
    benched: {
      id: mb.id,
      role: mb.role,
      label: mb.label,
      position: { ...LIBERO_REPLACEMENT_SPOT },
    },
  };
}
