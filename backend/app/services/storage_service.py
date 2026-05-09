"""
AWS S3 Storage Service
Handles upload of leaf scan images and returns public URLs.
"""
import uuid
import boto3
from botocore.exceptions import ClientError
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
        return cls._client

    @classmethod
    async def upload_image(cls, image_bytes: bytes, user_id: str, content_type: str = "image/jpeg") -> str:
        """Upload image to S3 and return the public URL."""
        key = f"scans/{user_id}/{uuid.uuid4()}.jpg"
        try:
            cls.get_client().put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=image_bytes,
                ContentType=content_type,
            )
            url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            # Fallback: return placeholder during development
            return f"https://placeholder.croopic.in/scans/{key}"
