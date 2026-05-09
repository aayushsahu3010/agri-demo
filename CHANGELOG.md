# CROOPIC — Changelog

> All changes are listed newest-first.

---

## Session 3 — 2026-05-09 (This Session) · Demo / Mock Mode

### Files Created / Modified

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 1 | `mobile/src/services/mockData.ts` | **NEW** | 6 realistic mock scan responses (4 diseased crops, 2 healthy). Each has full EN+HI treatment data, confidence scores, top-3 predictions, prevention tips. Cycles through them in sequence. |
| 2 | `mobile/src/services/api.ts` | **MODIFIED** | Added `DEMO_MODE = true` flag at the top. When `true`: `login()` / `register()` accept any credentials and return a fake token. `scanCrop()` waits 2.2 s (simulates network), then returns the next mock scan result using the local image URI. |
| 3 | `mobile/src/screens/main/HomeScreen.tsx` | **MODIFIED** | Added amber `⚗ Demo Mode` info banner below the header that only shows when `DEMO_MODE = true`. |
| 4 | `backend/app/core/config.py` | **MODIFIED** | Added `DEMO_MODE: bool = False` setting. Set via `.env`. |
| 5 | `backend/app/services/model_service.py` | **MODIFIED** | Three-layer fallback: `DEMO_MODE=True` in config → no weights file → PyTorch not installed. Any of these triggers demo mode automatically. Added `_demo_predict()` that returns a random realistic disease result with proper confidence distribution. Torch/timm now imported lazily inside try/except so the backend starts even without them installed. |
| 6 | `backend/.env.demo` | **NEW** | Drop-in `.env` for zero-config demo start. Uses SQLite (no PostgreSQL), `DEMO_MODE=True`, dummy JWT secret. Just run `cp .env.demo .env`. |
| 7 | `backend/requirements.txt` | **MODIFIED** | Added `aiosqlite==0.20.0` so SQLite async engine works for demo mode. |

### UI & Demo Mode Tweaks (Late Session 3)

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 1 | `mobile/src/services/api.ts` & `AuthContext.tsx` | **MODIFIED** | Web Crash Fix: Replaced direct `expo-secure-store` calls with a platform-aware helper (`getStorageItem`, `setStorageItem`) that safely falls back to `localStorage` on the Web. |
| 2 | `mobile/src/services/mockData.ts` & `model_service.py` | **MODIFIED** | Paddy Swap: Changed all demo mock data to use Paddy (Rice) diseases (Leaf Blast, Bacterial Blight, Brown Spot, Healthy) instead of mixed crops. |
| 3 | `mobile/src/screens/auth/LoginScreen.tsx` | **MODIFIED** | UI Polish: Replaced generic leaf icon with company logo `assets/logo.png`. |
| 4 | `mobile/src/screens/main/HomeScreen.tsx` | **MODIFIED** | UX Flow: Updated the "Start Scan" Hero CTA to pass `{ autoLaunch: true }` parameter to ScanScreen. |
| 5 | `mobile/src/screens/main/ScanScreen.tsx` | **MODIFIED** | UX Flow: Added `useEffect` to listen for `autoLaunch`. Automatically opens the camera when navigated from the Home CTA. |
| 6 | `mobile/src/screens/main/ResultScreen.tsx` | **MODIFIED** | UI Polish: Removed the 🇬🇧/🇮🇳 country flag emojis from the language toggle per user request. |

### Demo Mode Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DEMO_MODE = true                      │
│                  (flip one line to go live)              │
├────────────────────────┬────────────────────────────────┤
│     MOBILE (api.ts)    │     BACKEND (model_service.py) │
│                        │                                 │
│  login()  ──────────── │ ──► fake token (no DB hit)     │
│  register() ────────── │ ──► fake token (no DB hit)     │
│  scanCrop() ─── 2.2s ──│ ──► random result (no .pt)     │
│    ↓ uses local URI    │     ↑ auto-detected:            │
│    ↓ for image display │       no weights file           │
│    ↓ → ResultScreen    │       or DEMO_MODE=True in .env │
└────────────────────────┴────────────────────────────────┘
```

### How to Enable/Disable

| Layer | File | Change |
|---|---|---|
| **Mobile only** (no backend) | `mobile/src/services/api.ts` line 6 | `DEMO_MODE = true` → `false` |
| **Backend** (with backend running) | `backend/.env` | `DEMO_MODE=True` → `False` or remove |



---

## Session 2 — 2026-05-09 (This Session)

### Files Created / Changed

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 1 | `mobile/App.tsx` | **OVERWRITTEN** | Replaced the default Expo placeholder. Now wraps the app in `GestureHandlerRootView`, `SafeAreaProvider`, and `AuthProvider`, then renders `AppNavigator`. |
| 2 | `mobile/src/navigation/AppNavigator.tsx` | **NEW** | Root navigator. Shows `AuthStack` (Login → Register) when logged-out, and `MainTabs + ResultScreen` when logged-in. Auth state driven by `AuthContext`. |
| 3 | `mobile/src/screens/main/HomeScreen.tsx` | **NEW** | Dashboard. Farmer greeting, hero CTA "Scan Your Crop", three stat cards (Total / Diseased / Healthy), recent 5 scans list, pro-tip card. Pull-to-refresh. |
| 4 | `mobile/src/screens/main/ScanScreen.tsx` | **NEW** | Scan flow. Camera and Gallery entry points via `expo-image-picker`. Preview image, then "Analyse Crop →" calls `POST /predict/scan`, saves to local history, navigates to ResultScreen. |
| 5 | `mobile/src/screens/main/ResultScreen.tsx` | **NEW** | AI diagnosis view. Leaf image, disease name + severity banner, EN ↔ HI language toggle, confidence percentage, top-3 prediction bars, chemical treatments, organic treatments, prevention tips, urgency label, Share button. |
| 6 | `mobile/src/screens/main/HistoryScreen.tsx` | **NEW** | Chronological list of all on-device scans. FlatList with thumbnail, disease name (EN + HI), severity badge, confidence. Tap → ResultScreen. Trash icon clears all. Pull-to-refresh. |
| 7 | `mobile/src/screens/main/ProfileScreen.tsx` | **NEW** | User profile. Gradient avatar, name/phone, Account section, App section (version, privacy, terms, help), Log-out with confirmation Alert. |
| 8 | `mobile/src/services/historyStore.ts` | **NEW** | On-device persistence via `expo-file-system`. Reads/writes `scan_history.json`. Functions: `getHistory()`, `saveToHistory(scan)`, `clearHistory()`. Max 50 entries. |

### Navigation Structure

```
App.tsx
└── AuthProvider
    └── AppNavigator (NavigationContainer)
        ├── AuthStack          ← shown when NOT logged in
        │   ├── LoginScreen
        │   └── RegisterScreen
        └── MainStack          ← shown when logged in
            ├── MainTabs (Bottom Tab Navigator)
            │   ├── HomeScreen      (tab: Home)
            │   ├── ScanScreen      (tab: Scan)
            │   ├── HistoryScreen   (tab: History)
            │   └── ProfileScreen   (tab: Profile)
            └── ResultScreen        (slide_from_bottom animation)
```

### Data Flow

```
ScanScreen ──POST /predict/scan──► FastAPI Backend
           ──saveToHistory()─────► local scan_history.json
           ──navigate('Result')──► ResultScreen

HomeScreen / HistoryScreen ──getHistory()──► local scan_history.json
```

---

## Session 1 — 2026-05-09 (Previous Session)

### Files Created

| # | File | What It Does |
|---|------|--------------|
| 1 | `README.md` | Project overview |
| 2 | `backend/requirements.txt` | All Python deps (FastAPI, SQLAlchemy, PyTorch, Pillow, boto3…) |
| 3 | `backend/.env.example` | Environment config template |
| 4 | `backend/main.py` | FastAPI app entry + lifespan AI model preload |
| 5 | `backend/app/core/config.py` | Pydantic settings from `.env` |
| 6 | `backend/app/core/database.py` | Async SQLAlchemy engine + session factory |
| 7 | `backend/app/core/security.py` | JWT token create/verify, bcrypt password hashing |
| 8 | `backend/app/api/v1/router.py` | Central v1 router (auth + predict) |
| 9 | `backend/app/api/v1/endpoints/auth.py` | POST /auth/register, /auth/login, GET /auth/me |
| 10 | `backend/app/api/v1/endpoints/predict.py` | POST /predict/scan — AI disease inference |
| 11 | `backend/app/services/model_service.py` | PyTorch EfficientNet inference engine (loads at startup) |
| 12 | `backend/app/services/treatment_service.py` | EN + HI treatment recommendation database |
| 13 | `backend/app/services/storage_service.py` | AWS S3 image upload with dev fallback |
| 14 | `backend/app/models/models.py` | SQLAlchemy ORM: User + Scan tables |
| 15 | `ai_model/train.py` | EfficientNet-B4 training script (PlantVillage, 38 classes) |
| 16 | `mobile/` | Expo React Native project (blank-typescript template) |
| 17 | `mobile/src/constants/theme.ts` | Design tokens (COLORS, FONTS, SPACING, RADIUS) |
| 18 | `mobile/src/context/AuthContext.tsx` | JWT auth context + SecureStore persistence |
| 19 | `mobile/src/services/api.ts` | Axios client with JWT interceptor + typed methods |
| 20 | `mobile/src/screens/auth/LoginScreen.tsx` | Login screen |
| 21 | `mobile/src/screens/auth/RegisterScreen.tsx` | Register screen |

---

## What's Left (Next Steps)

- [ ] Set up PostgreSQL + run Alembic migrations (`alembic upgrade head`)
- [ ] Copy `.env.example` → `.env` and fill in real credentials
- [ ] Download PlantVillage dataset and run `ai_model/train.py`
- [ ] Place trained weights at `ai_model/weights/model.pt`
- [ ] Start backend: `cd backend && uvicorn main:app --reload`
- [ ] Start mobile: `cd mobile && npx expo start`
- [ ] Test full end-to-end scan flow on a physical device / emulator
- [ ] Add Razorpay subscription paywall for premium features
- [ ] Add Expo push notifications for disease alerts
- [ ] Deploy backend to AWS EC2 or Railway
