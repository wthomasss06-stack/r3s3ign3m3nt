import secrets

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsBoss, IsOrgMember

from .serializers import OrganizationSerializer, OrganizationUpdateSerializer


class MyOrganizationView(APIView):
    permission_classes = [IsAuthenticated, IsOrgMember]

    def get(self, request):
        return Response(OrganizationSerializer(request.user.organization).data)

    def patch(self, request):
        self.check_object_permissions(request, request.user.organization)
        if request.user.role not in ("BOSS", "GERANT"):
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
