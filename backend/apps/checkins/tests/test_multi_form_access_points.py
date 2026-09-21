import pytest

from apps.checkins.models import AccessPoint, FormTemplate
from apps.testing_utils import auth_client


@pytest.mark.django_db
def test_boss_can_create_form_and_access_point(boss_user, organization):
    client = auth_client(boss_user)
    form_response = client.post("/api/v1/form-templates/", {"title": "Livraisons", "fields_schema": [{"id": "nom", "type": "text", "label": "Nom", "required": True}], "is_active": True, "is_default": False}, format="json")
    assert form_response.status_code == 201
    form_id = form_response.data["id"]
    point_response = client.post("/api/v1/access-points/", {"name": "Quai livraison", "device_label": "Tablette Q1", "form_template": form_id, "is_active": True}, format="json")
    assert point_response.status_code == 201
    assert AccessPoint.objects.filter(name="Quai livraison", form_template_id=form_id).exists()


@pytest.mark.django_db
def test_staff_cannot_create_form_or_access_point(staff_user, organization, form_template):
    client = auth_client(staff_user)
    assert client.post("/api/v1/form-templates/", {"title": "Interdit", "fields_schema": []}, format="json").status_code == 403
    assert client.post("/api/v1/access-points/", {"name": "Interdit", "form_template": str(form_template.id)}, format="json").status_code == 403
