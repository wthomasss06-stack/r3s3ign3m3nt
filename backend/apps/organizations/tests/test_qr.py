"""Regeneration du QR = action sensible (invalide l'ancien lien immediatement) :
reservee au BOSS, meme le GERANT ne peut pas la declencher."""
from django.test import override_settings

from apps.testing_utils import auth_client


def test_boss_can_regenerate_qr(db, boss_user, organization):
    client = auth_client(boss_user)
    old_token = organization.qr_secure_token

    response = client.post("/api/v1/org/me/regenerate-qr/")

    assert response.status_code == 200
    organization.refresh_from_db()
    assert organization.qr_secure_token != old_token


def test_gerant_cannot_regenerate_qr(db, gerant_user, organization):
    client = auth_client(gerant_user)
    old_token = organization.qr_secure_token

    response = client.post("/api/v1/org/me/regenerate-qr/")

    assert response.status_code == 403
    organization.refresh_from_db()
    assert organization.qr_secure_token == old_token


@override_settings(CLOUDINARY_CLOUD_NAME="demo", CLOUDINARY_API_KEY="key", CLOUDINARY_API_SECRET="secret")
def test_boss_can_request_cloudinary_signature_without_secret(db, boss_user, organization):
    response = auth_client(boss_user).post("/api/v1/org/uploads/cloudinary-signature/", {}, format="json")
    assert response.status_code == 200
    assert response.data["cloud_name"] == "demo"
    assert response.data["api_key"] == "key"
    assert "signature" in response.data
    assert "api_secret" not in response.data
