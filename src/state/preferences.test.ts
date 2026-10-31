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

  it('has the libero on by default', async () => {
    expect((await freshPreferences()).getState().useLibero).toBe(true);
  });

  it('remembers the libero switch in localStorage', async () => {
    (await freshPreferences()).getState().setUseLibero(false);
    expect(window.localStorage.getItem('volleyguide:useLibero')).toBe('false');
    expect((await freshPreferences()).getState().useLibero).toBe(false);

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
    expect(prefs.getState().useLibero).toBe(true);
    prefs.getState().setUseLibero(false);
    expect(prefs.getState().useLibero).toBe(false);
  });
});
