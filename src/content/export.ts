import type { Phase, Point, Role, Rotation, System, Zone, ZoneMap } from '../domain/types';
import { BASE_SPOTS } from './formations';
import { LIBERO, LIBERO_REPLACEMENT_SPOT } from './libero';
import { DEFENSE_SPOTS, LIBERO_SERVES_FOR, SERVER_SPOT } from './serve';
import { systemFormation, SYSTEMS } from './systems';

/**
 * Everything the video pipeline (services/video/) needs from the site's content, as plain
 * JSON. Written by `npm run export:formations`; a test fails if the committed file is stale.
 */
export interface FormationsExport {
  generatedBy: string;
  coordinates: string;
  constants: {
    baseSpots: ZoneMap<Point>;
    serverSpot: Point;
    defenseSpots: ZoneMap<Point>;
    liberoReplacementSpot: Point;
    libero: { id: string; role: Role; label: string };
    liberoServesFor: string;
  };
  formations: {
    id: string;
    system: System;
    rotation: Rotation;
    phase: Phase;
    players: { id: string; role: Role; label: string; zone: Zone; position: Point }[];
  }[];
}

export const FORMATIONS_EXPORT_PATH = 'services/video/data/formations.json';

const ROTATIONS: readonly Rotation[] = [1, 2, 3, 4, 5, 6];
const PHASES = ['base', 'serve', 'receive'] as const;

export function buildFormationsExport(): FormationsExport {
  return {
    generatedBy: 'npm run export:formations (from src/content). Do not edit by hand.',
    coordinates:
      'Meters. x = 0..9 from the left sideline as seen from behind our end line; y = 0 at our end line, net at y = 9.',
    constants: {
      baseSpots: BASE_SPOTS,
      serverSpot: SERVER_SPOT,
      defenseSpots: DEFENSE_SPOTS,
      liberoReplacementSpot: LIBERO_REPLACEMENT_SPOT,
      libero: { ...LIBERO },
      liberoServesFor: LIBERO_SERVES_FOR,
    },
    formations: SYSTEMS.flatMap((system) =>
      ROTATIONS.flatMap((rotation) =>
        PHASES.map((phase) => {
          const f = systemFormation(system, rotation, phase);
          return {
            id: f.id,
            system: f.system,
            rotation: f.rotation,
            phase: f.phase,
            players: f.players.map(({ id, role, label, zone, position }) => ({
              id,
              role,
              label,
              zone,
              position: { x: position.x, y: position.y },
            })),
          };
        }),
      ),
    ),
  };
}

/** The exact file contents: stable key order, 2-space indent, trailing newline. */
export function formationsExportJson(): string {
  return `${JSON.stringify(buildFormationsExport(), null, 2)}\n`;
}
