import pytest
from django.test import override_settings

from apps.feedback.models import Feedback
from apps.testing_utils import auth_client


@pytest.mark.django_db
def test_public_feedback_is_saved(api_client):
    response = api_client.post("/api/v1/feedback/", {"category": "bug", "message": "Le bouton ne répond pas", "page_url": "https://example.com/"}, format="json")
    assert response.status_code == 201
    assert Feedback.objects.filter(category="bug").count() == 1


@pytest.mark.django_db
def test_platform_admin_can_login_and_read_overview(api_client, organization):
    with override_settings(PLATFORM_ADMIN_EMAIL="admin@example.com", PLATFORM_ADMIN_PASSWORD="a" * 20):
        login = api_client.post("/api/v1/admin/login/", {"email": "admin@example.com", "password": "a" * 20}, format="json")
        assert login.status_code == 200
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        overview = api_client.get("/api/v1/admin/overview/")
    assert overview.status_code == 200
    assert overview.data["organizations"] == 1


@pytest.mark.django_db
def test_regular_member_cannot_read_platform_admin(api_client, boss_user):
    response = auth_client(boss_user).get("/api/v1/admin/overview/")
    assert response.status_code == 403
