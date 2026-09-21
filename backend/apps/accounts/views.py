from rest_framework import status, throttling
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.permissions import IsBossOrGerant
from apps.common.responses import error_response

from .cookies import clear_refresh_cookie, set_refresh_cookie
from .serializers import GoogleAuthSerializer, InviteStaffSerializer, UserProfileUpdateSerializer, UserSerializer
from .services import (
    ROLE_CAPS,
    InvalidGoogleTokenError,
    count_role_usage,
    create_staff_invitation,
    resolve_or_create_user,
    verify_google_credential,
)


class GoogleAuthView(APIView):
    """Point d'entree unique de connexion. Aucun mot de passe : l'identite Google
    fait foi. Cree l'espace du patron a la premiere connexion, ou rattache un
    agent invite (voir accounts.services.resolve_or_create_user)."""

    permission_classes = [AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            google_profile = verify_google_credential(serializer.validated_data["credential"])
        except InvalidGoogleTokenError:
            return error_response("Jeton Google invalide ou expiré. Reconnecte-toi.", status.HTTP_401_UNAUTHORIZED)

        user, created = resolve_or_create_user(google_profile)
        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "access": str(refresh.access_token),
                "is_new": created,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(APIView):
    """Renouvelle l'access token a partir du refresh token lu dans le cookie httpOnly
    (jamais depuis le corps de la requete). Distinguer 401 (cookie mort -> logout
    legitime) de toute autre erreur reste la responsabilite du frontend
    (skill jwt-auth-resilience) ; ce endpoint ne renvoie que du 200 ou du 401."""

    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get("qr_refresh_token")
        if not raw_token:
            return error_response("Session expirée, reconnecte-toi.", status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(raw_token)
        except TokenError:
            return error_response("Session invalide, reconnecte-toi.", status.HTTP_401_UNAUTHORIZED)
        return Response({"access": str(refresh.access_token)})


class LogoutView(APIView):
    """AllowAny : un access token deja expire ne doit jamais bloquer la deconnexion."""

    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Déconnecté."})
        clear_refresh_cookie(response)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        update_fields = []
        for field in ("full_name", "avatar_url"):
            if field in serializer.validated_data:
                setattr(request.user, field, serializer.validated_data[field])
                update_fields.append(field)
        if update_fields:
            request.user.save(update_fields=update_fields)
        return Response(UserSerializer(request.user).data)


class DeactivateMeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role == "BOSS":
            return error_response("Le patron doit d’abord transférer ou supprimer l’entreprise.", status.HTTP_400_BAD_REQUEST)
        request.user.is_active = False
        request.user.save(update_fields=["is_active"])
        response = Response({"detail": "Compte désactivé."})
        clear_refresh_cookie(response)
        return response


class InviteStaffView(APIView):
    """BOSS et GERANT peuvent tous deux inviter — mais seul BOSS peut accorder le
    role GERANT (un GERANT ne peut inviter que des STAFF, jamais un pair)."""

    permission_classes = [IsAuthenticated, IsBossOrGerant]
    throttle_classes = [throttling.UserRateThrottle]

    def post(self, request):
        serializer = InviteStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        requested_role = serializer.validated_data.get("role", "STAFF")
        if requested_role == "GERANT" and request.user.role != "BOSS":
            return error_response(
                "Seul le patron peut inviter un gérant.", status.HTTP_403_FORBIDDEN
            )

        cap = ROLE_CAPS.get(requested_role)
        if cap and count_role_usage(request.user.organization, requested_role) >= cap:
            label = "gérants" if requested_role == "GERANT" else "agents"
            return error_response(
                f"Limite atteinte : {cap} {label} maximum (invitations en attente comprises).",
                status.HTTP_400_BAD_REQUEST,
            )

        invitation = create_staff_invitation(
            organization=request.user.organization,
            email=serializer.validated_data["email"],
            invited_by=request.user,
            role=requested_role,
        )
        invite_link = f"{request.build_absolute_uri('/')[:-1]}?invite={invitation.token}"
        return Response(
            {"invite_link": invite_link, "email": invitation.email, "role": invitation.role},
            status=status.HTTP_201_CREATED,
        )
