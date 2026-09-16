from django.urls import path

from .views import (
    CheckInExportView,
    CheckInListView,
    FormTemplateView,
    PublicFormView,
    SyncCheckInsView,
)

urlpatterns = [
    path("form-template/", FormTemplateView.as_view(), name="form-template"),
    path("public/forms/<str:qr_token>/", PublicFormView.as_view(), name="public-form"),
    path("checkins/sync/", SyncCheckInsView.as_view(), name="checkins-sync"),
    path("checkins/", CheckInListView.as_view(), name="checkins-list"),
    path("checkins/export/", CheckInExportView.as_view(), name="checkins-export"),
]
