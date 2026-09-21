from rest_framework import serializers

from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "logo_url", "visit_reasons", "qr_secure_token", "created_at", "is_suspended"]
        read_only_fields = ["id", "qr_secure_token", "created_at"]


class OrganizationUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    logo_url = serializers.CharField(required=False, allow_blank=True)
    visit_reasons = serializers.ListField(
        child=serializers.CharField(max_length=120), required=False, allow_empty=True
    )


class RenameOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

    def validate_name(self, value):
        return value.strip()
