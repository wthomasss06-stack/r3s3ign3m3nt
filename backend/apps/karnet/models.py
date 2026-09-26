import uuid

from django.db import models
from django.utils import timezone


class Client(models.Model):
    """Un visiteur devenu client suivi : fiche + historique, au-delà d'un simple
    passage au registre. Toujours rattaché à un seul établissement."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="karnet_clients")
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} — {self.organization.name}"


class Resource(models.Model):
    """Une ressource facturable de l'établissement : chambre, table, équipement ou
    article. Le prix est déclaré par l'établissement (pas de paiement réel pour
    l'instant) et sert de base au calcul automatique du montant dû à chaque
    réservation/consommation."""

    class Unit(models.TextChoices):
        JOUR = "jour", "Par jour"
        HEURE = "heure", "Par heure"
        UNITE = "unite", "Par unité"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="karnet_resources")
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.UNITE)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_unit_display()}) — {self.organization.name}"


class Reservation(models.Model):
    """Une réservation ou consommation d'une ressource par un client. Le montant est
    calculé et figé à la création (quantité × prix unitaire de la ressource à cet
    instant) : un changement de tarif ultérieur ne modifie jamais l'historique déjà
    facturé. Pour les ressources à l'heure, `ends_at` sert de base au rappel de fin
    de créneau (voir `reminder_due`) ; pour les ressources par jour, il sert à la
    détection de conflit ; pour les articles à l'unité, il reste `None` (vente
    immédiate, pas de créneau à réserver)."""

    class Status(models.TextChoices):
        EN_COURS = "en_cours", "En cours"
        TERMINEE = "terminee", "Terminée"
        ANNULEE = "annulee", "Annulée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="karnet_reservations")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="reservations")
    resource = models.ForeignKey(Resource, on_delete=models.PROTECT, related_name="reservations")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    starts_at = models.DateTimeField(default=timezone.now)
    ends_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.EN_COURS)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    reminder_acknowledged = models.BooleanField(default=False)
    created_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name="karnet_reservations_created")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_at"]
        indexes = [
            models.Index(fields=["organization", "-starts_at"]),
            models.Index(fields=["resource", "status", "starts_at"]),
        ]

    def __str__(self):
        return f"{self.resource.name} — {self.client.full_name} ({self.organization.name})"

    @property
    def reminder_due(self) -> bool:
        """Vrai si le créneau horaire de cette réservation est écoulé et pas encore
        acquitté — c'est ce qui déclenche la sonnerie côté Rappels."""
        return bool(
            self.resource.unit == Resource.Unit.HEURE
            and self.status == self.Status.EN_COURS
            and not self.reminder_acknowledged
            and self.ends_at is not None
            and self.ends_at <= timezone.now()
        )
