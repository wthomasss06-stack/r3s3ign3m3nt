from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(source="organization.id", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "avatar_url", "role", "organization_id", "organization_name"]


class UserProfileUpdateSerializer(serializers.Serializer):
    """Volontairement restreint a full_name/avatar_url : le role ne se change JAMAIS
    par cette voie (uniquement via une invitation, cf. services.resolve_or_create_user) —
    une auto-promotion serait une faille de privilege escalation."""

    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True)


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField()


class InviteStaffSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["GERANT", "STAFF"], default="STAFF", required=False)
