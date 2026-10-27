/** Reads the 1-based `?step=` parameter as a 0-based index within the lesson. */
export function stepIndexFromParam(param: string | null, stepCount: number): number {
  const step = Number.parseInt(param ?? '', 10);
  if (!Number.isFinite(step) || step < 1) return 0;
  return Math.min(step, stepCount) - 1;
}
