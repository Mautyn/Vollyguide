import { create } from 'zustand';

/** UI preferences kept in localStorage (allowed by CLAUDE.md: no user data, no tracking). */
const USE_LIBERO_KEY = 'volleyguide:useLibero';

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); use the default.
    return fallback;
  }
}

function writeBoolean(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Not remembered this time; the page keeps working.
  }
}

interface PreferencesState {
  useLibero: boolean;
  setUseLibero: (useLibero: boolean) => void;
}

export const usePreferences = create<PreferencesState>()((set) => ({
  useLibero: readBoolean(USE_LIBERO_KEY, true),
  setUseLibero: (useLibero) => {
    writeBoolean(USE_LIBERO_KEY, useLibero);
    set({ useLibero });
  },
}));

export { USE_LIBERO_KEY };
