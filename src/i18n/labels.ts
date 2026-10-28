import type { Role } from '../domain/types';
import type { Locale } from './locale';

/** Polish coaching abbreviations: rozgrywający, przyjmujący, atakujący, środkowy, libero. */
const POLISH_ABBREVIATION: Readonly<Record<Role, string>> = {
  S: 'R',
  OH: 'P',
  OPP: 'A',
  MB: 'Ś',
  L: 'L',
};

const ENGLISH_ABBREVIATION: Readonly<Record<Role, string>> = {
  S: 'S',
  OH: 'OH',
  OPP: 'OPP',
  MB: 'MB',
  L: 'L',
};

/**
 * A player's short label in the given language, keeping any number: OH1 → P1, MB2 → Ś2,
 * S → R. Labels that do not start with the role's English abbreviation are kept as they are.
 */
export function localizeLabel(label: string, role: Role, locale: Locale): string {
  if (locale === 'en') return label;
  const english = ENGLISH_ABBREVIATION[role];
  if (!label.startsWith(english)) return label;
  return POLISH_ABBREVIATION[role] + label.slice(english.length);
}
