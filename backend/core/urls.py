from django.contrib import admin
from django.urls import include, path

from apps.common.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", HealthCheckView.as_view(), name="health"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/org/", include("apps.organizations.urls")),
    path("api/v1/", include("apps.checkins.urls")),
]
