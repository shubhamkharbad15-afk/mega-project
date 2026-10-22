# AI Road Quality Management System — Project Setup & Run Guide

Welcome to the **AI Road Quality Management System** repository. This document provides step-by-step instructions for teammates and developers to set up, run, and test both the FastAPI backend and the multi-terminal React frontend.

---

## Architecture Overview

```
[ Citizen Mobile Client / Web Dashboard ]
               │
               │ HTTP REST & Real-Time Multipart Image Feeds
               ▼
   [ FastAPI Monolith Backend (:8000) ]
   ├── Vision Ingestion & Scorer (YOLOv11 / OpenCV Heuristics)
   ├── PostGIS Spatial Engine (ST_DWithin 5km Incident Queries)
   ├── Municipal PDI Governance & Work-Order Triage
   └── Field Contractor SOP & 3-Stage Milestone Proofs
               │
               ▼
   [ PostgreSQL 16 + PostGIS 3.4 (:5433) ]
   (users, detections, road_reports, notifications)
```

---

## Prerequisites

Ensure you have the following installed on your machine:
1. **Python 3.11+ / 3.12**
2. **Node.js 18+ & npm**
3. **Docker Desktop** (used to run PostgreSQL with PostGIS extensions)
4. **Git**

---

## Step 1: Start the PostGIS Spatial Database

The database requires PostgreSQL 16 with the **PostGIS** geospatial extension enabled. Docker Compose handles this automatically without needing to install PostgreSQL natively.

1. Open your terminal and navigate to the backend container directory:
   ```bash
   cd ai-road-quality-backend/app
   ```

2. Start the PostGIS container:
   ```bash
   docker compose up -d postgres
   ```
   *(Note: The database runs on host port `5433` mapped to internal `5432` to avoid conflicts with any existing local PostgreSQL installations).*

3. Run database migrations with Alembic:
   ```bash
   cd ..
   source .venv/bin/activate    # On Windows: .venv\Scripts\activate
   cd app
   alembic upgrade head
   ```

---

## Step 2: Run the FastAPI Backend Server

1. From `ai-road-quality-backend`:
   ```bash
   # Activate virtual environment if not already active
   source .venv/bin/activate    # On Windows: .venv\Scripts\activate

   # Install dependencies (first time only)
   pip install -r app/requirements.txt

   # Start the FastAPI Uvicorn development server
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Verify backend status:
   * **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   * **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Step 3: Run the React & Tailwind Frontend (Web Portal)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd ai-road-quality-frontend
   ```

2. Install dependencies (first time only):
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Access the application:
   * **Local Desktop Browser:** [http://localhost:5173](http://localhost:5173)
   * **Mobile Device on Same Wi-Fi:** Open `http://<YOUR-LOCAL-IP>:5173` (e.g. `http://192.168.0.100:5173`) on your iPhone or Android browser.

---

## Step 4: Run the React Native Mobile Sensing App (iOS / Android)

1. Open a new terminal window and navigate to the mobile directory:
   ```bash
   cd ai-road-quality-mobile
   ```

2. Install dependencies (first time only):
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Open on your phone:
   * Install **Expo Go** from the App Store (iOS) or Play Store (Android).
   * Scan the terminal QR code to run the live mobile app on your physical device with native camera and accelerometer vibration sensing.

---

## Navigating the 4 Stakeholder Terminals

Use the left navigation sidebar to switch between operational personas:

### 1. Citizen Sensing & Reporting Terminal
* **Live Camera Stream:** Runs real-time road cavity detection.
* **Good Road vs. Pothole Accuracy:** Clean, smooth roads display `✓ ROAD SOUND` (0% Risk). Potholes trigger real bounding boxes and severity scoring.
* **Mobile Hardware Camera:** On mobile devices accessing over local Wi-Fi, tap **"Snap with Phone Camera"** to trigger the phone's native camera hardware directly.
* **GIS Spatial Map:** Visualizes registered incidents within a 5 km radius using PostGIS coordinates (`SRID 4326`).
* **AI Advice Assistant:** Generates eco-friendly repair recommendations (Cold/Warm Mix asphalt, RAP recycling ratios, and IRC specifications).

### 2. Municipal Command Center (Government)
* **Pavement Distress Index (PDI):** Ward-level health monitoring (ASTM D6433 standards).
* **Work Order Queue:** Review citizen reports and approve repair tenders to contractors.
* **SDI Audit Export:** One-click CSV export of municipal distress logs.

### 3. Field Contractor Terminal (Worker)
* **Assigned Tickets:** Step-by-step Standard Operating Procedure (SOP) safety checklist.
* **AI Eco-Material Calculator:** Computes total asphalt weight, 40% Reclaimed Asphalt (RAP) ratio, and CO2 emissions saved.
* **3-Stage Milestone Proof:** Captures before, during, and after photos for payment audit release.

### 4. MLOps & System Admin Terminal
* **Inference Telemetry:** Real-time FPS, mAP@50 metrics, and PostGIS `ST_DWithin` query latency.
* **Continuous Retraining Pipeline:** Simulates retraining cycles incorporating field milestone photos.
* **Role-Based Access Control (RBAC):** Security permissions across civic stakeholders.

---

## Running Automated Tests

To run the backend test suite:
```bash
cd ai-road-quality-backend
pytest app/tests
```

To verify the frontend production build:
```bash
cd ai-road-quality-frontend
npm run build
```
