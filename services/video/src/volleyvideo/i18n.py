"""Texts shown by the tool, in English and Polish. Every key must exist in both."""

from __future__ import annotations

LANGS = ("en", "pl")

MESSAGES: dict[str, dict[str, str]] = {
    "en": {
        # Landmarks: "our" is the analysed team; left/right as seen from behind our end line.
        "our-end-left": "Our end line, left corner",
        "our-end-right": "Our end line, right corner",
        "our-attack-left": "Our attack line, left end",
        "our-attack-right": "Our attack line, right end",
        "centre-left": "Centre line, left end",
        "centre-right": "Centre line, right end",
        "their-attack-left": "Their attack line, left end",
        "their-attack-right": "Their attack line, right end",
        "their-end-left": "Their end line, left corner",
        "their-end-right": "Their end line, right corner",
        "our-end-line": "Any point on our end line, near the middle",
        "our-attack-line": "Any point on our attack line, near the middle",
        "centre-line-a": "Any point on the centre line, near the middle",
        "centre-line-b": "Another point on the centre line, a bit further along",
        "their-attack-line": "Any point on their attack line, near the middle",
        "their-end-line": "Any point on their end line, near the middle",
        "prompt": "Click: {name}  ({step}/{total}{optional})",
        "optional": ", optional",
        "keys": "Click near the mark, then click it precisely in the magnifier (top right). Space = confirm  S = skip  U = undo  F = finish  Esc = cancel",
        "review": "RMS error {rms:.3f} m, worst {worst:.3f} m. Check the drawn court lines. Space = save  R = redo  Esc = cancel",
        "need-more": "At least {count} court corners and line ends are needed.",
        "saved": "Saved calibration to {path}",
        "summary": "RMS error {rms:.3f} m, worst point {worst:.3f} m, lens k1 {k1:.4f}, k2 {k2:.4f}",
        "side-changes": "Side changes at: {times}",
        "cancelled": "Calibration cancelled.",
        "failed": "Calibration failed: {reason}",
        "orientation": "Our = the analysed team. Left/right as seen from behind our end line.",
    },
    "pl": {
        "our-end-left": "Nasza linia końcowa, lewy narożnik",
        "our-end-right": "Nasza linia końcowa, prawy narożnik",
        "our-attack-left": "Nasza linia ataku, lewy koniec",
        "our-attack-right": "Nasza linia ataku, prawy koniec",
        "centre-left": "Linia środkowa, lewy koniec",
        "centre-right": "Linia środkowa, prawy koniec",
        "their-attack-left": "Ich linia ataku, lewy koniec",
        "their-attack-right": "Ich linia ataku, prawy koniec",
        "their-end-left": "Ich linia końcowa, lewy narożnik",
        "their-end-right": "Ich linia końcowa, prawy narożnik",
        "our-end-line": "Dowolny punkt na naszej linii końcowej, blisko środka",
        "our-attack-line": "Dowolny punkt na naszej linii ataku, blisko środka",
        "centre-line-a": "Dowolny punkt na linii środkowej, blisko środka",
        "centre-line-b": "Drugi punkt na linii środkowej, trochę dalej",
        "their-attack-line": "Dowolny punkt na ich linii ataku, blisko środka",
        "their-end-line": "Dowolny punkt na ich linii końcowej, blisko środka",
        "prompt": "Kliknij: {name}  ({step}/{total}{optional})",
        "optional": ", opcjonalnie",
        "keys": "Kliknij w pobliżu znaku, a potem dokładnie w lupie (prawy górny róg). Spacja = zatwierdź  S = pomiń  U = cofnij  F = zakończ  Esc = anuluj",
        "review": "Błąd RMS {rms:.3f} m, najgorszy {worst:.3f} m. Sprawdź narysowane linie boiska. Spacja = zapisz  R = od nowa  Esc = anuluj",
        "need-more": "Potrzeba co najmniej {count} narożników i końców linii.",
        "saved": "Zapisano kalibrację do {path}",
        "summary": "Błąd RMS {rms:.3f} m, najgorszy punkt {worst:.3f} m, obiektyw k1 {k1:.4f}, k2 {k2:.4f}",
        "side-changes": "Zmiany stron w: {times}",
        "cancelled": "Kalibracja anulowana.",
        "failed": "Kalibracja nieudana: {reason}",
        "orientation": "Nasza = analizowana drużyna. Lewo/prawo patrząc zza naszej linii końcowej.",
    },
}


def t(lang: str, key: str, **values: object) -> str:
    """The text for `key` in `lang`, with `values` filled in."""
    return MESSAGES[lang][key].format(**values)
