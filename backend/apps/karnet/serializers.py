from rest_framework import serializers

from .models import Client, Reservation, Resource


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "full_name", "phone", "email", "note", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_full_name(self, value):
        return value.strip()


class ClientDetailSerializer(ClientSerializer):
    """Fiche client complète (phase 7) : ajoute les compteurs utiles à l'en-tête
    sans que l'appelant ait à recouper plusieurs requêtes lui-même."""

    checkins_count = serializers.IntegerField(read_only=True)
    reservations_count = serializers.IntegerField(read_only=True)
    last_visit_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ["checkins_count", "reservations_count", "last_visit_at"]


class ResourceSerializer(serializers.ModelSerializer):
    unit_display = serializers.CharField(source="get_unit_display", read_only=True)

    class Meta:
        model = Resource
        fields = ["id", "name", "unit", "unit_display", "price", "is_active", "created_at"]
        read_only_fields = ["id", "unit_display", "created_at"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value


class ReservationSerializer(serializers.ModelSerializer):
    """Lecture — inclut les libellés utiles à l'affichage sans requête supplémentaire."""

    client_name = serializers.CharField(source="client.full_name", read_only=True)
    client_phone = serializers.CharField(source="client.phone", read_only=True)
    resource_name = serializers.CharField(source="resource.name", read_only=True)
    resource_unit = serializers.CharField(source="resource.unit", read_only=True)
    reminder_due = serializers.BooleanField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "client", "client_name", "client_phone", "resource", "resource_name", "resource_unit",
            "quantity", "unit_price", "total_amount", "starts_at", "ends_at", "status",
            "is_paid", "paid_at", "reminder_acknowledged", "reminder_due", "created_at",
        ]
        read_only_fields = fields


class ReservationCreateSerializer(serializers.Serializer):
    """Écriture — accepte soit un client existant, soit de quoi en créer un à la
    volée (cas le plus courant : le visiteur devient client au moment de réserver)."""

    client = serializers.UUIDField(required=False)
    client_name = serializers.CharField(max_length=255, required=False)
    client_phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    resource = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    starts_at = serializers.DateTimeField(required=False)

    def validate(self, attrs):
        if not attrs.get("client") and not (attrs.get("client_name") or "").strip():
            raise serializers.ValidationError("Indique un client existant (client) ou un nom pour en créer un (client_name).")
        return attrs


class ReservationUpdateSerializer(serializers.ModelSerializer):
    """Écriture partielle — seuls le statut, le paiement et l'accusé de rappel sont
    modifiables après coup ; client/ressource/montant restent un historique figé."""

    class Meta:
        model = Reservation
        fields = ["status", "is_paid", "reminder_acknowledged"]
