from datetime import UTC, datetime
import uuid

from apps.checkins.models import CheckIn
from apps.testing_utils import auth_client


def test_stats_returns_volume_peak_and_frequent_reasons(db, boss_user, organization, form_template):
    form_template.fields_schema = [
        {"id": "motif", "type": "select", "label": "Motif de la visite", "options": ["Rendez-vous", "Livraison"], "required": False}
    ]
    form_template.save(update_fields=["fields_schema"])
    for hour, reason in [(10, "Rendez-vous"), (10, "Rendez-vous"), (14, "Livraison")]:
        CheckIn.objects.create(
            organization=organization,
            form_template=form_template,
            idempotency_key=uuid.uuid4(),
            responses={"motif": reason},
            created_at_client=datetime(2026, 9, 21, hour, 15, tzinfo=UTC),
        )

    response = auth_client(boss_user).get("/api/v1/checkins/stats/")

    assert response.status_code == 200
    assert response.data["total"] == 3
    assert response.data["peak_hour"] == "10h–11h"
    assert response.data["frequent_reasons"][0] == {"label": "Rendez-vous", "count": 2}
