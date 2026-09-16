import uuid

from django.db import models


class FormTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.OneToOneField(
        "organizations.Organization", on_delete=models.CASCADE, related_name="form_template"
    )
    title = models.CharField(max_length=255, default="Registre d'accès")
    # Schema dynamique : [{"id","type","label","required","options"?}, ...]
    # ADR-001 (cf. cahier des charges) : JSON plutot que EAV, le patron modifie ses
    # champs sans migration.
    fields_schema = models.JSONField(default=list)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} — {self.organization.name}"


class CheckIn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE, related_name="checkins"
    )
    form_template = models.ForeignKey(FormTemplate, on_delete=models.SET_NULL, null=True)
    # ADR-003 : cle generee cote client (PWA) avant tout envoi -> permet a la resynchro
    # apres coupure reseau de ne jamais creer de doublon (contrainte unique = rejet silencieux).
    idempotency_key = models.UUIDField(unique=True)
    responses = models.JSONField(default=dict)
    signature_blob = models.TextField(blank=True, null=True)
    created_at_client = models.DateTimeField()
    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at_client"]
        indexes = [models.Index(fields=["organization", "-created_at_client"])]

    def __str__(self):
        return f"Check-in {self.id} — {self.organization_id}"
