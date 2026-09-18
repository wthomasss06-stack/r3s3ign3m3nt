"""Permissions RBAC partagées entre apps. Verifiees cote serveur uniquement —
un role affiche cote frontend est du confort d'UI, jamais de la securite."""
from rest_framework.permissions import BasePermission


class IsBoss(BasePermission):
    """Autorise uniquement le role BOSS (le patron de l'etablissement)."""
    message = "Cette action est reservee au patron de l'etablissement."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "BOSS")


class IsBossOrGerant(BasePermission):
    """Autorise BOSS et GERANT — actions de gestion courante deleguees par le patron
    (formulaire, export, invitation de STAFF), mais pas les actions sensibles
    (regeneration du QR, suppression de l'organisation) reservees a IsBoss."""
    message = "Cette action est reservee au patron ou au gerant."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role in ("BOSS", "GERANT")
        )


class IsOrgMember(BasePermission):
    """Autorise BOSS et STAFF, tous deux membres d'une organisation."""
    message = "Compte non rattache a un etablissement."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.organization_id)
