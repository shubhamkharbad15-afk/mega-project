"""Download, prepare, and train the included YOLO11n Indian road-damage pipeline.

Run from the backend root:
    python train_road_model.py
    python train_road_model.py --skip-download
    python train_road_model.py --epochs 50 --batch 8

The RDD2022 India subset is about 527 MB. Training needs additional disk space.
A CUDA GPU is strongly recommended, but CPU training can be used (much slower).
"""
import argparse
import shutil
import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent
TRAINING_ROOT = BACKEND_ROOT / "models" / "road_hazard_training"
BACKEND_CHECKPOINT = BACKEND_ROOT / "models" / "best.pt"
DATA_YAML = TRAINING_ROOT / "data" / "yolo" / "data.yaml"
RAW_DATA = TRAINING_ROOT / "data" / "raw" / "RDD2022" / "India.zip"


def run_module(module: str, args: list[str] | None = None) -> None:
    command = [sys.executable, "-m", module, *(args or [])]
    print("\n>", " ".join(command), flush=True)
    subprocess.run(command, cwd=TRAINING_ROOT, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train YOLO11n on Indian road defects")
    parser.add_argument("--model", default="yolo11n.pt", help="Starting Ultralytics model")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--skip-download", action="store_true",
                        help="Skip dataset download if the raw India.zip already exists")
    args = parser.parse_args()

    if not TRAINING_ROOT.is_dir():
        raise SystemExit(f"Training project missing: {TRAINING_ROOT}")
    if not args.skip_download and not RAW_DATA.is_file():
        run_module("src.download")
    elif not RAW_DATA.is_file():
        raise SystemExit(
            f"Dataset archive not found: {RAW_DATA}. Run without --skip-download first."
        )

    if not DATA_YAML.is_file():
        run_module("src.prepare")

    # The included src.train script supports --model, --epochs and --batch.
    run_module("src.train", ["--model", args.model, "--epochs", str(args.epochs),
                             "--batch", str(args.batch)])

    checkpoint_name = Path(args.model).stem
    training_checkpoint = TRAINING_ROOT / "runs" / checkpoint_name / "weights" / "best.pt"
    if not training_checkpoint.is_file():
        raise SystemExit(
            f"Training completed but expected checkpoint was not found: {training_checkpoint}. "
            "Check the training output and runs/ directory."
        )

    BACKEND_CHECKPOINT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(training_checkpoint, BACKEND_CHECKPOINT)
    print(f"\nTrained checkpoint copied to: {BACKEND_CHECKPOINT}")
    print("Set ML_PROVIDER=yolo and MODEL_PATH=models/best.pt in backend/app/.env, then restart FastAPI.")


if __name__ == "__main__":
    main()
