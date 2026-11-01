"""Command line: `volleyvideo calibrate <video>`. More commands arrive with issues #41–#43."""

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
    return parser


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
    if args.command == "calibrate":
        return calibrate(args)
    return 1  # pragma: no cover (argparse rejects unknown commands)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
