"""
Cloudflare R2 media uploads (S3-compatible).

Env:
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_R2_ACCESS_KEY_ID
  CLOUDFLARE_R2_SECRET_ACCESS_KEY
  CLOUDFLARE_R2_BUCKET          (default: am-media)
  CLOUDFLARE_R2_PUBLIC_BASE_URL (e.g. https://pub-xxxx.r2.dev)
  CLOUDFLARE_R2_ENDPOINT        (optional; default https://{account_id}.r2.cloudflarestorage.com)
"""

from __future__ import annotations

import mimetypes
import uuid
from datetime import datetime
from typing import BinaryIO

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from rest_framework.exceptions import ValidationError


def cloudflare_configured() -> bool:
    return bool(
        getattr(settings, "CLOUDFLARE_ACCOUNT_ID", "")
        and getattr(settings, "CLOUDFLARE_R2_ACCESS_KEY_ID", "")
        and getattr(settings, "CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
        and getattr(settings, "CLOUDFLARE_R2_PUBLIC_BASE_URL", "")
    )


def _r2_client():
    account_id = settings.CLOUDFLARE_ACCOUNT_ID
    endpoint = (
        getattr(settings, "CLOUDFLARE_R2_ENDPOINT", "") or ""
    ).rstrip("/") or f"https://{account_id}.r2.cloudflarestorage.com"

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _object_key(filename: str | None) -> str:
    base = (filename or "upload.bin").replace("\\", "/").split("/")[-1]
    safe = "".join(c if c.isalnum() or c in "._-" else "-" for c in base).strip("-")
    if not safe:
        safe = "upload.bin"
    stamp = datetime.utcnow().strftime("%Y/%m/%d")
    return f"products/{stamp}/{uuid.uuid4().hex[:12]}-{safe}"


def public_url_for_key(key: str) -> str:
    base = settings.CLOUDFLARE_R2_PUBLIC_BASE_URL.rstrip("/")
    return f"{base}/{key.lstrip('/')}"


def upload_image_file(file_obj: BinaryIO, filename: str | None = None) -> str:
    """
    Upload a file to Cloudflare R2 bucket and return the public object URL.
    Railway DB stores only that URL — never the binary.
    """
    if not cloudflare_configured():
        raise ValidationError(
            {
                "detail": (
                    "Cloudflare R2 is not configured. Set CLOUDFLARE_ACCOUNT_ID, "
                    "CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, "
                    "and CLOUDFLARE_R2_PUBLIC_BASE_URL (bucket am-media), "
                    "or paste an image_url instead."
                )
            }
        )

    name = filename or getattr(file_obj, "name", None) or "upload.jpg"
    key = _object_key(name)
    content_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
    bucket = getattr(settings, "CLOUDFLARE_R2_BUCKET", "am-media") or "am-media"

    try:
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)
        client = _r2_client()
        client.upload_fileobj(
            file_obj,
            bucket,
            key,
            ExtraArgs={"ContentType": content_type},
        )
    except (BotoCoreError, ClientError, OSError) as exc:
        raise ValidationError({"detail": f"R2 upload failed: {exc}"}) from exc

    return public_url_for_key(key)
