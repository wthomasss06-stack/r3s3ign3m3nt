from rest_framework import serializers

from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "qr_secure_token", "created_at"]
        read_only_fields = ["id", "qr_secure_token", "created_at"]


class RenameOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
