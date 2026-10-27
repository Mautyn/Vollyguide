import { beforeEach, describe, expect, it } from 'vitest';
import { FREE_ZONE } from '../domain/court';
import { useCourtStore } from './courtStore';

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
