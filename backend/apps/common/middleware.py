import logging
import time
import uuid

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("qr_register.request")


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
