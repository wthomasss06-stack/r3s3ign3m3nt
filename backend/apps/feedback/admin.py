from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("created_at", "category", "status", "contact_email", "organization")
    list_filter = ("category", "status")
    search_fields = ("message", "contact_email", "user__email", "organization__name")
