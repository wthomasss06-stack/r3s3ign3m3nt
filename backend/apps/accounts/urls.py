from django.urls import path

from .views import AuditEventListView, CookieTokenRefreshView, DeactivateMeView, GoogleAuthView, InviteStaffView, LogoutView, MeView, RevokeInvitationView, RevokeMemberView, TeamAccessView

urlpatterns = [
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/deactivate/", DeactivateMeView.as_view(), name="auth-me-deactivate"),
    path("invite/", InviteStaffView.as_view(), name="auth-invite"),
    path("team/", TeamAccessView.as_view(), name="auth-team"),
    path("team/invitations/<uuid:invitation_id>/revoke/", RevokeInvitationView.as_view(), name="auth-revoke-invitation"),
    path("team/members/<uuid:user_id>/revoke/", RevokeMemberView.as_view(), name="auth-revoke-member"),
    path("audit/", AuditEventListView.as_view(), name="auth-audit"),
]
