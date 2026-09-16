"""Logique metier du moteur de formulaires : validation contre le schema dynamique
et ingestion offline-first idempotente. Separee des views (Niveau A)."""
from dataclasses import dataclass, field

from django.db import IntegrityError, transaction

from apps.organizations.models import Organization

from .models import CheckIn, FormTemplate


@dataclass
class SyncOutcome:
    idempotency_key: str
    status: str  # created | already_exists | unknown_organization | missing_required_fields | invalid
    missing_fields: list = field(default_factory=list)

    def as_dict(self) -> dict:
        payload = {"idempotency_key": self.idempotency_key, "status": self.status}
        if self.missing_fields:
            payload["fields"] = self.missing_fields
        return payload


def missing_required_fields(template: FormTemplate | None, responses: dict, signature_blob: str = "") -> list[str]:
    """Le client (PWA) valide deja les champs obligatoires pour l'UX, mais le serveur
    revalide toujours : un client peut etre contourne (senior-dev-guardrails).

    Le champ de type "signature" n'a pas de valeur dans `responses` : le dessin est
    transmis a part, dans `signature_blob` (cf. CheckIn.signature_blob). Le traiter
    comme les autres champs revenait a rejeter toute soumission valide comportant
    une signature obligatoire."""
    if not template:
        return []

    missing = []
    for f in template.fields_schema:
        if not f.get("required"):
            continue
        has_value = bool(signature_blob) if f["type"] == "signature" else bool(responses.get(f["id"]))
        if not has_value:
            missing.append(f["id"])
    return missing


def sync_single_checkin(item: dict) -> SyncOutcome:
    """Traite une soumission de la file offline. Ne leve jamais d'exception : chaque
    cas (org inconnue, champs manquants, doublon) devient un statut explicite que le
    frontend peut afficher ou ignorer silencieusement (doublon = succes du point de
    vue du visiteur, sa donnee est bien arrivee)."""
    key = str(item["idempotency_key"])

    organization = (
        Organization.objects.select_related("form_template")
        .filter(qr_secure_token=item["qr_token"])
        .first()
    )
    if not organization:
        return SyncOutcome(idempotency_key=key, status="unknown_organization")

    template = getattr(organization, "form_template", None)
    missing = missing_required_fields(template, item["responses"], item.get("signature_blob", ""))
    if missing:
        return SyncOutcome(idempotency_key=key, status="missing_required_fields", missing_fields=missing)

    try:
        with transaction.atomic():
            CheckIn.objects.create(
                organization=organization,
                form_template=template,
                idempotency_key=item["idempotency_key"],
                responses=item["responses"],
                signature_blob=item.get("signature_blob", ""),
                created_at_client=item["created_at_client"],
            )
        return SyncOutcome(idempotency_key=key, status="created")
    except IntegrityError:
        # La cle existe deja : la PWA a renvoye une soumission deja recue (reseau
        # instable ayant coupe avant reception de la reponse). Cote visiteur c'est
        # un succes, pas une erreur.
        return SyncOutcome(idempotency_key=key, status="already_exists")
