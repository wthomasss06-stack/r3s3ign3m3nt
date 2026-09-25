import uuid

from django.db import models


class Organization(models.Model):
    class KarnetCapability(models.TextChoices):
        """Sous-fonctionnalites du Niveau 2 KARNET, deblocables une a une une fois le
        socle active — voir Organization.capabilities."""

        RESERVATIONS = "reservations", "Réservations"
        PAYMENTS = "payments", "Paiements"
        RAPPELS = "rappels", "Rappels"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    logo_url = models.TextField(blank=True)
    is_suspended = models.BooleanField(default=False)
    visit_reasons = models.JSONField(default=list, blank=True)
    qr_secure_token = models.CharField(max_length=64, unique=True, db_index=True)
    karnet_enabled = models.BooleanField(default=False)
    karnet_capabilities = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def capabilities(self) -> dict:
        """Etat effectif des fonctionnalites pour cet etablissement, calcule cote serveur
        uniquement — le frontend ne fait jamais ce calcul lui-meme (cf. plan de bascule
        Niveau 1 -> Niveau 2). `registration` (Renseignement) est le socle permanent,
        toujours actif. Les sous-capacites KARNET retombent a False tant que
        `karnet_enabled` est False, sans effacer l'etat enregistre : reactiver KARNET
        restaure exactement ce qui etait deja debloque, sans tout reconfigurer."""
        subs = {key: False for key in self.KarnetCapability.values}
        if self.karnet_enabled:
            subs.update({key: bool(self.karnet_capabilities.get(key)) for key in self.KarnetCapability.values})
        return {"registration": True, "karnet": self.karnet_enabled, **subs}
