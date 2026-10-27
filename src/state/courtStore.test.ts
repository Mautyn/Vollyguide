import { beforeEach, describe, expect, it } from 'vitest';
import { FREE_ZONE } from '../domain/court';
import { lineupFromState, useCourtStore } from './courtStore';

describe('courtStore', () => {
  beforeEach(() => {
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
  });

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

  it('starts in rotation 1', () => {
    expect(useCourtStore.getState().rotation).toBe(1);
  });

  it('changes rotation, loading its base positions and discarding drags', () => {
    useCourtStore.getState().movePlayer('opp', { x: 0, y: 0 });
    useCourtStore.getState().setRotation(4);
    const { rotation, players, serveZones } = useCourtStore.getState();
    expect(rotation).toBe(4);
    expect(serveZones[4]).toBe('s');
    expect(players.find((p) => p.id === 's')?.position).toEqual({ x: 1.5, y: 7.5 });
    expect(players.find((p) => p.id === 'opp')?.position).toEqual({ x: 7.5, y: 3 });
  });

  it('reset keeps the selected rotation', () => {
    useCourtStore.getState().setRotation(5);
    useCourtStore.getState().movePlayer('s', { x: 0, y: 0 });
    useCourtStore.getState().reset();
    const { rotation, players } = useCourtStore.getState();
    expect(rotation).toBe(5);
    expect(players.find((p) => p.id === 's')?.position).toEqual({ x: 1.5, y: 3 });
  });

  it('starts in the base phase and switches to serve receive', () => {
    expect(useCourtStore.getState().phase).toBe('base');
    useCourtStore.getState().setPhase('receive');
    const { phase, players } = useCourtStore.getState();
    expect(phase).toBe('receive');
    expect(players.find((p) => p.id === 's')?.position).toEqual({ x: 8.5, y: 3.5 });
  });

  it('keeps the phase when the rotation changes', () => {
    useCourtStore.getState().setPhase('receive');
    useCourtStore.getState().setRotation(2);
    const { phase, players } = useCourtStore.getState();
    expect(phase).toBe('receive');
    expect(players.find((p) => p.id === 's')?.position).toEqual({ x: 6, y: 8.6 });
  });

  it('records where players stood before a formation change, but not for drags', () => {
    const before = useCourtStore.getState().transition.version;
    useCourtStore.getState().movePlayer('s', { x: 8, y: 2 });
    expect(useCourtStore.getState().transition.version).toBe(before);

    useCourtStore.getState().setPhase('receive');
    const { transition } = useCourtStore.getState();
    expect(transition.version).toBe(before + 1);
    expect(transition.from.s).toEqual({ x: 8, y: 2 });
  });

  it('resets to the base formation', () => {
    useCourtStore.getState().movePlayer('s', { x: 0, y: 0 });
    useCourtStore.getState().reset();
    const setter = useCourtStore.getState().players.find((p) => p.id === 's');
    expect(setter?.position).toEqual({ x: 7.5, y: 3 });
  });
});

describe('lineupFromState', () => {
  beforeEach(() => {
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
  });

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
