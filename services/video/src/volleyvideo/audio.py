"""Referee whistles from the video's sound track.

A pea whistle is loud and tonal around 2–4.5 kHz, unlike voices (mostly below 1 kHz) and
crowd noise (broadband). Per 50 ms frame we measure how much of the energy is in that band
and how peaked the band is, and keep runs of whistle frames that last long enough.
Audio is read through `ffmpeg` in chunks, so an hour of sound is never held in memory.
"""

from __future__ import annotations

import shutil
import subprocess
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

import numpy as np

SAMPLE_RATE = 16000
WINDOW = 1024
HOP = 800  # 50 ms at 16 kHz


@dataclass(frozen=True)
class WhistleConfig:
    band_hz: tuple[float, float] = (2000.0, 4500.0)
    min_band_ratio: float = 0.5
    min_peakiness: float = 8.0
    min_duration_s: float = 0.15
    max_gap_s: float = 0.1


@dataclass(frozen=True)
class Whistle:
    start_s: float
    end_s: float


def frame_features(
    samples: np.ndarray, sample_rate: int = SAMPLE_RATE, band_hz=(2000.0, 4500.0)
) -> tuple[np.ndarray, np.ndarray]:
    """Per frame (hop HOP, window WINDOW): share of energy in the band, and how peaked the
    band is (strongest bin / mean bin)."""
    samples = np.asarray(samples, dtype=np.float32)
    if len(samples) < WINDOW:
        return np.zeros(0), np.zeros(0)
    count = 1 + (len(samples) - WINDOW) // HOP
    idx = np.arange(WINDOW)[None, :] + HOP * np.arange(count)[:, None]
    frames = samples[idx] * np.hanning(WINDOW).astype(np.float32)
    power = np.abs(np.fft.rfft(frames, axis=1)) ** 2
    freqs = np.fft.rfftfreq(WINDOW, 1 / sample_rate)
    audible = freqs >= 100
    band = (freqs >= band_hz[0]) & (freqs <= band_hz[1])
    total = power[:, audible].sum(axis=1) + 1e-12
    in_band = power[:, band]
    ratio = in_band.sum(axis=1) / total
    peakiness = in_band.max(axis=1) / (in_band.mean(axis=1) + 1e-12)
    return ratio, peakiness


def find_whistles(
    ratio: np.ndarray,
    peakiness: np.ndarray,
    sample_rate: int = SAMPLE_RATE,
    config: WhistleConfig | None = None,
    offset_s: float = 0.0,
) -> list[Whistle]:
    """Runs of whistle frames, merged across short gaps, that last long enough."""
    config = config or WhistleConfig()
    hop_s = HOP / sample_rate
    active = (ratio >= config.min_band_ratio) & (peakiness >= config.min_peakiness)
    runs: list[list[float]] = []
    for i in np.flatnonzero(active):
        start = offset_s + i * hop_s
        end = start + WINDOW / sample_rate
        if runs and start - runs[-1][1] <= config.max_gap_s:
            runs[-1][1] = end
        else:
            runs.append([start, end])
    return [Whistle(s, e) for s, e in runs if e - s >= config.min_duration_s]


def detect_whistles(
    samples: np.ndarray, sample_rate: int = SAMPLE_RATE, config: WhistleConfig | None = None
) -> list[Whistle]:
    config = config or WhistleConfig()
    ratio, peakiness = frame_features(samples, sample_rate, config.band_hz)
    return find_whistles(ratio, peakiness, sample_rate, config)


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def audio_chunks(path: Path, chunk_s: float = 30.0) -> Iterator[np.ndarray]:
    """Mono 16 kHz float samples from any file ffmpeg can read, `chunk_s` seconds at a time."""
    if not ffmpeg_available():
        raise FileNotFoundError("ffmpeg is not installed or not on PATH")
    command = [
        "ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(path),
        "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "-",
    ]  # fmt: skip
    chunk_bytes = int(chunk_s * SAMPLE_RATE) * 4
    with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
        assert process.stdout is not None
        while True:
            data = process.stdout.read(chunk_bytes)
            if not data:
                break
            yield np.frombuffer(data[: len(data) // 4 * 4], dtype=np.float32)
        error = process.stderr.read().decode(errors="replace") if process.stderr else ""
        if process.wait() != 0:
            raise ValueError(f"ffmpeg could not read the sound of {path}: {error.strip()}")


def whistles_in_file(path: Path, config: WhistleConfig | None = None) -> list[Whistle]:
    """Whistles in a whole file, read chunk by chunk. Frames are cut at the same positions
    as for the whole signal, so chunking does not change the result."""
    config = config or WhistleConfig()
    ratios: list[np.ndarray] = []
    peaks: list[np.ndarray] = []
    carry = np.zeros(0, dtype=np.float32)
    for chunk in audio_chunks(path):
        buffer = np.concatenate([carry, chunk])
        ratio, peakiness = frame_features(buffer, SAMPLE_RATE, config.band_hz)
        ratios.append(ratio)
        peaks.append(peakiness)
        carry = buffer[len(ratio) * HOP :]
    if not ratios:
        return []
    return find_whistles(np.concatenate(ratios), np.concatenate(peaks), SAMPLE_RATE, config)
