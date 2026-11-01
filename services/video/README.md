# volleyvideo

Local match video analysis for [Volleyguide](https://mautyn.github.io/Vollyguide/): player positions at every serve and per-player mistakes for one team. Design: issue #38.

**Privacy.** Everything runs on your own computer. Videos, player names and numbers, and results stay in your local `output/` folder. They are never uploaded, and `.gitignore` keeps them out of the repo.

## Status

Phase 1 is being built step by step (issues #39–#43). So far: the rules and formations shared with the site, court calibration, player tracking and rally detection.

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

## Track players and find rallies

Tracking needs the optional GPU dependencies. Install PyTorch with CUDA first, then the `track` extra:

```bash
# Windows (PyPI's Windows build has no CUDA, so use PyTorch's own index):
.venv\Scripts\pip install torch --index-url https://download.pytorch.org/whl/cu128
.venv\Scripts\pip install -e ".[track]"

# Linux (PyPI's build already includes CUDA):
.venv/bin/pip install -e ".[track]"
```

An RTX 50-series card (such as the RTX 5050) needs PyTorch 2.7 or newer and a recent NVIDIA driver. `ffmpeg` must be on your PATH for whistle detection.

```bash
volleyvideo track ~/Videos/match.mp4            # about 10 frames per second; prints progress and speed
volleyvideo rallies ~/Videos/match.mp4          # rallies.json with suggested serve times
```

- `track` runs YOLO person detection with ByteTrack (from `ultralytics`) and keeps only people on the analysed team's half, the serving area behind their end line and the libero replacement zone. The other team, referees, the bench and spectators are dropped. Positions are the feet, in court meters, following the side changes from the calibration. Options: `--fps`, `--model` (default `yolo11m.pt`, downloaded once), `--imgsz`, `--conf`, `--device cuda|cpu`, `--start`/`--end` to try a short part first.
- **Privacy:** Ultralytics sends anonymous usage analytics by default; `volleyvideo` turns that off before loading the model. The only network use is downloading the model weights the first time.
- `rallies` finds bursts of player movement and uses the referee's whistles in the sound track to place each rally's start and end. It suggests the serve moment and whether we served (someone of ours behind our end line). Serve moments are confirmed by hand in the next step.

**Measure it on your match.** While watching a set, note the time of every serve in a text file, one per line (`0:12:34`), then:

```bash
volleyvideo rallies-check my-serves.txt --rallies output/match/rallies.json
```

It prints how many of your serves were found (target: at least 95 %) and lists the missed and the extra ones. The movement and whistle thresholds are in `RallyConfig` and `WhistleConfig` and may need tuning on real footage.

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

Dependencies: `numpy`, `scipy` (least-squares fit) and `opencv-python` (video and the calibration window). Optional `track` extra: `torch`, `ultralytics` (YOLO and ByteTrack; AGPL-3.0) and `lap` (needed by ByteTrack). Tests never need the `track` extra or a GPU.
