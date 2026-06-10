# reservas/api_serializers.py
from rest_framework import serializers
from calendario.models import Dia
from reservas.models import Reserva, ReservaPuntual, Responsable

from reservas.services import aulas_disponibles_en_fecha_hora


# -----------------------------
# AULAS DISPONIBLES (GENÉRICO)
# -----------------------------
class AulasDisponiblesInputSerializer(serializers.Serializer):
    """Serializer para la consulta de aulas disponibles en una fecha y hora determinada, con capacidad y equipamiento opcionalmente."""
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    capacidad_solicitada = serializers.IntegerField(min_value=0)

    num_ordenadores = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camara = serializers.BooleanField(required=False, default=False)
    enchufes = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        if attrs["hora_inicio"] >= attrs["hora_fin"]:
            raise serializers.ValidationError("hora_inicio debe ser menor que hora_fin.")
        return attrs

    def get_queryset(self, excluir_reserva_id=None):
        v = self.validated_data
        return aulas_disponibles_en_fecha_hora(
            fecha=v["fecha"],
            hora_inicio=v["hora_inicio"],
            hora_fin=v["hora_fin"],
            capacidad=v["capacidad_solicitada"],
            num_ordenadores=v.get("num_ordenadores"),
            altavoces=v.get("altavoces", False),
            proyector=v.get("proyector", False),
            camara=v.get("camara", False),
            enchufes=v.get("enchufes", False),
            excluir_reserva_id=excluir_reserva_id,
        )


# -----------------------------
# LISTADO PENDIENTES/SOLICITADAS
# -----------------------------
class ReservaPendienteListItemSerializer(serializers.ModelSerializer):
    """Serializer para el listado de reservas pendientes o solicitadas, con información básica de la reserva y el responsable."""
    idreserva = serializers.CharField(source="id_reserva.pk", read_only=True)
    fecha = serializers.DateField(source="id_reserva.id_dia.dia", read_only=True)
    hora_inicio = serializers.TimeField(source="id_reserva.hora_inicio", read_only=True)
    hora_fin = serializers.TimeField(source="id_reserva.hora_fin", read_only=True)
    id_aula = serializers.CharField(source="id_reserva.id_aula", read_only=True)
    nombre_aula = serializers.CharField(source="id_reserva.id_aula.nombre", read_only=True)
    estado = serializers.CharField(source="id_reserva.estado", read_only=True)

    correo_responsable = serializers.EmailField(
        source="id_responsable.correo",
        read_only=True,
        allow_blank=True,
        required=False,
    )

    class Meta:
        model = ReservaPuntual
        fields = [
            "idreserva",
            "motivo",
            "correo_responsable",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "capacidad_solicitada",
            "num_ordenadores_solicitados",
            "altavoces_solicitados",         
            "proyector_solicitado",
            "camara_solicitada",
            "enchufes_solicitados",
            "id_aula",
            "nombre_aula",
            "estado",
        ]
# -----------------------------
# DETALLE + PATCH EDICIÓN
# -----------------------------
class ReservaDetalleSerializer(serializers.Serializer):
    """Serializer para el detalle de una reserva puntual, con información completa de la reserva y el responsable. También se utiliza para la edición de la reserva mediante PATCH."""
    idreserva = serializers.CharField(read_only=True)

    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()

    motivo = serializers.CharField(max_length=90, allow_blank=True, required=False)
    correo_responsable = serializers.EmailField(allow_blank=True, required=False)

    capacidad_solicitada = serializers.IntegerField(min_value=0, required=False)
    num_ordenadores = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camara = serializers.BooleanField(required=False, default=False)
    enchufes = serializers.BooleanField(required=False, default=False)

    id_aula = serializers.IntegerField(required=False, allow_null=False)

    estado = serializers.CharField(required=False)

    def validate(self, attrs):
        """Validación cruzada para asegurar que hora_inicio es menor que hora_fin."""
        hi = attrs.get("hora_inicio")
        hf = attrs.get("hora_fin")
        if hi and hf and hi >= hf:
            raise serializers.ValidationError("hora_inicio debe ser menor que hora_fin.")
        return attrs

    def to_representation(self, instance: Reserva):
        """Sobrescribimos el método to_representation para incluir información del responsable y los recursos solicitados en la representación de la reserva puntual."""
        puntual = ReservaPuntual.objects.select_related("id_responsable").filter(id_reserva=instance).first()

        correo = ""
        motivo = ""
        if puntual and getattr(puntual, "id_responsable", None):
            correo = getattr(puntual.id_responsable, "correo", "") or ""
        if puntual:
            motivo = getattr(puntual, "motivo", "") or ""

        def get_attr(obj, name, default):
            return getattr(obj, name, default)

        return {
            "idreserva": instance.pk,
            "fecha": instance.id_dia.dia if instance.id_dia else None,
            "hora_inicio": instance.hora_inicio,
            "hora_fin": instance.hora_fin,

            "motivo": motivo,
            "correo_responsable": correo,

            "capacidad_solicitada": get_attr(puntual, "capacidad_solicitada", None) if puntual else None,
            "num_ordenadores": get_attr(puntual, "num_ordenadores_solicitados", None) if puntual else None,
            "altavoces": bool(get_attr(puntual, "altavoces_solicitados", False)) if puntual else False,
            "proyector": bool(get_attr(puntual, "proyector_solicitado", False)) if puntual else False,
            "camara": bool(get_attr(puntual, "camara_solicitada", False)) if puntual else False,
            "enchufes": bool(get_attr(puntual, "enchufes_solicitados", False)) if puntual else False,
            "id_aula": instance.id_aula_id if instance.id_aula_id else "",
            "nombre_aula": instance.id_aula.nombre if instance.id_aula else "",
            "estado": instance.estado,
        }

    def update(self, instance: Reserva, validated_data):
        """Actualizamos la reserva puntual con los datos validados. Primero actualizamos los campos de Reserva, luego los campos de ReservaPuntual."""
        if "fecha" in validated_data:
            fecha = validated_data["fecha"]
            try:
                dia = Dia.objects.get(dia=fecha)
            except Dia.DoesNotExist:
                raise serializers.ValidationError({"fecha": "La fecha no existe en el calendario académico."})
            instance.id_dia = dia

        for field in ["hora_inicio", "hora_fin", "id_aula"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        if "id_aula" in validated_data:
            instance.id_aula_id = validated_data["id_aula"]

        instance.save()

        puntual = ReservaPuntual.objects.filter(id_reserva=instance).first()

        if not puntual:
            raise serializers.ValidationError({"detail": "No se encontró la reserva puntual asociada."})

        if "motivo" in validated_data:
            puntual.motivo = validated_data["motivo"]
        
        if "capacidad_solicitada" in validated_data:
            puntual.capacidad_solicitada = validated_data["capacidad_solicitada"]
        
        if "num_ordenadores" in validated_data:
            puntual.num_ordenadores_solicitados = validated_data["num_ordenadores"] or 0
        
        if "altavoces" in validated_data:
            puntual.altavoces_solicitados = validated_data["altavoces"]
        
        if "proyector" in validated_data:
            puntual.proyector_solicitado = validated_data["proyector"]

        if "camara" in validated_data:
            puntual.camara_solicitada = validated_data["camara"]
        
        if "enchufes" in validated_data:
            puntual.enchufes_solicitados = validated_data["enchufes"]

        if "correo_responsable" in validated_data:
            nuevo_correo = (validated_data["correo_responsable"] or "").strip()
            
            correo_actual = getattr(puntual.id_responsable, "correo", "") if puntual.id_responsable else ""
            
            if nuevo_correo and nuevo_correo != correo_actual:
                try:
                    nuevo_responsable = Responsable.objects.get(correo=nuevo_correo)
                    puntual.id_responsable = nuevo_responsable
                except Responsable.DoesNotExist:
                    raise serializers.ValidationError({
                        "correo_responsable": f"No existe un responsable registrado con el correo '{nuevo_correo}'."
                    })
        puntual.save()
        return instance
    
class ReservaBulkIdsSerializer(serializers.Serializer):
    """Serializer para la eliminación masiva de reservas puntuales, con una lista de IDs de reservas a eliminar."""
    ids = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )