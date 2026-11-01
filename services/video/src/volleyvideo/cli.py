"""Command line: calibrate, track, rallies and rallies-check. More arrive with #42–#43."""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from pathlib import Path

from .calibration import DEFAULT_MAX_ERROR_M, Calibration, CalibrationError, fit_calibration
from .i18n import LANGS, t

DEFAULT_OUTPUT = Path(__file__).resolve().parents[2] / "output"


def parse_time(text: str) -> float:
    """Seconds from "SS", "MM:SS" or "HH:MM:SS" (seconds may have decimals)."""
    parts = text.strip().split(":")
    if not 1 <= len(parts) <= 3 or any(p == "" for p in parts):
        raise argparse.ArgumentTypeError(f"Not a time: {text!r}")
    try:
        values = [float(p) for p in parts]
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"Not a time: {text!r}") from error
    seconds = 0.0
    for value in values:
        if value < 0:
            raise argparse.ArgumentTypeError(f"Not a time: {text!r}")
        seconds = seconds * 60 + value
    return seconds


def format_time(seconds: float) -> str:
    whole = int(round(seconds))
    return f"{whole // 3600}:{whole // 60 % 60:02d}:{whole % 60:02d}"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="volleyvideo",
        description="Local volleyball match video analysis. Nothing leaves your computer.",
    )
    sub = parser.add_subparsers(dest="command", required=True)
    cal = sub.add_parser("calibrate", help="Map video pixels to court meters.")
    cal.add_argument("video", type=Path, help="The match video (Veo panoramic export).")
    cal.add_argument(
        "--at", type=parse_time, default=60.0, help="Frame to calibrate on (default 0:01:00)."
    )
    cal.add_argument(
        "--side-change",
        type=parse_time,
        action="append",
        default=[],
        metavar="TIME",
        help="When the teams change ends (repeat for every change).",
    )
    cal.add_argument(
        "--points",
        type=Path,
        help="Clicked points from a JSON file (e.g. an earlier calibration) instead of the window.",
    )
    cal.add_argument(
        "--out", type=Path, help="Where to save (default output/<video>/calibration.json)."
    )
    cal.add_argument("--max-error", type=float, default=DEFAULT_MAX_ERROR_M, help="Meters.")
    cal.add_argument("--lang", choices=LANGS, default="en")

    trk = sub.add_parser("track", help="Detect and track the analysed team's players.")
    trk.add_argument("video", type=Path)
    trk.add_argument("--calibration", type=Path, help="Default: output/<video>/calibration.json.")
    trk.add_argument("--fps", type=float, default=10.0, help="Frames analysed per second.")
    trk.add_argument("--model", default="yolo11m.pt", help="YOLO weights (downloaded once).")
    trk.add_argument("--imgsz", type=int, default=1920, help="Detection image size in pixels.")
    trk.add_argument("--conf", type=float, default=0.3, help="Minimum detection confidence.")
    trk.add_argument("--device", choices=("auto", "cuda", "cpu"), default="auto")
    trk.add_argument("--start", type=parse_time, default=0.0, help="Start time (default 0).")
    trk.add_argument("--end", type=parse_time, help="End time (default: end of video).")
    trk.add_argument("--out", type=Path, help="Default: output/<video>/tracks.npz.")
    trk.add_argument("--lang", choices=LANGS, default="en")

    ral = sub.add_parser("rallies", help="Find rallies and suggest serve moments.")
    ral.add_argument("video", type=Path)
    ral.add_argument("--tracks", type=Path, help="Default: output/<video>/tracks.npz.")
    ral.add_argument("--no-audio", action="store_true", help="Ignore whistles.")
    ral.add_argument("--out", type=Path, help="Default: output/<video>/rallies.json.")
    ral.add_argument("--lang", choices=LANGS, default="en")

    chk = sub.add_parser(
        "rallies-check", help="Compare found rallies with serve times you noted by hand."
    )
    chk.add_argument("truth", type=Path, help="Text file: one serve time per line (H:MM:SS).")
    chk.add_argument("--rallies", type=Path, required=True, help="rallies.json to check.")
    chk.add_argument("--tolerance", type=float, default=2.5, help="Seconds.")
    chk.add_argument("--lang", choices=LANGS, default="en")
    return parser


def output_dir(video: Path) -> Path:
    return DEFAULT_OUTPUT / video.stem


def make_detector(args: argparse.Namespace):  # pragma: no cover (needs the GPU extras)
    from .tracking import yolo_detector

    return yolo_detector(args.model, args.device, args.imgsz, args.conf)


def track(args: argparse.Namespace) -> int:
    import time

    from .tracking import Progress, track_video
    from .tracks import CourtArea, area_as_dict
    from .video import video_info

    lang = args.lang
    calibration_path = args.calibration or output_dir(args.video) / "calibration.json"
    if not calibration_path.exists():
        print(t(lang, "no-calibration", path=calibration_path), file=sys.stderr)
        return 2
    calibration = Calibration.load(calibration_path)
    info = video_info(args.video)
    end = args.end if args.end is not None else info.duration_s
    detector = make_detector(args)
    print(t(lang, "tracking", fps=args.fps, device=getattr(detector, "device", args.device)))
    started = time.monotonic()
    area = CourtArea()
    tracks = track_video(
        args.video, calibration, detector, fps=args.fps, area=area,
        start_s=args.start, end_s=end, progress=Progress(end),
    )  # fmt: skip
    took = time.monotonic() - started
    out = args.out or output_dir(args.video) / "tracks.npz"
    meta = {
        "video": args.video.name,
        "fps": args.fps,
        "model": args.model,
        "imgsz": args.imgsz,
        "conf": args.conf,
        "device": args.device,
        "startS": args.start,
        "endS": end,
        "processingS": round(took, 1),
        "area": area_as_dict(area),
    }
    tracks.save(out, meta)
    frames = len(tracks.times())
    print(t(lang, "tracked", rows=len(tracks), frames=frames, minutes=(end - args.start) / 60,
            took=took / 60))  # fmt: skip
    print(t(lang, "saved-tracks", path=out))
    return 0


def rallies(args: argparse.Namespace) -> int:
    from .audio import ffmpeg_available, whistles_in_file
    from .rallies import find_rallies, save_rallies
    from .tracks import Tracks

    lang = args.lang
    tracks_path = args.tracks or output_dir(args.video) / "tracks.npz"
    if not tracks_path.exists():
        print(t(lang, "no-tracks", path=tracks_path), file=sys.stderr)
        return 2
    tracks, _ = Tracks.load(tracks_path)
    whistles = []
    if not args.no_audio:
        if ffmpeg_available():
            try:
                whistles = whistles_in_file(args.video)
                print(t(lang, "whistles", count=len(whistles)))
            except ValueError:
                print(t(lang, "no-audio"))
        else:
            print(t(lang, "no-ffmpeg"))
    found = find_rallies(tracks, whistles)
    out = args.out or output_dir(args.video) / "rallies.json"
    save_rallies(out, found, {"video": args.video.name, "whistles": len(whistles)})
    ours = sum(1 for r in found if r.our_serve)
    print(t(lang, "rallies-found", count=len(found), ours=ours))
    print(t(lang, "saved-rallies", path=out))
    return 0


def read_truth(path: Path) -> list[float]:
    """Serve times, one per line; blank lines and lines starting with # are ignored."""
    times = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            times.append(parse_time(line))
    return times


def rallies_check(args: argparse.Namespace) -> int:
    from .rallies import evaluate, load_rallies

    lang = args.lang
    result = evaluate(load_rallies(args.rallies), read_truth(args.truth), args.tolerance)
    print(t(lang, "check-result", found=result.found, truth=result.truth, recall=result.recall,
            extra=len(result.extra), precision=result.precision))  # fmt: skip
    if result.missed:
        print(t(lang, "check-missed", tolerance=args.tolerance,
                times=", ".join(format_time(s) for s in result.missed)))  # fmt: skip
    if result.extra:
        print(t(lang, "check-extra", times=", ".join(format_time(s) for s in result.extra)))
    return 0


def calibrate(args: argparse.Namespace) -> int:
    from .video import read_frame, video_info

    lang = args.lang
    info = video_info(args.video)
    out = args.out or DEFAULT_OUTPUT / args.video.stem / "calibration.json"
    try:
        if args.points:
            raw = json.loads(args.points.read_text(encoding="utf-8"))
            calibration = fit_calibration(
                info.width,
                info.height,
                {k: (v[0], v[1]) for k, v in raw["landmarks"].items()},
                {k: (v[0], v[1]) for k, v in raw.get("lineMarks", {}).items()},
                side_changes_s=args.side_change,
                max_error_m=args.max_error,
            )
        else:
            from .calibrate_ui import fit_from_session, run_calibration_window

            frame = read_frame(args.video, args.at)
            fit = fit_from_session(info.width, info.height, args.side_change, args.max_error)
            result = run_calibration_window(frame, fit, lang=lang)
            if result is None:
                print(t(lang, "cancelled"))
                return 1
            calibration = result
    except CalibrationError as error:
        print(t(lang, "failed", reason=error), file=sys.stderr)
        return 2
    calibration.save(out)
    report(calibration, out, lang)
    return 0


def report(calibration: Calibration, out: Path, lang: str) -> None:
    print(
        t(
            lang,
            "summary",
            rms=calibration.rms_error_m,
            worst=calibration.max_error_m,
            k1=calibration.lens.k1,
            k2=calibration.lens.k2,
        )
    )
    if calibration.side_changes_s:
        times = ", ".join(format_time(s) for s in calibration.side_changes_s)
        print(t(lang, "side-changes", times=times))
    print(t(lang, "saved", path=out))


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    commands = {
        "calibrate": calibrate,
        "track": track,
        "rallies": rallies,
        "rallies-check": rallies_check,
    }
    return commands[args.command](args)  # pragma: no cover (argparse rejects unknown commands)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
