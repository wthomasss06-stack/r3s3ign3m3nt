"""Le refresh token JWT vit exclusivement dans un cookie httpOnly — jamais dans le
corps JSON, jamais en localStorage cote client (skill jwt-auth-resilience /
akatech-frontend-architect : "Ne stocke JAMAIS de refresh token en localStorage")."""
from django.conf import settings


def set_refresh_cookie(response, refresh_token) -> None:
    response.set_cookie(
        settings.REFRESH_COOKIE_NAME,
        str(refresh_token),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="None" if not settings.DEBUG else "Lax",
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path=settings.REFRESH_COOKIE_PATH,
    )


def clear_refresh_cookie(response) -> None:
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
