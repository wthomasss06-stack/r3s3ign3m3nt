"""Permissions RBAC partagées entre apps. Verifiees cote serveur uniquement —
un role affiche cote frontend est du confort d'UI, jamais de la securite."""
from rest_framework.permissions import BasePermission


class IsBoss(BasePermission):
    """Autorise uniquement le role BOSS (le patron de l'etablissement)."""
    message = "Cette action est reservee au patron de l'etablissement."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "BOSS")


class IsBossOrGerant(BasePermission):
    """Autorise BOSS et GERANT pour la gestion courante : formulaires multiples,
    points d'accueil, export et exploitation. Les suppressions sensibles,
    invitations, identité et régénération du QR principal restent au BOSS."""
    message = "Cette action est reservee au patron ou au gerant."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role in ("BOSS", "GERANT")
        )


class IsOrgMember(BasePermission):
    """Autorise tout membre rattaché : BOSS, GERANT ou STAFF."""
    message = "Compte non rattache a un etablissement."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.organization_id)
