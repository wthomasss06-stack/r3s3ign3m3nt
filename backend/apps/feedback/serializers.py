from rest_framework import serializers
from apps.accounts.models import AuditEvent

from .models import Feedback


class PlatformAuditEventSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    actor_email = serializers.EmailField(source="actor.email", read_only=True, allow_null=True)
    actor_name = serializers.CharField(source="actor.full_name", read_only=True, allow_null=True)
    actor_role = serializers.CharField(source="actor.role", read_only=True, allow_null=True)
    target_email = serializers.EmailField(source="target_user.email", read_only=True, allow_null=True)
    target_name = serializers.CharField(source="target_user.full_name", read_only=True, allow_null=True)
    target_role = serializers.CharField(source="target_user.role", read_only=True, allow_null=True)

    class Meta:
        model = AuditEvent
        fields = ["id", "organization_name", "action", "actor_name", "actor_email", "actor_role", "target_name", "target_email", "target_role", "metadata", "created_at"]


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["category", "message", "page_url", "contact_email"]


class FeedbackAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True, allow_null=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True, allow_null=True)
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Feedback
        fields = ["id", "category", "category_label", "message", "page_url", "contact_email", "user_email", "organization_name", "status", "status_label", "admin_note", "created_at", "updated_at"]
        read_only_fields = ["id", "user_email", "organization_name", "category_label", "status_label", "created_at", "updated_at"]


class FeedbackAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["status", "admin_note"]


class AdminOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    logo_url = serializers.CharField(required=False, allow_blank=True)
    visit_reasons = serializers.ListField(child=serializers.CharField(max_length=120), required=False, allow_empty=True)


class AdminMemberSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    role = serializers.ChoiceField(choices=["BOSS", "GERANT", "STAFF"])
    organization_id = serializers.UUIDField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)
