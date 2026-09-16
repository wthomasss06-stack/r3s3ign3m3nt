import uuid
from datetime import UTC, datetime

import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.checkins.models import FormTemplate
from apps.organizations.models import Organization

DEFAULT_SCHEMA = [
    {"id": "nom", "type": "text", "label": "Nom & Prénoms", "required": True},
    {"id": "telephone", "type": "phone", "label": "Téléphone", "required": True},
    {"id": "signature", "type": "signature", "label": "Signature", "required": True},
]


@pytest.fixture
def organization(db):
    return Organization.objects.create(name="Cabinet Test", qr_secure_token="test-token-123")


@pytest.fixture
def form_template(db, organization):
    return FormTemplate.objects.create(organization=organization, title="Registre", fields_schema=DEFAULT_SCHEMA)


@pytest.fixture
def boss_user(db, organization):
    return User.objects.create_user(email="patron@example.com", role=User.Role.BOSS, organization=organization)


@pytest.fixture
def staff_user(db, organization):
    return User.objects.create_user(email="agent@example.com", role=User.Role.STAFF, organization=organization)


@pytest.fixture
def api_client():
    return APIClient()


def auth_client(user) -> APIClient:
    from rest_framework_simplejwt.tokens import RefreshToken

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
