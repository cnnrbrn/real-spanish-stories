"""
Service for generating videos from language-tagged transcription data.

Takes language_tagged_json and generates final video with captions and highlighting.
"""

import bisect
import json
import logging
import os
import re
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import TypedDict

import numpy as np
from moviepy import AudioFileClip, VideoClip
from PIL import Image, ImageDraw, ImageFont

from types_ import Word, Section
from constants import (
    VIDEO_BACKGROUND_COLOR,
    VIDEO_CONTENT_FONT_SIZE,
    VIDEO_CRF,
    VIDEO_CRF_DRAFT,
    VIDEO_ENCODING_PRESET,
    VIDEO_ENCODING_PRESET_DRAFT,
    VIDEO_FONT_PATH,
    VIDEO_FPS,
    VIDEO_FPS_DRAFT,
    VIDEO_HEIGHT,
    VIDEO_HIGHLIGHT_COLOR,
    VIDEO_LINE_SPACING,
    VIDEO_LOGO_DURATION,
    VIDEO_LOGO_MAX_HEIGHT_RATIO,
    VIDEO_LOGO_MAX_WIDTH_RATIO,
    VIDEO_LOGO_PATH,
    VIDEO_MIN_FONT_SIZE,
    VIDEO_PRIMARY_FONT_COLOR,
    VIDEO_SECONDARY_FONT_COLOR,
    VIDEO_TEXT_MARGIN,
    VIDEO_TITLE_BORDER_PADDING_BOTTOM,
    VIDEO_TITLE_BORDER_PADDING_TOP,
    VIDEO_TITLE_BORDER_PADDING_X,
    VIDEO_TITLE_BORDER_WIDTH,
    VIDEO_TITLE_FONT_SIZE,
    VIDEO_WIDTH,
)

logger = logging.getLogger(__name__)


@dataclass
class TextBlock:
    """A block of words to display together (between lineBreaks)."""

    words: list[Word]
    start_time: float
    end_time: float


@dataclass
class FrameData:
    """Pre-computed data for rendering a frame at a specific time range."""

    start_time: float
    end_time: float
    section_type: str
    words: list[Word] | None = None
    highlight_index: int | None = None  # -1 = no highlight (for title sections)


@dataclass
class VideoConfig:
    """Configuration for video generation."""

    width: int = VIDEO_WIDTH
    height: int = VIDEO_HEIGHT
    fps: int = VIDEO_FPS
    background_color: tuple[int, int, int] = VIDEO_BACKGROUND_COLOR

    # Text colors
    primary_color: tuple[int, int, int] = VIDEO_PRIMARY_FONT_COLOR
    secondary_color: tuple[int, int, int] = VIDEO_SECONDARY_FONT_COLOR
    highlight_text_color: tuple[int, int, int] = VIDEO_HIGHLIGHT_COLOR

    # Font settings
    font_path: str = VIDEO_FONT_PATH
    title_font_size: int = VIDEO_TITLE_FONT_SIZE
    content_font_size: int = VIDEO_CONTENT_FONT_SIZE
    min_font_size: int = VIDEO_MIN_FONT_SIZE

    # Layout
    text_margin: int = VIDEO_TEXT_MARGIN
    line_spacing: float = VIDEO_LINE_SPACING

    # Title border (for static screens)
    title_border_padding_x: int = VIDEO_TITLE_BORDER_PADDING_X
    title_border_padding_top: int = VIDEO_TITLE_BORDER_PADDING_TOP
    title_border_padding_bottom: int = VIDEO_TITLE_BORDER_PADDING_BOTTOM
    title_border_width: int = VIDEO_TITLE_BORDER_WIDTH

    # Encoding
    encoding_preset: str = VIDEO_ENCODING_PRESET
    crf: int = VIDEO_CRF

    # Logo screen settings
    logo_path: str = VIDEO_LOGO_PATH
    logo_duration: float = VIDEO_LOGO_DURATION
    logo_max_width_ratio: float = VIDEO_LOGO_MAX_WIDTH_RATIO
    logo_max_height_ratio: float = VIDEO_LOGO_MAX_HEIGHT_RATIO



class VideoGenerationService:
    """Service for generating educational Spanish learning videos."""

    def __init__(self, config: VideoConfig | None = None, output_dir: Path | None = None):
        self.config = config or VideoConfig()
        self.output_dir = output_dir or Path("data/outputs")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._font_cache: dict[int, ImageFont.FreeTypeFont] = {}
        # Frame cache to avoid re-rendering identical frames
        self._frame_cache: dict[str, np.ndarray] = {}
        self._frame_cache_key: str | None = None
        self._frame_cache_data: np.ndarray | None = None
        # Logo image cache
        self._logo_image: Image.Image | None = None

    def generate_video(
        self,
        video_id: int,
        title: str,
        language_tagged_json: str,
        audio_path: str,
    ) -> str:
        """
        Generate the complete video from language-tagged sections.

        Uses a make_frame approach for memory efficiency instead of creating
        individual ImageClip objects for each word.

        Args:
            video_id: Video ID for output filename
            title: Video title (used for output filename)
            language_tagged_json: JSON string with sections and language-tagged words
            audio_path: Path to the audio file

        Returns:
            Path to the generated video file

        Raises:
            FileNotFoundError: If audio file doesn't exist
            ValueError: If JSON is invalid
            RuntimeError: If video generation fails
        """
        # Parse sections
        data = json.loads(language_tagged_json)
        sections = data.get("sections", [])

        # Verify audio exists
        audio_file = Path(audio_path)
        if not audio_file.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Generate output filename with slugified title
        slug = self._slugify(title)
        output_filename = f"video_{video_id}_{slug}.mp4"
        output_path = self.output_dir / output_filename

        start_time = time.time()
        logger.info(f"[{video_id}] Starting video generation with {len(sections)} sections")

        try:
            # Load audio
            logger.info(f"[{video_id}] Loading audio... ({time.time() - start_time:.1f}s)")
            audio = AudioFileClip(str(audio_file))
            audio_duration = audio.duration
            logger.info(f"[{video_id}] Audio file duration: {audio_duration:.1f}s ({time.time() - start_time:.1f}s)")

            # Build frame data index for efficient time-based lookup
            logger.info(f"[{video_id}] Building frame data index... ({time.time() - start_time:.1f}s)")
            frame_data_list = self._build_frame_data_index(sections, audio_duration)

            # Content ends at last section, not at audio file end
            content_end = frame_data_list[-1].end_time if frame_data_list else audio_duration
            video_duration = content_end + self.config.logo_duration

            # Add logo screen immediately after last section ends
            frame_data_list.append(
                FrameData(
                    start_time=content_end,
                    end_time=video_duration,
                    section_type="logo",
                )
            )
            logger.info(f"[{video_id}] Content ends at {content_end:.1f}s, video duration: {video_duration:.1f}s (includes {self.config.logo_duration}s logo) ({time.time() - start_time:.1f}s)")

            # Extract start times for binary search
            frame_start_times = [fd.start_time for fd in frame_data_list]

            # Clear frame cache for this video
            self._frame_cache_key = None
            self._frame_cache_data = None

            # Create make_frame function
            def make_frame(t: float) -> np.ndarray:
                frame_data = self._get_frame_data_at_time(t, frame_data_list, frame_start_times)
                return self._render_frame(frame_data, t)

            # Create video clip with make_frame
            logger.info(f"[{video_id}] Creating video clip... ({time.time() - start_time:.1f}s)")
            video = VideoClip(make_frame, duration=video_duration)
            video = video.with_fps(self.config.fps)
            video = video.with_audio(audio)

            # Export
            logger.info(f"[{video_id}] Exporting video to {output_path}... ({time.time() - start_time:.1f}s)")
            video.write_videofile(
                str(output_path),
                fps=self.config.fps,
                codec="libx264",
                audio_codec="aac",
                threads=4,
                preset=self.config.encoding_preset,
                ffmpeg_params=["-crf", str(self.config.crf)],
                logger=None,  # Suppress moviepy's verbose output
            )

            # Clean up
            audio.close()
            video.close()

            total_time = time.time() - start_time
            logger.info(f"[{video_id}] Video generation completed in {total_time:.1f}s: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Video generation failed for {video_id}: {str(e)}", exc_info=True)
            raise RuntimeError(f"Video generation failed: {str(e)}")

    def _build_frame_data_index(
        self,
        sections: list[Section],
        video_duration: float,
    ) -> list[FrameData]:
        """
        Build a time-indexed list of FrameData for efficient lookup.

        Creates entries for each word (with highlight) and static sections,
        filling gaps with appropriate content.
        """
        frame_data_list: list[FrameData] = []

        for section in sections:
            section_type = section.get("type", "")
            is_static = section.get("static", False)

            if is_static:
                # Static section - convert to words format for unified rendering
                text = section.get("text", "")
                start = section.get("start_time")
                end = section.get("end_time")

                if text and start is not None and end is not None and end > start:
                    # Create a single "word" containing the full text
                    words = [{"word": text, "start": start, "end": end}]
                    frame_data_list.append(
                        FrameData(
                            start_time=start,
                            end_time=end,
                            section_type=section_type,
                            words=words,
                            highlight_index=-1,  # No highlighting
                        )
                    )
            else:
                # Dynamic section with words
                words = section.get("words", [])
                if not words:
                    continue

                # Title sections: show all words for the full section duration (no per-word highlighting)
                if section_type in ("title_spanish", "title_english"):
                    # Force title_spanish to start at 0 to ensure it's always first after sorting
                    if section_type == "title_spanish":
                        start = 0.0
                    else:
                        start = section.get("start_time", words[0]["start"])
                    end = section.get("end_time", words[-1]["end"])
                    frame_data_list.append(
                        FrameData(
                            start_time=start,
                            end_time=end,
                            section_type=section_type,
                            words=words,
                            highlight_index=-1,  # No highlighting for titles
                        )
                    )
                    continue

                # Split into text blocks based on lineBreak markers
                blocks = self._split_into_text_blocks(words)

                for block in blocks:
                    # Create a FrameData entry for each word in the block
                    for i, word in enumerate(block.words):
                        word_start = word["start"]
                        word_end = word["end"]

                        if word_end <= word_start:
                            word_end = word_start + 0.1  # Minimum duration

                        frame_data_list.append(
                            FrameData(
                                start_time=word_start,
                                end_time=word_end,
                                section_type=section_type,
                                words=block.words,
                                highlight_index=i,
                            )
                        )

        # Sort by start time
        frame_data_list.sort(key=lambda fd: fd.start_time)

        # Add a blank frame at the start if needed (before first content)
        if frame_data_list and frame_data_list[0].start_time > 0:
            frame_data_list.insert(
                0,
                FrameData(
                    start_time=0,
                    end_time=frame_data_list[0].start_time,
                    section_type="blank",
                ),
            )

        # Note: We no longer add blank frames at the end - the logo screen
        # will be appended in generate_video() starting from the last section's end

        return frame_data_list

    def _get_frame_data_at_time(
        self,
        t: float,
        frame_data_list: list[FrameData],
        frame_start_times: list[float],
    ) -> FrameData:
        """
        Find the FrameData active at time t using binary search.
        """
        if not frame_data_list:
            # Return blank frame if no data
            return FrameData(
                start_time=0,
                end_time=1,
                section_type="blank",
            )

        # Binary search for the rightmost start_time <= t
        idx = bisect.bisect_right(frame_start_times, t) - 1

        if idx < 0:
            idx = 0
        elif idx >= len(frame_data_list):
            idx = len(frame_data_list) - 1

        # Search backwards for a frame that contains t within its time range
        for i in range(idx, -1, -1):
            frame = frame_data_list[i]
            if frame.start_time <= t < frame.end_time:
                return frame

        return frame_data_list[idx]

    def _render_frame(self, frame_data: FrameData, t: float) -> np.ndarray:  # noqa: ARG002
        """
        Render a frame based on FrameData.

        Uses caching to avoid re-rendering identical frames.
        """
        # Create cache key based on frame data
        if frame_data.section_type == "logo":
            cache_key = "logo"
        elif frame_data.words is not None and frame_data.highlight_index is not None:
            words_key = "|".join(w["word"] for w in frame_data.words)
            cache_key = f"{frame_data.section_type}:{words_key}:{frame_data.highlight_index}"
        else:
            cache_key = "blank"

        # Check cache
        if cache_key == self._frame_cache_key and self._frame_cache_data is not None:
            return self._frame_cache_data

        # Render the frame
        if frame_data.section_type == "blank":
            # Blank frame (dark background)
            img = Image.new(
                "RGB",
                (self.config.width, self.config.height),
                self.config.background_color,
            )
        elif frame_data.section_type == "logo":
            # Logo screen
            img = self._render_logo_frame()
        elif frame_data.words is not None and frame_data.highlight_index is not None:
            # Text block with optional highlighting
            img = self._render_text_block_frame(
                words=frame_data.words,
                highlight_index=frame_data.highlight_index,
                section_type=frame_data.section_type,
            )
        else:
            # Fallback to blank
            img = Image.new(
                "RGB",
                (self.config.width, self.config.height),
                self.config.background_color,
            )

        frame_array = np.array(img)

        # Update cache
        self._frame_cache_key = cache_key
        self._frame_cache_data = frame_array

        return frame_array

    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug."""
        # Normalize unicode and strip accents
        text = unicodedata.normalize("NFKD", text)
        text = "".join(c for c in text if not unicodedata.combining(c))
        # Lowercase
        text = text.lower()
        # Replace spaces with hyphens
        text = text.replace(" ", "-")
        # Remove special characters except hyphens
        text = re.sub(r"[^a-z0-9\-]", "", text)
        # Remove multiple consecutive hyphens
        text = re.sub(r"-+", "-", text)
        # Strip leading/trailing hyphens
        text = text.strip("-")
        return text

    def _split_into_text_blocks(self, words: list[Word]) -> list[TextBlock]:
        """Split words into display blocks based on lineBreak markers."""
        blocks = []
        current_words: list[Word] = []

        for word in words:
            current_words.append(word)

            if word.get("lineBreak", False):
                # End of this block
                if current_words:
                    blocks.append(
                        TextBlock(
                            words=current_words.copy(),
                            start_time=current_words[0]["start"],
                            end_time=current_words[-1]["end"],
                        )
                    )
                current_words = []

        # Don't forget remaining words
        if current_words:
            blocks.append(
                TextBlock(
                    words=current_words,
                    start_time=current_words[0]["start"],
                    end_time=current_words[-1]["end"],
                )
            )

        return blocks

    def _render_text_block_frame(
        self,
        words: list[Word],
        highlight_index: int,
        section_type: str,
    ) -> Image.Image:
        """Render a text block frame with word highlighting."""
        img = Image.new(
            "RGB",
            (self.config.width, self.config.height),
            self.config.background_color,
        )
        draw = ImageDraw.Draw(img)

        # Title sections use title font size, no highlighting, and get a border
        is_title_section = section_type in (
            "title_spanish", "title_english",
            "vocabulary_header", "verbs_header", "story_header",
        )
        font_size = self.config.title_font_size if is_title_section else self.config.content_font_size
        font = self._get_font(font_size)

        # Vocabulary sections: Spanish on top, English below (line highlighting)
        if section_type == "vocabulary":
            return self._render_vocab_frame(words, highlight_index, font, draw, img)

        # Verbs sections: 4 lines (es word, en word, es sentence, en sentence) with word highlighting
        if section_type == "verbs":
            return self._render_verbs_frame(words, highlight_index, font, draw, img)

        # Calculate layout with word wrapping
        max_width = self.config.width - (2 * self.config.text_margin)
        lines = self._calculate_text_layout(words, font, max_width)

        # Calculate total text height for vertical centering
        line_height = int(font_size * self.config.line_spacing)
        total_height = len(lines) * line_height
        start_y = (self.config.height - total_height) / 2

        # Track text bounds for border (title sections only)
        min_x = self.config.width
        max_x = 0

        # Draw each word
        word_idx = 0
        for line_num, line in enumerate(lines):
            y = start_y + (line_num * line_height)

            for word_data, x in line:
                # No highlighting for title sections or when highlight_index is -1
                is_highlighted = False if is_title_section else (highlight_index >= 0 and word_idx == highlight_index)
                color = self._get_word_color(word_data, is_highlighted, section_type)

                word_text = word_data["word"]
                draw.text((x, y), word_text, font=font, fill=color)

                # Track bounds for border
                if is_title_section:
                    word_bbox = font.getbbox(word_text)
                    word_width = word_bbox[2] - word_bbox[0]
                    min_x = min(min_x, x)
                    max_x = max(max_x, x + word_width)

                word_idx += 1

        # Draw border for title sections
        if is_title_section and lines:
            # Get text height from font
            sample_bbox = font.getbbox("Ay")
            text_height = sample_bbox[3] - sample_bbox[1]

            draw.rectangle(
                [
                    min_x - self.config.title_border_padding_x,
                    start_y - self.config.title_border_padding_top,
                    max_x + self.config.title_border_padding_x,
                    start_y + total_height - (line_height - text_height) + self.config.title_border_padding_bottom,
                ],
                outline=self.config.primary_color,
                width=self.config.title_border_width,
            )

        return img

    def _render_vocab_frame(
        self,
        words: list[Word],
        highlight_index: int,
        font: ImageFont.FreeTypeFont,
        draw: ImageDraw.ImageDraw,
        img: Image.Image,
    ) -> Image.Image:
        """Render vocabulary/verbs frame with Spanish on top, English below."""
        # Separate Spanish and English words
        spanish_words = []
        english_words = []
        spanish_indices = []
        english_indices = []

        for i, w in enumerate(words):
            if w.get("language") == "en":
                english_words.append(w)
                english_indices.append(i)
            else:
                # Default to Spanish
                spanish_words.append(w)
                spanish_indices.append(i)

        # Build text strings (strip commas)
        spanish_text = " ".join(w["word"].rstrip(",") for w in spanish_words)
        english_text = " ".join(w["word"].rstrip(",") for w in english_words)

        # Determine highlighting
        highlight_spanish = highlight_index >= 0 and highlight_index in spanish_indices
        highlight_english = highlight_index >= 0 and highlight_index in english_indices

        # Calculate layout
        line_height = int(self.config.content_font_size * self.config.line_spacing)
        total_height = 2 * line_height  # Two lines
        start_y = (self.config.height - total_height) / 2

        # Draw Spanish line (centered)
        if spanish_text:
            spanish_bbox = font.getbbox(spanish_text)
            spanish_width = spanish_bbox[2] - spanish_bbox[0]
            spanish_x = (self.config.width - spanish_width) / 2
            spanish_color = self.config.highlight_text_color if highlight_spanish else self.config.primary_color
            draw.text((spanish_x, start_y), spanish_text, font=font, fill=spanish_color)

        # Draw English line (centered, below Spanish)
        if english_text:
            english_bbox = font.getbbox(english_text)
            english_width = english_bbox[2] - english_bbox[0]
            english_x = (self.config.width - english_width) / 2
            english_y = start_y + line_height
            english_color = self.config.highlight_text_color if highlight_english else self.config.primary_color
            draw.text((english_x, english_y), english_text, font=font, fill=english_color)

        return img

    def _render_verbs_frame(
        self,
        words: list[Word],
        highlight_index: int,
        font: ImageFont.FreeTypeFont,
        draw: ImageDraw.ImageDraw,
        img: Image.Image,
    ) -> Image.Image:
        """Render verbs frame with 4 lines: es word, en word, es sentence, en sentence."""
        # Group words into lines by language switches
        lines: list[tuple[list[Word], str, list[int]]] = []  # (words, language, original_indices)
        current_words: list[Word] = []
        current_indices: list[int] = []
        current_lang: str | None = None

        for i, word in enumerate(words):
            lang = word.get("language", "es")
            if current_lang is None:
                current_lang = lang

            if lang != current_lang:
                # Language switch = new line
                if current_words:
                    lines.append((current_words, current_lang, current_indices))
                current_words = [word]
                current_indices = [i]
                current_lang = lang
            else:
                current_words.append(word)
                current_indices.append(i)

        if current_words and current_lang:
            lines.append((current_words, current_lang, current_indices))

        # Verb lines (first 2) always use content_font_size
        # Sentence lines (3+) may shrink if too wide
        verb_font = font  # Already at content_font_size
        verb_font_size = self.config.content_font_size

        available_width = self.config.width - (2 * self.config.text_margin)
        space_width = verb_font.getbbox(" ")[2]

        # Calculate max width of sentence lines only (lines 3+)
        sentence_lines = lines[2:] if len(lines) > 2 else []
        max_sentence_width = 0

        for line_words, _, _ in sentence_lines:
            line_width = 0
            for word in line_words:
                word_text = word["word"].rstrip(",")
                word_bbox = verb_font.getbbox(word_text)
                line_width += word_bbox[2] - word_bbox[0]
            line_width += space_width * (len(line_words) - 1) if len(line_words) > 1 else 0
            max_sentence_width = max(max_sentence_width, line_width)

        # Shrink font only for sentence lines if needed
        sentence_font_size = verb_font_size
        sentence_font = verb_font
        if max_sentence_width > available_width:
            scale = available_width / max_sentence_width
            sentence_font_size = max(int(self.config.content_font_size * scale), self.config.min_font_size)
            sentence_font = self._get_font(sentence_font_size)

        # Calculate layout - use verb font size for line height of verb lines,
        # sentence font size for sentence lines
        verb_line_height = int(verb_font_size * self.config.line_spacing)
        sentence_line_height = int(sentence_font_size * self.config.line_spacing)

        num_verb_lines = min(2, len(lines))
        num_sentence_lines = max(0, len(lines) - 2)
        total_height = (num_verb_lines * verb_line_height) + (num_sentence_lines * sentence_line_height)
        start_y = (self.config.height - total_height) / 2

        # Draw each line with individual word highlighting
        current_y = start_y
        for line_num, (line_words, lang, indices) in enumerate(lines):
            # Use verb font for first 2 lines, sentence font for rest
            is_verb_line = line_num < 2
            line_font = verb_font if is_verb_line else sentence_font
            line_height = verb_line_height if is_verb_line else sentence_line_height
            line_space_width = line_font.getbbox(" ")[2]

            y = current_y
            current_y += line_height

            base_color = self.config.primary_color if lang == "es" else self.config.secondary_color

            # First pass: calculate total width for centering
            total_width = 0
            for word in line_words:
                word_text = word["word"].rstrip(",")
                word_bbox = line_font.getbbox(word_text)
                total_width += word_bbox[2] - word_bbox[0]
            total_width += line_space_width * (len(line_words) - 1) if len(line_words) > 1 else 0

            # Calculate starting x for centering
            current_x = int((self.config.width - total_width) / 2)

            # Second pass: draw words
            for idx, word in zip(indices, line_words):
                word_text = word["word"].rstrip(",")
                is_highlighted = highlight_index >= 0 and idx == highlight_index
                color = self.config.highlight_text_color if is_highlighted else base_color

                draw.text((current_x, y), word_text, font=line_font, fill=color)

                word_bbox = line_font.getbbox(word_text)
                word_width = word_bbox[2] - word_bbox[0]
                current_x += word_width + line_space_width

        return img

    def _calculate_text_layout(
        self,
        words: list[Word],
        font: ImageFont.FreeTypeFont,
        max_width: int,
    ) -> list[list[tuple[Word, int]]]:
        """Calculate word positions with line wrapping."""
        lines: list[list[tuple[Word, int]]] = []
        current_line: list[tuple[Word, int]] = []
        current_x = self.config.text_margin
        space_width = font.getbbox(" ")[2]

        for word in words:
            word_text = word["word"]
            word_bbox = font.getbbox(word_text)
            word_width = word_bbox[2] - word_bbox[0]

            # Check if word fits on current line
            if current_line and (current_x + word_width > self.config.width - self.config.text_margin):
                # Start new line
                lines.append(current_line)
                current_line = []
                current_x = self.config.text_margin

            current_line.append((word, current_x))
            current_x += word_width + space_width

        # Don't forget last line
        if current_line:
            lines.append(current_line)

        # Center each line horizontally
        centered_lines: list[list[tuple[Word, int]]] = []
        for line in lines:
            if not line:
                continue

            # Calculate line width
            last_word, last_x = line[-1]
            last_word_width = font.getbbox(last_word["word"])[2]
            line_width = last_x + last_word_width - self.config.text_margin

            # Calculate offset to center
            offset = (self.config.width - line_width) / 2 - self.config.text_margin

            # Apply offset to all words
            centered_line = [(word, int(x + offset)) for word, x in line]
            centered_lines.append(centered_line)

        return centered_lines

    def _get_word_color(
        self,
        word: Word,
        is_highlighted: bool,
        section_type: str,
    ) -> tuple[int, int, int]:
        """Determine word color based on section type."""
        # If highlighted, use highlight color
        if is_highlighted:
            return self.config.highlight_text_color

        # Verbs section uses language-based coloring
        if section_type == "verbs":
            language = word.get("language")
            if language == "en":
                return self.config.secondary_color
            return self.config.primary_color

        # All other sections use primary color
        return self.config.primary_color

    def _get_font(self, size: int) -> ImageFont.FreeTypeFont:
        """Get or create a cached font at the specified size."""
        if size not in self._font_cache:
            try:
                self._font_cache[size] = ImageFont.truetype(self.config.font_path, size)
            except OSError:
                # Fallback to default font if Inter not available
                logger.warning(f"Font not found at {self.config.font_path}, using default")
                self._font_cache[size] = ImageFont.load_default()
        return self._font_cache[size]

    def _load_logo(self) -> Image.Image | None:
        """Load and scale the logo image for display."""
        if self._logo_image is not None:
            return self._logo_image

        logo_path = Path(self.config.logo_path)
        if not logo_path.exists():
            logger.warning(f"Logo file not found: {logo_path}")
            return None

        try:
            logo = Image.open(logo_path).convert("RGBA")

            # Calculate max dimensions
            max_width = int(self.config.width * self.config.logo_max_width_ratio)
            max_height = int(self.config.height * self.config.logo_max_height_ratio)

            # Scale logo to fit within max dimensions while preserving aspect ratio
            logo_width, logo_height = logo.size
            scale = min(max_width / logo_width, max_height / logo_height)

            if scale < 1.0:
                new_width = int(logo_width * scale)
                new_height = int(logo_height * scale)
                logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)

            self._logo_image = logo
            return logo
        except Exception as e:
            logger.error(f"Failed to load logo: {e}")
            return None

    def _render_logo_frame(self) -> Image.Image:
        """Render a frame with the centered logo on dark background."""
        img = Image.new(
            "RGB",
            (self.config.width, self.config.height),
            self.config.background_color,
        )

        logo = self._load_logo()
        if logo is None:
            return img

        # Center the logo
        logo_width, logo_height = logo.size
        x = (self.config.width - logo_width) // 2
        y = (self.config.height - logo_height) // 2

        # Paste logo with alpha channel support
        img.paste(logo, (x, y), logo)

        return img


def get_video_config(draft_mode: bool) -> VideoConfig:
    """Get VideoConfig based on draft_mode parameter.

    Args:
        draft_mode: If True, use faster encoding (15fps, ultrafast, CRF 30).
                   If False, use production quality (30fps, medium, CRF 23).
    """
    if draft_mode:
        return VideoConfig(
            fps=VIDEO_FPS_DRAFT,
            encoding_preset=VIDEO_ENCODING_PRESET_DRAFT,
            crf=VIDEO_CRF_DRAFT,
        )
    else:
        return VideoConfig()


def get_video_generation_service(draft_mode: bool = True) -> VideoGenerationService:
    """Get a VideoGenerationService instance with appropriate config.

    Args:
        draft_mode: If True, use fast encoding. If False, use production quality.
    """
    config = get_video_config(draft_mode=draft_mode)
    return VideoGenerationService(config=config)
