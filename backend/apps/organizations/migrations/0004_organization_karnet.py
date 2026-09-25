from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("organizations", "0003_organization_is_suspended")]
    operations = [
        migrations.AddField(model_name="organization", name="karnet_enabled", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="organization", name="karnet_capabilities", field=models.JSONField(default=dict, blank=True)),
    ]
