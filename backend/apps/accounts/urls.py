from django.urls import path

from .views import (
    CookieTokenRefreshView,
    GoogleAuthView,
    InviteStaffView,
    LogoutView,
    MeView,
    UserRoleUpdateView,
)

urlpatterns = [
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/role/", UserRoleUpdateView.as_view(), name="auth-role"),
    path("invite/", InviteStaffView.as_view(), name="auth-invite"),
]
