import { beforeEach, describe, expect, it } from 'vitest';
import { FREE_ZONE } from '../domain/court';
import { lineupFromState, useCourtStore } from './courtStore';

describe('courtStore', () => {
  beforeEach(() => useCourtStore.getState().reset());

  it('starts with six players of our team', () => {
    const { players } = useCourtStore.getState();
    expect(players).toHaveLength(6);
    expect(players.every((p) => p.team === 'us')).toBe(true);
  });

  it('moves a player in meters', () => {
    useCourtStore.getState().movePlayer('s', { x: 8, y: 1 });
    const setter = useCourtStore.getState().players.find((p) => p.id === 's');
    expect(setter?.position).toEqual({ x: 8, y: 1 });
  });

  it('keeps players inside the playable area', () => {
    useCourtStore.getState().movePlayer('s', { x: 100, y: -100 });
    const setter = useCourtStore.getState().players.find((p) => p.id === 's');
    expect(setter?.position).toEqual({ x: 9 + FREE_ZONE, y: -FREE_ZONE });
  });

  it('resets to the base formation', () => {
    useCourtStore.getState().movePlayer('s', { x: 0, y: 0 });
    useCourtStore.getState().reset();
    const setter = useCourtStore.getState().players.find((p) => p.id === 's');
    expect(setter?.position).toEqual({ x: 7.5, y: 3 });
  });
});

describe('lineupFromState', () => {
  beforeEach(() => useCourtStore.getState().reset());

  it('maps zones to the positions of the players standing there', () => {
    const { players, serveZones } = useCourtStore.getState();
    const lineup = lineupFromState(players, serveZones);
    expect(lineup?.[1]).toEqual({ x: 7.5, y: 3 });
    expect(lineup?.[4]).toEqual({ x: 1.5, y: 7.5 });
  });

  it('returns null when a zone points at a missing player', () => {
    const { players, serveZones } = useCourtStore.getState();
    expect(lineupFromState(players, { ...serveZones, 3: 'nobody' })).toBeNull();
  });
});
