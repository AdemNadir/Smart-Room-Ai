from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Data directory
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Default data paths
DEFAULT_ROOMS_CSV = DATA_DIR / "sample_rooms.csv"
DEFAULT_SCHEDULE_CSV = DATA_DIR / "sample_schedule.csv"