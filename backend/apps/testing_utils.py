"""Fonctions utilitaires de test (pas des fixtures pytest) — importees explicitement
la ou elles servent, contrairement a conftest.py qui est auto-decouvert."""
import uuid
from datetime import UTC, datetime

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


def auth_client(user) -> APIClient:
    client = APIClient()
    access = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


def valid_checkin_payload(qr_token: str, **overrides) -> dict:
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "qr_token": qr_token,
        "responses": {"nom": "Kouassi Jean", "telephone": "+2250707070707"},
        "signature_blob": "data:image/png;base64,iVBORw0KGgo=",
        "created_at_client": datetime.now(UTC).isoformat(),
    }
    payload.update(overrides)
    return payload
