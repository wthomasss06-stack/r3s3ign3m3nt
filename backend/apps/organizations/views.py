import secrets

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsBoss, IsOrgMember

from .serializers import OrganizationSerializer, RenameOrganizationSerializer


class MyOrganizationView(APIView):
    permission_classes = [IsAuthenticated, IsOrgMember]

    def get(self, request):
        return Response(OrganizationSerializer(request.user.organization).data)

    def patch(self, request):
        self.check_object_permissions(request, request.user.organization)
        if request.user.role != "BOSS":
            self.permission_denied(request, message=IsBoss.message)

        serializer = RenameOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = request.user.organization
        organization.name = serializer.validated_data["name"]
        organization.save(update_fields=["name"])
        return Response(OrganizationSerializer(organization).data)


class RegenerateQRTokenView(APIView):
    """Invalide instantanement l'ancien QR (utile si un lien fuite ou si un
    telephone kiosque est vole — cf. RISK-002 du cahier des charges)."""

    permission_classes = [IsAuthenticated, IsBoss]

    def post(self, request):
        organization = request.user.organization
        organization.qr_secure_token = secrets.token_urlsafe(16)
        organization.save(update_fields=["qr_secure_token"])
        return Response(OrganizationSerializer(organization).data)
