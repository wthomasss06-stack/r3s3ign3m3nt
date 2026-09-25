from django.urls import path

from .views import (
    CloudinarySignatureView,
    MyOrganizationView,
    OrganizationKarnetView,
    OrganizationLifecycleView,
    RegenerateQRTokenView,
)

urlpatterns = [
    path("me/", MyOrganizationView.as_view(), name="org-me"),
    path("me/lifecycle/", OrganizationLifecycleView.as_view(), name="org-lifecycle"),
    path("me/karnet/", OrganizationKarnetView.as_view(), name="org-karnet"),
    path("me/regenerate-qr/", RegenerateQRTokenView.as_view(), name="org-regenerate-qr"),
    path("uploads/cloudinary-signature/", CloudinarySignatureView.as_view(), name="cloudinary-signature"),
]
