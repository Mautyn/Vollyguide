import { create } from 'zustand';
import { detectLocale, type Locale } from '../i18n/locale';

/** The language choice is a UI preference kept in localStorage (allowed by CLAUDE.md). */
export const LOCALE_KEY = 'volleyguide:locale';

function readSaved(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_KEY);
  } catch {
    return null;
  }
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: detectLocale(readSaved(), browserLanguages()),
  setLocale: (locale) => {
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // Not remembered this time; the page keeps working.
    }
    set({ locale });
  },
}));

/** The active language, re-rendering when it changes. */
export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}
