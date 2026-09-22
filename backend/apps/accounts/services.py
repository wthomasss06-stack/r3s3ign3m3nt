"""Logique metier de l'authentification — separee des views (akatech-backend-architect
Niveau A : "Aucune logique metier dans les views/controllers")."""
import os
import secrets
from datetime import datetime, timezone

from django.db import transaction
from django.utils import timezone as django_timezone
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from apps.organizations.models import Organization

from .models import AuditEvent, RefreshSession, StaffInvitation, User

DEFAULT_FORM_SCHEMA = [
    {"id": "nom", "type": "text", "label": "Nom & Prénoms", "required": True},
    {"id": "telephone", "type": "phone", "label": "Téléphone / WhatsApp", "required": True},
    {
        "id": "motif",
        "type": "select",
        "label": "Motif de la visite",
        "options": ["Rendez-vous", "Livraison", "Autre"],
        "required": False,
    },
    {"id": "signature", "type": "signature", "label": "Signature", "required": True},
]


class InvalidGoogleTokenError(Exception):
    """Le jeton d'identite Google est absent, malforme, expire ou signe pour un autre client."""


class RevokedAccessError(Exception):
    """L’adresse Google est explicitement exclue d’un établissement."""


def verify_google_credential(credential: str) -> dict:
    try:
        return id_token.verify_oauth2_token(
            credential, google_requests.Request(), os.environ.get("GOOGLE_CLIENT_ID")
        )
    except ValueError as exc:
        raise InvalidGoogleTokenError(str(exc)) from exc


@transaction.atomic
def resolve_or_create_user(google_profile: dict) -> tuple[User, bool]:
    """Retourne (user, created). Trois cas :
    1. L'email existe deja -> on renvoie ce compte.
    2. Une invitation Staff non acceptee correspond a cet email -> rattachement STAFF
       a l'organisation qui a invite (le patron a saisi cet email au prealable,
       cf. InviteStaffView : la garantie d'identite vient de Google, pas du token).
    3. Sinon -> nouvel espace BOSS avec organisation, QR token et formulaire par defaut.
    """
    email = google_profile["email"]
    existing = User.objects.filter(email=email).first()
    if existing:
        return existing, False

    if StaffInvitation.objects.filter(email__iexact=email, revoked_at__isnull=False).exists():
        raise RevokedAccessError("Vous ne faites plus partie du staff ou de la gestion de cet établissement.")

    invitation = (
        StaffInvitation.objects.filter(email__iexact=email, accepted_at__isnull=True)
        .order_by("-created_at")
        .first()
    )

    if invitation:
        user = User.objects.create_user(
            email=email,
            full_name=google_profile.get("name", ""),
            avatar_url=google_profile.get("picture", ""),
            role=invitation.role,
            organization=invitation.organization,
        )
        invitation.accepted_at = user.created_at
        invitation.save(update_fields=["accepted_at"])
        return user, True

    organization = Organization.objects.create(
        name=google_profile.get("name", "Mon établissement"),
        qr_secure_token=secrets.token_urlsafe(16),
    )
    user = User.objects.create_user(
        email=email,
        full_name=google_profile.get("name", ""),
        avatar_url=google_profile.get("picture", ""),
        role=User.Role.BOSS,
        organization=organization,
    )
    # Import local : evite un cycle apps.accounts <-> apps.checkins au chargement.
    from apps.checkins.models import AccessPoint, FormTemplate

    template = FormTemplate.objects.create(
        organization=organization, title="Registre d'accès", fields_schema=DEFAULT_FORM_SCHEMA, is_default=True
    )
    AccessPoint.objects.create(organization=organization, form_template=template, name="Accueil principal", secure_token=organization.qr_secure_token)
    return user, True


MAX_GERANT_PER_ORG = 5
MAX_STAFF_PER_ORG = 5
ROLE_CAPS = {User.Role.GERANT: MAX_GERANT_PER_ORG, User.Role.STAFF: MAX_STAFF_PER_ORG}


def count_role_usage(organization, role: str) -> int:
    """Compte les membres deja actifs + les invitations encore en attente pour ce
    role, pour ne pas laisser une avalanche d'invitations depasser le plafond une
    fois toutes acceptees."""
    accepted = User.objects.filter(organization=organization, role=role).count()
    pending = StaffInvitation.objects.filter(
        organization=organization, role=role, accepted_at__isnull=True
    ).count()
    return accepted + pending


def create_staff_invitation(organization, email: str, invited_by: User, role: str = User.Role.STAFF) -> StaffInvitation:
    return StaffInvitation.objects.create(
        organization=organization,
        email=email,
        role=role,
        token=secrets.token_urlsafe(24),
        invited_by=invited_by,
    )


def register_refresh_session(user: User, refresh_token, request) -> RefreshSession:
    """Enregistre uniquement le JTI du refresh JWT, jamais le token lui-même."""
    session = RefreshSession.objects.create(
        user=user,
        jti=str(refresh_token["jti"]),
        user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:512],
        ip_address=request.META.get("REMOTE_ADDR"),
        expires_at=datetime.fromtimestamp(int(refresh_token["exp"]), tz=timezone.utc),
    )
    if user.organization_id:
        AuditEvent.objects.create(
            organization=user.organization,
            actor=user,
            action="auth.login",
            metadata={"session_id": str(session.id)},
        )
    return session


def revoke_refresh_session(raw_token: str | None, reason: str = "logout") -> None:
    """Révoque une session par son JTI sans jamais journaliser la valeur du JWT."""
    if not raw_token:
        return
    try:
        from rest_framework_simplejwt.tokens import RefreshToken

        jti = str(RefreshToken(raw_token)["jti"])
    except Exception:
        return
    session = RefreshSession.objects.select_related("user", "user__organization").filter(jti=jti, revoked_at__isnull=True).first()
    if not session:
        return
    session.revoked_at = django_timezone.now()
    session.save(update_fields=["revoked_at"])
    if session.user.organization_id:
        AuditEvent.objects.create(
            organization=session.user.organization,
            actor=session.user,
            action="auth.session_revoked",
            metadata={"session_id": str(session.id), "reason": reason},
        )
