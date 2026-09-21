import uuid

from django.conf import settings
from django.db import models


class Feedback(models.Model):
    class Category(models.TextChoices):
        IMPROVEMENT = "improvement", "Amélioration"
        BUG = "bug", "Erreur"
        OBSERVATION = "observation", "Observation"
        OTHER = "other", "Autre"

    class Status(models.TextChoices):
        NEW = "new", "Nouveau"
        REVIEWING = "reviewing", "En cours"
        DONE = "done", "Traité"
        ARCHIVED = "archived", "Archivé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OBSERVATION)
    message = models.TextField(max_length=4000)
    page_url = models.URLField(max_length=1000, blank=True)
    contact_email = models.EmailField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="feedbacks")
    organization = models.ForeignKey("organizations.Organization", null=True, blank=True, on_delete=models.SET_NULL, related_name="feedbacks")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    admin_note = models.TextField(blank=True, max_length=4000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "-created_at"]), models.Index(fields=["organization", "-created_at"])]

    def __str__(self):
        return f"{self.get_category_display()} — {self.message[:50]}"
