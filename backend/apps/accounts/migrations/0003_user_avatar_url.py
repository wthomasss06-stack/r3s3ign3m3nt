from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_staffinvitation_role_alter_user_role")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar_url",
            field=models.TextField(blank=True),
        ),
    ]
