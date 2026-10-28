import { describe, expect, it } from 'vitest';
import { localizeLabel } from './labels';
import { detectLocale, formatDecimal, polishPlural } from './locale';

describe('detectLocale', () => {
  it('follows the browser language', () => {
    expect(detectLocale(null, ['pl-PL', 'en'])).toBe('pl');
    expect(detectLocale(null, ['pl'])).toBe('pl');
    expect(detectLocale(null, ['en-US', 'pl'])).toBe('en');
    expect(detectLocale(null, ['de-DE'])).toBe('en');
    expect(detectLocale(null, [])).toBe('en');
  });

  it('lets a saved choice win, and ignores unknown saved values', () => {
    expect(detectLocale('en', ['pl-PL'])).toBe('en');
    expect(detectLocale('pl', ['en-US'])).toBe('pl');
    expect(detectLocale('fr', ['pl-PL'])).toBe('pl');
  });
});

describe('formatDecimal', () => {
  it('uses a decimal comma in Polish only', () => {
    expect(formatDecimal(7.5, 1, 'en')).toBe('7.5');
    expect(formatDecimal(7.5, 1, 'pl')).toBe('7,5');
    expect(formatDecimal(6, 1, 'pl')).toBe('6,0');
    expect(formatDecimal(-1.5, 1, 'pl')).toBe('-1,5');
  });
});

describe('polishPlural', () => {
  const steps = (n: number) => polishPlural(n, 'krok', 'kroki', 'kroków');
  it('picks the right form', () => {
    expect(steps(1)).toBe('krok');
    expect(steps(2)).toBe('kroki');
    expect(steps(4)).toBe('kroki');
    expect(steps(5)).toBe('kroków');
    expect(steps(7)).toBe('kroków');
    expect(steps(12)).toBe('kroków');
    expect(steps(22)).toBe('kroki');
  });
});

describe('localizeLabel', () => {
  it('uses Polish abbreviations and keeps the number', () => {
    expect(localizeLabel('OH1', 'OH', 'pl')).toBe('P1');
    expect(localizeLabel('MB2', 'MB', 'pl')).toBe('Ś2');
    expect(localizeLabel('S', 'S', 'pl')).toBe('R');
    expect(localizeLabel('S2', 'S', 'pl')).toBe('R2');
    expect(localizeLabel('OPP', 'OPP', 'pl')).toBe('A');
    expect(localizeLabel('L', 'L', 'pl')).toBe('L');
  });

  it('keeps English labels in English and unknown labels as they are', () => {
    expect(localizeLabel('OH1', 'OH', 'en')).toBe('OH1');
    expect(localizeLabel('B', 'MB', 'pl')).toBe('B');
  });
});
