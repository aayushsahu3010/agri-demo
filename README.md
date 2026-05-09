# 🌾 CROOPIC — AI-Powered Smart Agriculture Platform

> B2C AI platform for Indian farmers — Detect crop diseases instantly using Computer Vision.

## Architecture
```
React Native App → FastAPI Backend → Custom AI Model → PostgreSQL + S3 → JSON Response → Farmer Dashboard
```

## Monorepo Structure
```
croopic/
├── backend/          # FastAPI Python backend
├── mobile/           # React Native app
├── ai_model/         # Model training & export scripts
└── docs/             # Architecture & API docs
```

## Tech Stack
| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Backend | FastAPI (Python 3.11) |
| AI Inference | Custom Model via FastAPI endpoint |
| Database | PostgreSQL (via SQLAlchemy) |
| Storage | AWS S3 / Firebase Storage |
| Auth | JWT (FastAPI-Users) |
| Payments | Razorpay |
| Languages | English + Hindi |

## Quick Start
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Mobile
cd mobile && npm install && npx expo start
```
# agri-demo
