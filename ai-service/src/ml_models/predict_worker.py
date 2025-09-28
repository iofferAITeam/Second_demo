import argparse
import json
import sys

import joblib
import pandas as pd


def main() -> int:
    parser = argparse.ArgumentParser(description="Run predict_proba in an isolated process")
    parser.add_argument("--pipeline", required=True, help="Path to joblib pipeline file")
    parser.add_argument("--features-csv", required=True, help="Path to CSV with feature columns")
    args = parser.parse_args()

    try:
        df = pd.read_csv(args.features_csv)
        pipeline = joblib.load(args.pipeline)
        proba = pipeline.predict_proba(df)[:, 1]
        print(json.dumps({"probabilities": proba.tolist()}))
        return 0
    except Exception as e:
        print(f"Predict worker failed: {type(e).__name__}: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

