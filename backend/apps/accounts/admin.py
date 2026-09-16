from django.contrib import admin

from .models import StaffInvitation, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "organization", "created_at")
    list_filter = ("role",)
    search_fields = ("email", "full_name")


@admin.register(StaffInvitation)
class StaffInvitationAdmin(admin.ModelAdmin):
    list_display = ("email", "organization", "accepted_at", "created_at")
    list_filter = ("organization",)
