from django.urls import path

from .views import CookieTokenRefreshView, DeactivateMeView, GoogleAuthView, InviteStaffView, LogoutView, MeView

urlpatterns = [
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/deactivate/", DeactivateMeView.as_view(), name="auth-me-deactivate"),
    path("invite/", InviteStaffView.as_view(), name="auth-invite"),
]
