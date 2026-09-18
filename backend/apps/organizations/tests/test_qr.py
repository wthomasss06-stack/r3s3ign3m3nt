"""Regeneration du QR = action sensible (invalide l'ancien lien immediatement) :
reservee au BOSS, meme le GERANT ne peut pas la declencher."""
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
