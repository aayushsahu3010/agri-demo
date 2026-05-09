"""
/api/v1/predict — Core AI Disease Detection Endpoint
─────────────────────────────────────────────────────────────────
POST /api/v1/predict/scan
  - Accepts: multipart/form-data with field 'image'
  - Returns: JSON with disease, confidence, severity, treatment

This is the central endpoint connecting React Native → FastAPI → AI Model
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user
from app.services.model_service import ModelService
from app.services.treatment_service import get_treatment
from app.services.storage_service import StorageService
from app.core.config import settings

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_FILE_SIZE_MB = 10


# ─── Response Schemas ──────────────────────────────────────────
class PredictionTop3(BaseModel):
    label: str
    confidence: float


class ScanResponse(BaseModel):
    scan_id: str
    timestamp: str
    disease: str
    disease_name_en: str
    disease_name_hi: str
    confidence: float
    severity: str
    is_healthy: bool
    top_3: list[PredictionTop3]
    image_url: str
    treatment: dict
    message_en: str
    message_hi: str


# ─── Endpoint ──────────────────────────────────────────────────
@router.post(
    "/scan",
    response_model=ScanResponse,
    summary="Scan crop leaf image for disease",
    description="""
    Upload a crop leaf photo and receive instant AI-powered disease diagnosis.
    
    **Supported formats:** JPEG, PNG, WebP, HEIC  
    **Max file size:** 10 MB  
    **Auth:** Bearer JWT token required  
    
    Returns disease name (English + Hindi), confidence score, severity level,
    top-3 predictions, and treatment recommendations.
    """,
)
async def scan_crop(
    image: UploadFile = File(..., description="Crop leaf image (JPEG/PNG)"),
    current_user_id: str = Depends(get_current_user),
):
    # ── Validate file type ────────────────────────────────────
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{image.content_type}'. Use JPEG, PNG, or WebP.",
        )

    # ── Read & validate file size ─────────────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
        )

    # ── AI Inference ──────────────────────────────────────────
    try:
        prediction = ModelService.predict(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI inference failed: {str(e)}",
        )

    # ── Upload image to S3 ────────────────────────────────────
    image_url = await StorageService.upload_image(
        image_bytes=image_bytes,
        user_id=current_user_id,
        content_type=image.content_type,
    )

    # ── Get Treatment Recommendations ─────────────────────────
    treatment = get_treatment(prediction["disease"])

    # ── Build Response ────────────────────────────────────────
    scan_id = str(uuid.uuid4())
    is_healthy = prediction["is_healthy"]
    confidence_pct = round(prediction["confidence"] * 100, 1)

    if is_healthy:
        msg_en = f"Great news! Your crop appears healthy ({confidence_pct}% confidence)."
        msg_hi = f"अच्छी खबर! आपकी फसल स्वस्थ दिखती है ({confidence_pct}% विश्वास)।"
    else:
        msg_en = f"{treatment['disease_name_en']} detected with {confidence_pct}% confidence. Immediate action recommended."
        msg_hi = f"{treatment['disease_name_hi']} {confidence_pct}% विश्वास से पहचाना गया। तत्काल कार्रवाई की सलाह है।"

    return ScanResponse(
        scan_id=scan_id,
        timestamp=datetime.utcnow().isoformat() + "Z",
        disease=prediction["disease"],
        disease_name_en=treatment["disease_name_en"],
        disease_name_hi=treatment["disease_name_hi"],
        confidence=prediction["confidence"],
        severity=prediction["severity"],
        is_healthy=is_healthy,
        top_3=[PredictionTop3(**item) for item in prediction["top_3"]],
        image_url=image_url,
        treatment=treatment,
        message_en=msg_en,
        message_hi=msg_hi,
    )


# ─── Test endpoint (no auth, for dev/testing) ─────────────────
@router.post(
    "/scan/test",
    summary="[DEV ONLY] Test scan without authentication",
    include_in_schema=settings.DEBUG,
)
async def scan_crop_test(
    image: UploadFile = File(...),
):
    """Development-only endpoint — bypasses auth for quick testing."""
    image_bytes = await image.read()
    prediction = ModelService.predict(image_bytes)
    treatment = get_treatment(prediction["disease"])
    return {
        "prediction": prediction,
        "treatment_preview": {
            "disease_name_en": treatment["disease_name_en"],
            "disease_name_hi": treatment["disease_name_hi"],
            "urgency": treatment["urgency"],
        },
    }
