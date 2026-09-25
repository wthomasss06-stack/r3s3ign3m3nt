from django.contrib import admin

from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "karnet_enabled", "qr_secure_token", "created_at")
    list_filter = ("karnet_enabled",)
    search_fields = ("name",)
    # karnet_enabled reste modifiable ici pour un pilotage ops (rollout progressif),
    # en plus du toggle BOSS cote produit (PATCH /org/me/karnet/, trace en audit).
    fields = ("name", "logo_url", "is_suspended", "visit_reasons", "qr_secure_token", "karnet_enabled", "karnet_capabilities", "created_at")
    readonly_fields = ("qr_secure_token", "created_at")
