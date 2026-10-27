# Volleyguide

Read-only static web app that teaches professional volleyball positioning through an interactive court.

## Hard constraints
- Static site only: no backend, database, auth, accounts, analytics, tracking or cookies. Never add these unless an issue explicitly asks.
- No user data leaves the browser. localStorage only for UI preferences.
- All content (lessons, formations, rotations) lives in the repo as typed data in src/content/.

## Stack
Vite, React, TypeScript (strict), konva/react-konva, Zustand, React Router, Vitest + Testing Library, Playwright (chromium), ESLint, Prettier. Node 22.

## Court and domain rules
- Court 9 m wide x 18 m long. Coordinates in meters: x = 0..9 left to right as seen from behind our own end line; y = 0 at our end line, net at y = 9, opponent end line at y = 18. Our attack line y = 6, opponent attack line y = 12.
- Store every position in meters. Convert to pixels only in src/court/.
- Roles: S (setter), OH (outside hitter), OPP (opposite), MB (middle blocker), L (libero).
- Zones: 1 right back, 2 right front, 3 middle front, 4 left front, 5 left back, 6 middle back.
- Overlap rule at the moment of serve (judged by feet position):
  - each front-row player is closer to the net than the back-row player behind them: 4 vs 5, 3 vs 6, 2 vs 1;
  - within each row, left-to-right order is kept: 4-3-2 in front, 5-6-1 in back.
- Code in src/domain/ is pure (no React, no DOM) and fully unit-tested.

## Commands
- npm run dev | build | lint | typecheck | test | test:e2e
- npm run check: run before every commit; it must pass.

## Workflow
- Never commit to main. Branch name: claude/<issue-number>-<short-slug>.
- One issue = one branch = one PR. The PR body includes "Closes #<number>".
- Every feature or fix ships with tests: unit tests for domain logic, component or E2E tests for UI behavior.
- Small commits with conventional messages (feat:, fix:, test:, refactor:, docs:, chore:).
- For GitHub issues and PRs use the built-in GitHub tools or `gh api` (REST). `gh pr` and `gh issue` do not work in cloud sessions.
- If an issue is ambiguous, comment a question on the issue and stop instead of guessing.
- Don't add a dependency without stating why in the PR.
- Keep UI text in one strings module (Polish translation planned).

## Future (do not build until an issue asks)
- services/video/: Python pipeline for match video analysis.
