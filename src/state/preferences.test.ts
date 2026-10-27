import { afterEach, describe, expect, it, vi } from 'vitest';

async function freshPreferences() {
  vi.resetModules();
  return (await import('./preferences')).usePreferences;
}

describe('preferences', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('has the libero off by default', async () => {
    expect((await freshPreferences()).getState().useLibero).toBe(false);
  });

  it('remembers the libero switch in localStorage', async () => {
    (await freshPreferences()).getState().setUseLibero(true);
    expect(window.localStorage.getItem('volleyguide:useLibero')).toBe('true');
    expect((await freshPreferences()).getState().useLibero).toBe(true);
  });

  it('keeps working when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const prefs = await freshPreferences();
    expect(prefs.getState().useLibero).toBe(false);
    prefs.getState().setUseLibero(true);
    expect(prefs.getState().useLibero).toBe(true);
  });
});
