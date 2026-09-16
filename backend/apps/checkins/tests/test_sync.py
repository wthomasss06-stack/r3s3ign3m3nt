"""Flows critiques : idempotence anti-doublon + validation serveur des champs
obligatoires (le client PWA peut etre contourne, cf. senior-dev-guardrails)."""
from apps.checkins.models import CheckIn

from .conftest import valid_checkin_payload


def test_sync_creates_checkin(db, api_client, organization, form_template):
    payload = valid_checkin_payload(organization.qr_secure_token)

    response = api_client.post("/api/v1/checkins/sync/", {"checkins": [payload]}, format="json")

    assert response.status_code == 200
    assert response.data["processed"][0]["status"] == "created"
    assert CheckIn.objects.filter(organization=organization).count() == 1


def test_sync_is_idempotent_on_replay(db, api_client, organization, form_template):
    """Simule une PWA qui renvoie la meme fiche apres une coupure reseau survenue
    juste avant reception de la reponse serveur."""
    payload = valid_checkin_payload(organization.qr_secure_token)

    first = api_client.post("/api/v1/checkins/sync/", {"checkins": [payload]}, format="json")
    second = api_client.post("/api/v1/checkins/sync/", {"checkins": [payload]}, format="json")

    assert first.data["processed"][0]["status"] == "created"
    assert second.data["processed"][0]["status"] == "already_exists"
    assert CheckIn.objects.filter(organization=organization).count() == 1


def test_sync_rejects_missing_required_field(db, api_client, organization, form_template):
    payload = valid_checkin_payload(organization.qr_secure_token, responses={"nom": "Kouassi Jean"})

    response = api_client.post("/api/v1/checkins/sync/", {"checkins": [payload]}, format="json")

    assert response.data["processed"][0]["status"] == "missing_required_fields"
    assert "telephone" in response.data["processed"][0]["fields"]
    assert CheckIn.objects.count() == 0


def test_sync_never_trusts_client_supplied_organization_id(db, api_client, organization, form_template):
    """Le contrat n'accepte qu'un qr_token — un organization_id fourni par le client
    n'a tout simplement aucun champ ou aller (protection IDOR)."""
    payload = valid_checkin_payload("token-qui-nexiste-pas")

    response = api_client.post("/api/v1/checkins/sync/", {"checkins": [payload]}, format="json")

    assert response.data["processed"][0]["status"] == "unknown_organization"
    assert CheckIn.objects.count() == 0
