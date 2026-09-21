from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("organizations", "0002_organization_branding")]
    operations = [migrations.AddField(model_name="organization", name="is_suspended", field=models.BooleanField(default=False))]
