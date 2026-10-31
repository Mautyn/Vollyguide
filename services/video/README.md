# volleyvideo

Local match video analysis for [Volleyguide](https://mautyn.github.io/Vollyguide/): player positions at every serve and per-player mistakes for one team. Design: issue #38.

**Privacy.** Everything runs on your own computer. Videos, player names and numbers, and results stay in your local `output/` folder. They are never uploaded, and `.gitignore` keeps them out of the repo.

## Status

Phase 1 is being built step by step (issues #39–#43). So far: the project, and the rules and formations shared with the site.

## Shared with the site

- `data/formations.json`: every system × rotation × phase from `src/content/`, written by `npm run export:formations` in the repo root. Do not edit it by hand; a site test fails if it is out of date.
- `volleyvideo.rules`: the overlap and libero rules, ported from `src/domain/`. Both versions run the cases in `../../shared/rules/`.

Coordinates are the site's: meters, x = 0..9 from the left sideline, y = 0 at the analysed team's end line, net at y = 9.

## Development

Requires Python 3.12 or newer.

```bash
cd services/video
python -m venv .venv
.venv/bin/pip install -e ".[dev]"
.venv/bin/pytest
.venv/bin/ruff check .
.venv/bin/ruff format --check .
```

With [uv](https://docs.astral.sh/uv/): `uv venv && uv pip install -e ".[dev]"`, then the same commands.

Later steps add GPU dependencies (PyTorch with CUDA for an NVIDIA card); they will be listed here.
