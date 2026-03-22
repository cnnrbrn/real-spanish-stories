"""
Local WhisperX transcription service.

Loads WhisperX model, transcribes audio with word-level timestamps via forced alignment.
Returns { text, words, segments } matching the Replicate output format.
"""

import logging
import os
from pathlib import Path

# PyTorch 2.6+ changed weights_only default to True, breaking model loading
# Set this before importing torch to restore old behavior for trusted HuggingFace models
os.environ["TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD"] = "1"

import torch
import whisperx

logger = logging.getLogger(__name__)


class TranscriptionService:
    """Transcribes audio files with word-level timestamps using WhisperX."""

    def __init__(self, model_name: str = "large-v3"):
        self.model_name = model_name
        self._model = None
        self._align_model = None
        self._align_metadata = None
        self._align_language = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        self._compute_type = "float32"

    def _load_model(self):
        """Load WhisperX model (lazy initialization)."""
        if self._model is None:
            logger.info(f"Loading WhisperX model: {self.model_name} on {self._device} with {self._compute_type}")
            self._model = whisperx.load_model(
                self.model_name,
                self._device,
                compute_type=self._compute_type,
                asr_options={
                    "beam_size": 5,
                    "max_new_tokens": 128,
                },
                vad_options={
                    "vad_onset": 0.2,
                    "vad_offset": 0.1,
                    "min_speech_duration_ms": 100,
                    "min_silence_duration_ms": 300,
                },
            )
            logger.info("WhisperX model loaded successfully")

    def _load_align_model(self, language_code: str):
        """Load alignment model for the specified language."""
        if self._align_model is None or self._align_language != language_code:
            logger.info(f"Loading alignment model for language: {language_code}")
            self._align_model, self._align_metadata = whisperx.load_align_model(
                language_code=language_code,
                device=self._device,
            )
            self._align_language = language_code
            logger.info("Alignment model loaded successfully")

    def transcribe_audio(self, audio_path: str) -> dict:
        """
        Transcribe an audio file with word-level timestamps.

        Args:
            audio_path: Path to the audio file (WAV or MP3)

        Returns:
            Dictionary with text, words, and segments

        Raises:
            FileNotFoundError: If audio file doesn't exist
            RuntimeError: If transcription fails
        """
        path = Path(audio_path)
        if not path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        self._load_model()

        logger.info(f"Transcribing: {audio_path}")

        # Load audio
        audio = whisperx.load_audio(str(path))

        # Transcribe
        result = self._model.transcribe(
            audio,
            batch_size=4,
            chunk_size=10,
        )

        segments = result.get("segments", [])
        logger.info(f"Transcription complete, aligning {len(segments)} segments")

        # Align for word-level timestamps
        detected_language = result.get("language", "es")
        logger.info(f"Detected language: {detected_language}")
        self._load_align_model(detected_language)

        result = whisperx.align(
            result["segments"],
            self._align_model,
            self._align_metadata,
            audio,
            self._device,
            interpolate_method="linear",
            return_char_alignments=False,
        )

        # Extract words
        words = []
        for segment in result.get("segments", []):
            for word_data in segment.get("words", []):
                words.append({
                    "word": word_data.get("word", ""),
                    "start": word_data.get("start", 0.0),
                    "end": word_data.get("end", 0.0),
                })

        text = " ".join(w["word"] for w in words)
        logger.info(f"Transcription completed: {len(words)} words")

        return {
            "text": text,
            "words": words,
            "segments": result.get("segments", []),
        }
