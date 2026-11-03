import {
  courtLineup,
  rotationNumber,
  type MatchState,
  type Side,
  type TeamState,
} from '../../domain/match';
import { rotateClockwise } from '../../domain/rotation';
import type { Role, Rotation, System, ZoneMap } from '../../domain/types';
import { LIBERO } from '../libero';
import { OPPONENT_SERVING } from '../opponent';
import { ROTATION_ORDER } from '../rotations';
import { LIBERO_SERVES_FOR } from '../serve';
import { systemFormation } from '../systems';
import type { TeamOnCourt } from './positions';

/** A player as drawn: id, role and short label. */
export interface SimPlayer {
  id: string;
  role: Role;
  label: string;
}

/** Our team for the simulation, in the given rotation, from the site's formations. */
export function ourTeam(system: System, rotation: Rotation, libero: boolean): TeamState {
  const formation = systemFormation(system, rotation, 'base');
  return {
    system,
    players: formation.players.map(({ id, role }) => ({ id, role })),
    zones: Object.fromEntries(formation.players.map((p) => [p.zone, p.id])) as ZoneMap<string>,
    rotationKey: system === '5-1' ? 's' : 's1',
    libero: libero ? { id: LIBERO.id, role: LIBERO.role } : null,
    liberoServesFor: libero ? LIBERO_SERVES_FOR : null,
  };
}

/** The opponent: a 5-1 without a libero (the lineup from src/content/opponent.ts). */
export function opponentTeam(rotation: Rotation = 1): TeamState {
  let zones = Object.fromEntries(OPPONENT_SERVING.map((p) => [p.zone, p.id])) as ZoneMap<string>;
  for (let i = 0; i < ROTATION_ORDER.indexOf(rotation); i++) zones = rotateClockwise(zones);
  return {
    system: '5-1',
    players: OPPONENT_SERVING.map(({ id, role }) => ({ id, role })),
    zones,
    rotationKey: 'them-s',
    libero: null,
    liberoServesFor: null,
  };
}

/** Everyone who can appear in a simulation of this system, with their labels. */
export function simulationPlayers(system: System): { us: SimPlayer[]; them: SimPlayer[] } {
  const ours = systemFormation(system, 1, 'base').players.map(({ id, role, label }) => ({
    id,
    role,
    label,
  }));
  return {
    us: [...ours, { ...LIBERO }],
    them: OPPONENT_SERVING.map(({ id, role, label }) => ({ id, role, label })),
  };
}

/** One side of a match state, as the position generator needs it. */
export function teamOnCourt(state: MatchState, side: Side): TeamOnCourt {
  const team = state[side];
  const roles = Object.fromEntries(
    [...team.players, ...(team.libero ? [team.libero] : [])].map((p) => [p.id, p.role]),
  ) as Record<string, Role>;
  return {
    system: team.system,
    rotation: rotationNumber(team),
    zones: courtLineup(state, side).zones,
    roles,
    serving: state.serving === side,
  };
}
