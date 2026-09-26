import uuid

from django.utils import timezone

from apps.checkins.models import CheckIn
from apps.karnet.models import Client
from apps.testing_utils import auth_client


def test_checkins_can_be_filtered_by_karnet_client(db, boss_user, form_template, organization):
    """Phase 7 — la fiche client affiche l'historique des passages liés à ce
    client précisément, sans mélanger les autres visiteurs de l'établissement."""
    linked_client = Client.objects.create(organization=organization, full_name="David Kouassi")
    other_client = Client.objects.create(organization=organization, full_name="Autre Client")

    CheckIn.objects.create(
        organization=organization, form_template=form_template, client=linked_client,
        idempotency_key=uuid.uuid4(), responses={"nom": "David"}, created_at_client=timezone.now(),
    )
    CheckIn.objects.create(
        organization=organization, form_template=form_template, client=other_client,
        idempotency_key=uuid.uuid4(), responses={"nom": "Autre"}, created_at_client=timezone.now(),
    )
    CheckIn.objects.create(
        organization=organization, form_template=form_template, client=None,
        idempotency_key=uuid.uuid4(), responses={"nom": "Sans client"}, created_at_client=timezone.now(),
    )

    response = auth_client(boss_user).get(f"/api/v1/checkins/?client={linked_client.id}")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["client_id"] == str(linked_client.id)
