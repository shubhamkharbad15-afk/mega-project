# Model Artifacts Directory

This directory stores deep learning model weights for road damage detection.

## Supported Models
- **YOLOv8 / YOLOv11 (`best.pt`)**: Place trained weights here for automated inference via `ultralytics`.
- Set `ML_PROVIDER=yolo` and `MODEL_PATH=models/best.pt` in `.env`.
- When weights are not detected, the system automatically falls back to OpenCV heuristic computer-vision analysis.
