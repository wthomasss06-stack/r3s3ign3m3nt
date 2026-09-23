import logging
import time
import uuid

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("qr_register.request")


class ApiTrailingSlashMiddleware(MiddlewareMixin):
    """Résout les URLs API avec ou sans slash sans rediriger les requêtes.

    Un ancien bundle frontend peut appeler ``/api/v1/auth/google`` alors que
    Django déclare ``/api/v1/auth/google/``. La redirection 301 de
    ``CommonMiddleware`` peut transformer le POST en GET et perdre son corps.
    On normalise donc ``PATH_INFO`` en interne, avant le résolveur.
    """

    def process_request(self, request):
        if (
            request.path.startswith("/api/")
            and request.path != "/api/"
            and not request.path.endswith("/")
        ):
            request.path_info = f"{request.path_info}/"
            request.path = f"{request.path}/"


class RequestCorrelationMiddleware(MiddlewareMixin):
    """Ajoute un identifiant de requête et journalise méthode, route, statut et durée."""

    def process_request(self, request):
        request.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.request_started_at = time.monotonic()

    def process_response(self, request, response):
        request_id = getattr(request, "request_id", str(uuid.uuid4()))
        elapsed_ms = round((time.monotonic() - getattr(request, "request_started_at", time.monotonic())) * 1000, 2)
        response["X-Request-ID"] = request_id
        logger.info(
            "http_request",
            extra={"request_id": request_id, "method": request.method, "path": request.path, "status": response.status_code, "duration_ms": elapsed_ms},
        )
        return response
