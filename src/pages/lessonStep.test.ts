import { describe, expect, it } from 'vitest';
import { stepIndexFromParam } from './lessonStep';

describe('stepIndexFromParam', () => {
  it('turns the 1-based step into a 0-based index', () => {
    expect(stepIndexFromParam('1', 5)).toBe(0);
    expect(stepIndexFromParam('3', 5)).toBe(2);
  });

  it('starts at the first step when the parameter is missing or invalid', () => {
    expect(stepIndexFromParam(null, 5)).toBe(0);
    expect(stepIndexFromParam('abc', 5)).toBe(0);
    expect(stepIndexFromParam('0', 5)).toBe(0);
    expect(stepIndexFromParam('-2', 5)).toBe(0);
  });

  it('stops at the last step', () => {
    expect(stepIndexFromParam('99', 5)).toBe(4);
  });
});
