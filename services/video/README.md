# volleyvideo

Local match video analysis for [Volleyguide](https://mautyn.github.io/Vollyguide/): player positions at every serve and per-player mistakes for one team. Design: issue #38.

**Privacy.** Everything runs on your own computer. Videos, player names and numbers, and results stay in your local `output/` folder. They are never uploaded, and `.gitignore` keeps them out of the repo.

## Status

Phase 1 is being built step by step (issues #39–#43). So far: the rules and formations shared with the site, and court calibration.

## Calibrate a video

Download the **panoramic** export of the match from Veo and keep it outside the repo. Then:

```bash
volleyvideo calibrate ~/Videos/match.mp4 --at 0:05:00 --side-change 0:27:10 --side-change 0:52:40 --lang pl
```

- `--at`: a frame where the whole court is visible and empty enough to see the lines.
- `--side-change`: every time the teams change ends (repeat the option). Find the times in any video player.
- "Our" side is the **analysed team's** half in that frame; left and right are as seen from behind their end line. A small court diagram in the window shows which point to click.

In the window: click near the court mark, then click it precisely in the magnifier (top right) and press **Space**. **S** skips a point you can't see, **U** undoes, **F** finishes early, **Esc** cancels. The 10 corners and line ends come first (at least 8 are needed), then 6 optional points along the lines, which help with the lens distortion in the middle of the court. Prompts appear in the terminal.

After fitting, the court lines are drawn over the frame: check they sit on the real lines, then press **Space** to save, or **R** to start again. Calibration is rejected if the RMS error is above 0.15 m (`--max-error`). The result goes to `output/<video name>/calibration.json`. To re-fit from saved points: `--points output/<video name>/calibration.json`.

How it works: a radial lens model (k1, k2) plus a homography, fitted by least squares in court meters. The Veo panorama is stitched from wide lenses, so a plain homography would bend lines away from the court edges.

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

Dependencies: `numpy`, `scipy` (least-squares fit) and `opencv-python` (video and the calibration window). Later steps add GPU dependencies (PyTorch with CUDA for an NVIDIA card); they will be listed here.
