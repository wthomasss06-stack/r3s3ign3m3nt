import uuid
from datetime import timedelta

from django.utils import timezone

from apps.checkins.models import CheckIn
from apps.testing_utils import auth_client


def test_checkins_are_paginated_on_server_beyond_one_hundred(db, boss_user, form_template):
    base_time = timezone.now()
    CheckIn.objects.bulk_create([
        CheckIn(
            organization=boss_user.organization,
            form_template=form_template,
            idempotency_key=uuid.uuid4(),
            responses={"nom": f"Visiteur {index}"},
            created_at_client=base_time - timedelta(minutes=index),
        )
        for index in range(125)
    ])

    client = auth_client(boss_user)
    first = client.get("/api/v1/checkins/?page=1&page_size=20")
    seventh = client.get("/api/v1/checkins/?page=7&page_size=20")

    assert first.status_code == 200
    assert seventh.status_code == 200
    assert first.data["count"] == 125
    assert len(first.data["results"]) == 20
    assert len(seventh.data["results"]) == 5
    assert first.data["next"]
    assert seventh.data["previous"]


def test_checkins_page_size_is_capped_server_side(db, boss_user, form_template):
    client = auth_client(boss_user)
    response = client.get("/api/v1/checkins/?page_size=1000")

    assert response.status_code == 200
    assert len(response.data["results"]) <= 50
