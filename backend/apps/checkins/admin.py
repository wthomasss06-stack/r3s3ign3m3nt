from django.contrib import admin

from .models import CheckIn, FormTemplate


@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "version", "is_active", "updated_at")


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ("organization", "created_at_client", "synced_at")
    list_filter = ("organization",)
    date_hierarchy = "created_at_client"
