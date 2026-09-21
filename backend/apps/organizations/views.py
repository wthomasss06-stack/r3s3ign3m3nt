import hashlib
import secrets
import time

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsBoss, IsOrgMember
from apps.common.responses import error_response

from .serializers import OrganizationSerializer, OrganizationUpdateSerializer


class MyOrganizationView(APIView):
    permission_classes = [IsAuthenticated, IsOrgMember]

    def get(self, request):
        return Response(OrganizationSerializer(request.user.organization).data)

    def patch(self, request):
        self.check_object_permissions(request, request.user.organization)
        if request.user.role != "BOSS":
            self.permission_denied(request, message=IsBoss.message)

        serializer = OrganizationUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        organization = request.user.organization
        for field, value in serializer.validated_data.items():
            setattr(organization, field, value.strip() if isinstance(value, str) else value)
        if serializer.validated_data:
            organization.save(update_fields=list(serializer.validated_data.keys()))
        return Response(OrganizationSerializer(organization).data)


class RegenerateQRTokenView(APIView):
    permission_classes = [IsAuthenticated, IsBoss]

    def post(self, request):
        organization = request.user.organization
        organization.qr_secure_token = secrets.token_urlsafe(16)
        organization.save(update_fields=["qr_secure_token"])
        return Response(OrganizationSerializer(organization).data)


class CloudinarySignatureView(APIView):
    """Signe un upload image côté serveur sans exposer le secret Cloudinary."""

    permission_classes = [IsAuthenticated, IsBoss]

    def post(self, request):
        cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", "").strip().strip("\"'")
        api_key = getattr(settings, "CLOUDINARY_API_KEY", "").strip().strip("\"'")
        api_secret = getattr(settings, "CLOUDINARY_API_SECRET", "").strip().strip("\"'")
        if not cloud_name or not api_key or not api_secret:
            return error_response("Cloudinary n’est pas configuré sur le serveur.", status.HTTP_503_SERVICE_UNAVAILABLE)
        timestamp = int(time.time())
        folder = f"qr-register/{request.user.organization_id}"
        params = {"folder": folder, "timestamp": timestamp}
        # Cloudinary signe les paramètres triés sans URL-encoder le slash du
        # dossier : `folder=qr-register/<org>&timestamp=<unix>`. Utiliser
        # urlencode() ici transforme `/` en `%2F` et produit une signature
        # différente de celle recalculée par Cloudinary.
        string_to_sign = "&".join(f"{key}={value}" for key, value in sorted(params.items()))
        signature = hashlib.sha1(f"{string_to_sign}{api_secret}".encode("utf-8")).hexdigest()
        return Response({"cloud_name": cloud_name, "api_key": api_key, "timestamp": timestamp, "folder": folder, "signature": signature})


class OrganizationLifecycleView(APIView):
    permission_classes = [IsAuthenticated, IsBoss]

    def patch(self, request):
        organization = request.user.organization
        organization.is_suspended = bool(request.data.get("is_suspended", not organization.is_suspended))
        organization.save(update_fields=["is_suspended"])
        return Response(OrganizationSerializer(organization).data)

    def delete(self, request):
        request.user.organization.delete()
        return Response(status=204)
