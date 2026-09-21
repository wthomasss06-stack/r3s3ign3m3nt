import uuid

from django.db import migrations, models
import django.db.models.deletion


def create_primary_access_points(apps, schema_editor):
    Organization = apps.get_model("organizations", "Organization")
    FormTemplate = apps.get_model("checkins", "FormTemplate")
    AccessPoint = apps.get_model("checkins", "AccessPoint")
    for organization in Organization.objects.all():
        template = FormTemplate.objects.filter(organization_id=organization.id).order_by("id").first()
        if not template:
            continue
        template.is_default = True
        template.save(update_fields=["is_default"])
        AccessPoint.objects.get_or_create(organization_id=organization.id, name="Accueil principal", defaults={"form_template_id": template.id, "secure_token": organization.qr_secure_token})


class Migration(migrations.Migration):
    dependencies = [("checkins", "0001_initial")]
    operations = [
        migrations.AlterField(model_name="formtemplate", name="organization", field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="form_templates", to="organizations.organization")),
        migrations.AddField(model_name="formtemplate", name="is_default", field=models.BooleanField(default=False)),
        migrations.CreateModel(name="AccessPoint", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("name", models.CharField(max_length=120)),
            ("device_label", models.CharField(blank=True, max_length=120)),
            ("secure_token", models.CharField(db_index=True, max_length=64, unique=True)),
            ("is_active", models.BooleanField(default=True)),
            ("last_seen_at", models.DateTimeField(blank=True, null=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("form_template", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="access_points", to="checkins.formtemplate")),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="access_points", to="organizations.organization")),
        ], options={"ordering": ["name"], "constraints": [models.UniqueConstraint(fields=("organization", "name"), name="unique_access_point_name_per_org")] }),
        migrations.AddField(model_name="checkin", name="access_point", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="checkins", to="checkins.accesspoint")),
        migrations.RunPython(create_primary_access_points, migrations.RunPython.noop),
    ]
