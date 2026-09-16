"""Helper pour renvoyer une erreur au format standard depuis une APIView (hors exceptions DRF)."""
from rest_framework.response import Response


def error_response(message: str, status_code: int, retryable: bool = False) -> Response:
    return Response({"error": {"message": message, "retryable": retryable}}, status=status_code)
