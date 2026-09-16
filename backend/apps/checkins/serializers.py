from rest_framework import serializers

from .models import CheckIn, FormTemplate

ALLOWED_FIELD_TYPES = ("text", "phone", "email", "number", "date", "select", "checkbox", "signature")


class FormFieldSchemaSerializer(serializers.Serializer):
    """Valide chaque entree de fields_schema — evite qu'un JSON malforme casse le
    rendu du formulaire visiteur cote frontend."""

    id = serializers.SlugField()
    type = serializers.ChoiceField(choices=ALLOWED_FIELD_TYPES)
    label = serializers.CharField(max_length=255)
    required = serializers.BooleanField(default=False)
    options = serializers.ListField(child=serializers.CharField(), required=False)


class FormTemplateSerializer(serializers.ModelSerializer):
    fields_schema = FormFieldSchemaSerializer(many=True)

    class Meta:
        model = FormTemplate
        fields = ["id", "title", "fields_schema", "version", "is_active", "updated_at"]
        read_only_fields = ["id", "version", "updated_at"]


class PublicFormSerializer(serializers.Serializer):
    organization_name = serializers.CharField()
    fields_schema = serializers.JSONField()


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ["id", "responses", "signature_blob", "created_at_client", "synced_at"]


class CheckInSyncItemSerializer(serializers.Serializer):
    """Le client n'envoie jamais organization_id ni form_template_id — uniquement le
    qr_token public. L'organisation est deduite cote serveur (correction de la faille
    IDOR identifiee lors de la conception, cf. cahier des charges §11)."""

    idempotency_key = serializers.UUIDField()
    qr_token = serializers.CharField(max_length=64)
    responses = serializers.DictField()
    signature_blob = serializers.CharField(required=False, allow_blank=True, default="")
    created_at_client = serializers.DateTimeField()
