"""Validation et ingestion offline-first idempotente pour plusieurs points d'accueil."""
from dataclasses import dataclass, field

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.organizations.models import Organization

from .models import AccessPoint, CheckIn, FormTemplate


@dataclass
class SyncOutcome:
    idempotency_key: str
    status: str
    missing_fields: list = field(default_factory=list)

    def as_dict(self) -> dict:
        payload = {"idempotency_key": self.idempotency_key, "status": self.status}
        if self.missing_fields: payload["fields"] = self.missing_fields
        return payload


def missing_required_fields(template: FormTemplate | None, responses: dict, signature_blob: str = "") -> list[str]:
    if not template: return []
    missing = []
    for f in template.fields_schema:
        if f.get("required") and not (bool(signature_blob) if f["type"] == "signature" else bool(responses.get(f["id"]))): missing.append(f["id"])
    return missing


def resolve_target(token):
    point = AccessPoint.objects.select_related("organization", "form_template").filter(secure_token=token, is_active=True, organization__is_suspended=False).first()
    if point: return point.organization, point.form_template, point
    organization = Organization.objects.filter(qr_secure_token=token, is_suspended=False).first()
    if not organization: return None, None, None
    template = organization.form_templates.filter(is_default=True).first() or organization.form_templates.filter(is_active=True).first()
    return organization, template, None


def sync_single_checkin(item: dict) -> SyncOutcome:
    key = str(item["idempotency_key"])
    organization, template, access_point = resolve_target(item["qr_token"])
    if not organization: return SyncOutcome(key, "unknown_organization")
    missing = missing_required_fields(template, item["responses"], item.get("signature_blob", ""))
    if missing: return SyncOutcome(key, "missing_required_fields", missing)
    try:
        with transaction.atomic():
            CheckIn.objects.create(organization=organization, form_template=template, access_point=access_point, idempotency_key=item["idempotency_key"], responses=item["responses"], signature_blob=item.get("signature_blob", ""), created_at_client=item["created_at_client"])
            if access_point: AccessPoint.objects.filter(id=access_point.id).update(last_seen_at=timezone.now())
        return SyncOutcome(key, "created")
    except IntegrityError:
        return SyncOutcome(key, "already_exists")
