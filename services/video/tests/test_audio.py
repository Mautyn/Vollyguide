import wave

import numpy as np
import pytest

from volleyvideo.audio import (
    SAMPLE_RATE,
    audio_chunks,
    detect_whistles,
    whistles_in_file,
)

RNG = np.random.default_rng(3)


def whistle(duration_s, freq=3200.0, level=0.5):
    """A pea whistle: a tone that warbles ±150 Hz about 30 times a second."""
    t = np.arange(int(duration_s * SAMPLE_RATE)) / SAMPLE_RATE
    phase = 2 * np.pi * (freq * t + 150 / (2 * np.pi * 30) * np.sin(2 * np.pi * 30 * t))
    return level * np.sin(phase)


def voices(duration_s, level=0.3):
    """Harmonics between 150 and 900 Hz, changing pitch."""
    t = np.arange(int(duration_s * SAMPLE_RATE)) / SAMPLE_RATE
    f0 = 180 + 40 * np.sin(2 * np.pi * 0.7 * t)
    phase = 2 * np.pi * np.cumsum(f0) / SAMPLE_RATE
    return level * sum(np.sin(k * phase) / k for k in range(1, 6))


def scene():
    """30 s of crowd noise and voices with whistles at 5 s, 12.5 s and 24 s, plus a short
    3 kHz click at 18 s that is too short to be a whistle."""
    total = 30.0
    audio = 0.05 * RNG.standard_normal(int(total * SAMPLE_RATE)) + voices(total)
    for start, length in [(5.0, 0.6), (12.5, 0.3), (24.0, 1.2), (18.0, 0.05)]:
        i = int(start * SAMPLE_RATE)
        burst = whistle(length)
        audio[i : i + len(burst)] += burst
    return audio.astype(np.float32)


def test_finds_whistles_but_not_voices_noise_or_clicks():
    found = detect_whistles(scene())
    assert len(found) == 3
    for w, (start, length) in zip(found, [(5.0, 0.6), (12.5, 0.3), (24.0, 1.2)], strict=True):
        assert w.start_s == pytest.approx(start, abs=0.1)
        assert w.end_s - w.start_s == pytest.approx(length, abs=0.15)


def test_nothing_in_voices_and_noise_only():
    audio = 0.1 * RNG.standard_normal(10 * SAMPLE_RATE) + voices(10)
    assert detect_whistles(audio.astype(np.float32)) == []


def write_wav(path, samples):
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        f.writeframes(pcm.tobytes())
    return path


def test_reading_the_file_in_chunks_gives_the_same_whistles(tmp_path):
    audio = scene() * 0.5
    path = write_wav(tmp_path / "match.wav", audio)
    chunks = list(audio_chunks(path, chunk_s=7.3))
    assert len(chunks) == 5
    assert sum(len(c) for c in chunks) == len(audio)
    assert whistles_in_file(path) == detect_whistles(np.concatenate(chunks))
    assert len(whistles_in_file(path)) == 3


def test_a_file_without_sound(tmp_path):
    path = tmp_path / "silent.txt"
    path.write_text("not a video")
    with pytest.raises(ValueError, match="ffmpeg"):
        whistles_in_file(path)
