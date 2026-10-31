import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildFormationsExport, FORMATIONS_EXPORT_PATH, formationsExportJson } from './export';

describe('formations export for the video pipeline', () => {
  it('covers every system × rotation × phase once', () => {
    const { formations } = buildFormationsExport();
    expect(formations).toHaveLength(3 * 6 * 3);
    expect(new Set(formations.map((f) => f.id)).size).toBe(formations.length);
    for (const f of formations) expect(f.players).toHaveLength(6);
  });

  it('is up to date (run `npm run export:formations` if this fails)', () => {
    const committed = readFileSync(resolve(process.cwd(), FORMATIONS_EXPORT_PATH), 'utf8');
    expect(committed).toBe(formationsExportJson());
  });
});
