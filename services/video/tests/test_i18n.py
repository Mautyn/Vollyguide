import string

from volleyvideo.court import LANDMARKS, LINE_MARKS
from volleyvideo.i18n import LANGS, MESSAGES, t


def placeholders(text: str) -> set[str]:
    return {name for _, name, _, _ in string.Formatter().parse(text) if name}


def test_every_text_exists_in_english_and_polish():
    assert set(LANGS) == set(MESSAGES)
    assert MESSAGES["en"].keys() == MESSAGES["pl"].keys()
    for key in MESSAGES["en"]:
        for lang in LANGS:
            assert MESSAGES[lang][key].strip(), (lang, key)
        assert placeholders(MESSAGES["en"][key]) == placeholders(MESSAGES["pl"][key]), key
        assert MESSAGES["en"][key] != MESSAGES["pl"][key] or key in {"saved"}, key


def test_every_court_point_has_a_name():
    for mark in (*LANDMARKS, *LINE_MARKS):
        for lang in LANGS:
            assert mark.key in MESSAGES[lang]


def test_formats_values():
    assert t("pl", "saved", path="x.json") == "Zapisano kalibrację do x.json"
