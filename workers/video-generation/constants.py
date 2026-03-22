"""Video generation constants."""

from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent

# Colors (RGB tuples)
VIDEO_BACKGROUND_COLOR = (28, 27, 31)      # #1C1B1F
VIDEO_PRIMARY_FONT_COLOR = (211, 208, 204)      # #D3D0CC
VIDEO_SECONDARY_FONT_COLOR = (227, 204, 164)      # #E3CCA4
VIDEO_HIGHLIGHT_COLOR = (250, 75, 48)      # #FA4B30

# Dimensions
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
VIDEO_FPS = 30
VIDEO_FPS_DRAFT = 15

# Font settings
VIDEO_FONT_PATH = str(_BASE_DIR / "fonts" / "Inter-SemiBold.ttf")
VIDEO_TITLE_FONT_SIZE = 120
VIDEO_CONTENT_FONT_SIZE = 100
VIDEO_MIN_FONT_SIZE = 60  # Minimum font size for readability

# Layout
VIDEO_TEXT_MARGIN = 100
VIDEO_LINE_SPACING = 1.5
VIDEO_TITLE_BORDER_PADDING_X = 50
VIDEO_TITLE_BORDER_PADDING_TOP = 25
VIDEO_TITLE_BORDER_PADDING_BOTTOM = 50
VIDEO_TITLE_BORDER_WIDTH = 4

# Encoding
VIDEO_ENCODING_PRESET = "medium"
VIDEO_ENCODING_PRESET_DRAFT = "ultrafast"
VIDEO_CRF = 23  # Quality: 0=lossless, 51=worst. Default 23.
VIDEO_CRF_DRAFT = 30  # Lower quality for faster draft encoding

# Logo screen settings
VIDEO_LOGO_PATH = str(_BASE_DIR / "assets" / "logo.png")
VIDEO_LOGO_DURATION = 5.0  # seconds
VIDEO_LOGO_MAX_WIDTH_RATIO = 0.6   # Max 60% of video width
VIDEO_LOGO_MAX_HEIGHT_RATIO = 0.4  # Max 40% of video height

# End card settings
VIDEO_END_CARD_EXTENSION = 1.0  # Extra seconds to display end card
