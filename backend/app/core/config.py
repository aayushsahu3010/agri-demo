from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "CROOPIC"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str

    DATABASE_URL: str

    MODEL_PATH: str = "./ai_model/weights/croopic_model.pt"
    MODEL_ARCHITECTURE: str = "efficientnet_b4"
    CONFIDENCE_THRESHOLD: float = 0.70
    NUM_CLASSES: int = 38
    # Set DEMO_MODE=True in .env to skip model loading — no weights needed
    DEMO_MODE: bool = False

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "croopic-leaf-images"

    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    ALLOWED_ORIGINS: List[str] = ["http://localhost:8081"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
