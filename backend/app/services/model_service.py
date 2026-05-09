"""
CROOPIC AI Model Service
─────────────────────────────────────────────────────────────────
Loads your custom-trained PyTorch model (EfficientNet / ViT / ResNet / YOLOv8)
at app startup and serves inference requests.

Supported architectures (set MODEL_ARCHITECTURE in .env):
  - efficientnet_b4   (recommended — best accuracy/speed tradeoff)
  - efficientnet_b0   (lighter, good for low-RAM devices)
  - vit_base_patch16  (Vision Transformer)
  - resnet50
  - custom_cnn        (your own architecture — provide full model .pt)
"""

import io
import logging
import random
from pathlib import Path
from typing import Optional

import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── Demo mode flag (set automatically if weights are missing) ──
_DEMO_MODE: bool = False

# ─── Disease Class Labels (PlantVillage 38-class) ──────────────────────────
# Replace/extend this list with your own model's class labels
DISEASE_LABELS = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# ─── Lazy imports for when model IS available ───────────────────
try:
    import torch
    import torch.nn as nn
    import timm
    from PIL import Image
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False
    logger.warning("PyTorch / timm not installed. Running in demo mode.")


# ─── Demo disease pool ─────────────────────────────────────────
DEMO_DISEASES = [
    ("Rice___Leaf_Blast",            "High"),
    ("Rice___Bacterial_leaf_blight", "High"),
    ("Rice___Brown_Spot",            "Medium"),
    ("Rice___healthy",               "None"),
]


def _demo_predict() -> dict:
    """Generate a realistic-looking random prediction for demo/dev mode."""
    primary = random.choice(DEMO_DISEASES)
    others  = random.sample([d for d in DISEASE_LABELS if d != primary[0]], 2)

    conf_primary = round(random.uniform(0.68, 0.97), 4)
    conf_second  = round(random.uniform(0.01, (1 - conf_primary) * 0.8), 4)
    conf_third   = round(1 - conf_primary - conf_second, 4)

    disease    = primary[0]
    is_healthy = "healthy" in disease.lower()

    return {
        "disease":    disease,
        "confidence": conf_primary,
        "severity":   "None" if is_healthy else primary[1],
        "is_healthy": is_healthy,
        "top_3": [
            {"label": disease,    "confidence": conf_primary},
            {"label": others[0],  "confidence": conf_second},
            {"label": others[1],  "confidence": conf_third},
        ],
    }


# ─── Image Preprocessing ────────────────────────────────────────
IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]


def preprocess_image(image_bytes: bytes):
    """Convert raw image bytes → normalized tensor (1, 3, H, W)"""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(image, dtype=np.float32) / 255.0
    arr = (arr - np.array(MEAN)) / np.array(STD)
    tensor = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0)
    return tensor


# ─── Model Service ──────────────────────────────────────────────
class ModelService:
    _model: Optional[nn.Module] = None
    _device: torch.device = torch.device("cpu")

    @classmethod
    def load_model(cls):
        """Load model at startup. Switches to demo mode if weights or torch are missing."""
        global _DEMO_MODE

        if settings.DEMO_MODE:
            _DEMO_MODE = True
            logger.warning("🧪  DEMO_MODE=True in config. Using random predictions — no weights needed.")
            return

        if not _TORCH_AVAILABLE:
            _DEMO_MODE = True
            logger.warning("🧪  PyTorch not available. Falling back to demo mode.")
            return

        arch       = settings.MODEL_ARCHITECTURE
        model_path = Path(settings.MODEL_PATH)

        if not model_path.exists():
            _DEMO_MODE = True
            logger.warning(
                f"🧪  Weights not found at '{model_path}'. "
                "Switching to DEMO MODE — random predictions will be used. "
                "Train your model and place weights at that path to enable real inference."
            )
            return

        logger.info(f"Loading AI model: arch={arch}, path={model_path}")

        if arch == "custom_cnn":
            cls._model = torch.load(model_path, map_location=cls._device)
        else:
            cls._model = timm.create_model(arch, pretrained=False, num_classes=settings.NUM_CLASSES)
            state = torch.load(model_path, map_location=cls._device)
            if "model_state_dict" in state:
                state = state["model_state_dict"]
            cls._model.load_state_dict(state, strict=False)
            logger.info("✅ Model weights loaded successfully")

        cls._model.to(cls._device)
        cls._model.eval()

    @classmethod
    def predict(cls, image_bytes: bytes) -> dict:
        """Run inference. Falls back to demo prediction if model is not loaded."""
        if _DEMO_MODE or cls._model is None:
            return _demo_predict()

        tensor = preprocess_image(image_bytes).to(cls._device)

        with torch.no_grad():
            logits = cls._model(tensor)
            probs  = torch.softmax(logits, dim=1)[0]

        top_k_probs, top_k_idx = torch.topk(probs, k=3)

        top_disease    = DISEASE_LABELS[top_k_idx[0].item()]
        top_confidence = round(top_k_probs[0].item(), 4)
        is_healthy     = "healthy" in top_disease.lower()

        return {
            "disease":    top_disease,
            "confidence": top_confidence,
            "severity":   cls._get_severity(top_confidence, is_healthy),
            "is_healthy": is_healthy,
            "top_3": [
                {
                    "label":      DISEASE_LABELS[top_k_idx[i].item()],
                    "confidence": round(top_k_probs[i].item(), 4),
                }
                for i in range(3)
            ],
        }

    @staticmethod
    def _get_severity(confidence: float, is_healthy: bool) -> str:
        if is_healthy:
            return "None"
        if confidence >= 0.85:
            return "High"
        if confidence >= 0.70:
            return "Medium"
        return "Low"
