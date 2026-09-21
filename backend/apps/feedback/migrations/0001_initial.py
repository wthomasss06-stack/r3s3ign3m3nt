from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True
    dependencies = [("accounts", "0003_user_avatar_url"), ("organizations", "0002_organization_branding")]
    operations = [migrations.CreateModel(name="Feedback", fields=[
        ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
        ("category", models.CharField(choices=[("improvement", "Amélioration"), ("bug", "Erreur"), ("observation", "Observation"), ("other", "Autre")], default="observation", max_length=20)),
        ("message", models.TextField(max_length=4000)),
        ("page_url", models.URLField(blank=True, max_length=1000)),
        ("contact_email", models.EmailField(blank=True, max_length=254)),
        ("status", models.CharField(choices=[("new", "Nouveau"), ("reviewing", "En cours"), ("done", "Traité"), ("archived", "Archivé")], default="new", max_length=20)),
        ("admin_note", models.TextField(blank=True, max_length=4000)),
        ("created_at", models.DateTimeField(auto_now_add=True)),
        ("updated_at", models.DateTimeField(auto_now=True)),
        ("organization", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="feedbacks", to="organizations.organization")),
        ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="feedbacks", to=settings.AUTH_USER_MODEL)),
    ], options={"ordering": ["-created_at"], "indexes": [models.Index(fields=["status", "-created_at"], name="feedback_st_status_8d1d5b_idx"), models.Index(fields=["organization", "-created_at"], name="feedback_st_organiz_3fa4e5_idx")]})]
