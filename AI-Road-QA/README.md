# AI road QA

This workspace brings the original three project folders together and integrates
the uploaded YOLO11 road-hazard training project into the FastAPI backend.

## Folder structure

```text
AI road QA/
├── frontend/                 # Existing React + Vite web frontend
├── mobile-app/               # Existing Expo / React Native mobile app
├── backend/                  # Existing FastAPI backend
│   ├── app/
│   │   ├── ml/               # YOLO11 inference adapter + fallback detector
│   │   └── .env.example
│   ├── models/
│   │   ├── README.md
│   │   └── road_hazard_training/  # Uploaded public YOLO11 training repository
│   ├── requirements-models.txt
│   └── train_road_model.py
└── README.md
```

## 1. Backend setup (Windows PowerShell)

Use Python 3.11 if possible. From this folder:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-models.txt
Copy-Item app\.env.example app\.env
```

Edit `backend/app/.env` with your PostgreSQL/PostGIS credentials and a secure
`JWT_SECRET_KEY`. The database must be running and migrated for authenticated
detection/report flows. The ML fallback can still be imported without YOLO
weights.

## 2. Train the YOLO11 road-damage model

From `backend/` with the virtual environment activated:

```powershell
python train_road_model.py
```

This downloads the RDD2022 India subset (about 527 MB), converts its labels,
trains YOLO11n for 50 epochs, evaluates it, and copies the resulting checkpoint
to `backend/models/best.pt`. Training needs extra disk space; a CUDA GPU is
recommended. To train with less GPU memory, try:

```powershell
python train_road_model.py --batch 4
```

If the India dataset archive is already downloaded, skip the download:

```powershell
python train_road_model.py --skip-download
```

The supplied archive contained the training source code, not the actual trained
`.pt` checkpoint. Therefore, `models/best.pt` is created only after training
successfully finishes. The training repository reports results on its own test
split; those reported numbers are not a guarantee for your camera or roads.

## 3. Enable YOLO in the API

In `backend/app/.env`:

```env
ML_PROVIDER=yolo
MODEL_PATH=models/best.pt
CONFIDENCE_THRESHOLD=0.40
```

Run the backend from `backend/`:

```powershell
uvicorn app.main:app --reload
```

Swagger: http://127.0.0.1:8000/docs  
Health: http://127.0.0.1:8000/health

The detector returns normalized bounding boxes and maps the RDD2022 classes to
`longitudinal crack`, `transverse crack`, `alligator crack`, and `pothole`.
When `best.pt` or Ultralytics is missing, the existing OpenCV heuristic detector
is used as a fallback; fallback output is not YOLO inference.

## 4. Web frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite proxy already forwards `/api/v1` to `http://127.0.0.1:8000`.
Keep the backend running.

## 5. Mobile app

Open another terminal:

```powershell
cd mobile-app
npm install
npx expo start
```

Set the backend host in `mobile-app/src/api.js` to your computer's LAN IP
(e.g. `192.168.x.x:8000`) when using a physical phone. `localhost` on a phone
means the phone itself, not your PC. Ensure both devices are on the same network
and Windows Firewall permits the backend port. The current source defaults to
`192.168.0.100:8000`, which may need changing.

## Integration notes

- Existing endpoint remains `POST /api/v1/detections/`; frontend/mobile request
  contracts were not intentionally changed.
- Database migrations and PostgreSQL/PostGIS setup are still required for full
  end-to-end use.
- Do not commit `.env`, access tokens, database passwords, or generated datasets.
- `backend/models/road_hazard_training/` is source code and training utilities;
  it is not itself the trained checkpoint.

## Upgrade notes (Pass 2)

See [`UPGRADE_NOTES.md`](UPGRADE_NOTES.md) for the exact changes, verification results, and limitations. The municipal portal now supports report search, severity/status filters, CSV export, and an explicitly labelled operational priority score. A visible data-provenance banner distinguishes backend reports from local sample data. Light/dark theme preference persists across reloads.

### Run the priority-score tests

From `frontend/` with Node.js installed:

```bash
npm run test:priority
```

### Build the frontend

From `frontend/`:

```bash
npm ci
npm run build
npm run dev
```

A production build was not verified during the upgrade because dependency installation timed out in the build environment. Do not describe the project as production-ready until the frontend build, backend integration, authorization, and end-to-end tests have passed.
