# Volleyguide

A read-only, static web app that teaches professional volleyball positioning with an interactive court. There is no backend, no accounts and no tracking; everything runs in the browser.

**Live site:** https://mautyn.github.io/Vollyguide/

## Run locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

For E2E tests, install the Playwright browser once: `npx playwright install chromium`.

## Scripts

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the dev server                              |
| `npm run build`     | Type-check and build the static site into `dist/` |
| `npm run preview`   | Serve the production build locally                |
| `npm run lint`      | Run ESLint                                        |
| `npm run format`    | Format all files with Prettier                    |
| `npm run typecheck` | Run `tsc --noEmit`                                |
| `npm run test`      | Run unit and component tests (Vitest)             |
| `npm run test:e2e`  | Run Playwright E2E tests (chromium)               |
| `npm run check`     | lint + typecheck + test + build                   |

## Project layout

- `src/domain/` – pure TypeScript: court geometry, types, rotation and overlap rules
- `src/content/` – lessons and formations as typed data
- `src/court/` – Konva court components (the only place that converts meters to pixels)
- `src/pages/`, `src/components/`, `src/state/` – React UI and Zustand store
- `e2e/` – Playwright tests

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). The production build is served from `/Vollyguide/`; `dist/404.html` is a copy of `index.html` so deep links such as `/Vollyguide/court` work.

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). The production build is served from `/Vollyguide/`; `dist/404.html` is a copy of `index.html` so deep links such as `/Vollyguide/court` work.

See `CLAUDE.md` for the court coordinate system and contribution rules.
