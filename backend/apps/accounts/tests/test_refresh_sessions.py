from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import RefreshSession


def test_refresh_token_rotates_and_old_token_is_rejected(db, boss_user):
    refresh = RefreshToken.for_user(boss_user)
    RefreshSession.objects.create(
        user=boss_user,
        jti=str(refresh["jti"]),
        expires_at=timezone.now() + timedelta(days=1),
    )
    client = APIClient()
    client.cookies["qr_refresh_token"] = str(refresh)

    rotated = client.post("/api/v1/auth/token/refresh/")

    assert rotated.status_code == 200
    assert rotated.data["access"]
    assert RefreshSession.objects.filter(user=boss_user, revoked_at__isnull=False).count() == 1
    assert RefreshSession.objects.filter(user=boss_user, revoked_at__isnull=True).count() == 1

    old_client = APIClient()
    old_client.cookies["qr_refresh_token"] = str(refresh)
    rejected = old_client.post("/api/v1/auth/token/refresh/")

    assert rejected.status_code == 401
