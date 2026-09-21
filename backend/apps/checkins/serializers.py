from rest_framework import serializers

from .models import AccessPoint, CheckIn, FormTemplate

ALLOWED_FIELD_TYPES = ("text", "phone", "email", "number", "date", "select", "checkbox", "signature")


class FormFieldSchemaSerializer(serializers.Serializer):
    id = serializers.SlugField()
    type = serializers.ChoiceField(choices=ALLOWED_FIELD_TYPES)
    label = serializers.CharField(max_length=255)
    required = serializers.BooleanField(default=False)
    options = serializers.ListField(child=serializers.CharField(), required=False)


class FormTemplateSerializer(serializers.ModelSerializer):
    fields_schema = FormFieldSchemaSerializer(many=True)

    class Meta:
        model = FormTemplate
        fields = ["id", "title", "fields_schema", "version", "is_active", "is_default", "updated_at"]
        read_only_fields = ["id", "version", "updated_at"]


class FormTemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormTemplate
        fields = ["title", "fields_schema", "is_active", "is_default"]

    def validate_fields_schema(self, value):
        serializer = FormFieldSchemaSerializer(data=value, many=True)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data


class AccessPointSerializer(serializers.ModelSerializer):
    form_title = serializers.CharField(source="form_template.title", read_only=True)
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = AccessPoint
        fields = ["id", "name", "device_label", "secure_token", "is_active", "last_seen_at", "created_at", "form_template", "form_title", "public_url"]
        read_only_fields = ["id", "secure_token", "last_seen_at", "created_at", "form_title", "public_url"]

    def get_public_url(self, obj):
        return f"/v/{obj.secure_token}"


class AccessPointWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessPoint
        fields = ["name", "device_label", "form_template", "is_active"]


class PublicFormSerializer(serializers.Serializer):
    organization_name = serializers.CharField()
    organization_logo_url = serializers.CharField(allow_blank=True)
    visit_reasons = serializers.ListField(child=serializers.CharField())
    fields_schema = serializers.JSONField()
    form_id = serializers.UUIDField()
    form_title = serializers.CharField()
    access_point_id = serializers.UUIDField(allow_null=True)
    access_point_name = serializers.CharField(allow_blank=True)


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ["id", "responses", "signature_blob", "created_at_client", "synced_at"]


class CheckInSyncItemSerializer(serializers.Serializer):
    idempotency_key = serializers.UUIDField()
    qr_token = serializers.CharField(max_length=64)
    responses = serializers.DictField()
    signature_blob = serializers.CharField(required=False, allow_blank=True, default="")
    created_at_client = serializers.DateTimeField()
