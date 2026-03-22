"""Shared type definitions for video generation."""

from typing import TypedDict, NotRequired


class Word(TypedDict):
    """Word with timing and optional language tag.

    Fields:
        word: The actual word text
        start: Start time in seconds (float)
        end: End time in seconds (float)
        lineBreak: If True, this word ends a display line in the video
        language: Language code ("es" for Spanish, "en" for English)
    """
    word: str
    start: float
    end: float
    lineBreak: NotRequired[bool]
    language: NotRequired[str]


class Section(TypedDict, total=False):
    """Section of the video.

    The total=False means ALL fields are optional.
    Different section types use different combinations of these fields:
    - Static sections (headers): only have 'type', 'static', 'text'
    - Timed sections (audio): have 'type', 'start_time', 'end_time', 'words'
    """
    type: str
    start_time: float
    end_time: float
    words: list[Word]
    static: bool
    text: str
