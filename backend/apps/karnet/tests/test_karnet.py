"""Niveau 2 KARNET — visiteurs/clients, ressources facturables, réservations avec
calcul automatique du montant et rappel de fin de créneau horaire."""
from decimal import Decimal

from django.utils import timezone

from apps.karnet.models import Client, Reservation, Resource
from apps.testing_utils import auth_client


def enable_karnet(organization):
    organization.karnet_enabled = True
    organization.save(update_fields=["karnet_enabled"])
    return organization


def make_resource(organization, **overrides):
    defaults = {"organization": organization, "name": "Chambre 12", "unit": Resource.Unit.JOUR, "price": Decimal("30000")}
    defaults.update(overrides)
    return Resource.objects.create(**defaults)


def test_karnet_endpoints_are_blocked_when_not_enabled(db, boss_user, organization):
    response = auth_client(boss_user).get("/api/v1/karnet/resources/")
    assert response.status_code == 403


def test_boss_and_gerant_can_create_resource_staff_cannot(db, boss_user, gerant_user, staff_user, organization):
    enable_karnet(organization)
    payload = {"name": "Table 3", "unit": "heure", "price": "5000"}

    ok = auth_client(boss_user).post("/api/v1/karnet/resources/", payload, format="json")
    assert ok.status_code == 201

    ok2 = auth_client(gerant_user).post("/api/v1/karnet/resources/", {**payload, "name": "Table 4"}, format="json")
    assert ok2.status_code == 201

    forbidden = auth_client(staff_user).post("/api/v1/karnet/resources/", {**payload, "name": "Table 5"}, format="json")
    assert forbidden.status_code == 403

    # STAFF peut quand même consulter la liste.
    listing = auth_client(staff_user).get("/api/v1/karnet/resources/")
    assert listing.status_code == 200
    assert len(listing.data) == 2


def test_any_role_can_create_client(db, staff_user, organization):
    enable_karnet(organization)
    response = auth_client(staff_user).post("/api/v1/karnet/clients/", {"full_name": "David Kouassi", "phone": "0707070707"}, format="json")
    assert response.status_code == 201
    assert Client.objects.filter(organization=organization, full_name="David Kouassi").exists()


def test_reservation_computes_amount_and_creates_client_inline(db, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization)  # 30 000 / jour

    response = auth_client(staff_user).post(
        "/api/v1/karnet/reservations/",
        {"client_name": "David", "resource": str(resource.id), "quantity": 2},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["unit_price"] == "30000.00"
    assert response.data["total_amount"] == "60000.00"
    assert response.data["client_name"] == "David"
    reservation = Reservation.objects.get(id=response.data["id"])
    assert reservation.ends_at == reservation.starts_at + timezone.timedelta(days=2)


def test_reservation_conflict_on_overlapping_slot(db, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization, unit=Resource.Unit.HEURE, price=Decimal("5000"))
    client = auth_client(staff_user)
    first = client.post("/api/v1/karnet/reservations/", {"client_name": "Ange", "resource": str(resource.id), "quantity": 3}, format="json")
    assert first.status_code == 201

    second = client.post("/api/v1/karnet/reservations/", {"client_name": "Autre client", "resource": str(resource.id), "quantity": 1}, format="json")
    assert second.status_code == 409


def test_unite_resource_has_no_time_slot_and_no_conflict(db, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization, unit=Resource.Unit.UNITE, name="Bouteille d'eau", price=Decimal("500"))
    client = auth_client(staff_user)

    first = client.post("/api/v1/karnet/reservations/", {"client_name": "Ange", "resource": str(resource.id), "quantity": 3}, format="json")
    second = client.post("/api/v1/karnet/reservations/", {"client_name": "Bella", "resource": str(resource.id), "quantity": 1}, format="json")

    assert first.status_code == 201 and second.status_code == 201
    assert first.data["ends_at"] is None


def test_reservation_creation_blocked_when_sub_capability_disabled(db, boss_user, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization)
    auth_client(boss_user).patch("/api/v1/org/me/karnet/", {"capabilities": {"reservations": False}}, format="json")

    response = auth_client(staff_user).post("/api/v1/karnet/reservations/", {"client_name": "David", "resource": str(resource.id)}, format="json")

    assert response.status_code == 403


def test_marking_paid_sets_timestamp_and_respects_capability(db, boss_user, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization)
    reservation = Reservation.objects.create(organization=organization, client=Client.objects.create(organization=organization, full_name="David"), resource=resource, quantity=1, unit_price=resource.price, total_amount=resource.price)

    ok = auth_client(staff_user).patch(f"/api/v1/karnet/reservations/{reservation.id}/", {"is_paid": True}, format="json")
    assert ok.status_code == 200
    assert ok.data["is_paid"] is True
    assert ok.data["paid_at"] is not None

    auth_client(boss_user).patch("/api/v1/org/me/karnet/", {"capabilities": {"payments": False}}, format="json")
    blocked = auth_client(staff_user).patch(f"/api/v1/karnet/reservations/{reservation.id}/", {"is_paid": False}, format="json")
    assert blocked.status_code == 403


def test_reminder_due_filter_and_acknowledgement(db, staff_user, organization):
    enable_karnet(organization)
    resource = make_resource(organization, unit=Resource.Unit.HEURE, price=Decimal("5000"))
    client_record = Client.objects.create(organization=organization, full_name="Ange")
    expired = Reservation.objects.create(
        organization=organization, client=client_record, resource=resource, quantity=3,
        unit_price=resource.price, total_amount=resource.price * 3,
        starts_at=timezone.now() - timezone.timedelta(hours=4),
        ends_at=timezone.now() - timezone.timedelta(hours=1),
    )

    due = auth_client(staff_user).get("/api/v1/karnet/reservations/?reminder_due=true")
    assert due.status_code == 200
    assert [r["id"] for r in due.data] == [str(expired.id)]

    auth_client(staff_user).patch(f"/api/v1/karnet/reservations/{expired.id}/", {"reminder_acknowledged": True, "status": "terminee"}, format="json")

    after = auth_client(staff_user).get("/api/v1/karnet/reservations/?reminder_due=true")
    assert after.data == []
