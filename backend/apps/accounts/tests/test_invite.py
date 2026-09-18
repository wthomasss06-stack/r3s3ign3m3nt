"""Un GERANT peut inviter du STAFF au quotidien, mais ne peut jamais s'octroyer
ou octroyer un pair GERANT — seul le BOSS accorde ce niveau (cf. cahier des charges,
matrice de permissions patron > gerant > staff)."""
from apps.accounts.models import StaffInvitation

from apps.testing_utils import auth_client


def test_boss_can_invite_gerant(db, boss_user, organization):
    client = auth_client(boss_user)

    response = client.post(
        "/api/v1/auth/invite/", {"email": "futur-gerant@example.com", "role": "GERANT"}, format="json"
    )

    assert response.status_code == 201
    assert StaffInvitation.objects.get(email="futur-gerant@example.com").role == "GERANT"


def test_gerant_can_invite_staff(db, gerant_user, organization):
    client = auth_client(gerant_user)

    response = client.post(
        "/api/v1/auth/invite/", {"email": "futur-agent@example.com", "role": "STAFF"}, format="json"
    )

    assert response.status_code == 201
    assert StaffInvitation.objects.get(email="futur-agent@example.com").role == "STAFF"


def test_gerant_cannot_invite_another_gerant(db, gerant_user, organization):
    client = auth_client(gerant_user)

    response = client.post(
        "/api/v1/auth/invite/", {"email": "autre-gerant@example.com", "role": "GERANT"}, format="json"
    )

    assert response.status_code == 403
    assert not StaffInvitation.objects.filter(email="autre-gerant@example.com").exists()


def test_staff_cannot_invite_anyone(db, staff_user, organization):
    client = auth_client(staff_user)

    response = client.post(
        "/api/v1/auth/invite/", {"email": "quelquun@example.com"}, format="json"
    )

    assert response.status_code == 403


def test_invite_defaults_to_staff_role(db, boss_user, organization):
    """Si le patron ne precise rien, l'invitation est STAFF par defaut (le niveau
    le plus restreint) — jamais un role plus permissif par defaut."""
    client = auth_client(boss_user)

    response = client.post("/api/v1/auth/invite/", {"email": "sans-role@example.com"}, format="json")

    assert response.status_code == 201
    assert StaffInvitation.objects.get(email="sans-role@example.com").role == "STAFF"
