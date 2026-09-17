"""Logique metier de l'authentification — separee des views (akatech-backend-architect
Niveau A : "Aucune logique metier dans les views/controllers")."""
import os
import secrets

from django.db import transaction
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from apps.organizations.models import Organization

from .models import StaffInvitation, User

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
            role=User.Role.STAFF,
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
    from apps.checkins.models import FormTemplate

    FormTemplate.objects.create(
        organization=organization, title="Registre d'accès", fields_schema=DEFAULT_FORM_SCHEMA
    )
    return user, True


def create_staff_invitation(organization, email: str, invited_by: User) -> StaffInvitation:
    return StaffInvitation.objects.create(
        organization=organization,
        email=email,
        token=secrets.token_urlsafe(24),
        invited_by=invited_by,
    )
