# Volleyguide: project summary

> **Snapshot.** Sections 1 ("Current state") and 6 ("Open items") describe the project on 31 October 2026 and are not kept up to date. Check GitHub for the current issues, PRs and CI status.

_State as of 31 October 2026. Repository: [Mautyn/Vollyguide](https://github.com/Mautyn/Vollyguide). Live site: https://mautyn.github.io/Vollyguide/_

Volleyguide is a read-only, static web app that teaches professional volleyball positioning on an interactive court drawn to scale. It has no backend, accounts, analytics or cookies; the only things stored are UI preferences in localStorage.

---

## 1. Current state

- **Everything is merged.** `main` is at `1819f3a` (merge of #30). There are **no open issues and no open PRs**.
- **CI and deploy are green** on `main`: the `ci` workflow and the GitHub Pages `Deploy` workflow both succeeded for #30.
- **Tests:** about 663 unit and component tests (Vitest) and 31 end-to-end tests (Playwright, chromium), all passing.
- **The site is bilingual:** English and Polish (#30).

### What the site does

| Page                                       | What you can do                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**                                   | Hero section, links to the Court and Lessons, three feature cards.                                                                                                                                                                                                                                                                           |
| **Court** (`/court`)                       | Pick a system (5-1, 6-2 or 4-2), one of 6 rotations, and the base or receive phase. Drag players. Live overlap-rule check, libero switch, "Show opponent" switch (receive phase only), formation notes, player list with positions.                                                                                                          |
| **Lessons** (`/lessons`)                   | 3 step-by-step lessons on a read-only court: court and zones (6 steps), the overlap rule (6 steps, including 2 illegal examples), 5-1 serve receive (7 steps). Each step has its own shareable URL (`?step=`).                                                                                                                               |
| **Practice** (`/practice`)                 | Pick a system, rotation and phase (or "Random task"), drag players from the bench, then Check (1 m tolerance), Show answer or Try again. Works with the libero. Nothing is saved.                                                                                                                                                            |
| **Tactics** (`/tactics/:topic/:situation`) | Auto-playing animations with Play/Pause, previous/next moment, Restart, 0.5×/1× speed and a scrubbable progress bar, plus a ball and block bars. Three tabs: **Blocking** (4 situations), **Defense** (4, perimeter system, with "Who is attacking?" notes), **Coverage** (4). Each situation has Positioning, Execution and Key principles. |
| **Everywhere**                             | EN/PL switch in the header, light and dark mode that follow the system setting, phone layout (375 px), a phone header that shows only the logo icon.                                                                                                                                                                                         |

### Work history (issue → PR, all merged)

| Issue | Feature                                                                                                     | PR                            |
| ----- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| —     | Project setup (Vite, React, TS, Konva, Zustand, Router, Vitest, Playwright, ESLint/Prettier, CI, CLAUDE.md) | #1                            |
| #2    | GitHub Pages deploy, `/Vollyguide/` base path, `404.html` fallback for direct links                         | #9                            |
| #3    | Six 5-1 rotations and the rotation picker                                                                   | #10                           |
| #4    | Serve-receive formations, phase toggle, animation                                                           | #11                           |
| #12   | UI redesign: Tailwind v4 and shadcn/ui, dark mode, self-hosted Inter font                                   | #13                           |
| #5    | Lessons                                                                                                     | #14                           |
| #6    | Practice mode                                                                                               | #15 → **#16** (see section 5) |
| #7    | Libero                                                                                                      | #17                           |
| #8    | Opponent team                                                                                               | #18                           |
| #19   | Positions shown as distance from the net, distance markers on the court                                     | #23                           |
| #20   | Tactics page, animation player, Blocking tab                                                                | #24                           |
| #22   | Coverage tab                                                                                                | #25                           |
| #26   | 5-1 / 6-2 / 4-2 systems on Court and Practice                                                               | #27                           |
| #21   | Defense tab (perimeter system)                                                                              | #28                           |
| #29   | Polish translation of the whole site                                                                        | #30                           |

---

## 2. Architecture (code map)

| Folder or file                                      | What it holds                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/domain/`                                       | **Pure TypeScript, no React or DOM, fully unit-tested.** Court constants; types (`Role`, `Zone`, `Rotation`, `Phase`, `System`); `overlap.ts` (overlap rule); `rotation.ts` (`rotateClockwise`); `interpolate.ts` (easing and the `Transition` type); `grading.ts` (`gradePlacement`); `libero.ts`; `opponent.ts` (`toOpponentFrame`); `netRelative.ts` (`toNetRelative`); `scene.ts` (animation keyframes). |
| `src/content/`                                      | Typed data: formations, rotations, 5-1 receive, `systems.ts` (6-2/4-2 and `settingSetter`), `libero.ts`, `opponent.ts`, `catalog.ts` (`findFormation(system, rotation, phase)`), `lessons/`, `tactics/` (blocking, defense, coverage).                                                                                                                                                                       |
| `src/content/i18n/`                                 | Polish versions of content, keyed by content id (`pl/lessons.ts`, `pl/tactics.ts`, `pl/notes.ts`), plus `localize.ts`.                                                                                                                                                                                                                                                                                       |
| `src/court/`                                        | Konva drawing: `CourtStage`, `PlayerToken`, the ball and block bars, zone labels, distance markers. **The only place meters are turned into pixels** (`scale.ts`).                                                                                                                                                                                                                                           |
| `src/state/`                                        | Zustand stores: `courtStore`, `practiceStore`, `preferences` (libero, saved), `localeStore` (language, saved).                                                                                                                                                                                                                                                                                               |
| `src/strings.ts`                                    | All UI text, as `en` and `pl` objects. `pl` must have exactly the same type as `en`.                                                                                                                                                                                                                                                                                                                         |
| `src/i18n/`                                         | Language detection, decimal comma, Polish plurals, Polish role abbreviations.                                                                                                                                                                                                                                                                                                                                |
| `src/components/ui/`                                | shadcn/ui components (our own copy): Button, Card, Badge, Alert, Separator, Toggle, ToggleGroup, Switch.                                                                                                                                                                                                                                                                                                     |
| `e2e/`                                              | Playwright tests. They run against the production build under `/Vollyguide/` (`npm run build && npm run preview`).                                                                                                                                                                                                                                                                                           |
| `.github/workflows/`                                | `ci.yml` (job `ci`: `npm run check`, then the E2E tests; uploads the Playwright report on failure) and `deploy.yml` (GitHub Pages on every push to `main`).                                                                                                                                                                                                                                                  |
| `scripts/install_pkgs.sh` + `.claude/settings.json` | SessionStart hook that installs dependencies in cloud sessions; permissions.                                                                                                                                                                                                                                                                                                                                 |

**Coordinates.** Positions are stored in meters: x = 0..9 from our left sideline, y = 0 at our end line, the net at y = 9. They are **shown** relative to the net ("7.5 m from left · 6.0 m from net"; Polish "7,5 m od lewej · 6,0 m od siatki") through `toNetRelative`. The opponent's "left" is their own left.

---

## 3. Key decisions and why

### Stack and tooling

- **TypeScript is pinned to `~6.0.x`, not 7.** typescript-eslint did not support TS 7.
- **Tailwind + shadcn/ui** (you chose this over Mantine or hand-written CSS). shadcn components are copied into the repo, so we own the code and only ship what we use.
- **The Inter font is self-hosted** (`@fontsource-variable/inter`). Google Fonts would send requests to Google, and CLAUDE.md does not allow data to leave the browser. An E2E test checks that every request goes to our own site.
- **The Court, Lessons, Practice and Tactics pages are lazy-loaded.** Konva is large, so the Home page doesn't download it.
- **GitHub Pages serves a `404.html` copy of `index.html`.** That keeps normal URLs working when opened directly (no `#` in URLs). `vite preview` also uses the `/Vollyguide/` base so E2E tests run like production.

### Volleyball modelling

- **Rotation number = the setter's zone**, played in the order 1, 6, 5, 4, 3, 2. With two setters, rotations are numbered by S1 (your choice).
- **5-1 receive:** three passers (both outside hitters and the back-row middle) in lanes at x ≈ 1.5 / 4.5 / 7.5 m. The setter stands as close to the setting spot as the overlap rule allows.
- **6-2:** the back-row setter always sets, so 6-2 reuses the tested 5-1 receive positions of rotations 1, 6 and 5. Rotations 4, 3 and 2 are the same with S1↔S2, OH1↔OH2 and MB1↔MB2 swapped.
- **4-2:** the front-row setter sets **from zone 3** (your choice: the traditional 4-2). The positions are new and were hand-written.
- **Libero:** replaces the back-row middle blocker in every system. The replaced middle waits in the libero replacement zone at (−1.5, 3). The switch is **on by default** to match professional play (#34; it was off at first, as #7 specified). A visitor's own choice is saved and wins.
- **Opponent:** one generic 5-1 rotation 1 serving lineup, stored in the opponent's own frame. Their server is exempt from the overlap rule, so the check uses the zone-1 base spot instead.
- **Practice:** a player is correct within 1.0 m of their spot. Players start in a fixed order on the bench at x = −1.5.
- **Defense:** the perimeter system (your choice). **The block-shadow test from the original #21 was dropped** (your approval). From above, a real block's "shadow" covers almost the whole court width, so the test could never pass with the issue's own positions. Each defender is checked against depth and width ranges instead.
- **Coverage, situation 2:** when the opposite attacks from zone 2, the setter is the zone 1 player who came forward to set, so the **libero covers close behind the hitter**.
- **Display:** positions are shown relative to the net (#19). Stored coordinates did not change, so no rules had to change.

### Interface and language

- **Polish translation:**
  - the language follows the browser; an EN/PL button switches it, and the choice is saved (`volleyguide:locale`);
  - Polish abbreviations: R, P, A, Ś, L;
  - decimal comma and Polish plurals;
  - English content stays the source, and Polish versions are keyed by content id; tests make sure nothing is untranslated.
- **How switching works:** `strings` always returns the active language, and the layout re-mounts the page when the language changes. That avoided rewriting every component.
- **Phone header:** "Home" is hidden on phones because the logo links home. The language switch is a single compact button so the header still fits 375 px.

---

## 4. Active rules and constraints

From **CLAUDE.md** (the current version is in the repo):

- **Static site only:** no backend, database, auth, analytics, tracking or cookies. localStorage only for UI preferences.
- **Content** is typed data in `src/content/`.
- **Positions** are stored in meters, turned into pixels only in `src/court/`, and shown relative to the net.
- **`src/domain/`** is pure and fully unit-tested.
- **`npm run check`** (lint, typecheck, tests, build) must pass before every commit.
- **Branches and PRs:**
  - never commit to `main`; branch name `claude/<issue>-<slug>`;
  - one issue = one branch = one PR, and the PR body says "Closes #n".
- **Every feature or fix ships with tests:** unit tests for domain logic, component or E2E tests for UI.
- **Commits:** small, with conventional messages.
- **GitHub:** use the GitHub tools or `gh api`.
- **Ambiguous issue:** comment a question on the issue and stop.
- **Dependencies:** state why each new one is needed in the PR.
- **Translations:** UI text in `src/strings.ts` (`en` + `pl`), content translations in `src/content/i18n/`. Every new text needs both languages.
- **No AI attribution anywhere on GitHub:** no `Co-Authored-By` or `Claude-Session` trailers or links and no "Generated with/by Claude Code" lines in commits, PRs, issues or comments.
- **Future, not to build until an issue asks:** `services/video/`, a Python pipeline for match video analysis.

**Your preferences, stated in chat:**

- No "Generated by Claude Code" line in PR descriptions, issue descriptions or comments. The GitHub integration appends it to PRs automatically, so it is removed by editing the description afterwards.
- Each PR should target `main` directly. No stacked PR bases (see section 5).

**Working agreement:** issues carry concrete acceptance criteria that Claude must meet and that CI mostly proves. You review the volleyball correctness and the look and feel, then merge.

---

## 5. Lessons learned (process)

- **Stacked PRs went wrong once.** #15 (practice) targeted #14's branch and was merged there after #14 had already reached `main`, so practice mode never got to `main`. #16 fixed it. **Rule since then:** every PR targets `main`; if it builds on unmerged work, its diff includes that work until the other PR merges.
- **Parallel PRs touching the same file** (#23 and #24 both added an export line to `src/domain/index.ts`) cause a predictable conflict. Fix it by merging `main` into the branch, never by rewriting history.
- **A real bug was found through a CI-only failure (#15).** Dragging a player while a formation animation was still running dropped them part-way. Grabbing a player now ends the animation (`finish()` in `useAnimatedPositions`). Timing-sensitive E2E tests are now stress-run (`--workers=1 --repeat-each`) before pushing.
- **Squash merging is recommended:** some intermediate commits don't build on their own (for example, tests updated in a later commit).
- **Environment note:** this cloud session's proxy blocks downloading CI artifacts (Playwright reports), so CI failures are investigated through job logs and local reproduction with `CI=true`.

---

## 6. Open items and known gaps

### Decisions waiting on you

None at the moment.

**Decided since the first draft:**

- The libero switch is on by default (#34).
- "Generated by Claude Code" lines are removed everywhere (see section 4).
  The GitHub integration still appends the footer to every PR Claude creates, so Claude edits the description right after creating the PR. Older PRs (#24, #27, #28, #30, …) still carry it.

### Housekeeping you can do

1. **Delete the 15 merged branches** (`claude/setup`, `claude/2-github-pages` … `claude/29-polish`). All are fully contained in `main`. Cloud sessions can't delete branches (the git proxy answers 403), so this has to be done on GitHub or from your own machine. Turning on "Automatically delete head branches" (Settings → General) prevents the pile-up.
2. **Add branch protection on `main`:** require the `ci` check and a PR. Recommended at the start; not confirmed as done.

### Known gaps (not built; candidates for new issues)

1. **Our serve phase** is not modelled. That includes the rule that the middle blocker in zone 1 serves before the libero comes back in (noted in `src/domain/libero.ts`).
2. **Opponent rotations and phases:** the opponent is always 5-1 rotation 1 serving.
3. **Lessons and Tactics are 5-1 only.** There are no lessons for 6-2 or 4-2.
4. **Practice progress and the system choice are not saved** (on purpose). The language is not in the URL.
5. **Rotational and "6-up" defense** were out of scope for #21.
6. **Cosmetic:** at the contact moment in Tactics, the ball can cover the attacker's label (e.g. OH2 in the pipe situation).
7. **Small performance note:** Vitest creates a jsdom environment per test file, which makes the test run slower than it needs to be.

### Content waiting for your volleyball review

Merged, but flagged as needing an expert eye:

- 4-2 receive positions (`RECEIVE_4_2` in `src/content/systems.ts`).
- 5-1 receive positions and notes (`src/content/receive.ts`): the setter's spot in rotation 1, and where the back-row opposite hides in rotations 2–4.
- Tactics texts and positions (`src/content/tactics/blocking.ts`, `defense.ts`, `coverage.ts`).
- Polish terminology (`src/strings.ts` `pl`, `src/content/i18n/pl/`): ustawienie, zawodnik nieblokujący, obrona obwodowa, asekuracja (bliski/dalszy krąg), pozorowanie, krótka piłka, jednonóż, and so on.

---

## 7. Suggested next steps

1. Housekeeping: delete merged branches and enable branch protection on `main`.
2. Review the flagged content (section 6), especially the 4-2 positions and the Polish terms. Wording and position changes are one-line edits.
3. Possible next issues, in rough order of value:
   - **Our serve phase**, including the libero / middle blocker serving rule.
   - **Lessons for 6-2 and 4-2**, using the existing lesson model and Polish overlays.
   - **Opponent rotations** in receive, or an opponent formation that follows a chosen system.
   - **Rotational defense**, compared with perimeter, as a Tactics situation.
   - **Free-ball and down-ball situations** in Tactics.
   - `services/video/` (match video analysis), only when you want to start it. It goes beyond the static-site constraint and needs its own design issue.
4. For every new issue, keep the workflow:
   - concrete acceptance criteria;
   - one branch and one PR targeting `main`;
   - tests, and translations in both languages.
