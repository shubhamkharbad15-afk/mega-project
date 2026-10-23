# AI Road QA — Upgrade Pass 2

This is an incremental, source-preserving upgrade of the supplied project archive. Existing Citizen, Municipal, Field Contractor, MLOps/Admin, map, PWA, FastAPI, and Expo app areas have been retained.

## Delivered in this pass

### UI and accessibility
- Added a persistent light/dark theme toggle in the desktop operational bar and mobile header.
- Theme preference is stored in browser local storage and restored on reload.
- Added dark palette overrides for shared app chrome, common cards, text, borders, forms, and status colors.
- Added reduced-motion handling and a live status announcement for data provenance.
- Added a refresh control for backend health and report data.

### Municipal report triage
- Added search across report title, description, defect type, location, ID, and contractor.
- Added severity and workflow-status filters.
- Reports are sorted by an explainable, deterministic operational priority score.
- Added CSV export of the filtered queue with report fields and score/label columns.
- Added an empty state when no reports match the current filters.

### Transparent priority scoring
The score is a prototype triage aid (0–100), not a validated risk probability, official pavement rating, ASTM D6433 calculation, or replacement for an inspection. It uses existing report fields only:
- Severity: up to 60 points.
- Community confirmations/upvotes: up to 20 points.
- Workflow status: up to 15 points.
- Coordinates present: up to 5 points.

The breakdown can be inspected by hovering over the score. Unit tests cover factor reconciliation, missing location, score caps, and negative upvote handling.

### Honest data provenance
- The application now visibly distinguishes reports returned by the backend API from local sample records.
- The nearby-report client no longer silently mixes sample titles, locations, budget, and contractor data into backend records.
- Detection fallback responses now identify themselves as client fallback/demo output and carry a warning; they must not be interpreted as successful image inference.
- Ward and contractor cards are explicitly labelled illustrative rather than live measurements.

## Verification performed
- `node --test frontend/tests/priorityScore.test.js`: **passed (3 tests)**.
- `python -m compileall -q backend/app`: **passed** (Python syntax compilation only; not an integration test).
- `npm ci --no-audit --no-fund`: **timed out in this environment**. As a result, `vite` was unavailable and a production frontend build could not be verified here. Run the frontend build on a machine with working npm registry access before presenting/deploying this project.

## Model status — important
- The supplied archive does not contain a trained YOLO checkpoint (`best.pt`).
- `backend/app/ml/model_loader.py` selects the existing OpenCV/heuristic fallback when the YOLO checkpoint or Ultralytics dependency is unavailable.
- No accuracy, precision, recall, F1, latency benchmark, or field-validation result is claimed by this upgrade.
- Ward PDI, city health rating, contractor performance, budget, and eco-material figures that are hard-coded in the existing UI remain illustrative prototype values; they are not presented as live verified telemetry.

## Known limitations / next engineering work
- Existing auth and some non-report API calls still contain legacy client fallbacks. Review and remove demo authentication before any real deployment; the UI must not be treated as production-secure authorization.
- Municipal approval and contractor workflow updates currently update client-side state. Persisting work-order changes requires a backend workflow endpoint and database transaction.
- The existing mobile app was retained but not rebuilt or tested in this environment.
- Run the full backend test suite and frontend build locally; then do an end-to-end test with a configured database, backend, and actual labeled image set.

## Operational workflow upgrade (Pass 2)

- Added a real sign-in/register dialog and role-aware terminal navigation. Public registration creates citizen accounts only; staff access is assigned by an authorized administrator.
- Removed silent local/mock success for register, login, current-user lookup, and report submission.
- Protected detection/report creation with authentication; municipal/contractor/admin roles are required for workflow updates.
- Added persisted report assignment, budget, resolution-note and updated-at fields with Alembic migration `0002_report_workflow.py`.
- Added a guarded workflow update endpoint with explicit allowed status transitions. Government approval and field repair completion now call the backend and only update the UI after a successful response.
- Added 30-second dashboard refresh while open; this is polling, not a WebSocket push feed.
- Added `REAL_WORLD_READINESS.md` with database migration, role provisioning, security and deployment requirements.

### Verification status

- Frontend priority unit tests: 3 passed.
- Python source compilation: passed.
- Backend pytest collection could not run in this environment because `geoalchemy2` is not installed.
- Frontend production build could not be verified because `npm ci` timed out in this environment. Run `npm ci` and `npm run build` on the target Windows machine before deployment.
- No trained YOLO checkpoint is included. Do not present fallback output as a validated ML prediction.
