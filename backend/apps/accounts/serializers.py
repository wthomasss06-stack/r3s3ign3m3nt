from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(source="organization.id", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "organization_id", "organization_name"]


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField()


class InviteStaffSerializer(serializers.Serializer):
    email = serializers.EmailField()
