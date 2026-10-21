# System Architecture & Engineering Specifications

## Project Overview

The **AI Road Quality Management System** is a road-defect detection, geo-tagging, and citizen reporting platform. The repository contains the FastAPI modular-monolith backend (`ai-road-quality-backend`), providing REST APIs for:
- User registration and JWT authentication
- Road defect detection from image uploads (potholes, cracks)
- PostGIS-enabled geospatial queries for nearby defect reports
- Citizen road condition reports and history tracking
- Automated repair advisory and eco-friendly material recommendations
- Defect severity analytics and user notifications

> **Current Scope:** Citizen/user application and mobile backend integration. Government/contractor admin workflows and dispatch portals are planned for future phases.

---

## Technology Stack

- **Language:** Python 3.11+ / 3.12
- **Framework:** FastAPI, Uvicorn
- **ORM & Database:** SQLAlchemy 2.0 (AsyncIO), Asyncpg, GeoAlchemy2, PostgreSQL 16 with PostGIS 3.4
- **Database Migrations:** Alembic
- **Validation & Settings:** Pydantic v2, Pydantic-Settings
- **Authentication:** Python-Jose (JWT), Passlib (Bcrypt)
- **Computer Vision & ML:** 
  - Pluggable detector protocol (`RoadDamageDetector`)
  - Deterministic `MockDetector` (default for development/testing)
  - Extensible `YOLODetector` (lazy-loaded Ultralytics YOLOv11 adapter)
  - Pillow, OpenCV (cv2), NumPy
- **Testing:** Pytest, Pytest-AsyncIO, HTTPX (FastAPI TestClient)
- **Containerization:** Docker, Docker Compose

---

## Repository Structure

```
mega-project/
├── .gitignore
├── ARCHITECTURE.md                 # System architecture and engineering reference
├── HowToRun.md                     # Step-by-step setup and testing instructions
├── ai-road-quality-frontend/       # Cross-platform React & Tailwind frontend (4 Terminals)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Terminal switcher & live backend telemetry indicator
│   │   │   ├── CitizenTerminal.jsx # Mobile-ready citizen sensing & snapshot review
│   │   │   ├── GovernmentTerminal.jsx # Municipal PDI index & work order approvals
│   │   │   ├── WorkerTerminal.jsx  # Field contractor dispatch & 3-stage milestone proofs
│   │   │   └── AdminTerminal.jsx   # YOLOv11 telemetry, retraining pipeline & RBAC
│   │   ├── api.js                  # FastAPI backend client with graceful fallback
│   │   ├── App.jsx                 # Global state & multi-terminal router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── ai-road-quality-backend/
    └── app/
        ├── alembic/                # Database migration scripts and configuration
        │   ├── versions/           # Versioned migration scripts (0001_initial_schema.py)
        │   ├── alembic.ini         # Alembic configuration
        │   └── env.py              # Async migration environment runner
        ├── analytics/              # Aggregated defect reporting metrics
        │   ├── router.py           # GET /api/v1/analytics/summary
        │   └── service.py          # Summary aggregation queries
        ├── assistant/              # Automated repair advisory
        │   ├── router.py           # POST /api/v1/assistant/repair-advice
        │   ├── schemas.py          # Advice request/response Pydantic models
        │   └── service.py          # Heuristic repair advice & eco-material generator
        ├── auth/                   # Authentication & registration
        │   ├── router.py           # /api/v1/auth/register, /login, /me
        │   ├── schemas.py          # Auth request & token models
        │   └── service.py          # User authentication logic
        ├── core/                   # Application core modules
        │   ├── config.py           # Pydantic BaseSettings & .env configuration
        │   ├── database.py         # Async SQLAlchemy engine, session maker, get_db
        │   ├── dependencies.py     # FastAPI dependencies (e.g. get_current_user)
        │   └── security.py         # Password hashing & JWT token encode/decode
        ├── detections/             # Defect detection pipeline
        │   ├── models.py           # Detection SQLAlchemy model with PostGIS Geometry(POINT)
        │   ├── router.py           # POST /api/v1/detections/ (multipart image upload + GPS)
        │   ├── schemas.py          # Detection request and response schemas
        │   └── service.py          # File upload storage, ML execution, score calculation
        ├── locations/              # GIS and location services
        │   ├── router.py           # GET /api/v1/locations/nearby
        │   └── service.py          # PostGIS ST_DWithin & ST_Distance queries
        ├── ml/                     # ML abstraction and detector implementations
        │   ├── detector.py         # RoadDamageDetector Protocol & Prediction dataclass
        │   ├── mock_detector.py    # Deterministic MockDetector
        │   ├── model_loader.py     # get_detector() factory function
        │   └── yolo_detector.py    # Lazy-loaded Ultralytics YOLOv11 adapter
        ├── notifications/          # Citizen notifications
        │   ├── models.py           # Notification model
        │   ├── router.py           # GET /api/v1/notifications/
        │   ├── schemas.py          # Notification schemas
        │   └── service.py          # Notification queries & updates
        ├── reports/                # Citizen road incident reporting
        │   ├── models.py           # RoadReport model with PostGIS Geometry(POINT)
        │   ├── router.py           # POST /api/v1/reports/, GET /reports/, GET /{id}
        │   ├── schemas.py          # Report schemas
        │   └── service.py          # Report CRUD operations
        ├── tests/                  # Unit and integration test suite
        │   ├── test_health.py      # Health check endpoint test
        │   ├── test_locations_service.py # Spatial SQL query compilation tests
        │   └── test_mock_detector.py     # Mock detector prediction verification
        ├── uploads/                # Local directory for uploaded road images
        ├── users/                  # User accounts and roles
        │   ├── models.py           # User model
        │   ├── router.py           # GET /api/v1/users/me
        │   ├── schemas.py          # User response models
        │   └── service.py          # User queries
        ├── Dockerfile              # Backend container definition
        ├── docker-compose.yml      # FastAPI + PostGIS container orchestrator
        ├── main.py                 # FastAPI application factory and router inclusions
        ├── models.py               # ORM relationship registry (User, Detection, RoadReport, Notification)
        ├── README.md               # Backend documentation
        └── requirements.txt        # Python package dependencies
```

---

## Architecture & Data Flow

```
[ Citizen Mobile Client / Web App ]
                 │
                 │ HTTP REST (JSON / Multipart)
                 ▼
          [ FastAPI Main ]
        (Prefix: /api/v1)
                 │
  ┌──────────────┼──────────────┬──────────────┬──────────────┐
  │              │              │              │              │
[ Auth ]    [ Detections ]   [ Reports ]  [ Locations ]  [ Assistant ]
  │              │              │              │              │
  ▼              ▼              ▼              ▼              ▼
JWT Token   ML Detector    RoadReport     PostGIS GIS    Repair Rules
            ┌────┴────┐     (Spatial)     (ST_DWithin)   (Eco-materials)
            ▼         ▼
          Mock       YOLO
            │
            ▼
   [ PostgreSQL 16 + PostGIS 3.4 ]
   (users, detections, road_reports, notifications)
```

### Detection & Reporting Workflow
1. **Upload & Ingest:** Client sends image file with GPS latitude and longitude (`POST /api/v1/detections/`).
2. **File Persistence:** Image saved to `uploads/` with a UUID filename.
3. **Inference:** `get_detector()` loads the configured ML provider (`MockDetector` by default, or `YOLODetector` if `ML_PROVIDER=yolo`).
4. **Scoring:** Confidence and bounding boxes determine defect severity (`high`, `medium`, `low`) and calculated `risk_score`.
5. **Geo-tagging:** Record saved in database with a PostGIS `POINT(longitude latitude)` (SRID 4326).
6. **Citizen Report:** Citizen can reference the detection ID when submitting an official `RoadReport` (`POST /api/v1/reports/`).
7. **Spatial Query:** Clients search for nearby incidents within a given radius in meters using `GET /api/v1/locations/nearby` powered by `ST_DWithin` and `ST_Distance`.

---

## Configuration & Environment Variables

Configuration is loaded from environment variables or `ai-road-quality-backend/app/.env` using Pydantic Settings (`app.core.config.Settings`).

| Variable | Default | Purpose |
|---|---|---|
| `APP_NAME` | `AI Road Quality Management System` | Application title |
| `APP_VERSION` | `0.1.0` | Application release version |
| `DEBUG` | `True` | Debug mode / SQL echo logging |
| `DATABASE_URL` | `postgresql+asyncpg://roaduser:roadpassword@localhost:5433/road_quality` | Async PostgreSQL connection string |
| `JWT_SECRET_KEY` | `change-me` | Secret key for signing JWT access tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiration duration in minutes |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded road defect images |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated or `*`) |
| `ML_PROVIDER` | `mock` | Active detector: `mock` or `yolo` |
| `MODEL_PATH` | `models/best.pt` | Path to YOLO model weights |
| `CONFIDENCE_THRESHOLD` | `0.40` | Minimum confidence score for YOLO predictions |

---

## Essential Commands

### 1. Local Python Setup
Always execute Python commands with `ai-road-quality-backend` as working directory or ensure it is in `PYTHONPATH`:

```bash
cd ai-road-quality-backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r app/requirements.txt

# Run FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive Swagger API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Testing
```bash
cd ai-road-quality-backend
pytest app/tests
```

### 3. Docker & PostGIS Database
```bash
cd ai-road-quality-backend/app

# Start PostGIS and API containers
docker compose up -d

# Check service logs
docker compose logs -f api
```
*Note: The PostGIS container exposes host port `5433` mapped to internal `5432` to avoid conflicts with native PostgreSQL installations.*

### 4. Database Migrations (Alembic)
```bash
cd ai-road-quality-backend/app

# Run pending migrations
alembic upgrade head

# Generate a new migration revision
alembic revision -m "migration_description"
```

---

## Coding Conventions & Engineering Guidelines

1. **Import Paths:**
   - All backend submodules assume package root `app`. Use absolute imports within `app` (e.g. `from app.core.config import settings`, `from app.users.models import User`).
   - Do not use relative parent imports across domain boundaries.
2. **Modular Architecture:**
   - Keep feature domains isolated in their respective folders (`auth`, `users`, `detections`, `reports`, `locations`, `analytics`, `assistant`, `notifications`).
   - Each domain follows the standard pattern: `models.py` (ORM), `schemas.py` (Pydantic), `service.py` (business logic), and `router.py` (FastAPI routes).
3. **ORM Registration:**
   - Import `app.models` in `app/main.py` to ensure all SQLAlchemy models and relationships are registered before route handling.
4. **Spatial Data:**
   - Coordinate order: Coordinates in PostGIS WKT format must be `POINT(longitude latitude)` with SRID 4326.
   - For radius comparisons and distance computations in meters, cast `Geometry` to `Geography(srid=4326)`.
5. **ML Abstraction Integrity:**
   - Always access detectors via `app.ml.model_loader.get_detector()`.
   - Never import heavy ML frameworks (like `ultralytics` or `torch`) at the module root of routers or services; keep them lazy-loaded within `app/ml/yolo_detector.py`.
6. **Security & Secrets:**
   - Never commit `.env` files, JWT secrets, or production passwords to the repository.
   - Enforce authentication via `Depends(get_current_user)` on all protected endpoints.
