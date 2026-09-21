from django.urls import path

from .views import MyOrganizationView, OrganizationLifecycleView, RegenerateQRTokenView

urlpatterns = [
    path("me/", MyOrganizationView.as_view(), name="org-me"),
    path("me/lifecycle/", OrganizationLifecycleView.as_view(), name="org-lifecycle"),
    path("me/regenerate-qr/", RegenerateQRTokenView.as_view(), name="org-regenerate-qr"),
]
