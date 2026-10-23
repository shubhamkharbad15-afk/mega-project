# Real-world readiness checklist

This repository is a full-stack project scaffold, not a certified road-inspection product. Complete this checklist before using it for public infrastructure decisions.

## Four isolated personas

- **Citizen / Road Reporter** — public signup, submit evidence and track own/community reports.
- **Municipal Government** — triage reports, assign/approve work and review operational queues.
- **Field Contractor** — view assigned work and submit repair milestones/evidence.
- **Developer / System Administrator** — system operations and model/deployment diagnostics.

The frontend now blocks rendering a portal unless the signed-in user's backend-returned role matches that portal. This is a usability and defense-in-depth control, **not a security boundary**. Enforce authorization on every backend route and database query. Do not trust a role supplied by the browser, local storage, or request body. Provision staff accounts through a verified administrative process; public signup must never create staff roles.

## Camera and model accuracy

- Live camera access requires `localhost` or HTTPS in modern browsers; grant camera permission when prompted.
- The capture action saves an inspection frame and opens the review flow. Check the displayed source/model status before interpreting results.
- The archive does not include a trained `best.pt` checkpoint. The OpenCV heuristic fallback is not a validated ML model and must not be represented as ground-truth detection.
- Train and evaluate on representative, labeled road imagery from the target region. Report precision, recall, mAP, per-class confusion matrices, calibration, and end-to-end latency on a held-out set. Test day/night, rain, shadows, motion blur, varied camera angles, and different road surfaces.
- Use human review for consequential decisions. A model confidence score is not the probability that a road defect is real unless calibrated and validated.

## Deployment gates

1. Use PostgreSQL/PostGIS with migrations applied and encrypted backups.
2. Configure a high-entropy `JWT_SECRET_KEY`, short access-token lifetime, refresh/revocation strategy, password hashing, rate limiting, and audit logs.
3. Add server-side object-level access checks, upload size/type limits, malware scanning, image retention policy, CSRF/CORS policy, HTTPS, and secrets management.
4. Persist workflow transitions transactionally and test concurrent updates.
5. Configure mobile API URL to a trusted HTTPS endpoint; never ship production credentials in the app.
6. Run backend tests, frontend `npm ci && npm run build`, mobile smoke tests, dependency/security scans, and end-to-end role-isolation tests.
7. Load test API, database, uploads and inference; monitor latency, errors, drift and model version.
8. Do not publish fabricated ward, budget, contractor, or pavement-health values as live measurements. Label illustrative/demo values.

## Local commands (Windows PowerShell)

```powershell
# Backend
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-models.txt
Copy-Item app\.env.example app\.env
# Edit app\.env, then:
alembic upgrade head
uvicorn app.main:app --reload

# Frontend, in another terminal
cd frontend
npm ci
npm run test:priority
npm run build
npm run dev

# Expo mobile app, in another terminal
cd mobile-app
npm install
npx expo start
```

Check `README.md` for database setup and model training. A successful local startup is not equivalent to production readiness.
