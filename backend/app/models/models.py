"""SQLAlchemy ORM Models for CROOPIC"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id                 = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name               = Column(String(100), nullable=False)
    phone              = Column(String(15), unique=True, nullable=False, index=True)
    email              = Column(String(255), unique=True, nullable=True)
    hashed_password    = Column(String(255), nullable=False)
    state              = Column(String(50), nullable=True)          # Indian state
    preferred_language = Column(String(5), default="en")           # "en" | "hi"
    subscription_tier  = Column(String(20), default="free")        # free | pro | expert
    scans_used         = Column(Integer, default=0)
    is_active          = Column(Boolean, default=True)
    created_at         = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id               = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id          = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    image_url        = Column(String(500), nullable=False)
    disease_label    = Column(String(200), nullable=False)
    disease_name_en  = Column(String(200), nullable=False)
    disease_name_hi  = Column(String(200), nullable=False)
    confidence       = Column(Float, nullable=False)
    severity         = Column(String(20), nullable=False)           # High | Medium | Low | None
    is_healthy       = Column(Boolean, nullable=False)
    top_3_json       = Column(JSON, nullable=True)
    treatment_json   = Column(JSON, nullable=True)
    crop_type        = Column(String(100), nullable=True)           # user-provided crop info
    created_at       = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans")
