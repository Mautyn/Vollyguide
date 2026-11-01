from volleyvideo.click_session import TARGETS, ClickSession
from volleyvideo.court import LANDMARKS, LINE_MARKS


def test_asks_for_landmarks_first_then_optional_line_marks():
    assert [t.key for t in TARGETS] == [m.key for m in LANDMARKS] + [m.key for m in LINE_MARKS]
    assert not any(t.optional for t in TARGETS[: len(LANDMARKS)])
    assert all(t.optional for t in TARGETS[len(LANDMARKS) :])


def test_click_skip_and_undo():
    session = ClickSession()
    session.click(10, 20)
    session.skip()
    session.click(30, 40)
    assert session.points == {TARGETS[0].key: (10, 20), TARGETS[2].key: (30, 40)}
    session.undo()  # removes the third click
    assert session.current == TARGETS[2]
    session.undo()  # undoes the skip
    assert session.current == TARGETS[1]
    assert session.points == {TARGETS[0].key: (10, 20)}
    session.undo()
    session.undo()  # nothing left: no error
    assert session.index == 0 and session.points == {}


def test_enough_after_eight_landmarks_and_split_by_kind():
    session = ClickSession()
    for i in range(7):
        session.click(i, i)
    assert not session.enough
    session.click(7, 7)
    assert session.enough
    session.skip()
    session.skip()
    session.click(100, 100)  # first line mark
    assert len(session.landmarks) == 8
    assert session.line_marks == {LINE_MARKS[0].key: (100, 100)}


def test_finishes_after_the_last_target():
    session = ClickSession()
    for _ in TARGETS:
        session.skip()
    assert session.finished and session.current is None
    session.click(1, 1)  # ignored
    session.skip()
    assert session.points == {}
