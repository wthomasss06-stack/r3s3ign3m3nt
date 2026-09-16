"""RBAC verifie cote serveur : un STAFF ne doit jamais pouvoir modifier le formulaire,
meme si le frontend cache le bouton (controle UI != securite)."""
from .conftest import auth_client


def test_staff_cannot_update_form_template(db, staff_user, form_template):
    client = auth_client(staff_user)

    response = client.put("/api/v1/form-template/", {"title": "Piraté"}, format="json")

    assert response.status_code == 403
    form_template.refresh_from_db()
    assert form_template.title != "Piraté"


def test_boss_can_update_form_template(db, boss_user, form_template):
    client = auth_client(boss_user)
    new_schema = [{"id": "nom", "type": "text", "label": "Nom complet", "required": True}]

    response = client.put(
        "/api/v1/form-template/", {"title": "Registre v2", "fields_schema": new_schema}, format="json"
    )

    assert response.status_code == 200
    form_template.refresh_from_db()
    assert form_template.title == "Registre v2"
    assert form_template.version == 2


def test_staff_can_read_form_template(db, staff_user, form_template):
    client = auth_client(staff_user)
    response = client.get("/api/v1/form-template/")
    assert response.status_code == 200
