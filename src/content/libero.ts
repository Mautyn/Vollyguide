import { applyLibero } from '../domain/libero';
import { applyLiberoAtServe } from '../domain/serve';
import type { Point } from '../domain/types';
import { formationToZones, type Formation, type FormationPlayer } from './formations';
import { LIBERO_SERVES_FOR } from './serve';

export const LIBERO = { id: 'l', role: 'L', label: 'L' } as const;

/**
 * Where the replaced middle blocker waits: our sideline's free zone between the end line
 * and the attack line, which is the libero replacement zone.
 */
export const LIBERO_REPLACEMENT_SPOT: Point = { x: -1.5, y: 3 };

export type BenchedPlayer = Omit<FormationPlayer, 'zone'>;

/**
 * The formation with the libero standing where the back-row middle blocker would stand
 * (same zone, same spot), and that middle blocker on the bench. At our serve the libero
 * serves only for LIBERO_SERVES_FOR; when the other middle blocker is in zone 1, that
 * middle blocker serves and the libero is the one waiting on the bench.
 */
export function withLibero(formation: Formation): {
  formation: Formation;
  benched: BenchedPlayer | null;
} {
  const zones = formationToZones(formation);
  if (formation.phase === 'serve') {
    // USAV/NCAA: the libero serves in one rotation only; otherwise it waits off court.
    const atServe = applyLiberoAtServe(zones, formation.players, LIBERO, LIBERO_SERVES_FOR);
    if (atServe.liberoOff) {
      return {
        formation,
        benched: { ...LIBERO, position: { ...LIBERO_REPLACEMENT_SPOT } },
      };
    }
  }
  const { replaced } = applyLibero(zones, formation.players, LIBERO);
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
