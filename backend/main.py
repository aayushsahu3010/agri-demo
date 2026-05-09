"""
CROOPIC FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables & load AI model"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Pre-load model into memory at startup
    from app.services.model_service import ModelService
    ModelService.load_model()
    print("✅ CROOPIC backend started. AI model loaded.")
    yield
    print("🛑 CROOPIC backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered crop disease detection API for Indian farmers",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
