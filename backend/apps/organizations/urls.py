from django.urls import path

from .views import MyOrganizationView, RegenerateQRTokenView

urlpatterns = [
    path("me/", MyOrganizationView.as_view(), name="org-me"),
    path("me/regenerate-qr/", RegenerateQRTokenView.as_view(), name="org-regenerate-qr"),
]
