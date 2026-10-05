# AI Road Quality Management System

## Backend

FastAPI modular-monolith backend for an AI-powered road-defect sensing
and citizen reporting platform.

## Scope

The implementation focuses on the citizen/user application.

Included:

- User registration
- JWT authentication
- Road-damage detection API
- Image upload
- Geo-tagged detections
- Citizen road reports
- Report history
- Nearby road reports
- Analytics
- Notifications
- AI-assisted repair guidance
- ML abstraction layer
- Mock detector
- Future YOLO adapter

Excluded:

- Government portal
- Worker portal
- Contractor management
- Government approval workflow
- Developer/Admin portal

## Architecture

React Native / Mobile App
        |
        v
FastAPI Backend
        |
        +----------------------+
        |                      |
        v                      v
PostgreSQL + PostGIS      ML Detector
                              |
                       +------+------+
                       |             |
                       v             v
                   MockDetector   YOLODetector

## API Base URL

/api/v1

## Main endpoints

### Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

### Users

GET /api/v1/users/me

### Detection

POST /api/v1/detections/

### Reports

POST /api/v1/reports/
GET  /api/v1/reports/
GET  /api/v1/reports/{report_id}

### GIS

GET /api/v1/locations/nearby

### Analytics

GET /api/v1/analytics/summary

### Notifications

GET /api/v1/notifications/

### AI Repair Assistant

POST /api/v1/assistant/repair-advice

## Development

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Swagger:

http://127.0.0.1:8000/docs

## ML

The default provider is:

ML_PROVIDER=mock

The real trained model can later be enabled through:

ML_PROVIDER=yolo

MODEL_PATH=models/best.pt

The API contract remains unchanged.

## Database

The PostgreSQL/PostGIS layer is defined but does not need to be
connected for the initial architecture showcase.