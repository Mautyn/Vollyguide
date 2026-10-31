// Writes services/video/data/formations.json from the site's typed content (src/content/),
// so the video pipeline uses exactly the same formations. Run: npm run export:formations
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { module } = await runnerImport(resolve(root, 'src/content/export.ts'), { root });
const target = resolve(root, module.FORMATIONS_EXPORT_PATH);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, module.formationsExportJson());
console.log(`Wrote ${module.FORMATIONS_EXPORT_PATH}`);
