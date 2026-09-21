import csv

from rest_framework import generics, status, throttling
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import StreamingHttpResponse

from apps.common.permissions import IsBossOrGerant, IsOrgMember
from apps.common.responses import error_response
from apps.organizations.models import Organization

from .models import CheckIn
from .serializers import (
    CheckInSerializer,
    CheckInSyncItemSerializer,
    FormTemplateSerializer,
    PublicFormSerializer,
)
from .services import sync_single_checkin


class FormTemplateView(APIView):
    """GET : BOSS et STAFF consultent le formulaire actif.
    PUT : seul le BOSS le modifie (source unique de verite pour le QR)."""

    permission_classes = [IsAuthenticated, IsOrgMember]

    def get(self, request):
        template = getattr(request.user.organization, "form_template", None)
        if not template:
            return error_response("Aucun formulaire configuré pour cet établissement.", status.HTTP_404_NOT_FOUND)
        return Response(FormTemplateSerializer(template).data)

    def put(self, request):
        if request.user.role not in ("BOSS", "GERANT"):
            self.permission_denied(request, message=IsBossOrGerant.message)

        template = request.user.organization.form_template
        serializer = FormTemplateSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(version=template.version + 1)
        return Response(serializer.data)


class PublicFormView(APIView):
    """Resolu uniquement via le qr_token — jamais via un ID d'organisation en clair
    (protection IDOR, cf. cahier des charges §11)."""

    permission_classes = [AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def get(self, request, qr_token):
        organization = (
            Organization.objects.select_related("form_template").filter(qr_secure_token=qr_token).first()
        )
        if not organization:
            return error_response("QR Code invalide ou désactivé.", status.HTTP_404_NOT_FOUND)

        template = getattr(organization, "form_template", None)
        if not template or not template.is_active:
            return error_response(
                "Aucun formulaire actif pour cet établissement.", status.HTTP_404_NOT_FOUND
            )

        data = {
            "organization_name": organization.name,
            "organization_logo_url": organization.logo_url,
            "visit_reasons": organization.visit_reasons or [],
            "fields_schema": template.fields_schema,
        }
        return Response(PublicFormSerializer(data).data)


class SyncCheckInsView(APIView):
    """Ingestion groupee, tolerante aux doublons (idempotency_key) et aux reseaux
    instables : chaque item du batch est traite independamment, un echec sur l'un
    ne bloque jamais les autres."""

    permission_classes = [AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]
    MAX_BATCH_SIZE = 50  # borne la taille du payload (protection DoS basique)

    def post(self, request):
        items = request.data.get("checkins", [])
        if not isinstance(items, list) or len(items) > self.MAX_BATCH_SIZE:
            return error_response(
                f"Lot invalide (maximum {self.MAX_BATCH_SIZE} fiches par envoi).",
                status.HTTP_400_BAD_REQUEST,
            )

        processed = []
        for raw in items:
            serializer = CheckInSyncItemSerializer(data=raw)
            if not serializer.is_valid():
                processed.append(
                    {
                        "idempotency_key": raw.get("idempotency_key"),
                        "status": "invalid",
                        "errors": serializer.errors,
                    }
                )
                continue
            outcome = sync_single_checkin(serializer.validated_data)
            processed.append(outcome.as_dict())

        return Response({"synced_count": len(processed), "processed": processed}, status=status.HTTP_200_OK)


class CheckInPagination(PageNumberPagination):
    page_size = 25
    max_page_size = 100


class CheckInListView(generics.ListAPIView):
    serializer_class = CheckInSerializer
    permission_classes = [IsAuthenticated, IsOrgMember]
    pagination_class = CheckInPagination

    def get_queryset(self):
        queryset = CheckIn.objects.filter(organization=self.request.user.organization)
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")
        if date_from:
            queryset = queryset.filter(created_at_client__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at_client__lte=date_to)
        return queryset


class CheckInExportView(APIView):
    permission_classes = [IsAuthenticated, IsBossOrGerant]

    def get(self, request):
        organization = request.user.organization
        template = getattr(organization, "form_template", None)
        fields = template.fields_schema if template else []
        queryset = CheckIn.objects.filter(organization=organization).iterator()

        def rows():
            header = ["Heure d'arrivée"] + [f["label"] for f in fields]
            yield _csv_row(header)
            for checkin in queryset:
                row = [checkin.created_at_client.strftime("%d/%m/%Y %H:%M")]
                for f in fields:
                    if f["type"] == "signature":
                        row.append("Signé" if checkin.signature_blob else "Non signé")
                    elif f["type"] == "checkbox":
                        row.append("Oui" if checkin.responses.get(f["id"]) else "Non")
                    else:
                        row.append(checkin.responses.get(f["id"], ""))
                yield _csv_row(row)

        response = StreamingHttpResponse(rows(), content_type="text/csv; charset=utf-8")
        safe_name = "".join(c for c in organization.name if c.isalnum() or c in " -_").strip() or "etablissement"
        response["Content-Disposition"] = f'attachment; filename="registre_{safe_name}.csv"'
        return response


def _csv_row(values: list) -> str:
    import io

    buffer = io.StringIO()
    csv.writer(buffer).writerow(values)
    return buffer.getvalue()
