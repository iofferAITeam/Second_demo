#!/usr/bin/env python3
"""
Minimal test runner for the School Recommendation toolchain.

This script will:
1) Initialize a session for a given user_id (default: hanyu_liu_003)
2) Build a sample StudentTagInfo (or use the helper if present)
3) Call get_prediction() and print top-N universities

Run:
  uv run python scripts/test_school_recommendation.py [user_id] [field]

If QS CSV is missing for the field, the script will report it gracefully.
"""

import sys
from pathlib import Path

# Ensure project root on sys.path so 'src' package can be imported when running from scripts/
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pandas as pd

from src.utils.session_manager import init_session
from src.tools.school_rec_tools import get_prediction, create_sample_student_tag_info
from src.domain.students_prediction import StudentTagInfo, InterestField


def main():
    user_id = sys.argv[1] if len(sys.argv) > 1 else "hanyu_liu_003"
    field = sys.argv[2] if len(sys.argv) > 2 else None  # e.g., "Business" or "Computer Science"

    # 1) Initialize session
    init_session(user_id)

    # 2) Build StudentTagInfo
    tag_info: StudentTagInfo = create_sample_student_tag_info()
    if field:
        # Override interest field if provided
        tag_info.interest_field = InterestField(field_name=field, description=field, prediction_value=field)

    # 3) Validate QS CSV exists
    qs_csv = Path(f"data/qs_data/{tag_info.interest_field.field_name}.csv")
    if not qs_csv.exists():
        print(f"[ERROR] QS CSV not found: {qs_csv}. Provide QS data for field '{tag_info.interest_field.field_name}'.")
        return 2

    # 4) Call prediction
    try:
        universities = get_prediction(tag_info)
    except FileNotFoundError as fe:
        print(f"[ERROR] Missing model or features file: {fe}")
        return 3
    except Exception as e:
        print(f"[ERROR] Prediction failed: {type(e).__name__}: {e}")
        return 4

    if universities is None:
        print("[WARN] get_prediction returned None. Check logs for details.")
        return 5

    # 5) Print results
    print("=== Prediction Result ===")
    if isinstance(universities, pd.Series):
        universities = list(universities)
    for i, uni in enumerate(universities[:20], 1):
        print(f"{i:02d}. {uni}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

