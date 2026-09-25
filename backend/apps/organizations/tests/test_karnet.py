"""Bascule KARNET (Niveau 2) : reservee au BOSS, capacites calculees cote serveur,
chaque changement trace dans AuditEvent — le frontend ne fait jamais ce calcul."""
from apps.accounts.models import AuditEvent
from apps.testing_utils import auth_client


def test_default_capabilities_are_registration_only(db, boss_user, organization):
    response = auth_client(boss_user).get("/api/v1/org/me/")

    assert response.status_code == 200
    assert response.data["karnet_enabled"] is False
    assert response.data["capabilities"] == {
        "registration": True,
        "karnet": False,
        "reservations": False,
        "payments": False,
        "rappels": False,
    }


def test_boss_can_enable_karnet(db, boss_user, organization):
    response = auth_client(boss_user).patch("/api/v1/org/me/karnet/", {"karnet_enabled": True}, format="json")

    assert response.status_code == 200
    assert response.data["karnet_enabled"] is True
    assert response.data["capabilities"]["karnet"] is True
    assert response.data["capabilities"]["reservations"] is False  # pas activee individuellement
    organization.refresh_from_db()
    assert organization.karnet_enabled is True
    event = AuditEvent.objects.get(organization=organization, action="organization.karnet_enabled")
    assert event.actor == boss_user
    assert event.metadata == {"previous": False, "next": True}


def test_boss_can_disable_karnet(db, boss_user, organization):
    client = auth_client(boss_user)
    client.patch("/api/v1/org/me/karnet/", {"karnet_enabled": True}, format="json")

    response = client.patch("/api/v1/org/me/karnet/", {"karnet_enabled": False}, format="json")

    assert response.status_code == 200
    assert response.data["capabilities"]["karnet"] is False
    assert AuditEvent.objects.filter(organization=organization, action="organization.karnet_disabled").exists()


def test_gerant_and_staff_cannot_toggle_karnet(db, gerant_user, staff_user, organization):
    for user in (gerant_user, staff_user):
        response = auth_client(user).patch("/api/v1/org/me/karnet/", {"karnet_enabled": True}, format="json")
        assert response.status_code == 403
    organization.refresh_from_db()
    assert organization.karnet_enabled is False


def test_unauthenticated_cannot_toggle_karnet(db, organization):
    from rest_framework.test import APIClient

    response = APIClient().patch("/api/v1/org/me/karnet/", {"karnet_enabled": True}, format="json")
    assert response.status_code == 401


def test_sub_capability_is_stored_but_inert_until_karnet_enabled(db, boss_user, organization):
    client = auth_client(boss_user)

    response = client.patch("/api/v1/org/me/karnet/", {"capabilities": {"reservations": True}}, format="json")
    assert response.status_code == 200
    assert response.data["capabilities"]["reservations"] is False  # KARNET encore desactive

    client.patch("/api/v1/org/me/karnet/", {"karnet_enabled": True}, format="json")
    organization.refresh_from_db()
    assert organization.capabilities["reservations"] is True  # retrouvee sans devoir la re-cocher


def test_disabling_karnet_preserves_capability_state(db, boss_user, organization):
    client = auth_client(boss_user)
    client.patch("/api/v1/org/me/karnet/", {"karnet_enabled": True, "capabilities": {"reservations": True}}, format="json")

    client.patch("/api/v1/org/me/karnet/", {"karnet_enabled": False}, format="json")

    organization.refresh_from_db()
    assert organization.karnet_capabilities.get("reservations") is True  # etat conserve
    assert organization.capabilities["reservations"] is False  # mais masque tant que KARNET est off


def test_rejects_unknown_capability_key(db, boss_user, organization):
    response = auth_client(boss_user).patch("/api/v1/org/me/karnet/", {"capabilities": {"invalide": True}}, format="json")
    assert response.status_code == 400


def test_rejects_empty_payload(db, boss_user, organization):
    response = auth_client(boss_user).patch("/api/v1/org/me/karnet/", {}, format="json")
    assert response.status_code == 400
