from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("organizations", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="logo_url",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="visit_reasons",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
