export type Locale = 'en' | 'pl';

export const LOCALES: readonly Locale[] = ['en', 'pl'];

/**
 * The language to show: a saved choice wins; otherwise Polish if the browser's preferred
 * languages start with Polish, else English.
 */
export function detectLocale(saved: string | null, languages: readonly string[]): Locale {
  if (saved === 'en' || saved === 'pl') return saved;
  const first = languages[0]?.toLowerCase() ?? '';
  return first === 'pl' || first.startsWith('pl-') ? 'pl' : 'en';
}

/** A number with a fixed number of decimals, in the locale's format (Polish uses a comma). */
export function formatDecimal(value: number, digits: number, locale: Locale): string {
  const text = value.toFixed(digits);
  return locale === 'pl' ? text.replace('.', ',') : text;
}

/** Polish plural forms: 1 krok, 2–4 kroki, 5+ kroków (but 12–14 kroków, 22–24 kroki). */
export function polishPlural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}
